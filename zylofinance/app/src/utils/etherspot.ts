import { EtherspotBundler, PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { encodeFunctionData, parseEther } from 'viem';
import { ZYLO_VAULT_ABI } from '../contracts/abis';
import { CONTRACTS } from '../contracts/config';

const ARKA_URL = 'https://arka.etherspot.io'; // or the testnet rpc link
const apiKey = process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY;
const chainId = 114;
const paymasterUrl = `${ARKA_URL}?apiKey=${apiKey}&chainId=${chainId}&useVp=true`;

export async function initEtherspotSDK(provider: any) {
  try {
    // 1. Wrap the provider from Web3Auth/Wagmi
    const mappedProvider = new Web3WalletProvider(provider);
    await mappedProvider.refresh();

    // 2. Initialize the SDK without 'projectKey'
    const primeSdk = new PrimeSdk(mappedProvider, {
      chainId: 114, // Coston2
      // Instead of projectKey, use the Bundler with your API Key
      bundlerProvider: new EtherspotBundler(
        114, 
        process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY || ''
      )
    });

    return primeSdk;
  } catch (error) {
    console.error('Failed to initialize Etherspot SDK:', error);
    throw error;
  }
}

/**
 * Create batched UserOperation for depositing native FLR into ZyloVault
 * Note: Uses the custom 'depositFLR' function which wraps and stakes automatically.
 */
export async function createDepositBatch(
  primeSdk: PrimeSdk,
  flrAmount: bigint
) {
  try {
    // Clear any previous failed attempts
    await primeSdk.clearUserOpsFromBatch();

    // Encode the custom ZyloVault native deposit function
    const depositData = encodeFunctionData({
      abi: ZYLO_VAULT_ABI,
      functionName: 'depositFLR',
      args: [], // No args needed as it reads from msg.value
    });

    // Add the native deposit to the batch
    await primeSdk.addUserOpsToBatch({
      to: CONTRACTS.ZYLO_VAULT as `0x${string}`,
      data: depositData,
      value: flrAmount, // This sends the native FLR with the call
    });

    // Estimate and send with Paymaster sponsorship
    const userOp = await primeSdk.estimate({
      paymasterDetails: {
url: paymasterUrl,        context: { mode: 'sponsor',
          calculateGasLimits: true // Critical for Arka/Flare
         },
      }
    });

    const userOpHash = await primeSdk.send(userOp);
    return userOpHash;
  } catch (error: any) {
    console.error('Failed to create deposit batch:', error);
    throw new Error(error.message || 'Failed to execute deposit');
  }
}

/**
 * Create batched UserOperation for spending yFLR as Native FLR
 * Steps: Withdraw (burn yFLR -> get FLR) → Transfer native FLR to recipient
 */
export async function createSpendBatch(
  primeSdk: PrimeSdk,
  flrAmount: bigint,
  recipientAddress: `0x${string}`
) {
  try {
    await primeSdk.clearUserOpsFromBatch();

    // 1. Encode the custom ZyloVault native withdraw function
    // This burns your shares and places native FLR back in your Smart Account
    const withdrawData = encodeFunctionData({
      abi: ZYLO_VAULT_ABI,
      functionName: 'withdrawFLR',
      args: [flrAmount], // Amount of FLR to extract (shares are calculated internally)
    });

    // Add withdraw to batch
    await primeSdk.addUserOpsToBatch({
      to: CONTRACTS.ZYLO_VAULT as `0x${string}`,
      data: withdrawData,
    });

    // 2. Add native transfer to the recipient
    await primeSdk.addUserOpsToBatch({
      to: recipientAddress,
      value: flrAmount,
    });

    // Estimate and send (Gasless)
    const userOp = await primeSdk.estimate({
      paymasterDetails: {
url: paymasterUrl,
        context: { mode: 'sponsor',
          calculateGasLimits: true 
         },
      }
    });

    const userOpHash = await primeSdk.send(userOp);
    return userOpHash;
  } catch (error: any) {
    console.error('Failed to create spend batch:', error);
    throw new Error(error.message || 'Failed to execute spend');
  }
}


/**
 * Wait for UserOperation to be confirmed using the Prime SDK
 */
export async function waitForUserOpReceipt(
  primeSdk: PrimeSdk,
  userOpHash: string
) {
  let receipt = null;
  const timeout = Date.now() + 60000; // 1 minute timeout

  while (receipt === null && Date.now() < timeout) {
    // We use the SDK method, not the Viem helper
    receipt = await primeSdk.getUserOpReceipt(userOpHash);
    
    if (!receipt) {
      // Wait 2 seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!receipt) {
    throw new Error('Transaction timing out. Check the hash on explorer.');
  }

  return receipt;
}