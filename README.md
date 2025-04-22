<p align="center">
  <a href="https://twitter.com/KRNL_xyz"><img src="https://img.shields.io/badge/KRNL%20Protocol-Integrated-blue?style=flat-square" alt="KRNL Protocol"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
</p>

# Chama DApp 🚀

A **decentralized group savings and credit** application (Chama) with built‑in **KRNL protocol** security for transparent, compliant group savings on‑chain.

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [What Is a Chama & How It Works](#what-is-a-chama--how-it-works)
3. [Features](#features)
4. [KRNL Integration](#krnl-integration)
5. [Smart Contracts](#smart-contracts)
6. [Frontend](#frontend)
7. [User Flow](#user-flow)
8. [Architecture](#architecture)
9. [Getting Started](#getting-started)
10. [Project Structure](#project-structure)
11. [Registration & IDs](#registration--ids)
12. [License](#license)

---

## 🔍 Overview

The **Chama DApp** digitizes the East African *Chama* (ROSCA) tradition, enabling groups to pool savings, enforce contributions, and distribute funds—all via smart contracts. By integrating the KRNL protocol, every critical action is validated by trusted kOS kernels, ensuring a secure, transparent, and compliant financial experience.

---

## 📚 What Is a Chama & How It Works

A **Chama** (Swahili for “group”) is a community-based savings circle where members contribute regularly into a collective pot and take turns receiving the lump sum. Traditionally orchestrated over in-person meetings, this DApp automates and secures the entire lifecycle:

1. **Formation**
   - **Creator** defines parameters:
     - **Deposit Amount** (collateral)
     - **Cycle Contribution** (periodic deposit)
     - **Penalty Rate** (for missed contributions)
     - **Maximum Members**
     - **Cycle Duration** (daily, weekly, monthly)

2. **Onboarding**
   - **Members** join by staking the required **deposit**.
   - Smart contract verifies eligibility via **KRNL kernels** (e.g., prohibited‑list, trusted‑list).

3. **Contribution Cycle**
   - On each cycle’s **start**, members must send their **contribution** before the deadline.
   - **Missed contributions** incur a **penalty** (deducted from deposit and added to that cycle’s pot).

4. **Round‑Robin Payout**
   - After the cycle ends, the total pot (contributions + penalties) is **automatically transferred** to the next member in line.
   - The cycle pointer advances, and the next round begins without manual intervention.

5. **Completion**
   - The process repeats until all members have received their payout once (or as configured).
   - Members can form new Chamas or re‑join existing ones.

<p align="center">
  🔄 Round Robin
  💰 Automated Payouts
</p>

---

## ✨ Features

- **🆕 Create & Manage Chamas**
  Flexible parameters for deposit, contribution, penalty, and membership.
- **👥 Secure Onboarding**
  KRNL‑verified join process ensures only approved members participate.
- **⏱️ Automated Contributions**
  Smart contracts enforce schedules and collect funds.
- **🔄 Round‑Robin Payouts**
  Trustless lump‑sum distribution each cycle.
- **🔐 KRNL Protocol**
  kOS kernels guard every critical function (337, 340).
- **🦊 Web3 Wallets**
  MetaMask, WalletConnect, and more supported.

---

## 🔗 KRNL Integration

| Kernel ID | Name            | Purpose                                       |
|:---------:|:----------------|:----------------------------------------------|
| **337**   | Prohibited-list | Blocks banned addresses                       |
| **340**   | Trusted-list    | Verifies addresses against a vetted allowlist |

> Every call to `createChama`, `joinChama`, `contribute`, and `payout` requires a validated **KRNL payload**, processed by `TokenAuthority.sol`.

---

## 📜 Smart Contracts

### UpdatedChamaFactory.sol
- **Network:** Ethereum Sepolia
- **Address:** `0x792184F1818dA1d3D754796290E8BB795ADA1D56`

Key signature:
```solidity
function createChama(..., KrnlPayload calldata krnl) external onlyAuthorized(krnl, ...);
```

### TokenAuthority.sol
- **Network:** Oasis Sapphire Testnet
- **Address:** `0xBD4c76CA1d7663C42207f8256024BBbc23EA94e2`

Manages:
- Access token & runtime digest verification
- Kernel result validation & final signing

---

## 🎨 Frontend

- **Framework:** React + Vite + Tailwind CSS
- **Wallets:** ethers.js + Web3Modal
- **KRNL Service:** Payload generation & submission
- **Key Pages:**
  - Create Chama
  - Chama Dashboard
  - Member Contributions
  - Payout History

---

## 🚀 User Flow

1. **Connect Wallet**
2. **Create or Join** a Chama (KRNL‑protected)
3. **Deposit & Contribute** each cycle
4. **Receive Payout** automatically
5. **Track** all actions on-chain

---

## 🏗️ Architecture

### Smart Contract Layer
- Solidity v0.8.24
- KRNL Protocol integration
- OpenZeppelin ReentrancyGuard & Ownable

### Application Layer
- React + Vite
- ethers.js & Web3Modal
- Tailwind CSS

---

## 🛠️ Getting Started

### Prerequisites
- Node.js ≥ 16
- Yarn or npm
- MetaMask or similar

### Smart Contract
```bash
git clone https://github.com/your-org/chama-dapp.git
cd chama-dapp
npm install
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
contracts/
  ├─ KRNL.sol
  ├─ TokenAuthority.sol
  └─ UpdatedChamaFactory.sol
frontend/
  ├─ src/
  ├─ vite.config.js
tests/
scripts/
README.md
```

---

## 🆔 Registration & IDs

- **Contract ID:** 6987
- **DApp ID:** 6647
- **Entry ID:** `0x25697230ba3dbe8965028244e85238a6f45f68bc7a83de008e0d330227eb3765`
- **Access Token:** `0x3045022100ddcd683932eea49a3c3d0a2ebed7ac99cef9760639dc21de6d1d1ef3ad4f8cf102204cf9a37afddc17def4c687d2cedd8c46868484ff7e5e9ef0e8b9d5ca4841058c`

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE).
