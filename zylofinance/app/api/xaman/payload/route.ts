import { NextResponse } from 'next/server';
import { Xumm } from "xumm"

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentUnderlyingAddress, totalAmountXRP, paymentReference } = body;

    // Validate inputs
    if (!agentUnderlyingAddress || !totalAmountXRP || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate API credentials are present
    const apiKey = process.env.XUMM_API_KEY;
    const apiSecret = process.env.XUMM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Xumm API credentials missing');
      return NextResponse.json(
        { error: 'Xumm API credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize SDK inside the request handler to ensure env vars are loaded
    const xumm = new Xumm(apiKey, apiSecret);

    // Check if payload API is available
    if (!xumm.payload) {
      throw new Error('Xaman SDK payload API not available');
    }

    // Convert XRP to drops (multiply by 1,000,000) - Xumm expects drops as string
    const amountInDrops = String(Math.floor(totalAmountXRP * 1_000_000));

    // Remove 0x prefix and trailing zeros from payment reference
    let memoDataHex = paymentReference.startsWith('0x')
      ? paymentReference.slice(2)
      : paymentReference;
    memoDataHex = memoDataHex.replace(/0+$/, '').toUpperCase();

    console.log('Creating Xaman payload:', {
      destination: agentUnderlyingAddress,
      amount: amountInDrops,
      amountXRP: totalAmountXRP,
      memo: memoDataHex
    });

    // Create the payload using createAndSubscribe
    const { created, resolved } = await xumm.payload.createAndSubscribe(
      {
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
      },
      (eventMessage) => {
        console.log('Xaman event:', eventMessage.data);

        if ('opened' in eventMessage.data) {
          console.log('Xaman payload opened');
        }
        if ('signed' in eventMessage.data) {
          console.log('Xaman payload signed:', eventMessage.data.signed);
          return eventMessage;
        }
      }
    );

    // Log the complete created object to debug structure
    console.log('Xaman payload created (full object):', JSON.stringify(created, null, 2));
    console.log('Payload URL:', created.next?.always);
    console.log('Payload QR:', created.refs?.qr_png);

    // Extract QR code URL - try multiple possible paths
    const qrUrl = created.refs?.qr_png || '';
    const deepLink = created.next?.always || created.next || '';

    console.log('Xaman payload created:', {
      uuid: created.uuid,
      qr: qrUrl,
      deepLink: deepLink
    });

    const payload = await resolved;
    console.log('Xaman payload resolved:', payload);

    // Return the payload data
    return NextResponse.json({
      uuid: created.uuid,
      refs: {
        qr_png: qrUrl,
      },
      next: {
        always: deepLink,
      },
    });
  } catch (error: any) {
    console.error('Xaman API error (full):', error);
    console.error('Xaman API error message:', error.message);
    console.error('Xaman API error details:', error.details || 'No details');

    // Return more detailed error information
    return NextResponse.json(
      {
        error: error.message || 'Failed to create Xaman payload',
        details: error.details || undefined,
        reference: error.reference || undefined
      },
      { status: 500 }
    );
  }
}
