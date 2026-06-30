import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, fhevm } from "hardhat";
import { SilentRFQ, SilentRFQ__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { relayer } from "@fhevm/mock-utils";

type Signers = {
  buyer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

async function deployFixture(buyerAddress: string) {
  const deadline = (await time.latest()) + 3600; // 1 hour from current block time
  const factory = (await ethers.getContractFactory("SilentRFQ")) as SilentRFQ__factory;
  const contract = (await factory.deploy(buyerAddress, "Test RFQ", deadline)) as SilentRFQ;
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress, deadline };
}

describe("SilentRFQ", function () {
  let signers: Signers;
  let contract: SilentRFQ;
  let contractAddress: string;
  let deadline: number;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      buyer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      carol: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite cannot run on Sepolia Testnet");
      this.skip();
    }
    ({ contract, contractAddress, deadline } = await deployFixture(signers.buyer.address));
  });

  // Helper: encrypt and submit a bid as a given vendor
  const submitBid = async (vendor: HardhatEthersSigner, amount: number) => {
    const enc = await fhevm
      .createEncryptedInput(contractAddress, vendor.address)
      .add64(amount)
      .encrypt();
    const tx = await contract.connect(vendor).submitBid(enc.handles[0], enc.inputProof);
    await tx.wait();
  };

  // Helper: advance past deadline and have buyer call finalize()
  const finalizeRFQ = async () => {
    await time.increaseTo(deadline + 1);
    const tx = await contract.connect(signers.buyer).finalize();
    await tx.wait();
  };

  // Decrypt _bestBid as buyer — only valid after finalize() grants FHE.allow(buyer)
  const decryptBestBid = async (): Promise<bigint> => {
    const handle = await contract.getBestBid();
    return fhevm.userDecryptEuint(FhevmType.euint64, handle, contractAddress, signers.buyer);
  };

  // Public-decrypt _bestVendorIndex — valid after finalize() calls makePubliclyDecryptable.
  // No signer required: the index is publicly decryptable by anyone via the Zama gateway.
  const decryptBestVendorIndex = async (): Promise<bigint> => {
    const handle = await contract.getBestVendorIndex();
    return fhevm.publicDecryptEuint(FhevmType.euint64, handle);
  };

  // Build the three arguments for callbackRevealWinner by querying the mock relayer.
  // Requires finalize() to have been called first (makePubliclyDecryptable must be set).
  const getCallbackArgs = async (): Promise<{
    handlesList: string[];
    abiEncodedCleartexts: string;
    decryptionProof: string;
  }> => {
    const handle = await contract.getBestVendorIndex();
    const extraData = ethers.solidityPacked(["uint8"], [0]); // 0x00 — v0 extraData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await relayer.requestRelayerV1PublicDecrypt(ethers.provider as any, {
      ciphertextHandles: [handle],
      extraData,
    });
    const { decrypted_value: abiEncodedCleartexts, signatures } = result.response[0];
    // Pack: uint8(N) || sig_0 ... sig_{N-1} || extraData (0x00)
    const decryptionProof = ethers.concat([
      ethers.solidityPacked(["uint8"], [signatures.length]),
      ...signatures.map((s: string) => ethers.getBytes(s)),
      ethers.getBytes(extraData),
    ]);
    return { handlesList: [handle], abiEncodedCleartexts, decryptionProof };
  };

  // ─── Deployment ────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets initial state correctly", async function () {
      expect(await contract.buyer()).to.eq(signers.buyer.address);
      expect(await contract.finalized()).to.eq(false);
      expect(await contract.winnerRevealed()).to.eq(false);
      expect(await contract.vendorCount()).to.eq(0n);
      // Uninitialized encrypted handles are bytes32(0)
      expect(await contract.getBestBid()).to.eq(ethers.ZeroHash);
      expect(await contract.getBestVendorIndex()).to.eq(ethers.ZeroHash);
    });

    it("rejects deployment with zero buyer address", async function () {
      const factory = await ethers.getContractFactory("SilentRFQ");
      const deadline = (await time.latest()) + 3600;
      await expect(
        factory.deploy(ethers.ZeroAddress, "Test RFQ", deadline),
      ).to.be.revertedWithCustomError(contract, "InvalidBuyer");
    });

    it("rejects deployment with deadline in the past", async function () {
      const factory = await ethers.getContractFactory("SilentRFQ");
      // timestamp 1 is clearly in the past; constructor must revert
      await expect(
        factory.deploy(signers.buyer.address, "Test RFQ", 1),
      ).to.be.revertedWithCustomError(contract, "InvalidDeadline");
    });

    it("rejects deployment with deadline equal to current block timestamp", async function () {
      const factory = await ethers.getContractFactory("SilentRFQ");
      // time.latest() returns the most recent block timestamp.
      // The deploy tx mines a new block at timestamp >= latest + 1,
      // so a deadline equal to latest is already <= block.timestamp when constructor runs.
      const currentTs = await time.latest();
      await expect(
        factory.deploy(signers.buyer.address, "Test RFQ", currentTs),
      ).to.be.revertedWithCustomError(contract, "InvalidDeadline");
    });
  });

  // ─── submitBid ─────────────────────────────────────────────────────────────

  describe("submitBid", function () {
    it("rejects bid after deadline", async function () {
      await time.increaseTo(deadline + 1);
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(100)
        .encrypt();
      await expect(
        contract.connect(signers.alice).submitBid(enc.handles[0], enc.inputProof),
      ).to.be.revertedWithCustomError(contract, "DeadlinePassed");
    });

    it("rejects bid at exact deadline boundary", async function () {
      // block.timestamp == deadline must be rejected: bids are accepted only strictly before deadline
      await time.setNextBlockTimestamp(deadline);
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(100)
        .encrypt();
      await expect(
        contract.connect(signers.alice).submitBid(enc.handles[0], enc.inputProof),
      ).to.be.revertedWithCustomError(contract, "DeadlinePassed");
    });

    it("rejects duplicate bid from same address", async function () {
      await submitBid(signers.alice, 100);
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(50)
        .encrypt();
      await expect(
        contract.connect(signers.alice).submitBid(enc.handles[0], enc.inputProof),
      ).to.be.revertedWithCustomError(contract, "AlreadyBid");
    });

    it("first bid — direct encrypted store path", async function () {
      await submitBid(signers.alice, 100);
      expect(await contract.vendorCount()).to.eq(1n);

      // Decrypt only after finalize() grants FHE.allow to buyer
      await finalizeRFQ();

      expect(await decryptBestBid()).to.eq(100n);
      expect(await decryptBestVendorIndex()).to.eq(0n);
    });

    it("lower bid displaces current best", async function () {
      await submitBid(signers.alice, 100);
      await submitBid(signers.bob, 50);

      await finalizeRFQ();

      expect(await decryptBestBid()).to.eq(50n);
      expect(await decryptBestVendorIndex()).to.eq(1n); // Bob is index 1
    });

    it("higher bid does not displace current best", async function () {
      await submitBid(signers.alice, 50);
      await submitBid(signers.bob, 100);

      await finalizeRFQ();

      expect(await decryptBestBid()).to.eq(50n);
      expect(await decryptBestVendorIndex()).to.eq(0n); // Alice is index 0
    });

    it("equal bids keep the earliest submitted vendor (tie policy)", async function () {
      // FHE.lt is strictly less-than: equal bids produce isLower = false.
      // FHE.select therefore keeps the existing _bestBid and _bestVendorIndex unchanged.
      // The first vendor to submit an equal bid wins the tie.
      await submitBid(signers.alice, 100);
      await submitBid(signers.bob, 100);

      await finalizeRFQ();

      expect(await decryptBestBid()).to.eq(100n);
      expect(await decryptBestVendorIndex()).to.eq(0n); // Alice submitted first, Alice wins
    });

    it("selects best bid among three vendors", async function () {
      await submitBid(signers.alice, 200);
      await submitBid(signers.bob, 50);
      await submitBid(signers.carol, 150);

      await finalizeRFQ();

      expect(await decryptBestBid()).to.eq(50n);
      expect(await decryptBestVendorIndex()).to.eq(1n); // Bob is index 1
    });

    it("registers vendors in submission order", async function () {
      await submitBid(signers.alice, 100);
      await submitBid(signers.bob, 50);

      const vendorList = await contract.getVendors();
      expect(vendorList[0]).to.eq(signers.alice.address);
      expect(vendorList[1]).to.eq(signers.bob.address);
    });
  });

  // ─── finalize ──────────────────────────────────────────────────────────────

  describe("finalize", function () {
    it("rejects finalize from non-buyer", async function () {
      await submitBid(signers.alice, 100);
      await time.increaseTo(deadline + 1);
      await expect(
        contract.connect(signers.alice).finalize(),
      ).to.be.revertedWithCustomError(contract, "NotBuyer");
    });

    it("rejects finalize before deadline", async function () {
      await submitBid(signers.alice, 100);
      await expect(
        contract.connect(signers.buyer).finalize(),
      ).to.be.revertedWithCustomError(contract, "DeadlineNotPassed");
    });

    it("rejects finalize with no bids", async function () {
      await time.increaseTo(deadline + 1);
      await expect(
        contract.connect(signers.buyer).finalize(),
      ).to.be.revertedWithCustomError(contract, "NoBids");
    });

    it("succeeds after deadline with bids", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      expect(await contract.finalized()).to.eq(true);
    });

    it("succeeds at exact deadline boundary", async function () {
      // block.timestamp == deadline must allow finalization: bids close at deadline, settlement opens
      await submitBid(signers.alice, 100);
      await time.setNextBlockTimestamp(deadline);
      const tx = await contract.connect(signers.buyer).finalize();
      await tx.wait();
      expect(await contract.finalized()).to.eq(true);
    });

    it("rejects double finalize", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      await expect(
        contract.connect(signers.buyer).finalize(),
      ).to.be.revertedWithCustomError(contract, "AlreadyFinalized");
    });
  });

  // ─── callbackRevealWinner ──────────────────────────────────────────────────

  describe("callbackRevealWinner (gateway path)", function () {
    it("rejects if not finalized", async function () {
      await submitBid(signers.alice, 100);
      const { handlesList, abiEncodedCleartexts } = {
        handlesList: [await contract.getBestVendorIndex()],
        abiEncodedCleartexts: ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [0]),
      };
      // Use a dummy proof — should revert on NotFinalized before reaching signature check
      const dummyProof = ethers.concat([ethers.solidityPacked(["uint8"], [0]), ethers.getBytes("0x00")]);
      await expect(
        contract.callbackRevealWinner(handlesList, abiEncodedCleartexts, dummyProof),
      ).to.be.revertedWithCustomError(contract, "NotFinalized");
    });

    it("rejects if winner already revealed via callbackRevealWinner", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      // First call succeeds
      await (await contract.callbackRevealWinner(args.handlesList, args.abiEncodedCleartexts, args.decryptionProof)).wait();
      // Second call must revert
      await expect(
        contract.callbackRevealWinner(args.handlesList, args.abiEncodedCleartexts, args.decryptionProof),
      ).to.be.revertedWithCustomError(contract, "WinnerAlreadyRevealed");
    });

    it("rejects if handlesList is empty", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      await expect(
        contract.callbackRevealWinner([], args.abiEncodedCleartexts, args.decryptionProof),
      ).to.be.revertedWithCustomError(contract, "InvalidDecryptionHandles");
    });

    it("rejects if handlesList contains wrong handle", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      const wrongHandles = [ethers.ZeroHash]; // bytes32(0) — not the _bestVendorIndex handle
      await expect(
        contract.callbackRevealWinner(wrongHandles, args.abiEncodedCleartexts, args.decryptionProof),
      ).to.be.revertedWithCustomError(contract, "InvalidDecryptionHandles");
    });

    it("rejects if handlesList.length > 1", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      // Two entries — even if the first is correct, the contract requires exactly one handle
      const twoHandles = [args.handlesList[0], args.handlesList[0]];
      await expect(
        contract.callbackRevealWinner(twoHandles, args.abiEncodedCleartexts, args.decryptionProof),
      ).to.be.revertedWithCustomError(contract, "InvalidDecryptionHandles");
    });

    it("rejects tampered decryptionProof (zeroed signatures)", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      // Build a structurally valid proof (right length) but with a zeroed 65-byte signature.
      // ECDSA recovery of zeros returns an address that is not a registered KMS signer.
      const fakeProof = ethers.concat([
        ethers.solidityPacked(["uint8"], [1]),
        new Uint8Array(65), // 65 zero bytes — invalid ECDSA signature
        ethers.getBytes("0x00"), // extraData
      ]);
      await expect(
        contract.callbackRevealWinner(args.handlesList, args.abiEncodedCleartexts, fakeProof),
      ).to.be.reverted; // KMSInvalidSigner from FHE library internals
    });

    it("rejects tampered abiEncodedCleartexts with valid proof structure", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      // Replace the real decrypted index with a different value. The KMS signature covers
      // the original (handlesList, abiEncodedCleartexts) tuple, so swapping the cleartexts
      // invalidates the signature even though the proof bytes are structurally intact.
      const tamperedCleartexts = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [999n]);
      await expect(
        contract.callbackRevealWinner(args.handlesList, tamperedCleartexts, args.decryptionProof),
      ).to.be.reverted; // KMSInvalidSigner — signature does not cover tampered cleartexts
    });

    it("succeeds with valid proof, stores correct winner index and winner address", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      const tx = await contract.callbackRevealWinner(
        args.handlesList,
        args.abiEncodedCleartexts,
        args.decryptionProof,
      );
      await tx.wait();
      expect(await contract.winnerRevealed()).to.eq(true);
      expect(await contract.revealedWinnerIndex()).to.eq(0n);
      expect(await contract.winnerAddress()).to.eq(signers.alice.address);
    });

    it("can be called by anyone — not restricted to buyer", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      const args = await getCallbackArgs();
      // Carol (index 3) is not the buyer — callback is permissionless
      const tx = await contract
        .connect(signers.carol)
        .callbackRevealWinner(args.handlesList, args.abiEncodedCleartexts, args.decryptionProof);
      await tx.wait();
      expect(await contract.winnerRevealed()).to.eq(true);
      expect(await contract.winnerAddress()).to.eq(signers.alice.address);
    });

    it("full flow via gateway: Alice=100 Bob=50 Carol=200 — Bob wins", async function () {
      await submitBid(signers.alice, 100);
      await submitBid(signers.bob, 50);
      await submitBid(signers.carol, 200);
      await finalizeRFQ();

      // winnerAddress must revert before reveal
      await expect(contract.winnerAddress()).to.be.revertedWithCustomError(contract, "WinnerNotRevealed");

      // Get gateway callback args — decrypts _bestVendorIndex (Bob = index 1)
      const args = await getCallbackArgs();

      // Confirm the decrypted index is 1 (Bob)
      const decodedIndex = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], args.abiEncodedCleartexts)[0];
      expect(decodedIndex).to.eq(1n);

      // Anyone can call — use carol here
      await (
        await contract
          .connect(signers.carol)
          .callbackRevealWinner(args.handlesList, args.abiEncodedCleartexts, args.decryptionProof)
      ).wait();

      expect(await contract.winnerRevealed()).to.eq(true);
      expect(await contract.revealedWinnerIndex()).to.eq(1n);
      expect(await contract.winnerAddress()).to.eq(signers.bob.address);

      // Buyer still decrypts the winning bid amount privately
      const winningBid = await decryptBestBid();
      expect(winningBid).to.eq(50n);
    });
  });

});
