# Zylo Finance

> A Gasless Abstracted yield aggregator and automated asset management platform built specifically for the Flare Network and XRP Ledger.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Flare Network](https://img.shields.io/badge/network-Flare-red.svg)](https://flare.network)
[![ERC-4626](https://img.shields.io/badge/standard-ERC--4626-green.svg)](https://eips.ethereum.org/EIPS/eip-4626)

---

## 📋 Table of Contents

- [Overview](#overview)
- [The What?](#the-what)
- [Core Functionality](#core-functionality)
- [Key Components & Technical Architecture](#key-components--technical-architecture)
- [User Experience Features](#user-experience-features)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
- [Features](#features)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

Zylo Finance is designed to **simplify the "earn" experience** for Flare users by automating complex delegation and compounding strategies that would otherwise require manual intervention every few days.

Our platform eliminates the complexity of DeFi yield farming on Flare Network, providing users with a seamless, gasless experience to maximize their FLR, WFLR, and FXRP holdings.

---

## 🤔 The What?

Zylo Finance is a **yield aggregator** that maximizes the utility of FLR, WFLR, and FXRP through the Flare Network's native protocols. Think of it as your automated DeFi manager that works 24/7 to optimize your yields without requiring constant manual intervention.

### Why Zylo?

- **No Manual Work**: Forget about claiming rewards every 3.5 days
- **No Gas Fees**: Gasless transactions powered by Account Abstraction
- **Auto-Compounding**: Maximize returns through automated reinvestment
- **Simple UX**: One-click deposits, no technical knowledge required

---

## ⚙️ Core Functionality

### 🚀 The "Yield Engine"

The app's primary purpose is to maximize the utility of **FLR**, **WFLR**, and **FXRP** through the network's native protocols.

#### **Automated FTSO Delegation**

Flare's **Time Series Oracle (FTSO)** pays out rewards every 3.5 days to those who delegate their tokens to data providers.

**What Zylo Does:**
- Automatically selects high-performing FTSO data providers
- Delegates the vault's pooled funds to optimal providers
- Continuously monitors and rebalances delegation for maximum yield

#### **The Harvest**

Instead of users manually claiming rewards and paying gas fees to re-delegate them, Zylo uses a **"Harvest" function**:

- ✅ Claims all rewards for the pool automatically
- ✅ Reinvests them immediately
- ✅ Maximizes the effects of compound interest
- ✅ Zero gas costs for individual users

#### **Liquidity with yFLR**

When you deposit into Zylo, you receive **yFLR tokens**:

- **Yield-Bearing Receipt Tokens**: Represent your share of the vault
- **Growing Value**: yFLR increases in value relative to FLR as rewards are collected
- **Composable**: Use yFLR in other DeFi protocols while still earning yield
- **Redeemable**: Burn yFLR anytime to withdraw your FLR + earned rewards

---

## 🏗️ Key Components & Technical Architecture

### ERC-4626 Standard

Zylo is built using the **ERC-4626 standard** - the industry standard for "Yield-Bearing Vaults".

| Feature | Description |
|---------|-------------|
| **Smart Accounts** | Zylo utilizes Account Abstraction (ERC-4337) to allow users to interact with the app using social logins (via Web3Auth) and enjoy "gasless" transactions sponsored by a Paymaster. |
| **ZyloVault Contract** | The central hub where all funds are pooled. It handles the deposit, withdraw, and harvest logic. |
| **FTSO Integration** | The contract communicates directly with the Flare PriceSubmitter and VoterWhitelister to manage delegation. |
| **Yield Transparency** | The app provides a dashboard showing "Total Value Locked" (TVL), current APY, and individual earnings. |
| **XRP ↔ FXRP Conversion** | Seamless conversion using FAssets directly with your Xaman Wallet payload. |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                      │
│          (Web3Auth + Gasless Transactions)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zylo Vault (ERC-4626)                    │
│                                                             │
│  • Deposit/Withdraw Logic                                  │
│  • yFLR Token Minting/Burning                              │
│  • Harvest & Compound                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Flare Network Protocols                    │
│                                                             │
│  • FTSO (Time Series Oracle)                               │
│  • PriceSubmitter Contract                                 │
│  • VoterWhitelister                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 💎 User Experience Features

The application is tailored for both **"DeFi Power Users"** and **"Newcomers"**:

### 🎁 Gasless Onboarding

Because Zylo uses **Etherspot's Prime SDK**, users don't need FLR in their wallets to pay for their first transaction—the app can sponsor the gas.

### ⚡ Single-Click Yield

Users don't need to understand "wrapping," "delegation," or "epochs." Depositing FLR into the vault handles all those steps in one click.

### 📊 Real-Time Dashboard

- **Total Value Locked (TVL)**: See the entire vault's holdings
- **Current APY**: Real-time yield calculations
- **Individual Earnings**: Track your personal performance
- **Transaction History**: Complete audit trail of all activities

### 🔐 Social Login Support

- Login with Google, Twitter, Discord, or any social provider
- No need to manage private keys
- Non-custodial—you always control your funds

### 🔄 XRP Integration

Convert XRP to FXRP directly through your **Xaman Wallet** and start earning immediately.

---

## 📜 Smart Contracts

### Deployed Contracts on Flare Network

| Contract | Address |
|----------|---------|
| **Zylo Vault** | `0xEBeE2004E3D8cE6aD0E1aC6467Bc39da3907966E` |
| **Staking Module** | `0x8EE359559403bF3a6D2349721d4A5cf09408231E` |

### Contract Verification

All contracts are verified on the Flare Block Explorer for full transparency.

---

## 🚀 Getting Started

### For Users

1. **Visit the App**: Navigate to [app.zylo.finance](https://app.zylo.finance)
2. **Connect Wallet**: Use social login or connect your Web3 wallet
3. **Deposit FLR**: Choose your deposit amount
4. **Receive yFLR**: Get your yield-bearing tokens instantly
5. **Earn Automatically**: Sit back and watch your balance grow

### For Developers

Detailed setup instructions are available in our documentation:

- [Mobile Quickstart](./zylofinance/MOBILE_QUICKSTART.md)
- [Mobile Setup Summary](./zylofinance/MOBILE_SETUP_SUMMARY.md)
- [How to Run Mobile](./zylofinance/HOW_TO_RUN_MOBILE.md)
- [Integration Guide](./zylofinance/INTEGRATION_GUIDE.md)
- [Xaman Setup](./zylofinance/XAMAN_SETUP.md)

#### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/zylo-finance.git
cd zylo-finance/zylofinance

# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

---

## ✨ Features

- ✅ **Automated FTSO Delegation** - Set it and forget it
- ✅ **Auto-Compounding Rewards** - Maximize your yield
- ✅ **Gasless Transactions** - No FLR needed for gas
- ✅ **Social Login Support** - Web3Auth integration
- ✅ **ERC-4626 Compliant** - Industry standard vault
- ✅ **XRP/FXRP Integration** - Seamless cross-chain experience
- ✅ **Real-Time Analytics** - Live TVL, APY, and earnings tracking
- ✅ **Mobile Support** - iOS and Android apps via Capacitor
- ✅ **Non-Custodial** - You always control your funds
- ✅ **Transparent & Verified** - All contracts verified on-chain

---

## 📚 Documentation

Comprehensive documentation is available for different use cases:

### User Guides
- Getting Started Guide
- How to Deposit & Withdraw
- Understanding yFLR Tokens
- XRP to FXRP Conversion

### Developer Documentation
- [Integration Guide](./zylofinance/INTEGRATION_GUIDE.md)
- Smart Contract API Reference
- SDK Documentation
- Mobile App Development

### Technical Deep Dives
- FTSO Delegation Strategy
- Harvest Mechanism Explained
- Account Abstraction Implementation
- ERC-4626 Vault Architecture

---

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 Security

Security is our top priority. If you discover a security vulnerability, please email security@zylo.finance.

### Audits

- Smart contracts audited by [Auditor Name] - [Report Link]
- Continuous monitoring with [Security Tool]

---

## 📊 Statistics

- **Total Value Locked**: $X.XX Million
- **Active Users**: X,XXX+
- **Rewards Distributed**: X,XXX FLR
- **Compound Events**: X,XXX+

---

## 🌐 Links

- **Website**: [zylo.finance](https://zylo.finance)
- **App**: [app.zylo.finance](https://app.zylo.finance)
- **Twitter**: [@ZyloFinance](https://twitter.com/ZyloFinance)
- **Discord**: [Join our community](https://discord.gg/zylofinance)
- **Documentation**: [docs.zylo.finance](https://docs.zylo.finance)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Flare Network team for the amazing infrastructure
- Etherspot for Account Abstraction SDK
- Web3Auth for seamless authentication
- Our amazing community of users and contributors

---

<div align="center">

**Built with ❤️ for the Flare Network community**

[Get Started](https://app.zylo.finance) • [Documentation](./zylofinance) • [Community](https://discord.gg/zylofinance)

</div>
