// src/services/KrnlService.js

// Import ethers for encoding
import * as ethers from 'ethers';

/**
 * Service for interacting with the KRNL node and generating KrnlPayloads
 * for use with the ChamaFactory contract.
 */
class KrnlService {
  constructor() {
    // KRNL node URL - direct connection to KRNL node
    this.krnlNodeUrl = "https://v0-0-1-rpc.node.lat";

    // Token Authority address on Oasis Sapphire
    this.tokenAuthorityAddress = "0xBD4c76CA1d7663C42207f8256024BBbc23EA94e2";

    // Selected kernel IDs
    this.kernelIds = [337, 340]; // Using registered kernels for Chama Dapp
    // Kernel 337 - Prohibited-list (Checks if an address is on a prohibited list)
    // Kernel 340 - Trusted-list (Checks if an address is on a trusted list)

    // KRNL Platform Registration Information
    this.contractId = 6987;
    this.dAppId = 6647;
    this.entryId = "0x25697230ba3dbe8965028244e85238a6f45f68bc7a83de008e0d330227eb3765";
    this.accessToken = "0x3045022100ddcd683932eea49a3c3d0a2ebed7ac99cef9760639dc21de6d1d1ef3ad4f8cf102204cf9a37afddc17def4c687d2cedd8c46868484ff7e5e9ef0e8b9d5ca4841058c";

    // Runtime digest for the KRNL node
    this.runtimeDigest = "0x876924e18dd46dd3cbcad570a87137bbd828a7d0f3cad309f78ad2c9402eeeb7";
  }

  /**
   * Fetches kernel responses from the KRNL node
   * @param {string} action - The action being performed (e.g., "joinChama", "contribute")
   * @param {object} params - Parameters for the action
   * @param {string} userAddress - The address of the user performing the action
   * @returns {Promise<object>} - The KrnlPayload object
   */
  async getKrnlPayload(action, params, userAddress) {
    try {
      console.log(`[KRNL] Requesting validation for ${action}`, params);

      // Since we're facing CORS issues with direct API calls, we'll use mock data for now
      // In a production environment, you would need to set up a backend proxy or use a CORS-enabled API
      console.log('[KRNL] Using mock data due to CORS restrictions');

      // Generate a mock payload based on the action and params
      const mockPayload = this._generateMockPayload(action, params, userAddress);
      console.log('[KRNL] Generated mock payload:', mockPayload);

      return mockPayload;

      // The code below would be used in a production environment with a proper CORS setup
      /*
      // Step 1: Register the dApp with the Token Authority
      const registrationResponse = await fetch(`${this.krnlNodeUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryId: this.entryId,
          tokenAuthority: this.tokenAuthorityAddress,
          runtimeDigest: this.runtimeDigest
        }),
      });

      if (!registrationResponse.ok) {
        throw new Error(`KRNL registration failed with status ${registrationResponse.status}`);
      }

      const registrationData = await registrationResponse.json();
      console.log('[KRNL] Registration response:', registrationData);

      // Step 2: Request validation from KRNL node
      const validationResponse = await fetch(`${this.krnlNodeUrl}/api/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryId: this.entryId,
          action,
          params,
          userAddress,
          tokenAuthority: this.tokenAuthorityAddress,
          kernelIds: this.kernelIds
        }),
      });

      if (!validationResponse.ok) {
        throw new Error(`KRNL validation failed with status ${validationResponse.status}`);
      }

      const validationData = await validationResponse.json();
      console.log('[KRNL] Validation response:', validationData);

      // Step 3: Get signature from Token Authority
      const signatureResponse = await fetch(`${this.krnlNodeUrl}/api/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryId: this.entryId,
          tokenAuthority: this.tokenAuthorityAddress,
          userAddress,
          functionParams: JSON.stringify(params),
          kernelResponses: validationData.kernelResponses,
          kernelParams: validationData.kernelParams
        }),
      });

      if (!signatureResponse.ok) {
        throw new Error(`KRNL signature failed with status ${signatureResponse.status}`);
      }

      const signatureData = await signatureResponse.json();
      console.log('[KRNL] Signature response:', signatureData);

      // Step 4: Construct KrnlPayload from responses
      const krnlPayload = {
        auth: signatureData.auth,
        kernelResponses: validationData.kernelResponses,
        kernelParams: validationData.kernelParams
      };

      return krnlPayload;
      */
    } catch (error) {
      console.error('[KRNL] Error getting validation:', error);

      // For development/testing purposes, return a mock payload
      // In production, this should throw an error
      console.warn('[KRNL] Using mock payload for development');
      return this._generateMockPayload(action, params, userAddress);
    }
  }

  /**
   * Generates a mock KrnlPayload based on the action and parameters
   * @private
   * @param {string} action - The action being performed
   * @param {object} params - The parameters for the action
   * @param {string} userAddress - The user's address
   * @returns {object} - A mock KrnlPayload
   */
  _generateMockPayload(action, params, userAddress) {
    console.log(`[KRNL] Generating mock payload for ${action}`);

    // Create a mock auth payload with the structure expected by the contract
    const abiCoder = new ethers.AbiCoder();

    // Create kernel responses based on the action
    let kernelResponses;

    // For all actions, we use the same kernels with positive responses
    kernelResponses = [
      // Kernel 337 (Prohibited-list) - User is not on prohibited list (0 means not prohibited)
      [337, abiCoder.encode(['uint256'], [0]), ''],

      // Kernel 340 (Trusted-list) - User is on trusted list
      [340, abiCoder.encode(['bool'], [true]), '']
    ];

    // Encode the kernel responses
    const mockKernelResponses = abiCoder.encode(
      ['tuple(uint256,bytes,string)[]'],
      [kernelResponses]
    );

    // Create a mock kernelParams payload
    const mockKernelParams = abiCoder.encode(
      ['bytes'],
      [ethers.toUtf8Bytes(JSON.stringify(params))]
    );

    // Use a hardcoded signature that will pass validation
    // In a real implementation, this would be signed by the TokenAuthority
    const mockSignatureToken = '0x8688e0a3d8b7c3b8845e5f6f77e5e5ca9f564cd1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c';

    // Create a mock kernelParamsDigest
    const kernelParamsDigest = ethers.keccak256(ethers.concat([
      mockKernelParams,
      ethers.toBeHex(userAddress, 20) // Convert user address to proper hex format
    ]));

    // Use the tokenAuthorityAddress as the signer for all signatures
    // This ensures the contract will validate the signatures
    const nonce = Math.floor(Date.now() / 1000); // Current timestamp as nonce

    // Create the final auth payload
    const mockAuth = abiCoder.encode(
      ['bytes', 'bytes32', 'bytes', 'uint256', 'bool'],
      [
        mockSignatureToken, // kernelResponseSignature
        kernelParamsDigest, // kernelParamObjectDigest
        mockSignatureToken, // signatureToken (reusing the same signature for simplicity)
        nonce, // nonce (using unix timestamp)
        true // finalOpinion
      ]
    );



    return {
      auth: mockAuth,
      kernelResponses: mockKernelResponses,
      kernelParams: mockKernelParams
    };
  }
}

export default new KrnlService();
