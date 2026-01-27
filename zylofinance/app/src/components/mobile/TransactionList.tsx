'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchTransactionHistory, formatTransactionForDisplay, getTransactionExplorerLink } from '../../services/transactionService';
import '../../styles/mobile-neo-brutalist.css';

export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  hash?: string;
  method?: string;
}

interface TransactionListProps {
  smartAccountAddress?: string;
  title?: string;
  limit?: number;
}

export default function TransactionList({
  smartAccountAddress,
  title = 'Recent Transactions',
  limit = 10
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    if (!smartAccountAddress) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const txHistory = await fetchTransactionHistory(smartAccountAddress, limit);
      const formattedTxs = txHistory.map(tx => formatTransactionForDisplay(tx, smartAccountAddress));
      setTransactions(formattedTxs);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [smartAccountAddress, limit]);

  if (!smartAccountAddress) {
    return (
      <div className="mobile-transaction-list">
        <h2 className="mobile-transaction-header">{title}</h2>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'rgba(0, 0, 0, 0.5)',
          fontSize: '0.875rem'
        }}>
          Connect wallet to view transaction history
        </div>
      </div>
    );
  }
  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${Math.abs(amount).toFixed(4)} FLR`;
  };

  const handleTransactionClick = (hash?: string) => {
    if (hash) {
      window.open(getTransactionExplorerLink(hash), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="mobile-transaction-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="mobile-transaction-header" style={{ color: '#070709' }}>{title}</h2>
        <button
          onClick={loadTransactions}
          disabled={loading}
          style={{
            padding: '0.5rem',
            background: '#E1C4E9',
            border: '2px solid #070709',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: loading ? 'none' : '2px 2px 0px #070709'
          }}
          title="Refresh transactions"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} color="#070709" />
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#232323',
          fontSize: '0.875rem',
          opacity: 0.7
        }}>
          Loading transactions...
        </div>
      ) : error ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#ef4444',
          fontSize: '0.875rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '0.5rem',
          border: '2px solid #ef4444'
        }}>
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#232323',
          fontSize: '0.875rem',
          opacity: 0.6
        }}>
          No transactions yet
        </div>
      ) : (
        <>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="mobile-transaction-item"
              onClick={() => handleTransactionClick(transaction.hash)}
              style={{
                cursor: transaction.hash ? 'pointer' : 'default',
                background: '#E1C4E9',
                border: '2px solid #070709',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '3px 3px 0px #070709'
              }}
              onMouseEnter={(e) => {
                if (transaction.hash) {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0px #070709';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #070709';
              }}
            >
              <div className="mobile-transaction-avatar" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#070709',
                color: '#E1C4E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {transaction.amount >= 0 ? '↓' : '↑'}
              </div>

              <div className="mobile-transaction-details" style={{ flex: 1, minWidth: 0 }}>
                <div className="mobile-transaction-name" style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: '#070709',
                  marginBottom: '0.25rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {transaction.method || transaction.name}
                </div>
                <div className="mobile-transaction-date" style={{
                  fontSize: '0.75rem',
                  color: '#232323',
                  opacity: 0.7
                }}>
                  {transaction.date}
                </div>
              </div>

              <div
                className={`mobile-transaction-amount ${
                  transaction.amount >= 0 ? 'positive' : 'negative'
                }`}
                style={{
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: transaction.amount >= 0 ? '#10b981' : '#ef4444',
                  flexShrink: 0
                }}
              >
                {formatAmount(transaction.amount)}
              </div>

              <div
                className={`mobile-transaction-status ${transaction.status}`}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: transaction.status === 'success' ? '#10b981' : transaction.status === 'failed' ? '#ef4444' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {transaction.status === 'success' ? (
                  <Check size={14} strokeWidth={3} color="#fff" />
                ) : transaction.status === 'failed' ? (
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>✕</span>
                ) : (
                  <ArrowRight size={14} strokeWidth={3} color="#fff" />
                )}
              </div>

              {transaction.hash && (
                <div style={{ marginLeft: '0.25rem', flexShrink: 0 }}>
                  <ExternalLink size={14} color="#070709" style={{ opacity: 0.5 }} />
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
