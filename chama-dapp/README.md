
# Chama Dapp

[![chamabg.png](https://i.postimg.cc/bvcF7W8v/chamabg.png)](https://postimg.cc/yDjP9fDq)

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)  
[![Vite](https://img.shields.io/badge/Vite-4.0.0-blue)](https://vitejs.dev/)  
[![Material UI](https://img.shields.io/badge/Material%20UI-v5-blue)](https://mui.com/)  
[![Solidity](https://img.shields.io/badge/Solidity-0.8.26-blue)](https://soliditylang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Chama Dapp is a decentralized savings platform that revolutionizes traditional group savings—commonly known as Chamas—by bringing transparency, security, and automated governance on-chain. A **Chama** is a community-based savings group inspired by the **Rotating Savings and Credit Association (ROSCA)** model, where members contribute regularly to a shared pool and take turns receiving the lump sum. Our Dapp leverages blockchain technology deployed on the Scroll Sepolia Testnet (enhanced with Scroll Zero-Knowledge Proofs for scalability and privacy) to automate these processes, ensuring trustless, efficient, and democratic financial management.

---

## Features

- **Create a Chama:**  
  Launch your decentralized savings group with configurable parameters:
  - Initial deposit and recurring contribution amounts
  - Penalty rates for defaulting members
  - Maximum number of members
  - Contribution cycle duration (daily, weekly, or monthly)

- **Join a Chama:**  
  Discover and join active Chamas by sending the required deposit. Membership is verified on-chain, ensuring complete transparency.

- **Automated Contributions & Payouts:**  
  Contributions are automatically collected on schedule, and payouts are executed in a round-robin fashion. Penalties for defaults are deducted from deposits and added to the payout of the scheduled recipient.

- **Real-Time Dashboard & Analytics:**  
  View detailed analytics such as contribution history, funds allocation, and real-time balance updates, all integrated into an intuitive Material UI dashboard.

- **Wallet & Blockchain Integration:**  
  Securely connect your wallet using reown Appkit. Interactions with the blockchain are facilitated by Wagmi, Ethers.js, and viem, ensuring seamless and reliable on-chain operations.

- **Email Notifications:**  
  Integrated serverless functions (hosted on Vercel) send real-time email notifications via SendGrid whenever a new Chama is created, keeping all subscribers informed.

---

## Live App

- **Live App:** [https://chama-dapp.vercel.app/](https://chama-dapp.vercel.app/)

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or npm
- A wallet (e.g., MetaMask) configured for the [Scroll Sepolia Testnet](https://scroll.io/)
- Familiarity with reown Appkit for wallet connections and blockchain interactions

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/gethsun1/chama-dapp
   cd chama-dapp
   ```

2. **Install Dependencies:**

   ```bash
   yarn install
   ```

3. **Run the Development Server:**

   ```bash
   yarn dev
   ```

4. **Build for Production:**

   ```bash
   yarn build
   ```

---

## Smart Contract Architecture

The core of Chama Dapp is the [**ChamaFactory**](https://github.com/gethsun1/chama-dapp/blob/main/src/contracts/ChamaFactory.sol) smart contract. Developed in Solidity (v0.8.26), it implements a decentralized savings model that automates the management of group savings with strict on-chain governance.

### Key Functions & Sample Snippets

#### 1. Creating a Chama

The `createChama` function initializes a new savings group with all necessary parameters. It ensures that key requirements are met (e.g., non-zero deposit and contribution amounts) and logs an event for on-chain transparency.

```solidity
function createChama(
    string memory _name,
    string memory _description,
    uint256 _depositAmount,
    uint256 _contributionAmount,
    uint256 _penalty,
    uint256 _maxMembers,
    uint256 _cycleDuration
) external returns (uint256) {
    require(_maxMembers > 0, "Max members must be > 0");
    require(_depositAmount > 0, "Deposit amount must be > 0");
    require(_contributionAmount > 0, "Contribution amount must be > 0");

    chamaCount++;
    Chama storage newChama = chamas[chamaCount];
    newChama.id = chamaCount;
    newChama.creator = msg.sender;
    newChama.name = _name;
    newChama.description = _description;
    newChama.depositAmount = _depositAmount;
    newChama.contributionAmount = _contributionAmount;
    newChama.penalty = _penalty;
    newChama.maxMembers = _maxMembers;
    newChama.cycleDuration = _cycleDuration;
    newChama.currentRound = 1;
    newChama.currentCycle = 1;
    newChama.nextCycleStart = block.timestamp + _cycleDuration;
    newChama.isActive = true;

    emit ChamaCreated(chamaCount, _name, msg.sender);
    return chamaCount;
}
```

#### 2. Joining a Chama

The `joinChama` function allows users to join an active Chama by sending the exact deposit amount. It prevents duplicate membership and ensures the Chama is not already full.

```solidity
function joinChama(uint256 _chamaId) external payable {
    Chama storage chama = chamas[_chamaId];
    require(chama.isActive, "Chama is not active");
    require(chama.membersCount < chama.maxMembers, "Chama is full");
    require(msg.value == chama.depositAmount, "Incorrect deposit amount");
    require(!isMember(_chamaId, msg.sender), "Already a member");

    chama.members.push(msg.sender);
    chama.membersCount++;
    memberDeposit[_chamaId][msg.sender] = chama.depositAmount;
    emit JoinedChama(_chamaId, msg.sender);
}
```

#### 3. Making Contributions & Payouts

The contract also handles periodic contributions and automated payouts. Contributions are checked against the schedule, and if a member defaults, a penalty is applied. Payouts are executed in a round‑robin fashion.

```solidity
function contribute(uint256 _chamaId) external payable {
    Chama storage chama = chamas[_chamaId];
    require(chama.isActive, "Chama is not active");
    require(isMember(_chamaId, msg.sender), "Not a member of this Chama");
    require(msg.value == chama.contributionAmount, "Incorrect contribution amount");
    require(block.timestamp < chama.nextCycleStart, "Contribution period over for current cycle");
    require(!contributions[_chamaId][chama.currentCycle][msg.sender], "Contribution already made for current cycle");

    contributions[_chamaId][chama.currentCycle][msg.sender] = true;
    emit ContributionMade(_chamaId, chama.currentCycle, msg.sender, msg.value);
}
```

*Note: Additional functions (such as `payout` and internal calculations) ensure that the smart contract robustly handles all group savings operations while protecting against reentrancy and other common attacks.*

---

## Technical Architecture Overview

1. **Smart Contracts:**  
   - **Deployment:** ChamaFactory contracts are deployed on the Scroll Sepolia Testnet using Scroll Zero-Knowledge Proofs for scalability and privacy.
   - **Core Logic:** Implements creation, joining, contributions, and automated payouts for Chama groups.

2. **Frontend:**  
   - **Built with:** React, Vite, and Material UI  
   - **Blockchain Integration:** Uses reown Appkit along with Wagmi/Ethers.js to connect user wallets, query on-chain data, and interact with smart contracts.
   - **Analytics:** A Dashboard displays real-time on-chain data alongside demo analytics (to be replaced by actual on-chain analytics later).

3. **Backend:**  
   - **Serverless Functions:** Hosted on Vercel to manage auxiliary tasks such as email notifications and subscription management.
   - **Email Notifications:** When a new Chama is created, a serverless function triggers an email (via SendGrid) to all subscribers, including key details and a shareable invite link.

---

## Wallet & Blockchain Integration

- **Wallet Connection:**  
  Users connect their wallets securely using reown Appkit.  
- **Blockchain Interaction:**  
  All on-chain interactions (e.g., creating, joining, contributing) are managed via smart contracts using ethers.js and viem for conversions and formatting.
- **On-Chain Data Display:**  
  The Dashboard fetches on-chain data (like joined Chamas, balances, and deposit information) via custom hooks, ensuring that users see up-to-date information.

---

## Future Plans

- **Enhanced Analytics:**  
  Integrate on-chain event indexing (using tools like The Graph) to display detailed contribution histories and financial analytics.
- **Governance Mechanisms:**  
  Develop member-driven governance features to allow Chama members to decide on investment strategies and fund allocation.
- **AI-Powered Assistance:**  
  Introduce an AI chatbot for guiding users through the platform and providing personalized financial insights.
- **Mobile Optimization:**  
  Continue refining the UI/UX to ensure seamless operation across all devices.

---

## Contributing

Contributions are welcome! Please fork the repository, make your improvements, and submit a pull request. For major changes, please open an issue first to discuss your ideas.

---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit).

---

## Contact

For further inquiries or support, please contact Gethsun at [gethsun09@gmail.com](mailto:gethsun09@gmail.com).

---

Chama Dapp is dedicated to transforming the traditional ROSCA model into a modern, trustless, and decentralized savings solution that empowers unbanked communities and fosters collective financial resilience.
