# Chama DApp with KRNL Integration

A decentralized application for creating and managing Chama groups (rotating savings and credit associations) with enhanced security and compliance through KRNL protocol integration.

## Overview

The Chama DApp allows users to:
- Create new Chama groups
- Join existing Chamas
- Make regular contributions
- Execute payouts to members
- Track contribution history and payout schedules

## Technology Stack

- **Frontend**: React, Material-UI, Vite
- **Smart Contracts**: Solidity
- **Development Environment**: Hardhat
- **Blockchain Networks**:
  - Ethereum Sepolia (for UpgradedChamaFactory)
  - Oasis Sapphire Testnet (for TokenAuthority)
- **Wallet Integration**: Web3Modal, AppKit
- **Security & Compliance**: KRNL Protocol

## KRNL Protocol Integration

The Chama DApp integrates with the KRNL protocol to enhance security and compliance:

- **Kernels Used**:
  - Kernel 337 (Prohibited-list)
  - Kernel 340 (Trusted-list)
  
- **TokenAuthority Contract**: Deployed on Oasis Sapphire Testnet for confidential computing and secure validation

- **Development Mode**: The contracts include a development mode that bypasses signature validation for easier testing

## Smart Contracts

1. **UpgradedChamaFactory**: Main contract for creating and managing Chamas
   - Deployed on Ethereum Sepolia: `0xab05c6480f4306cB54d90eFbe64A250fFc8757d0`

2. **TokenAuthority**: Contract for validating KRNL kernel responses
   - Deployed on Oasis Sapphire Testnet: `0x59016421277Eea0F50568c0AfCd0c383Fa7a8cd7`

## Getting Started

### Prerequisites

- Node.js and npm/yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/gethsun1/chama-dapp-krnl.git
   cd chama-dapp-krnl
   ```

2. Install dependencies:
   ```
   cd chama-dapp
   yarn install
   ```

3. Start the development server:
   ```
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Smart Contract Deployment

If you want to deploy your own version of the contracts:

1. Set up environment variables:
   ```
   cd hardhat
   cp .env.example .env
   ```
   Edit `.env` with your private key and API keys

2. Deploy TokenAuthority to Oasis Sapphire Testnet:
   ```
   npx hardhat run scripts/deploy-token-authority.js --network sapphire_testnet
   ```

3. Deploy UpgradedChamaFactory to Ethereum Sepolia:
   ```
   npx hardhat run scripts/deploy-chama-factory.js --network sepolia
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
