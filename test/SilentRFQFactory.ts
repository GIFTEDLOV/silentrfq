import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, fhevm } from "hardhat";
import { SilentRFQ, SilentRFQFactory, SilentRFQFactory__factory } from "../types";
import { expect } from "chai";

describe("SilentRFQFactory", function () {
  let signers: {
    buyer1: HardhatEthersSigner;
    buyer2: HardhatEthersSigner;
    other: HardhatEthersSigner;
  };
  let factory: SilentRFQFactory;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      buyer1: ethSigners[0],
      buyer2: ethSigners[1],
      other: ethSigners[2],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    const Factory = (await ethers.getContractFactory("SilentRFQFactory")) as SilentRFQFactory__factory;
    factory = (await Factory.deploy()) as SilentRFQFactory;
  });

  // ─── createRFQ ─────────────────────────────────────────────────────────────

  describe("createRFQ", function () {
    it("sets msg.sender as buyer on the deployed SilentRFQ", async function () {
      const deadline = (await time.latest()) + 3600;
      await (await factory.connect(signers.buyer1).createRFQ("Widget procurement", deadline)).wait();

      const rfqs = await factory.getRFQs();
      const rfq = (await ethers.getContractAt("SilentRFQ", rfqs[0])) as SilentRFQ;
      expect(await rfq.buyer()).to.eq(signers.buyer1.address);
    });

    it("returns the address of the deployed SilentRFQ contract", async function () {
      const deadline = (await time.latest()) + 3600;
      // staticCall to capture return value without mining a tx
      const rfqAddress = await factory.connect(signers.buyer1).createRFQ.staticCall("Widget procurement", deadline);
      await (await factory.connect(signers.buyer1).createRFQ("Widget procurement", deadline)).wait();

      const rfqs = await factory.getRFQs();
      expect(rfqAddress).to.eq(rfqs[0]);
    });

    it("emits RFQCreated with correct rfq address, buyer, description and deadline", async function () {
      const deadline = (await time.latest()) + 3600;
      const rfqAddress = await factory.connect(signers.buyer1).createRFQ.staticCall("Widget procurement", deadline);

      await expect(factory.connect(signers.buyer1).createRFQ("Widget procurement", deadline))
        .to.emit(factory, "RFQCreated")
        .withArgs(rfqAddress, signers.buyer1.address, "Widget procurement", deadline);
    });

    it("rejects invalid deadline — propagated from SilentRFQ constructor", async function () {
      // timestamp 1 is in the past; SilentRFQ constructor reverts with InvalidDeadline
      await expect(
        factory.connect(signers.buyer1).createRFQ("Widget procurement", 1),
      ).to.be.reverted;
    });
  });

  // ─── getRFQs ───────────────────────────────────────────────────────────────

  describe("getRFQs", function () {
    it("returns all RFQs created across all buyers", async function () {
      const deadline = (await time.latest()) + 3600;
      await (await factory.connect(signers.buyer1).createRFQ("RFQ A", deadline)).wait();
      await (await factory.connect(signers.buyer2).createRFQ("RFQ B", deadline)).wait();

      const rfqs = await factory.getRFQs();
      expect(rfqs.length).to.eq(2);

      const rfqA = (await ethers.getContractAt("SilentRFQ", rfqs[0])) as SilentRFQ;
      const rfqB = (await ethers.getContractAt("SilentRFQ", rfqs[1])) as SilentRFQ;
      expect(await rfqA.buyer()).to.eq(signers.buyer1.address);
      expect(await rfqB.buyer()).to.eq(signers.buyer2.address);
    });

    it("returns empty array when no RFQs have been created", async function () {
      expect(await factory.getRFQs()).to.deep.eq([]);
    });
  });

  // ─── getRFQsByBuyer ────────────────────────────────────────────────────────

  describe("getRFQsByBuyer", function () {
    it("returns only RFQs created by the specified buyer", async function () {
      const deadline = (await time.latest()) + 3600;
      await (await factory.connect(signers.buyer1).createRFQ("RFQ A", deadline)).wait();
      await (await factory.connect(signers.buyer2).createRFQ("RFQ B", deadline)).wait();
      await (await factory.connect(signers.buyer1).createRFQ("RFQ C", deadline)).wait();

      const buyer1RFQs = await factory.getRFQsByBuyer(signers.buyer1.address);
      const buyer2RFQs = await factory.getRFQsByBuyer(signers.buyer2.address);

      expect(buyer1RFQs.length).to.eq(2); // RFQ A and RFQ C
      expect(buyer2RFQs.length).to.eq(1); // RFQ B only
    });

    it("returns empty array for a buyer with no RFQs", async function () {
      expect(await factory.getRFQsByBuyer(signers.other.address)).to.deep.eq([]);
    });
  });

  // ─── rfqCount ──────────────────────────────────────────────────────────────

  describe("rfqCount", function () {
    it("returns zero before any RFQs are created", async function () {
      expect(await factory.rfqCount()).to.eq(0n);
    });

    it("increments with each createRFQ call", async function () {
      const deadline = (await time.latest()) + 3600;
      expect(await factory.rfqCount()).to.eq(0n);
      await (await factory.connect(signers.buyer1).createRFQ("RFQ A", deadline)).wait();
      expect(await factory.rfqCount()).to.eq(1n);
      await (await factory.connect(signers.buyer2).createRFQ("RFQ B", deadline)).wait();
      expect(await factory.rfqCount()).to.eq(2n);
    });
  });
});
