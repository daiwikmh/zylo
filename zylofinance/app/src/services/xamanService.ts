/**
 * Xaman (formerly Xumm) Payload Generator Service - Frontend
 * Simple wrapper to call the backend API route
 *
 * SECURITY: All Xumm SDK operations happen in /api/xaman/payload
 * to keep API credentials secure on the backend.
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
 * Generates a Xaman payment payload by calling the backend API
 */
export async function generateXamanPayload(
  payload: XamanPaymentPayload
): Promise<XamanPayloadResult> {
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

  return {
    qrUrl: data.refs.qr_png,
    deepLink: data.next.always,
    uuid: data.uuid,
  };
}
