const hre = require("hardhat");

async function main() {
  console.log("Deploying TokenAuthority to Oasis Sapphire Testnet");

  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);

  // Deploy TokenAuthority
  console.log("Deploying TokenAuthority...");
  const TokenAuthority = await hre.ethers.getContractFactory("TokenAuthority");
  const tokenAuthority = await TokenAuthority.deploy();
  await tokenAuthority.waitForDeployment();

  const tokenAuthorityAddress = await tokenAuthority.getAddress();
  console.log("TokenAuthority deployed to:", tokenAuthorityAddress);

  console.log("Deployment complete!");
  console.log("TokenAuthority:", tokenAuthorityAddress);

  // Save the address to a file for easy access
  const fs = require("fs");
  const addresses = {
    tokenAuthority: tokenAuthorityAddress
  };
  fs.writeFileSync("sapphire-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Address saved to sapphire-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
