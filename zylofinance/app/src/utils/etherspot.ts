import { EtherspotBundler, PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { encodeFunctionData, parseEther, decodeEventLog, createPublicClient, http } from 'viem';
import { ZYLO_VAULT_ABI, ASSET_MANAGER_ABI } from '../contracts/abis';
import { CONTRACTS } from '../contracts/config';
import { CHAIN_ID, getPaymasterUrl, TIMEOUTS } from './constants';

export async function initEtherspotSDK(provider: any) {
  try {
    // 1. Wrap the provider from Web3Auth/Wagmi
    const mappedProvider = new Web3WalletProvider(provider);
    await mappedProvider.refresh();

    // 2. Initialize the SDK without 'projectKey'
    const primeSdk = new PrimeSdk(mappedProvider, {
      chainId: CHAIN_ID,
      // Instead of projectKey, use the Bundler with your API Key
      bundlerProvider: new EtherspotBundler(
        CHAIN_ID,
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
        url: getPaymasterUrl(),
        context: {
          mode: 'sponsor',
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
        url: getPaymasterUrl(),
        context: {
          mode: 'sponsor',
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
 * Create batched UserOperation for reserving collateral with FAsset AssetManager
 * Pays the Collateral Reservation Fee (CRF) and gets payment reference for XRP transfer
 */
export async function createReserveCollateralBatch(
  primeSdk: PrimeSdk,
  agentAddress: `0x${string}`,
  lots: bigint,
  maxMintingFeeBIPS: bigint,
  executorAddress: `0x${string}`,
  collateralReservationFee: bigint,
) {
  try {
    // Clear any previous failed attempts
    await primeSdk.clearUserOpsFromBatch();
    console.log("CRF (value):", collateralReservationFee.toString());
    console.log("Max Minting Fee BIPS (arg):", maxMintingFeeBIPS.toString());

    // Encode the reserveCollateral function call
    // Signature: reserveCollateral(address agent, uint256 lots, uint256 maxMintingFeeBIPS, address executor)
    const reserveData = encodeFunctionData({
      abi: ASSET_MANAGER_ABI,
      functionName: 'reserveCollateral',
      args: [agentAddress, lots, maxMintingFeeBIPS, executorAddress],
    });
    console.log("Encoded data:", reserveData);

    // Add the reserve collateral to the batch with CRF value
    await primeSdk.addUserOpsToBatch({
      to: CONTRACTS.ASSET_MANAGER as `0x${string}`,
      data: reserveData,
      value: collateralReservationFee, // This sends the CRF with the call
    });

    // Estimate and send with Paymaster sponsorship for gas
    const userOp = await primeSdk.estimate({
      paymasterDetails: {
        url: getPaymasterUrl(),
        context: {
          mode: 'sponsor',
          calculateGasLimits: true // Critical for Arka/Flare
        },
      }
    });

    const userOpHash = await primeSdk.send(userOp);
    return userOpHash;
  } catch (error: any) {
    console.error('Failed to create reserve collateral batch:', error);
    throw new Error(error.message || 'Failed to execute reserve collateral');
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
  const timeout = Date.now() + TIMEOUTS.USER_OP_RECEIPT;

  console.log(`Waiting for UserOp receipt: ${userOpHash}`);

  while (receipt === null && Date.now() < timeout) {
    // We use the SDK method, not the Viem helper
    receipt = await primeSdk.getUserOpReceipt(userOpHash);

    if (!receipt) {
      await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.POLLING_INTERVAL));
    }
  }

  if (!receipt) {
    throw new Error('Transaction timing out. Check the hash on explorer.');
  }

  console.log('UserOp Receipt received. Success:', receipt.success);

  // Log failure details if transaction failed
  if (!receipt.success) {
    console.error('Transaction failed on-chain');
    console.error('Receipt:', receipt);
  }

  return receipt;
}

/**
 * Format payment reference for XRP memo field (remove 0x prefix and trailing zeros)
 */
export function formatPaymentReferenceForMemo(paymentReference: string): string {
  // Remove 0x prefix
  let hex = paymentReference.startsWith('0x') ? paymentReference.slice(2) : paymentReference;

  // Remove trailing zeros (padding)
  hex = hex.replace(/0+$/, '');

  return hex.toUpperCase();
}

/**
 * Parse CollateralReserved event from transaction receipt
 * Manually parse the log data since the event signature doesn't match standard ABI
 */
export function parseCollateralReservedEvent(receipt: any) {
  try {
    console.log('=== Parsing CollateralReserved Event ===');
    console.log('Receipt structure:', Object.keys(receipt));

    // UserOp receipt might have logs in different places
    let logs = receipt.logs || receipt.receipt?.logs || [];

    console.log(`Found ${logs.length} logs in receipt`);

    if (logs.length === 0) {
      console.error('Full receipt:', JSON.stringify(receipt, null, 2));
      throw new Error('No logs found in receipt');
    }

    // Find the log from AssetManager contract
    const assetManagerLog = logs.find(
      (log: any) => log.address?.toLowerCase() === CONTRACTS.ASSET_MANAGER.toLowerCase()
    );

    if (!assetManagerLog) {
      console.error('No log found from AssetManager contract');
      console.error('Available log addresses:', logs.map((l: any) => l.address));
      throw new Error('AssetManager log not found');
    }

    console.log('Found AssetManager log');
    console.log('Topics:', assetManagerLog.topics);
    console.log('Data:', assetManagerLog.data);

    // Extract indexed parameters from topics
    // topics[0] = event signature
    // topics[1] = agentVault (indexed)
    // topics[2] = minter (indexed)
    // topics[3] = collateralReservationId (indexed)
    const agentVault = `0x${assetManagerLog.topics[1].slice(26)}` as `0x${string}`;
    const minter = `0x${assetManagerLog.topics[2].slice(26)}` as `0x${string}`;
    const collateralReservationId = BigInt(assetManagerLog.topics[3]);

    // Parse data field manually
    const data = assetManagerLog.data.slice(2); // Remove 0x prefix

    // Data layout (32 bytes each):
    // 0-64: valueUBA
    // 64-128: feeUBA
    // 128-192: firstUnderlyingBlock
    // 192-256: lastUnderlyingBlock
    // 256-320: lastUnderlyingTimestamp
    // 320-384: offset to paymentAddress string
    // 384-448: paymentReference (bytes32)
    // 448-512: executor address
    // 512-576: executorFeeNatWei
    // Then the string data follows...

    const valueUBA = BigInt('0x' + data.slice(0, 64));
    const feeUBA = BigInt('0x' + data.slice(64, 128));
    const firstUnderlyingBlock = BigInt('0x' + data.slice(128, 192));
    const lastUnderlyingBlock = BigInt('0x' + data.slice(192, 256));
    const lastUnderlyingTimestamp = BigInt('0x' + data.slice(256, 320));

    // paymentAddress string offset and actual data
    const stringOffset = parseInt(data.slice(320, 384), 16);
    const paymentRefHex = '0x' + data.slice(384, 448);
    const executor = `0x${data.slice(448 + 24, 512)}` as `0x${string}`;
    const executorFeeNatWei = BigInt('0x' + data.slice(512, 576));

    // Extract the string from the offset location
    const stringLengthHex = data.slice(stringOffset * 2, stringOffset * 2 + 64);
    const stringLength = parseInt(stringLengthHex, 16);
    const stringDataHex = data.slice(stringOffset * 2 + 64, stringOffset * 2 + 64 + stringLength * 2);
    const paymentAddress = Buffer.from(stringDataHex, 'hex').toString('utf8');

    console.log('=== Extracted Data ===');
    console.log('Agent Vault:', agentVault);
    console.log('Minter:', minter);
    console.log('Collateral Reservation ID:', collateralReservationId.toString());
    console.log('Value UBA (drops):', valueUBA.toString());
    console.log('Fee UBA (drops):', feeUBA.toString());
    console.log('Payment Address (XRP):', paymentAddress);
    console.log('Payment Reference:', paymentRefHex);

    return {
      agentVault,
      collateralReservationId,
      minter,
      valueUBA,
      feeUBA,
      firstUnderlyingBlock,
      lastUnderlyingBlock,
      lastUnderlyingTimestamp,
      paymentAddress, // Agent's XRP address
      paymentReference: paymentRefHex, // Payment reference for memo
      executor,
      executorFeeNatWei,
    };
  } catch (error: any) {
    console.error('Failed to parse CollateralReserved event:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}