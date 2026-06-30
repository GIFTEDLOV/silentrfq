import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, fhevm } from "hardhat";
import { SilentRFQ, SilentRFQ__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  buyer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

async function deployFixture() {
  const deadline = (await time.latest()) + 3600; // 1 hour from current block time
  const factory = (await ethers.getContractFactory("SilentRFQ")) as SilentRFQ__factory;
  const contract = (await factory.deploy("Test RFQ", deadline)) as SilentRFQ;
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
    ({ contract, contractAddress, deadline } = await deployFixture());
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

  // Decrypt _bestVendorIndex as buyer — only valid after finalize() grants FHE.allow(buyer)
  const decryptBestVendorIndex = async (): Promise<bigint> => {
    const handle = await contract.getBestVendorIndex();
    return fhevm.userDecryptEuint(FhevmType.euint64, handle, contractAddress, signers.buyer);
  };

  // ─── Deployment ────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets initial state correctly", async function () {
      expect(await contract.buyer()).to.eq(signers.buyer.address);
      expect(await contract.finalized()).to.eq(false);
      expect(await contract.vendorCount()).to.eq(0n);
      // Uninitialized encrypted handles are bytes32(0)
      expect(await contract.getBestBid()).to.eq(ethers.ZeroHash);
      expect(await contract.getBestVendorIndex()).to.eq(ethers.ZeroHash);
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

      // Decrypt only after finalize() grants permission
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

    it("rejects double finalize", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      await expect(
        contract.connect(signers.buyer).finalize(),
      ).to.be.revertedWithCustomError(contract, "AlreadyFinalized");
    });
  });

  // ─── revealWinnerFromDecryptedIndex ────────────────────────────────────────

  describe("revealWinnerFromDecryptedIndex", function () {
    it("rejects reveal before finalize", async function () {
      await submitBid(signers.alice, 100);
      await expect(
        contract.connect(signers.buyer).revealWinnerFromDecryptedIndex(0),
      ).to.be.revertedWithCustomError(contract, "NotFinalized");
    });

    it("rejects reveal from non-buyer", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      await expect(
        contract.connect(signers.alice).revealWinnerFromDecryptedIndex(0),
      ).to.be.revertedWithCustomError(contract, "NotBuyer");
    });

    it("rejects invalid winner index", async function () {
      await submitBid(signers.alice, 100);
      await finalizeRFQ();
      await expect(
        contract.connect(signers.buyer).revealWinnerFromDecryptedIndex(1),
      ).to.be.revertedWithCustomError(contract, "InvalidWinnerIndex");
    });
  });

  // ─── Full flow ─────────────────────────────────────────────────────────────

  describe("Full flow", function () {
    it("Alice=100 Bob=50 Carol=200: Bob wins, losing amounts stay private", async function () {
      await submitBid(signers.alice, 100);
      await submitBid(signers.bob, 50);
      await submitBid(signers.carol, 200);

      expect(await contract.vendorCount()).to.eq(3n);

      // Advance past deadline and finalize — this is the step that grants buyer decrypt access
      await finalizeRFQ();
      expect(await contract.finalized()).to.eq(true);

      // Buyer decrypts the winning vendor index off-chain (FHE.allow was granted in finalize)
      const winnerIndex = await decryptBestVendorIndex();
      expect(winnerIndex).to.eq(1n); // Bob submitted at index 1

      // MVP mock-only: buyer submits the decrypted index to reveal winner on-chain
      // (In production Sepolia version, this step will be replaced by the Zama gateway callback)
      const tx = await contract
        .connect(signers.buyer)
        .revealWinnerFromDecryptedIndex(Number(winnerIndex));
      await tx.wait();

      expect(await contract.revealedWinnerIndex()).to.eq(1n);
      expect(await contract.winnerAddress()).to.eq(signers.bob.address);

      // Buyer can verify the winning bid amount; Alice's and Carol's amounts remain private
      const winningBid = await decryptBestBid();
      expect(winningBid).to.eq(50n);
    });
  });
});
