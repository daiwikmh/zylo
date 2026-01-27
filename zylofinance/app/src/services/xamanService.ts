/**
 * Xaman (formerly Xumm) Payload Generator Service - Frontend
 * Calls the backend API route to generate XRP payment requests
 *
 * SECURITY: This service does NOT use the xumm-sdk directly in the browser.
 * All SDK operations happen in the backend API route to protect API credentials.
 */

export interface XamanPaymentPayload {
  agentUnderlyingAddress: string;
  totalAmountXRP: number;
  paymentReference: string;
}

export interface XamanPayloadResult {
  qrUrl: string;
  deepLink: string;
  uuid: string;
}

/**
 * Generates a Xaman payment payload for FAsset minting
 * Calls the backend API route instead of using the SDK directly
 * @param payload - Payment details including agent address, amount, and payment reference
 * @returns QR URL and deep link for Xaman wallet
 */
export async function generateXamanPayload(
  payload: XamanPaymentPayload
): Promise<XamanPayloadResult> {
  try {
    console.log('Calling Xaman API route with:', payload);

    const response = await fetch('/api/xaman/payload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to create Xaman payload');
    }

    console.log('Xaman payload created:', {
      uuid: data.uuid,
      qr: data.refs.qr_png,
      deepLink: data.next.always
    });

    return {
      qrUrl: data.refs.qr_png,
      deepLink: data.next.always,
      uuid: data.uuid,
    };
  } catch (error: any) {
    console.error('Failed to generate Xaman payload:', error);

    // Fallback: Generate a manual payment URL
    const amountInDrops = Math.floor(payload.totalAmountXRP);
    const manualUrl = `https://xumm.app/detect/request:${payload.agentUnderlyingAddress}?amount=${amountInDrops}`;

    return {
      qrUrl: '', // No QR available in fallback mode
      deepLink: manualUrl,
      uuid: 'fallback-' + Date.now(),
    };
  }
}

/**
 * Generates a manual deep link for XRP payment (fallback)
 * This can be used if you want to generate deep links client-side
 */
export function getXamanDeepLink(payload: XamanPaymentPayload): string {
  const { agentUnderlyingAddress, totalAmountXRP } = payload;
  const amountInDrops = Math.floor(totalAmountXRP);

  // Xaman deep link format
  return `https://xumm.app/detect/request:${agentUnderlyingAddress}?amount=${amountInDrops}`;
}
