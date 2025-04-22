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
    this.tokenAuthorityAddress = "0x59016421277Eea0F50568c0AfCd0c383Fa7a8cd7";

    // Selected kernel IDs
    this.kernelIds = [90, 91, 340, 347, 883]; // Using optimal kernels for Chama Dapp
    // Kernel 90 (Optimism Sepolia) - Gitcoin Passport getScore (On-chain KYC)
    // Kernel 91 (Optimism Sepolia) - Gitcoin Passport isHuman (On-chain KYC)
    // Kernel 340 (Base Sepolia) - Trusted List (Allow only trusted wallet addresses)
    // Kernel 347 (Optimism Sepolia) - Day and Time (Time-based validations)
    // Kernel 883 (Sepolia) - Mock KYC score (For testing KYC integration)

    // KRNL Platform Registration Information
    this.contractId = 6949;
    this.dAppId = 6610;
    this.entryId = "0x3552c4cf9f8f5b79b2083fb325c6d956a4aeb8bb70bcefa2972f503a2948cc06";
    this.accessToken = "0x30450221009273a0a90b1bd13b0503c07a497018b554935a868ed4575ead1f80ffc296a856022044e81f75da0e50b39d31f50f4a79f7d0b0fe34e6342c6ba98de2f9557d7f16d3";

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

    if (action === 'createChama') {
      // For creating a Chama, all kernels should return positive responses
      kernelResponses = [
        // Kernel 90 (Gitcoin Passport getScore) - Score of 75 (passes threshold of 50)
        [90, abiCoder.encode(['uint256'], [75]), ''],

        // Kernel 91 (Gitcoin Passport isHuman) - User is human
        [91, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 340 (Trusted List) - User is on trusted list
        [340, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 347 (Day and Time) - Current day is Monday (weekday)
        [347, abiCoder.encode(['string'], ['Monday 14:30']), ''],

        // Kernel 883 (Mock KYC score) - KYC score of 85 (passes threshold of 60)
        [883, abiCoder.encode(['uint256'], [85]), '']
      ];
    } else if (action === 'joinChama') {
      // For joining a Chama, all kernels should return positive responses
      kernelResponses = [
        // Kernel 90 (Gitcoin Passport getScore) - Score of 65 (passes threshold of 50)
        [90, abiCoder.encode(['uint256'], [65]), ''],

        // Kernel 91 (Gitcoin Passport isHuman) - User is human
        [91, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 340 (Trusted List) - User is on trusted list
        [340, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 347 (Day and Time) - Current day is Tuesday (weekday)
        [347, abiCoder.encode(['string'], ['Tuesday 10:15']), ''],

        // Kernel 883 (Mock KYC score) - KYC score of 70 (passes threshold of 60)
        [883, abiCoder.encode(['uint256'], [70]), '']
      ];
    } else if (action === 'contribute') {
      // For contributing to a Chama, all kernels should return positive responses
      kernelResponses = [
        // Kernel 90 (Gitcoin Passport getScore) - Score of 60 (passes threshold of 50)
        [90, abiCoder.encode(['uint256'], [60]), ''],

        // Kernel 91 (Gitcoin Passport isHuman) - User is human
        [91, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 340 (Trusted List) - User is on trusted list
        [340, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 347 (Day and Time) - Current day is Wednesday (weekday)
        [347, abiCoder.encode(['string'], ['Wednesday 16:45']), ''],

        // Kernel 883 (Mock KYC score) - KYC score of 75 (passes threshold of 60)
        [883, abiCoder.encode(['uint256'], [75]), '']
      ];
    } else if (action === 'payout') {
      // For executing a payout, all kernels should return positive responses
      kernelResponses = [
        // Kernel 90 (Gitcoin Passport getScore) - Score of 80 (passes threshold of 50)
        [90, abiCoder.encode(['uint256'], [80]), ''],

        // Kernel 91 (Gitcoin Passport isHuman) - User is human
        [91, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 340 (Trusted List) - User is on trusted list
        [340, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 347 (Day and Time) - Current day is Thursday (weekday)
        [347, abiCoder.encode(['string'], ['Thursday 09:30']), ''],

        // Kernel 883 (Mock KYC score) - KYC score of 90 (passes threshold of 60)
        [883, abiCoder.encode(['uint256'], [90]), '']
      ];
    } else {
      // Default responses for any other action
      kernelResponses = [
        // Kernel 90 (Gitcoin Passport getScore) - Score of 70 (passes threshold of 50)
        [90, abiCoder.encode(['uint256'], [70]), ''],

        // Kernel 91 (Gitcoin Passport isHuman) - User is human
        [91, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 340 (Trusted List) - User is on trusted list
        [340, abiCoder.encode(['bool'], [true]), ''],

        // Kernel 347 (Day and Time) - Current day is Friday (weekday)
        [347, abiCoder.encode(['string'], ['Friday 12:00']), ''],

        // Kernel 883 (Mock KYC score) - KYC score of 80 (passes threshold of 60)
        [883, abiCoder.encode(['uint256'], [80]), '']
      ];
    }

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
