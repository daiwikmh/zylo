'use client';

import { useState, useEffect } from 'react';
import { Link2, TrendingUp, Wallet } from 'lucide-react';
import TransactionList from './TransactionList';
import '../../styles/mobile-neo-brutalist.css';

interface MobileDashboardProps {
  balance?: string;
  smartAccountAddress?: string;
  isConnected?: boolean;
  onLinkClick?: () => void;
  onStatsClick?: () => void;
  onConnectWallet?: () => void;
}

export default function MobileDashboard({
  balance,
  smartAccountAddress,
  isConnected = false,
  onLinkClick,
  onStatsClick,
  onConnectWallet
}: MobileDashboardProps) {
  if (!isConnected) {
    return (
      <div className="mobile-dashboard">
        <div className="mobile-dashboard-header">
          <h1 className="mobile-dashboard-title" style={{ color: '#070709', fontWeight: '700' }}>Zylo Finance</h1>
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <Wallet size={64} strokeWidth={2} color="#E1C4E9" style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', color: '#232323', opacity: 0.8 }}>
              Connect your wallet to get started
            </p>
            <button
              onClick={onConnectWallet}
              style={{
                padding: '1rem 2rem',
                background: '#070709',
                color: '#E1C4E9',
                border: '2px solid #070709',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #232323',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px #232323';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #232323';
              }}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-dashboard">
      {/* Header with Balance */}
      <div className="mobile-dashboard-header">
        <h1 className="mobile-dashboard-title" style={{ color: '#070709', fontWeight: '700', fontSize: '2rem', marginBottom: '1.5rem' }}>
          Zylo Finance
        </h1>

        <div className="mobile-balance-card" style={{
          background: '#E1C4E9',
          border: '2px solid #070709',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '6px 6px 0px #070709'
        }}>
          <div className="mobile-balance-label" style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#232323',
            marginBottom: '0.5rem',
            opacity: 0.8
          }}>
            Total Balance
          </div>
          <div className="mobile-balance-amount" style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#070709',
            marginBottom: '1rem',
            fontFamily: 'monospace'
          }}>
            {balance || '$0.00'}
          </div>

          {smartAccountAddress && (
            <div style={{
              fontSize: '0.75rem',
              color: '#232323',
              marginTop: '0.5rem',
              marginBottom: '1.5rem',
              fontFamily: 'monospace',
              opacity: 0.7,
              padding: '0.5rem',
              background: 'rgba(7, 7, 9, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(7, 7, 9, 0.2)'
            }}>
              {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
            </div>
          )}

          <div className="mobile-action-buttons" style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              className="mobile-action-button"
              onClick={onLinkClick}
              aria-label="Link Account"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#070709',
                color: '#E1C4E9',
                border: '2px solid #070709',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px #232323',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #232323';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #232323';
              }}
            >
              <Link2 size={20} color="#E1C4E9" strokeWidth={2.5} />
            </button>
            <button
              className="mobile-action-button"
              onClick={onStatsClick}
              aria-label="View Stats"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#070709',
                color: '#E1C4E9',
                border: '2px solid #070709',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px #232323',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #232323';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #232323';
              }}
            >
              <TrendingUp size={20} color="#E1C4E9" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ marginTop: '2rem' }}>
        <TransactionList smartAccountAddress={smartAccountAddress} />
      </div>
    </div>
  );
}
