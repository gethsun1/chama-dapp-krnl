const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Using account:", deployerAddress);

  // Read the ChamaFactory address from the Sepolia deployment
  let sepoliaAddresses;
  try {
    sepoliaAddresses = JSON.parse(fs.readFileSync("sepolia-addresses.json", "utf8"));
    console.log("Using ChamaFactory address:", sepoliaAddresses.chamaFactory);
  } catch (error) {
    console.error("Error reading sepolia-addresses.json");
    console.error(error);
    process.exit(1);
  }

  // The address to whitelist
  const addressToWhitelist = "0x3535448e2AAa9EfB9F575F292C904d383EDa9352";
  console.log("Whitelisting address:", addressToWhitelist);

  // Get the ChamaFactory contract
  const ChamaFactory = await hre.ethers.getContractFactory("ChamaFactory");
  const chamaFactory = ChamaFactory.attach(sepoliaAddresses.chamaFactory);

  // Add the address to the whitelist
  console.log("Adding address to whitelist...");
  const tx = await chamaFactory.updateWhitelist(addressToWhitelist, true);
  await tx.wait();
  console.log("Transaction hash:", tx.hash);

  // Verify the address is whitelisted
  const isWhitelisted = await chamaFactory.whitelist(addressToWhitelist);
  console.log("Is address whitelisted:", isWhitelisted);

  console.log("Whitelisting complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
