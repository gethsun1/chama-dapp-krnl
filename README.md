
<p align="center">
  <a href="https://twitter.com/KRNL_xyz"><img src="https://img.shields.io/badge/KRNL%20Protocol-Integrated-blue?style=flat-square" alt="KRNL Protocol"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
</p>

# Chama DApp 🚀

A **decentralized savings and credit** application (Chama) with built‑in **KRNL protocol** security for transparent, compliant group savings on the blockchain.

---

## 📖 Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [KRNL Integration](#krnl-integration)  
4. [Smart Contracts](#smart-contracts)  
5. [Frontend](#frontend)  
6. [User Flow](#user-flow)  
7. [Architecture](#architecture)  
8. [Getting Started](#getting-started)  
9. [Project Structure](#project-structure)  
10. [Registration & IDs](#registration--ids)  
11. [License](#license)

---

## 🔍 Overview

**Chama DApp** modernizes the East African *Chama* (ROSCA) model by moving group savings onto-chain for:

- **Transparency:** Immutable on‑chain records  
- **Security:** Smart‑contract enforcement  
- **Compliance:** KRNL‑validated actions  
- **Accessibility:** Wallet‑powered UX  

---

## ✨ Features

- **🆕 Create & Manage Chamas**  
  Define name, description, deposit, cycle, penalty, and membership limits.  
- **👥 Member Onboarding**  
  Securely join existing Chamas with deposit collateral.  
- **💰 Automated Contributions**  
  Recurring, on‑schedule deposits enforced by smart contracts.  
- **🔄 Round‑Robin Payouts**  
  Lumpsum distribution each cycle, adjusted for defaults.  
- **🔐 KRNL Protocol**  
  Real‑time, on‑chain validation via kOS kernels.  
- **🦊 Web3 Wallets**  
  MetaMask, WalletConnect, and more out of the box.

---

## 🔗 KRNL Integration

We leverage KRNL’s kOS kernels for mission‑critical checks:

| Kernel ID | Name              | Purpose                                                            |
|:---------:|:------------------|:-------------------------------------------------------------------|
| **337**   | Prohibited-list   | Blocks banned or malicious addresses                               |
| **340**   | Trusted-list      | Verifies users against a vetted allowlist                          |

> All protected functions (`createChama`, `joinChama`, `contribute`, `payout`) require a **KRNL payload** and pass through our `TokenAuthority` for validation.

---

## 📜 Smart Contracts

### 1. `UpdatedChamaFactory.sol`
- **Network:** Ethereum Sepolia  
- **Address:** `0x30a3a40FCDD904C32f0eBC2B05aC7082db0A7a6a`  

**Key Functions**  
```solidity
function createChama(..., KrnlPayload calldata krnl) external onlyAuthorized(krnl, ...);
function joinChama(uint256 chamaId, KrnlPayload calldata krnl) external onlyAuthorized(krnl, ...);
function contribute(uint256 chamaId, KrnlPayload calldata krnl) external onlyAuthorized(krnl, ...);
function payout(uint256 chamaId, KrnlPayload calldata krnl) external onlyAuthorized(krnl, ...);
```

### 2. `TokenAuthority.sol`
- **Network:** Oasis Sapphire Testnet  
- **Address:** `0x8eE3A46aAd8c8F09d56D8d0D6A2227ee9eF45018`  

Handles:  
- Access token verification  
- Runtime digest checks  
- Kernel result validation and final signing  

---

## 🎨 Frontend

Built with **React** & **Vite**, styled in Tailwind CSS.

- **Pages & Components**  
  - Home / Dashboard  
  - Create Chama Form  
  - Chama Detail & Contribution UI  
  - Member Portfolio  
- **Integration**  
  - `ethers.js` for blockchain calls  
  - `KrnlService` for generating and submitting KRNL payloads  
  - Responsive design for desktop & mobile

---

## 🚀 User Flow

1. **Connect Wallet** (MetaMask / WalletConnect)  
2. **Create Chama** or **Join Existing**  
3. **Deposit & Contribute** automatically each cycle  
4. **Receive Lumpsum Payouts** in round‑robin order  
5. **Track History** transparently on‑chain  

---

## 🏗️ Technical Architecture

### Smart Contract Layer
- **Solidity (v0.8.24)**  
- **KRNL Protocol**: Kernel-based access control  
- **ReentrancyGuard** and **Ownable** for security

### Application Layer
- **React + Vite**  
- **ethers.js** & **Web3Modal**  
- **KrnlService** for kOS interoperability  
- **Tailwind CSS** for styling  

---

## 🛠️ Getting Started

### Prerequisites
- Node.js ≥ 16  
- Yarn or npm  
- MetaMask (or other Web3 wallet)  

### Smart Contract
```bash
git clone https://github.com/your-org/chama-dapp.git
cd chama-dapp
npm install
# Compile & deploy via KRNL CLI
krnl compile
krnl deploy-all
```

### Frontend
```bash
cd frontend
yarn install
yarn dev
```

---

## 📁 Project Structure

```
├── contracts/
│   ├── KRNL.sol
│   ├── TokenAuthority.sol
│   └── UpdatedChamaFactory.sol
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
├── tests/
├── scripts/
└── README.md
```

---

## 🆔 Registration & IDs

- **Contract ID:** 6983  
- **DApp ID:** 6643  
- **Entry ID:** `0xc99dc8d45e29dfb80ae76b15fe31e5d43f0f7371525649ab4e11b1521b7d4baf`

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.
