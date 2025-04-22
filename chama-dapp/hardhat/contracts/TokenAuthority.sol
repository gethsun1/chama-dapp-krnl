// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";

/// @notice Protects core ChamaFactory actions via kOS kernels 337, 340
contract TokenAuthority is Ownable {
    struct Keypair { bytes pubKey; bytes privKey; }
    Keypair private signingKeypair;
    Keypair private accessKeypair;

    // Trust anchors injected post‑deploy
    mapping(address => bool)    public nodeWhitelist;
    mapping(bytes32 => bool)    public runtimeDigests;
    mapping(uint256 => bool)    public kernels;

    constructor() Ownable(msg.sender) {
        signingKeypair = _generateKey();
        accessKeypair  = _generateKey();

        // Enable only the kernels your DApp uses:
        kernels[337] = true;  // Prohibited-list
        kernels[340] = true;  // Trusted-list
    }

    /// @notice Owner can whitelist a node’s pubkey
    function setNodeWhitelist(address nodePubKey, bool allowed) external onlyOwner {
        nodeWhitelist[nodePubKey] = allowed;
    }

    /// @notice Owner can allow a runtime digest
    function setRuntimeDigest(bytes32 digest, bool allowed) external onlyOwner {
        runtimeDigests[digest] = allowed;
    }

    /// @notice Owner can toggle kernels on/off
    function setKernel(uint256 kernelId, bool allowed) external onlyOwner {
        kernels[kernelId] = allowed;
    }

    modifier onlyAuthorized(bytes calldata auth) {
        (bytes32 entryId, bytes memory accessToken, bytes32 rd, bytes memory rdSig, , , ) =
            abi.decode(auth, (bytes32, bytes, bytes32, bytes, uint256, uint256, bytes));
        require(_verifyAccessToken(entryId, accessToken), "Invalid access token");
        require(_verifyRuntimeDigest(rd, rdSig), "Invalid runtime digest");
        _;
    }

    modifier onlyValidated(bytes calldata execPlan) {
        require(_verifyExecutionPlan(execPlan), "Kernel validation failed");
        _;
    }

    // Define the Exec struct at contract level
    struct Exec {
        uint256 kernelId;
        bytes result;
        bool isValidated;
        bool opinion;
    }

    function _validateExecution(bytes calldata execPlan)
        external pure returns (bytes memory)
    {
        Exec[] memory exs = abi.decode(execPlan, (Exec[]));
        for (uint i; i < exs.length; i++) {
            uint k = exs[i].kernelId;
            if (k == 337) {
                bool ok = abi.decode(exs[i].result, (uint256)) == 0;
                exs[i].isValidated = ok;
                exs[i].opinion     = ok;
            } else if (k == 340) {
                bool ok = abi.decode(exs[i].result, (bool));
                exs[i].isValidated = ok;
                exs[i].opinion     = ok;
            }
        }
        return abi.encode(exs);
    }

    function _verifyExecutionPlan(bytes calldata execPlan) private pure returns (bool) {
        Exec[] memory exs = abi.decode(execPlan, (Exec[]));
        for (uint i; i < exs.length; i++) if (!exs[i].isValidated) return false;
        return true;
    }

    function _generateKey() private view returns (Keypair memory) {
        bytes memory seed = Sapphire.randomBytes(32, "");
        (bytes memory pub, bytes memory priv) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256, seed
        );
        return Keypair(pub, priv);
    }

    function _verifyAccessToken(bytes32 entryId, bytes memory accessToken)
        private view returns (bool)
    {
        bytes memory digest = abi.encodePacked(keccak256(abi.encode(entryId)));
        return Sapphire.verify(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            accessKeypair.pubKey,
            digest,
            "",
            accessToken
        );
    }

    function _verifyRuntimeDigest(bytes32 rd, bytes memory sig)
        private view returns (bool)
    {
        address signer = ECDSA.recover(rd, sig);
        return nodeWhitelist[signer] && runtimeDigests[rd];
    }

    function registerdApp(bytes32 entryId) external view returns (bytes memory) {
        bytes32 d = keccak256(abi.encode(entryId));
        return Sapphire.sign(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            accessKeypair.privKey,
            abi.encodePacked(d),
            ""
        );
    }

    function sign(
        bytes calldata auth,
        address sender,
        bytes calldata execPlan,
        bytes calldata fnParams,
        bytes calldata krnlParams,
        bytes calldata krnlResponses
    ) external view onlyValidated(execPlan) onlyAuthorized(auth)
      returns (
        bytes memory respSig,
        bytes32 paramsDigest,
        bytes memory tokSig,
        bool finalOpinion
      )
    {
        bytes32 respDigest = keccak256(abi.encodePacked(krnlResponses, sender));
        respSig      = _signDigest(respDigest);
        paramsDigest = keccak256(abi.encodePacked(krnlParams, sender));
        finalOpinion = _getFinalOpinion(execPlan);
        bytes32 dataDig = keccak256(abi.encodePacked(
            keccak256(fnParams), paramsDigest, sender, finalOpinion
        ));
        tokSig = _signDigest(dataDig);
    }

    function _getFinalOpinion(bytes calldata execPlan) private pure returns (bool) {
        Exec[] memory exs = abi.decode(execPlan, (Exec[]));
        for (uint i; i < exs.length; i++) if (!exs[i].opinion) return false;
        return true;
    }

    function _signDigest(bytes32 d) private view returns (bytes memory) {
        bytes memory raw = Sapphire.sign(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            signingKeypair.privKey,
            abi.encodePacked(d),
            ""
        );
        (, SignatureRSV memory r) = EthereumUtils.toEthereumSignature(
            signingKeypair.pubKey, d, raw
        );
        return abi.encodePacked(r.r, r.s, uint8(r.v));
    }
}
