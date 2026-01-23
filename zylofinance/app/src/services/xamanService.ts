/**
 * Xaman (formerly Xumm) Payload Generator Service
 * Generates XRP payment requests with FAsset minting metadata
 */

import { XummSdk } from 'xumm-sdk';

export interface XamanPaymentPayload {
  agentUnderlyingAddress: string;
  totalAmountXRP: number;
  paymentReference: string;
}

export interface XamanPayloadResult {
  qrUrl: string;
  deepLink: string;
  payload: any;
  uuid: string;
}

// Initialize Xumm SDK
let xummClient: XummSdk | null = null;

function getXummClient(): XummSdk {
  if (!xummClient) {
    const apiKey = process.env.NEXT_PUBLIC_XUMM_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_XUMM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.warn('XUMM_API_KEY or XUMM_API_SECRET not set, using fallback mode');
      throw new Error('Xaman API credentials not configured');
    }

    console.log('Initializing Xaman SDK with API Key:', apiKey.slice(0, 8) + '...');

    xummClient = new XummSdk(apiKey, apiSecret);
  }
  return xummClient;
}

/**
 * Test the Xaman SDK connection
 * @returns Pong response with application info
 */
export async function testXamanConnection() {
  try {
    const xumm = getXummClient();
    const pong = await xumm.ping();
    console.log('Xaman SDK connected:', pong.application);
    return pong;
  } catch (error: any) {
    console.error('Xaman SDK ping failed:', error.message);
    throw error;
  }
}

/**
 * Generates a Xaman payment payload for FAsset minting
 * @param payload - Payment details including agent address, amount, and payment reference
 * @returns QR URL and deep link for Xaman wallet
 */
export async function generateXamanPayload(
  payload: XamanPaymentPayload
): Promise<XamanPayloadResult> {
  const { agentUnderlyingAddress, totalAmountXRP, paymentReference } = payload;

  // Convert XRP to drops (1 XRP = 1,000,000 drops)
  const amountInDrops = String(Math.floor(totalAmountXRP * 1_000_000));

  // Payment reference should already be a hex string (bytes32)
  // Remove 0x prefix and trailing zeros
  let memoDataHex = paymentReference.startsWith('0x')
    ? paymentReference.slice(2)
    : paymentReference;

  // Remove trailing zeros
  memoDataHex = memoDataHex.replace(/0+$/, '').toUpperCase();

  // Create the Xaman payment transaction payload
  const xrpPaymentTx = {
    TransactionType: 'Payment',
    Destination: agentUnderlyingAddress,
    Amount: amountInDrops,
    Memos: [
      {
        Memo: {
          MemoData: memoDataHex,
        },
      },
    ],
  };

  try {
    const xumm = getXummClient();

    console.log('Creating Xaman payload with:', {
      destination: agentUnderlyingAddress,
      amount: amountInDrops,
      memo: memoDataHex
    });

    // Create the payload using createAndSubscribe (returns promise with created & resolved)
    const payloadPromise = xumm.payload.createAndSubscribe(
      xrpPaymentTx,
      (event) => {
        console.log('Xaman event:', event.data);

        if (typeof event.data.signed !== 'undefined') {
          console.log('Xaman payload signed:', event.data.signed);
          return event.data;
        }
      }
    );

    // Get the created payload (this is available immediately)
    const { created } = await payloadPromise;

    console.log('Xaman payload created:', {
      uuid: created.uuid,
      qr: created.refs.qr_png,
      deepLink: created.next.always
    });

    return {
      qrUrl: created.refs.qr_png,
      deepLink: created.next.always,
      payload: xrpPaymentTx,
      uuid: created.uuid,
    };
  } catch (error: any) {
    console.error('Failed to generate Xaman payload:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // Fallback: Generate a manual payment URL
    if (error.message?.includes('not configured') || error.message?.includes('API Key')) {
      const manualUrl = `https://xumm.app/detect/request:${agentUnderlyingAddress}?amount=${amountInDrops}`;

      return {
        qrUrl: '', // No QR available in fallback mode
        deepLink: manualUrl,
        payload: xrpPaymentTx,
        uuid: 'fallback-' + Date.now(),
      };
    }

    throw error;
  }
}

/**
 * Subscribe to payload events (optional - use after creating payload)
 * @param payloadUuid - The UUID of the payload to subscribe to
 * @param onEvent - Callback function for events
 */
export async function subscribeToPayload(
  payloadUuid: string,
  onEvent: (event: any) => void
) {
  try {
    const xumm = getXummClient();

    const subscription = await xumm.payload.subscribe(payloadUuid, (event) => {
      if ('opened' in event.data) {
        console.log('Xaman payload opened by user');
        onEvent({ type: 'opened', data: event.data });
      }
      if ('signed' in event.data) {
        console.log('Xaman payload signed:', event.data.signed);
        onEvent({ type: 'signed', data: event.data });
        return event; // Return to resolve the subscription
      }
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to payload:', error);
    throw error;
  }
}

/**
 * Check the status of a Xaman payload
 * @param payloadUuid - The UUID of the payload to check
 * @returns Payload status information
 */
export async function checkXamanPayloadStatus(payloadUuid: string) {
  try {
    const xumm = getXummClient();
    const payloadData = await xumm.payload.get(payloadUuid);

    return {
      opened: payloadData.meta.opened,
      signed: payloadData.meta.signed,
      cancelled: payloadData.meta.cancelled,
      expired: payloadData.meta.expired,
      txid: payloadData.response?.txid,
    };
  } catch (error) {
    console.error('Failed to check payload status:', error);
    throw new Error('Failed to check Xaman payload status');
  }
}

/**
 * Generates a manual deep link for XRP payment (fallback)
 * This can be used if you want to generate deep links client-side
 */
export function getXamanDeepLink(payload: XamanPaymentPayload): string {
  const { agentUnderlyingAddress, totalAmountXRP } = payload;
  const amountInDrops = Math.floor(totalAmountXRP * 1_000_000);

  // Xaman deep link format
  return `https://xumm.app/detect/request:${agentUnderlyingAddress}?amount=${amountInDrops}`;
}
