const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Updating frontend configuration...");

  // Read the deployment addresses
  let sepoliaAddresses, sapphireAddresses;

  try {
    sepoliaAddresses = JSON.parse(fs.readFileSync("sepolia-addresses.json", "utf8"));
    sapphireAddresses = JSON.parse(fs.readFileSync("sapphire-addresses.json", "utf8"));
  } catch (error) {
    console.error("Error reading address files. Make sure both networks are deployed.");
    console.error(error);
    process.exit(1);
  }

  // Read the ChamaFactory ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/UpgradedChamaFactory.sol/ChamaFactory.json");
  const artifact = require(artifactPath);

  // Create the config file content
  const configContent = `// UpgradedChamaFactoryConfig.js
export const UPGRADED_CHAMA_FACTORY_ADDRESS = "${sepoliaAddresses.chamaFactory}";
export const TOKEN_AUTHORITY_ADDRESS = "${sapphireAddresses.tokenAuthority}";
export const UPGRADED_CHAMA_FACTORY_ABI = ${JSON.stringify(artifact.abi, null, 2)};
`;

  // Write the config file
  const configPath = path.join(__dirname, "../../src/contracts/UpgradedChamaFactoryConfig.js");
  fs.writeFileSync(configPath, configContent);
  console.log("Config file saved to src/contracts/UpgradedChamaFactoryConfig.js");

  // Save the ABI separately
  const abiPath = path.join(__dirname, "../../src/contracts/UpgradedChamaFactoryABI.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("ABI saved to src/contracts/UpgradedChamaFactoryABI.json");

  console.log("Frontend configuration updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
