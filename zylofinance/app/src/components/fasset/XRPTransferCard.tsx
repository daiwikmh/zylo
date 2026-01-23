"use client";

import { useState, useEffect } from 'react';
import { generateXamanPayload, testXamanConnection, type XamanPaymentPayload } from '../../services/xamanService';
import { formatPaymentReferenceForMemo } from '../../utils/etherspot';
import type { ReservationData } from './FAssetReservationCard';

interface XRPTransferCardProps {
  reservationData: ReservationData;
  onTransferComplete?: () => void;
}

export const XRPTransferCard = ({
  reservationData,
  onTransferComplete,
}: XRPTransferCardProps) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    generatePayload();
  }, [reservationData]);

  const generatePayload = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Test connection first
      console.log('Testing Xaman SDK connection...');
      await testXamanConnection();
      console.log('Xaman SDK connected successfully!');

      const payload: XamanPaymentPayload = {
        agentUnderlyingAddress: reservationData.agentUnderlyingAddress,
        totalAmountXRP: reservationData.totalAmountXRP,
        paymentReference: reservationData.paymentReference,
      };

      const result = await generateXamanPayload(payload);
      setQrUrl(result.qrUrl);
      setDeepLink(result.deepLink);
    } catch (err: any) {
      console.error('Failed to generate Xaman payload:', err);

      // Better error messages
      if (err.message?.includes('not configured') || err.message?.includes('API Key')) {
        setError('Xaman API credentials not configured. Please add NEXT_PUBLIC_XUMM_API_KEY and NEXT_PUBLIC_XUMM_API_SECRET to .env.local');
      } else if (err.message?.includes('ping')) {
        setError('Unable to connect to Xaman API. Please check your API credentials.');
      } else {
        setError('Failed to generate payment request: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  return (
    <div className="xrp-transfer-card" style={{
      background: '#0D0D0D',
      boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
      border: '1px solid rgba(6, 182, 212, 0.2)'
    }}>
      {/* Header */}
      <div className="fasset-card-header">
        <div>
          <h2 className="fasset-card-title" style={{ color: '#ffffff' }}>Send XRP Payment</h2>
          <p className="fasset-card-subtitle" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Step 2: Scan QR code with Xaman wallet
          </p>
        </div>
        <span className="fasset-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
          Step 2
        </span>
      </div>

      {/* Success Icon */}
      <div className="xrp-success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Instructions */}
      <div className="xrp-instructions">
        <p style={{ color: '#06b6d4', fontWeight: 600, marginBottom: '0.5rem' }}>
          Collateral Reserved Successfully!
        </p>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
          Now send exactly <strong style={{ color: '#06b6d4' }}>{reservationData.totalAmountXRP.toFixed(2)} XRP</strong> to complete the minting process.
        </p>
      </div>

      {/* QR Code Display */}
      {isLoading ? (
        <div className="xrp-qr-loading" style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(6, 182, 212, 0.2)',
            borderTop: '4px solid #06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Generating Xaman QR code...</p>
        </div>
      ) : error ? (
        <div className="xrp-error" style={{
          color: '#ff6b6b',
          padding: '1.5rem',
          textAlign: 'center',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button onClick={generatePayload} style={{
            background: 'rgba(6, 182, 212, 0.2)',
            color: '#06b6d4',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}>
            Retry
          </button>
        </div>
      ) : qrUrl ? (
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          {/* QR Code */}
          <div style={{
            background: '#ffffff',
            padding: '1rem',
            borderRadius: '1rem',
            border: '2px solid rgba(6, 182, 212, 0.3)',
            display: 'inline-block',
            marginBottom: '0.75rem'
          }}>
            <img
              src={qrUrl}
              alt="XRP Payment QR Code"
              style={{
                width: '200px',
                height: '200px',
                display: 'block'
              }}
            />
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
            Scan with Xaman wallet
          </p>
        </div>
      ) : null}

      {/* Payment Details */}
      <div className="xrp-payment-details" style={{
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        <div className="xrp-detail-row">
          <span className="xrp-detail-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Amount to Send</span>
          <span className="xrp-detail-value" style={{ color: '#06b6d4' }}>
            {reservationData.totalAmountXRP.toFixed(2)} XRP
            <button
              className="xrp-copy-btn"
              onClick={() => copyToClipboard(reservationData.totalAmountXRP.toFixed(2), 'Amount')}
              title="Copy amount"
              style={{ color: '#06b6d4' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </span>
        </div>

        <div className="xrp-detail-row">
          <span className="xrp-detail-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>XRP Destination</span>
          <span className="xrp-detail-value" style={{
            color: '#06b6d4',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{reservationData.agentUnderlyingAddress}</span>
            <button
              className="xrp-copy-btn"
              onClick={() =>
                copyToClipboard(reservationData.agentUnderlyingAddress, 'XRP Address')
              }
              title="Copy XRP address"
              style={{ color: '#06b6d4' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </span>
        </div>

        <div className="xrp-detail-row">
          <span className="xrp-detail-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Lots</span>
          <span className="xrp-detail-value" style={{ color: '#06b6d4' }}>{reservationData.lots}</span>
        </div>

        <div className="xrp-detail-row">
          <span className="xrp-detail-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Reservation ID</span>
          <span className="xrp-detail-value" style={{ color: '#06b6d4', fontFamily: 'monospace' }}>
            #{reservationData.collateralReservationId}
          </span>
        </div>

        <div className="xrp-detail-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="xrp-detail-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Payment Reference (Hex Memo)
            </span>
            <button
              className="xrp-copy-btn"
              onClick={() => {
                const formattedMemo = formatPaymentReferenceForMemo(reservationData.paymentReference);
                copyToClipboard(formattedMemo, 'Payment Reference');
              }}
              title="Copy payment reference for XRP memo"
              style={{
                color: '#06b6d4',
                padding: '0.25rem 0.5rem',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              Copy for Memo
            </button>
          </div>
          <span className="xrp-detail-value" style={{
            color: '#06b6d4',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
            background: 'rgba(6, 182, 212, 0.05)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            {formatPaymentReferenceForMemo(reservationData.paymentReference)}
          </span>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
            Use this hex value in your XRP wallet's Memo field (type: Hex)
          </div>
        </div>
      </div>

      {/* Open in Xaman Button */}
      {deepLink && (
        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="xrp-open-xaman-btn"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            marginTop: '1rem'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>Open in Xaman Wallet</span>
        </a>
      )}

      {/* Waiting Status */}
      {!isLoading && !error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(6, 182, 212, 0.3)',
            borderTop: '2px solid #06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div>
            <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.875rem' }}>
              Waiting for XRP Ledger Confirmation...
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Your testFXRP will arrive once the transaction is confirmed on XRP Ledger
            </div>
          </div>
        </div>
      )}

      {/* Manual Instructions */}
      <div style={{
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{ color: '#06b6d4', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          Manual Payment Instructions:
        </div>
        <ol style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', paddingLeft: '1.25rem', margin: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Open your XRP wallet (Xaman, Bifrost, or any XRP wallet)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Send <strong style={{ color: '#06b6d4' }}>{reservationData.totalAmountXRP.toFixed(6)} XRP</strong> to the destination address above
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#06b6d4' }}>IMPORTANT:</strong> In the Memo field, select "Hex" type and paste the payment reference (without 0x)
          </li>
          <li>
            Confirm and send the transaction
          </li>
        </ol>
      </div>

      {/* Warning Box */}
      <div className="xrp-warning-box" style={{
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        color: '#fbbf24',
        marginTop: '1rem'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          Send the <strong>exact amount</strong> with the payment reference included. Do not modify the transaction.
        </span>
      </div>
    </div>
  );
};
