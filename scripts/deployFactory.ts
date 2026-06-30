import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SilentRFQFactory with account:", deployer.address);

  const Factory = await ethers.getContractFactory("SilentRFQFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("SilentRFQFactory deployed to:", address);
  console.log("\nCopy this to frontend/.env.local:");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
