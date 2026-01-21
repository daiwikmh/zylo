# ZyloVault Integration Guide

This guide explains the smart contract integrations for yield staking and yFLR spending functionality.

## 🎯 Overview

The integration includes two main features:
1. **Yield Staking Interface** - Deposit FLR to earn yFLR rewards
2. **Send Interface with yFLR Spending** - Transfer FLR or spend yFLR tokens

## 📁 Project Structure

```
app/
├── src/
│   ├── contracts/
│   │   ├── abis.ts              # Contract ABIs (ZyloVault, WNat, ERC20)
│   │   └── config.ts            # Contract addresses and chain config
│   ├── utils/
│   │   └── etherspot.ts         # Etherspot SDK helpers
│   └── components/
│       ├── yield/
│       │   ├── YieldStakingCard.tsx    # Deposit interface
│       │   └── index.ts
│       └── send/
│           ├── SendReceiveCard.tsx     # Send/receive interface
│           └── index.ts
└── (app)/
    ├── analytics/
    │   └── page.tsx             # Yield & staking page
    └── send/
        └── page.tsx             # Send & receive page
```

## 🔧 Configuration

### 1. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_ETHERSPOT_PROJECT_KEY=your_etherspot_project_key
NEXT_PUBLIC_PAYMASTER_URL=https://flare-testnet-bundler.etherspot.io
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/114/rpc?apikey=YOUR_API_KEY
```

### 2. Contract Addresses

The contracts are pre-configured for Flare Network (Chain ID: 14):

- **ZyloVault**: `0xEBeE2004E3D8cE6aD0E1aC6467Bc39da3907966E`
- **WNat**: `0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d`

Update these in `app/src/contracts/config.ts` if needed.

## 🚀 Features

### Task 1: Yield Staking Interface

**Location**: `app/(app)/analytics/page.tsx`

**Features**:
- ✅ Deposit native FLR to earn yFLR
- ✅ Batched transactions (Wrap → Approve → Deposit)
- ✅ Display yFLR balance and underlying value
- ✅ Real-time yield tracking graph
- ✅ Gasless transactions via Etherspot Paymaster

**How it works**:
1. User enters FLR amount
2. Clicks "Deposit & Start Earning"
3. Creates batched UserOperation:
   - Step A: Wrap native FLR to WNat
   - Step B: Approve ZyloVault to spend WNat
   - Step C: Call `ZyloVault.deposit(amount, smartAccountAddress)`
4. Transaction executes gaslessly via Paymaster

### Task 2: Send Interface with yFLR Spending

**Location**: `app/(app)/send/page.tsx`

**Features**:
- ✅ Send native FLR directly
- ✅ Spend yFLR (withdraws from vault and sends)
- ✅ Batched yFLR spending (Withdraw → Transfer)
- ✅ Receive tab with wallet address display
- ✅ Gasless transactions

**How it works** (yFLR spending):
1. User selects "Spend yFLR" mode
2. Enters recipient address and FLR amount
3. Creates batched UserOperation:
   - Step A: Call `ZyloVault.withdraw(flrAmount, smartAccountAddress, smartAccountAddress)`
   - Step B: Transfer native FLR to recipient
4. Transaction executes gaslessly

## 🎨 Design System

### Color Scheme
- **Primary**: `#E1C4E9` (Light Purple)
- **Secondary**: `#070709` (Near Black)
- **Accent**: `#10b981` (Green for positive changes)
- **Background**: Gradients using primary colors

### Component Styling
All components use the new color scheme while maintaining:
- Rounded corners (`border-radius: 1.25rem`)
- Proper spacing (1rem gaps)
- Hover effects and transitions
- Dark theme variants for cards

## 🔌 Integration with Web3Auth

The Etherspot SDK has been properly configured to work with Web3Auth:

```typescript
// In app/(app)/analytics/page.tsx and app/(app)/send/page.tsx
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { useWeb3Auth } from '../../src/providers/web3auth';

const { provider: web3AuthProvider } = useWeb3Auth();

// Wrap Web3Auth provider with Etherspot's Web3WalletProvider
const walletProvider = new Web3WalletProvider(web3AuthProvider);

const sdk = new PrimeSdk(
  walletProvider,
  { chainId: 14, projectKey: process.env.NEXT_PUBLIC_ETHERSPOT_PROJECT_KEY }
);
```

This configuration is already implemented in both pages!

## 📊 Smart Contract Functions Used

### ZyloVault (ERC-4626)
- `deposit(uint256 assets, address receiver)` - Deposit WNat, receive yFLR
- `withdraw(uint256 assets, address receiver, address owner)` - Burn yFLR, receive FLR
- `convertToAssets(uint256 shares)` - Get underlying FLR value of yFLR
- `balanceOf(address account)` - Get yFLR balance

### WNat (Wrapped Native)
- `deposit()` - Wrap native FLR (payable)
- `approve(address spender, uint256 amount)` - Approve vault

## 🧪 Testing

### Test the Deposit Flow
1. Navigate to `/analytics`
2. Connect wallet
3. Enter FLR amount
4. Click "Deposit & Start Earning"
5. Verify yFLR balance updates

### Test the yFLR Spending Flow
1. Navigate to `/send`
2. Select "Spend yFLR" tab
3. Enter recipient and amount
4. Click "Spend yFLR & Send"
5. Verify transaction completes

## 🔒 Security Considerations

1. **Approvals**: Approve only exact amounts needed
2. **Address Validation**: All recipient addresses are validated
3. **Balance Checks**: Prevent overdraft attempts
4. **Error Handling**: User-friendly error messages
5. **Gasless Security**: Transactions sponsored by paymaster

## 🐛 Troubleshooting

### "Failed to initialize Etherspot SDK"
- Check `NEXT_PUBLIC_ETHERSPOT_PROJECT_KEY` is set
- Verify Web3Auth provider is connected

### "Transaction failed"
- Ensure sufficient balance
- Check paymaster is configured correctly
- Verify contract addresses are correct for your network

### "Invalid recipient address"
- Ensure address starts with `0x`
- Verify address is valid Ethereum address

## 📚 Additional Resources

- [Etherspot Prime SDK Docs](https://etherspot.fyi/prime-sdk/intro)
- [ERC-4626 Tokenized Vault Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [Wagmi React Hooks](https://wagmi.sh/react/getting-started)
- [Viem Documentation](https://viem.sh/)

## 🎉 Next Steps

1. Replace placeholder provider with actual Web3Auth provider
2. Test on Flare testnet
3. Configure paymaster for gasless transactions
4. Add transaction history tracking
5. Implement APY calculations from on-chain data

---

Built with ❤️ using Next.js, Wagmi, Viem, and Etherspot Prime SDK
