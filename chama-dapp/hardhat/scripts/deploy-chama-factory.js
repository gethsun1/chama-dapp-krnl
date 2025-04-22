const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying UpgradedChamaFactory to Ethereum Sepolia");

  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);

  // Read the TokenAuthority and KRNL addresses from the Sapphire deployment
  let sapphireAddresses;
  try {
    sapphireAddresses = JSON.parse(fs.readFileSync("sapphire-addresses.json", "utf8"));
    console.log("Using TokenAuthority address:", sapphireAddresses.tokenAuthority);
  } catch (error) {
    console.error("Error reading sapphire-addresses.json. Make sure to deploy to Sapphire first.");
    console.error(error);
    process.exit(1);
  }

  // Deploy UpgradedChamaFactory with TokenAuthority address
  console.log("Deploying UpgradedChamaFactory...");
  const UpgradedChamaFactory = await hre.ethers.getContractFactory("UpgradedChamaFactory");
  const upgradedChamaFactory = await UpgradedChamaFactory.deploy(
    sapphireAddresses.tokenAuthority
  );
  await upgradedChamaFactory.waitForDeployment();

  const upgradedChamaFactoryAddress = await upgradedChamaFactory.getAddress();
  console.log("UpgradedChamaFactory deployed to:", upgradedChamaFactoryAddress);

  console.log("Deployment complete!");
  console.log("UpgradedChamaFactory:", upgradedChamaFactoryAddress);

  // Save the address to a file for easy access
  const addresses = {
    chamaFactory: upgradedChamaFactoryAddress
  };
  fs.writeFileSync("sepolia-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Address saved to sepolia-addresses.json");

  // Wait for 30 seconds to ensure Etherscan has time to index the contract
  console.log("Waiting for 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Verify contract on Etherscan
  try {
    console.log("Verifying UpgradedChamaFactory on Etherscan...");
    await hre.run("verify:verify", {
      address: upgradedChamaFactoryAddress,
      constructorArguments: [
        sapphireAddresses.tokenAuthority
      ],
    });

    console.log("Verification complete!");
  } catch (error) {
    console.error("Error during verification:", error);
  }

  // Generate the ABI for the UpgradedChamaFactory contract
  console.log("Generating ABI for UpgradedChamaFactory...");
  const artifact = await hre.artifacts.readArtifact("UpgradedChamaFactory");
  fs.writeFileSync("../src/contracts/UpgradedChamaFactoryABI.json", JSON.stringify(artifact.abi, null, 2));
  console.log("ABI saved to ../src/contracts/UpgradedChamaFactoryABI.json");

  // Create a config file with the contract address and ABI
  console.log("Creating config file...");
  const configContent = `// UpgradedChamaFactoryConfig.js
export const UPGRADED_CHAMA_FACTORY_ADDRESS = "${upgradedChamaFactoryAddress}";
export const TOKEN_AUTHORITY_ADDRESS = "${sapphireAddresses.tokenAuthority}";

// Import ABI using ES modules
import UPGRADED_CHAMA_FACTORY_ABI from "./UpgradedChamaFactoryABI.json";
export { UPGRADED_CHAMA_FACTORY_ABI };
`;
  fs.writeFileSync("../src/contracts/UpgradedChamaFactoryConfig.js", configContent);
  console.log("Config file saved to ../src/contracts/UpgradedChamaFactoryConfig.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
