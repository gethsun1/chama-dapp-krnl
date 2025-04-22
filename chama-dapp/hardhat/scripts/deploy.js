const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to", hre.network.name);

  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);

  // Deploy TokenAuthority first
  console.log("Deploying TokenAuthority...");
  const TokenAuthority = await hre.ethers.getContractFactory("TokenAuthority");
  const tokenAuthority = await TokenAuthority.deploy(deployerAddress);
  await tokenAuthority.waitForDeployment();

  const tokenAuthorityAddress = await tokenAuthority.getAddress();
  console.log("TokenAuthority deployed to:", tokenAuthorityAddress);

  // Deploy KRNL token
  console.log("Deploying KRNL token...");
  const KRNL = await hre.ethers.getContractFactory("KRNL");
  const krnl = await KRNL.deploy(tokenAuthorityAddress);
  await krnl.waitForDeployment();

  const krnlAddress = await krnl.getAddress();
  console.log("KRNL token deployed to:", krnlAddress);

  // Deploy UpgradedChamaFactory with TokenAuthority address
  console.log("Deploying UpgradedChamaFactory...");
  const UpgradedChamaFactory = await hre.ethers.getContractFactory("UpgradedChamaFactory");
  const upgradedChamaFactory = await UpgradedChamaFactory.deploy(tokenAuthorityAddress, krnlAddress);
  await upgradedChamaFactory.waitForDeployment();

  const upgradedChamaFactoryAddress = await upgradedChamaFactory.getAddress();
  console.log("UpgradedChamaFactory deployed to:", upgradedChamaFactoryAddress);

  console.log("Deployment complete!");
  console.log("TokenAuthority:", tokenAuthorityAddress);
  console.log("KRNL Token:", krnlAddress);
  console.log("UpgradedChamaFactory:", upgradedChamaFactoryAddress);

  // Wait for 30 seconds to ensure Etherscan has time to index the contracts
  console.log("Waiting for 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Verify contracts on Etherscan
  try {
    console.log("Verifying TokenAuthority on Etherscan...");
    await hre.run("verify:verify", {
      address: tokenAuthorityAddress,
      constructorArguments: [deployerAddress],
    });

    console.log("Verifying KRNL token on Etherscan...");
    await hre.run("verify:verify", {
      address: krnlAddress,
      constructorArguments: [tokenAuthorityAddress],
    });

    console.log("Verifying UpgradedChamaFactory on Etherscan...");
    await hre.run("verify:verify", {
      address: upgradedChamaFactoryAddress,
      constructorArguments: [tokenAuthorityAddress, krnlAddress],
    });

    console.log("Verification complete!");
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
