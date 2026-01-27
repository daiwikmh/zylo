"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { useWeb3Auth } from '../../src/providers/web3auth';
import { initEtherspotSDK } from '@/app/src/utils/etherspot';
import { FAssetReservationCard, type ReservationData } from '@/app/src/components/fasset/FAssetReservationCard';
import { XRPTransferCard } from '@/app/src/components/fasset/XRPTransferCard';

export default function FXRPPage() {
  const { address, isConnected } = useAccount();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Initialize Etherspot SDK when connected
  useEffect(() => {
    if (!isConnected || !address || !web3AuthProvider) return;

    let mounted = true;

    (async () => {
      try {
        const sdk = await initEtherspotSDK(web3AuthProvider);
        if (mounted) setPrimeSdk(sdk);
      } catch (e) {
        console.error("Etherspot init failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isConnected, address, web3AuthProvider]);

  const handleReservationComplete = (data: ReservationData) => {
    setReservationData(data);
    setIsFlipping(true);

    // Wait for flip animation then change step
    setTimeout(() => {
      setCurrentStep(2);
      setIsFlipping(false);
    }, 600);
  };

  const handleTransferComplete = () => {
    // Handle minting completion
    console.log('Minting process completed!');
  };

  const handleReset = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentStep(1);
      setReservationData(null);
      setIsFlipping(false);
    }, 600);
  };

  return (
    <div className="fxrp-container" style={{ padding: '2rem' }}>
      <div className="fxrp-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="fxrp-title" style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#070709',
            marginBottom: '0.5rem'
          }}>
            Mint testFXRP
          </h1>
          <p className="fxrp-subtitle" style={{
            fontSize: '1rem',
            color: '#232323',
            opacity: 0.8
          }}>
            Mint FAssets backed by XRP on the Flare Network
          </p>
        </div>
        <div className="fxrp-progress" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div className={`fxrp-progress-step ${currentStep >= 1 ? 'active' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div className="fxrp-progress-circle" style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentStep >= 1 ? '#070709' : '#E1C4E9',
              color: currentStep >= 1 ? '#E1C4E9' : '#070709',
              border: '2px solid #070709',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>1</div>
            <span style={{
              fontWeight: '600',
              color: currentStep >= 1 ? '#070709' : '#232323',
              opacity: currentStep >= 1 ? 1 : 0.6
            }}>Reserve</span>
          </div>
          <div className="fxrp-progress-line" style={{
            width: '40px',
            height: '2px',
            background: currentStep >= 2 ? '#070709' : '#E1C4E9'
          }} />
          <div className={`fxrp-progress-step ${currentStep >= 2 ? 'active' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div className="fxrp-progress-circle" style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentStep >= 2 ? '#070709' : '#E1C4E9',
              color: currentStep >= 2 ? '#E1C4E9' : '#070709',
              border: '2px solid #070709',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>2</div>
            <span style={{
              fontWeight: '600',
              color: currentStep >= 2 ? '#070709' : '#232323',
              opacity: currentStep >= 2 ? 1 : 0.6
            }}>Transfer</span>
          </div>
        </div>
      </div>

      <div className="fxrp-content">
        {/* Info Card */}
        <div className="fxrp-info-card" style={{
          background: '#E1C4E9',
          border: '2px solid #070709',
          boxShadow: '6px 6px 0px #070709',
          borderRadius: '1rem',
          padding: '2rem'
        }}>
          <div className="fxrp-info-header" style={{ marginBottom: '1.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <h3 style={{ color: '#070709', fontSize: '1.5rem', fontWeight: '700' }}>How It Works</h3>
          </div>
          <div className="fxrp-info-content">
            <div className="fxrp-info-step" style={{ marginBottom: '1.5rem' }}>
              <div className="fxrp-info-number" style={{
                background: '#070709',
                color: '#E1C4E9',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>1</div>
              <div>
                <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Reserve Collateral</h4>
                <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Choose your lot size and pay the Collateral Reservation Fee (CRF) from your Smart Account.
                </p>
              </div>
            </div>
            <div className="fxrp-info-step" style={{ marginBottom: '1.5rem' }}>
              <div className="fxrp-info-number" style={{
                background: '#070709',
                color: '#E1C4E9',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>2</div>
              <div>
                <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Send XRP Payment</h4>
                <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Use Xaman wallet to send the required XRP amount to the agent's address with the payment reference.
                </p>
              </div>
            </div>
            <div className="fxrp-info-step">
              <div className="fxrp-info-number" style={{
                background: '#070709',
                color: '#E1C4E9',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>3</div>
              <div>
                <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Receive testFXRP</h4>
                <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Once confirmed, you'll receive testFXRP tokens in your wallet that represent your XRP on Flare.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card Area with Flip Animation */}
        <div className="fxrp-main-area">
          <div className={`fxrp-card-container ${isFlipping ? 'flipping' : ''}`}>
            {currentStep === 1 ? (
              <FAssetReservationCard
                primeSdk={primeSdk}
                onReservationComplete={handleReservationComplete}
              />
            ) : (
              reservationData && (
                <XRPTransferCard
                  reservationData={reservationData}
                  onTransferComplete={handleTransferComplete}
                />
              )
            )}
          </div>

          {/* Reset Button (shown on step 2) */}
          {currentStep === 2 && (
            <button onClick={handleReset} className="fxrp-reset-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Start New Reservation
            </button>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="fxrp-faq-section" style={{ marginTop: '3rem' }}>
        <h3 className="fxrp-faq-title" style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#070709',
          marginBottom: '2rem'
        }}>
          Frequently Asked Questions
        </h3>
        <div className="fxrp-faq-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="fxrp-faq-item" style={{
            background: '#E1C4E9',
            border: '2px solid #070709',
            boxShadow: '4px 4px 0px #070709',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.75rem' }}>
              What is a lot?
            </h4>
            <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
              A lot is the standard unit for FAsset minting. 1 lot = 10 XRP. You can mint multiple lots at once.
            </p>
          </div>
          <div className="fxrp-faq-item" style={{
            background: '#E1C4E9',
            border: '2px solid #070709',
            boxShadow: '4px 4px 0px #070709',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.75rem' }}>
              What is the CRF?
            </h4>
            <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
              The Collateral Reservation Fee (CRF) is a small fee paid to reserve collateral from an agent. It's refundable if you complete the minting process.
            </p>
          </div>
          <div className="fxrp-faq-item" style={{
            background: '#E1C4E9',
            border: '2px solid #070709',
            boxShadow: '4px 4px 0px #070709',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.75rem' }}>
              Why do I need Xaman?
            </h4>
            <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Xaman (formerly Xumm) is a secure XRP wallet needed to send the XRP payment with the correct payment reference.
            </p>
          </div>
          <div className="fxrp-faq-item" style={{
            background: '#E1C4E9',
            border: '2px solid #070709',
            boxShadow: '4px 4px 0px #070709',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: '#070709', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.75rem' }}>
              How long does minting take?
            </h4>
            <p style={{ color: '#232323', fontSize: '0.875rem', lineHeight: '1.5' }}>
              After sending XRP, the minting process typically completes within 5-10 minutes once the transaction is confirmed on the XRP Ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
