// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";

/// @title TokenAuthority for ChamaFactory Protection via KRNL on Oasis Sapphire
/// @notice Guards ChamaFactory.sol using kOS kernels (337, 340, 90, 91, 347)
contract TokenAuthority is Ownable {
    struct Keypair { bytes pubKey; bytes privKey; }
    struct Execution {
        uint256 kernelId;
        bytes result;
        bytes proof;
        bool isValidated;
        bool opinion;
        string opinionDetails;
        string err;
    }

    Keypair private signingKeypair;
    Keypair private accessKeypair;
    bytes32 private signingKeypairRetrievalPassword;

    mapping(address => bool) private whitelist;
    mapping(bytes32 => bool) private runtimeDigests;
    mapping(uint256 => bool) private kernels;

    constructor(address initialOwner) Ownable(initialOwner) {
        signingKeypair = _generateKey();
        accessKeypair  = _generateKey();

        kernels[337] = true;
        kernels[340] = true;
        kernels[90]  = true;
        kernels[91]  = true;
        kernels[347] = true;

        whitelist[0x3535448e2AAa9EfB9F575F292C904d383EDa9352] = true;
        runtimeDigests[
            0x876924e18dd46dd3cbcad570a87137bbd828a7d0f3cad309f78ad2c9402eeeb7
        ] = true;
    }

    modifier onlyAuthorized(bytes calldata auth) {
        (
            bytes32 entryId,
            bytes memory accessToken,
            bytes32 runtimeDigest,
            bytes memory runtimeDigestSignature,
            uint256 nonce,
            uint256 blockTimeStamp,
            bytes memory authSignature
        ) = abi.decode(auth, (bytes32, bytes, bytes32, bytes, uint256, uint256, bytes));

        require(_verifyAccessToken(entryId, accessToken), "Invalid access token");
        require(_verifyRuntimeDigest(runtimeDigest, runtimeDigestSignature), "Bad runtime digest");
        _;
    }

    modifier onlyValidated(bytes calldata executionPlan) {
        require(_verifyExecutionPlan(executionPlan), "Kernel validation failed");
        _;
    }

    modifier onlyAllowedKernel(uint256 kernelId) {
        require(kernels[kernelId], "Kernel not enabled");
        _;
    }

    function _validateExecution(bytes calldata executionPlan)
        external
        pure 
        returns (bytes memory)
    {
        Execution[] memory execs = abi.decode(executionPlan, (Execution[]));
        for (uint256 i; i < execs.length; i++) {
            uint256 k = execs[i].kernelId;
            if (k == 337) {
                bool ok = abi.decode(execs[i].result, (uint256)) == 0;
                execs[i].isValidated = ok;
                execs[i].opinion     = ok;
            } else if (k == 340) {
                bool ok = abi.decode(execs[i].result, (bool));
                execs[i].isValidated = ok;
                execs[i].opinion     = ok;
            } else if (k == 90) {
                bool ok = abi.decode(execs[i].result, (uint256)) > 0;
                execs[i].isValidated = ok;
                execs[i].opinion     = ok;
            } else if (k == 91) {
                bool ok = abi.decode(execs[i].result, (bool));
                execs[i].isValidated = ok;
                execs[i].opinion     = ok;
            } else if (k == 347) {
                bool ok = bytes(abi.decode(execs[i].result, (string))).length > 0;
                execs[i].isValidated = ok;
                execs[i].opinion     = ok;
            }
        }
        return abi.encode(execs);
    }

    function _verifyExecutionPlan(bytes calldata executionPlan)
        private
        pure
        returns (bool)
    {
        Execution[] memory execs = abi.decode(executionPlan, (Execution[]));
        for (uint256 i; i < execs.length; i++) {
            if (!execs[i].isValidated) return false;
        }
        return true;
    }

    function _getFinalOpinion(bytes calldata executionPlan)
        private
        pure
        returns (bool)
    {
        Execution[] memory execs = abi.decode(executionPlan, (Execution[]));
        for (uint256 i; i < execs.length; i++) {
            if (!execs[i].opinion) return false;
        }
        return true;
    }

    function _generateKey() private view returns (Keypair memory) {
        bytes memory seed = Sapphire.randomBytes(32, "");
        (bytes memory pubKey, bytes memory privKey) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            seed
        );
        return Keypair(pubKey, privKey);
    }

    function _verifyAccessToken(bytes32 entryId, bytes memory accessToken)
        private
        view
        returns (bool)
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

    function _verifyRuntimeDigest(bytes32 runtimeDigest, bytes memory sig)
        private
        view
        returns (bool)
    {
        return whitelist[ECDSA.recover(runtimeDigest, sig)];
    }

    function _ethSig(bytes memory privKey, bytes memory pubKey, bytes32 digest)
        private
        view
        returns (bytes memory)
    {
        bytes memory raw = Sapphire.sign(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            privKey,
            abi.encodePacked(digest),
            ""
        );
        (, SignatureRSV memory rsv) = EthereumUtils.toEthereumSignature(
            pubKey,
            digest,
            raw
        );
        return abi.encodePacked(rsv.r, rsv.s, uint8(rsv.v));
    }

    function registerdApp(bytes32 entryId) external view returns (bytes memory) {
        return _ethSig(
            accessKeypair.privKey,
            accessKeypair.pubKey,
            keccak256(abi.encode(entryId))
        );
    }

    function isKernelAllowed(bytes calldata auth, uint256 kernelId)
        external
        view
        onlyAuthorized(auth)
        returns (bool)
    {
        return kernels[kernelId];
    }

    function getOpinion(bytes calldata auth, bytes calldata executionPlan)
        external
        view
        onlyAuthorized(auth)
        returns (bytes memory)
    {
        try this._validateExecution(executionPlan) returns (bytes memory result) {
            return result;
        } catch {
            return executionPlan;
        }
    }

    function sign(
        bytes calldata auth,
        address senderAddress,
        bytes calldata executionPlan,
        bytes calldata functionParams,
        bytes calldata kernelParams,
        bytes calldata kernelResponses
    )
        external
        view
        onlyValidated(executionPlan)
        onlyAuthorized(auth)
        returns (
            bytes memory kernelResponsesSignature,
            bytes32 kernelParamsDigest,
            bytes memory signatureToken,
            bool finalOpinion
        )
    {
        (, , , , uint256 nonce, , ) = abi.decode(
            auth,
            (bytes32, bytes, bytes32, bytes, uint256, uint256, bytes)
        );

        kernelResponsesSignature = _ethSig(
            signingKeypair.privKey,
            signingKeypair.pubKey,
            keccak256(abi.encodePacked(kernelResponses, senderAddress))
        );

        kernelParamsDigest = keccak256(abi.encodePacked(kernelParams, senderAddress));

        finalOpinion = _getFinalOpinion(executionPlan);

        signatureToken = _ethSig(
            signingKeypair.privKey,
            signingKeypair.pubKey,
            keccak256(
                abi.encodePacked(
                    keccak256(functionParams),
                    kernelParamsDigest,
                    senderAddress,
                    nonce,
                    finalOpinion
                )
            )
        );
    }
}
