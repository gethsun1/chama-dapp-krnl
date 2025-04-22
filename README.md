# Chama DApp with KRNL Integration

A decentralized application for creating and managing Chama groups with enhanced security and compliance through KRNL protocol integration.

## What is a Chama?

A Chama is a type of cooperative savings and investment group common in East Africa, particularly in Kenya. Similar to Rotating Savings and Credit Associations (ROSCAs) or "money pools" in other cultures, Chamas allow members to pool resources, save collectively, and provide each other with financial support. Traditionally managed through in-person meetings and paper records, the Chama DApp brings this concept to the blockchain for greater transparency, security, and accessibility.

## Key Features

- **Decentralized Chama Creation**: Create Chama groups on the Ethereum blockchain with customizable parameters
- **Secure Member Management**: Add and manage members with blockchain-based verification
- **Automated Contributions**: Make and track contributions with smart contract enforcement
- **Transparent Payouts**: Execute payouts to members based on predefined rules
- **KRNL Protocol Integration**: Enhanced security and compliance through KRNL kernels
- **Web3 Wallet Integration**: Connect with MetaMask and other Ethereum wallets

## KRNL Protocol Integration

The Chama DApp leverages the KRNL protocol for enhanced security and compliance:

- **Kernel 337 (Prohibited-list)**: Ensures users are not on prohibited lists before creating or joining Chamas
- **Kernel 340 (Trusted-list)**: Verifies users are on trusted lists for enhanced security

These kernels provide real-time validation of user actions, ensuring compliance with predefined rules and enhancing the security of the platform.

## Smart Contracts

### UpgradedChamaFactory

The main contract that manages the creation and operation of Chama groups.

- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x30a3a40FCDD904C32f0eBC2B05aC7082db0A7a6a`

#### Key Functions

- `createChama(string name, string description, uint256 depositAmount, uint256 contributionAmount, uint256 penalty, uint256 maxMembers, uint256 cycleDuration, KrnlTypes.KrnlPayload memory krnlPayload)`: Creates a new Chama group with the specified parameters
- `joinChama(uint256 chamaId, KrnlTypes.KrnlPayload memory krnlPayload)`: Allows a user to join an existing Chama
- `contribute(uint256 chamaId, KrnlTypes.KrnlPayload memory krnlPayload)`: Makes a contribution to a Chama
- `executePayout(uint256 chamaId, address memberAddress, KrnlTypes.KrnlPayload memory krnlPayload)`: Executes a payout to a Chama member

### TokenAuthority

The contract that validates KRNL payloads and ensures compliance with security rules.

- **Network**: Oasis Sapphire Testnet
- **Address**: `0x8eE3A46aAd8c8F09d56D8d0D6A2227ee9eF45018`

## Frontend Application

The frontend is built with React and Vite, providing a modern and responsive user interface for interacting with the Chama DApp.

### Key Components

- **Home Page**: Overview of the DApp and available Chamas
- **Create Chama**: Form for creating new Chama groups
- **Chama Details**: View and manage a specific Chama
- **Member Dashboard**: Personal dashboard for users to track their Chamas and contributions
- **Web3 Integration**: Connect wallet functionality with MetaMask support

## User Flow

1. **Connect Wallet**: User connects their Ethereum wallet to the DApp
2. **Create or Join Chama**: User creates a new Chama or joins an existing one
3. **Make Contributions**: User makes regular contributions to their Chama(s)
4. **Receive Payouts**: User receives payouts according to the Chama's rules

## Technical Architecture

### Smart Contract Layer

- **Solidity Contracts**: Core business logic implemented in Solidity
- **KRNL Integration**: Security and compliance through KRNL protocol
- **ERC20 Support**: Support for ETH and potentially other tokens

### Application Layer

- **React Frontend**: Modern UI built with React
- **ethers.js**: Ethereum interaction library
- **Web3Modal**: Wallet connection management
- **KrnlService**: Service for generating KRNL payloads

## Setup and Development

### Smart Contract Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values or run:
   krnl setup
   ```

3. Compile contracts:
   ```bash
   krnl compile
   ```

4. Deploy contracts:
   ```bash
   krnl deploy-all
   ```

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd chama-dapp
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

## Project Structure

- `src/`: Smart contract source files
  - `TokenAuthority.sol`: KRNL integration contract
  - `KRNL.sol`: KRNL protocol interface
- `chama-dapp/`: Frontend application
  - `src/components/`: React components
  - `src/contracts/`: Contract ABIs and configurations
  - `src/services/`: Service classes including KrnlService
  - `src/pages/`: Main application pages
- `test/`: Test files for smart contracts
- `script/`: Deployment scripts

## KRNL Registration Information

- **Contract ID**: 6983
- **dApp ID**: 6643
- **Entry ID**: 0xc99dc8d45e29dfb80ae76b15fe31e5d43f0f7371525649ab4e11b1521b7d4baf

## License

MIT
