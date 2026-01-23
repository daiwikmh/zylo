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
    <div className="fxrp-container">
      <div className="fxrp-header">
        <div>
          <h1 className="fxrp-title">Mint testFXRP</h1>
          <p className="fxrp-subtitle">
            Mint FAssets backed by XRP on the Flare Network
          </p>
        </div>
        <div className="fxrp-progress">
          <div className={`fxrp-progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="fxrp-progress-circle">1</div>
            <span>Reserve</span>
          </div>
          <div className="fxrp-progress-line" />
          <div className={`fxrp-progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="fxrp-progress-circle">2</div>
            <span>Transfer</span>
          </div>
        </div>
      </div>

      <div className="fxrp-content">
        {/* Info Card */}
        <div className="fxrp-info-card" style={{ background: '#E6D9FD' }}>
          <div className="fxrp-info-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <h3>How It Works</h3>
          </div>
          <div className="fxrp-info-content">
            <div className="fxrp-info-step">
              <div className="fxrp-info-number">1</div>
              <div>
                <h4>Reserve Collateral</h4>
                <p>Choose your lot size and pay the Collateral Reservation Fee (CRF) from your Smart Account.</p>
              </div>
            </div>
            <div className="fxrp-info-step">
              <div className="fxrp-info-number">2</div>
              <div>
                <h4>Send XRP Payment</h4>
                <p>Use Xaman wallet to send the required XRP amount to the agent's address with the payment reference.</p>
              </div>
            </div>
            <div className="fxrp-info-step">
              <div className="fxrp-info-number">3</div>
              <div>
                <h4>Receive testFXRP</h4>
                <p>Once confirmed, you'll receive testFXRP tokens in your wallet that represent your XRP on Flare.</p>
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
      <div className="fxrp-faq-section">
        <h3 className="fxrp-faq-title">Frequently Asked Questions</h3>
        <div className="fxrp-faq-grid">
          <div className="fxrp-faq-item">
            <h4>What is a lot?</h4>
            <p>A lot is the standard unit for FAsset minting. 1 lot = 10 XRP. You can mint multiple lots at once.</p>
          </div>
          <div className="fxrp-faq-item">
            <h4>What is the CRF?</h4>
            <p>The Collateral Reservation Fee (CRF) is a small fee paid to reserve collateral from an agent. It's refundable if you complete the minting process.</p>
          </div>
          <div className="fxrp-faq-item">
            <h4>Why do I need Xaman?</h4>
            <p>Xaman (formerly Xumm) is a secure XRP wallet needed to send the XRP payment with the correct payment reference.</p>
          </div>
          <div className="fxrp-faq-item">
            <h4>How long does minting take?</h4>
            <p>After sending XRP, the minting process typically completes within 5-10 minutes once the transaction is confirmed on the XRP Ledger.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
