"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import { PrimeSdk, Web3eip1193WalletProvider } from "@etherspot/prime-sdk";
import { fetchPortfolioValue, PortfolioData } from "../../services/portfolioService";
import { CHAIN_ID, DECIMAL_PLACES } from "../../utils/constants";

export const PortfolioValue = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>("");

  const { address: eoaAddress, isConnected } = useAccount();
  const { data: client } = useConnectorClient();

  useEffect(() => {
    const initSmartAccount = async () => {
      if (!client?.transport) return;

      try {
        const walletProvider = await Web3eip1193WalletProvider.connect(
          client.transport as any
        );

        const sdk = new PrimeSdk(walletProvider, {
          chainId: CHAIN_ID,
        });

        const smartAddress = await sdk.getCounterFactualAddress();
        setSmartAccountAddress(smartAddress);
      } catch (error) {
        console.error("Failed to get smart account:", error);
      }
    };

    if (isConnected) {
      initSmartAccount();
    }
  }, [client, isConnected]);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!eoaAddress && !smartAccountAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPortfolioValue(eoaAddress, smartAccountAddress);
        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
    const interval = setInterval(loadPortfolio, 30000);

    return () => clearInterval(interval);
  }, [eoaAddress, smartAccountAddress]);

  if (!isConnected) {
    return (
      <div className="portfolio-card">
        <div className="portfolio-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 className="portfolio-title" style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            margin: 0,
            color: '#070709'
          }}>Portfolio</h3>
        </div>
        <div className="send-receive-not-connected" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          padding: '1.5rem 1rem',
          color: 'rgba(7, 7, 9, 0.5)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M3 8l9 6 9-6" />
          </svg>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>Connect wallet to view portfolio</p>
        </div>
      </div>
    );
  }

  if (loading && !portfolio) {
    return (
      <div className="portfolio-card">
        <div className="portfolio-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 className="portfolio-title" style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            margin: 0,
            color: '#070709'
          }}>Portfolio</h3>
          <div className="portfolio-badge" style={{
            fontSize: '0.625rem',
            padding: '0.25rem 0.5rem',
            background: 'rgba(7, 7, 9, 0.15)',
            color: '#070709',
            borderRadius: '9999px',
            fontWeight: '500'
          }}>Loading</div>
        </div>
        <div className="portfolio-total" style={{
          padding: '0.75rem',
          background: 'rgba(7, 7, 9, 0.08)',
          borderRadius: '0.5rem',
          marginBottom: '0.75rem',
          border: '1px solid rgba(7, 7, 9, 0.15)'
        }}>
          <div className="portfolio-total-label" style={{
            fontSize: '0.75rem',
            color: 'rgba(7, 7, 9, 0.6)',
            marginBottom: '0.25rem',
            fontWeight: '500'
          }}>Total Value</div>
          <div className="portfolio-total-value" style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#070709',
            fontFamily: 'monospace'
          }}>$0.00</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-card">
        <div className="portfolio-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 className="portfolio-title" style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            margin: 0,
            color: '#070709'
          }}>Portfolio</h3>
        </div>
        <div className="send-receive-not-connected" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          padding: '1.5rem 1rem',
          color: 'rgba(7, 7, 9, 0.5)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ color: "#ef4444", fontSize: '0.875rem', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  const aggregatedAssets = portfolio?.accounts.reduce((acc, account) => {
    account.assets.forEach((asset) => {
      if (!acc[asset.symbol]) {
        acc[asset.symbol] = {
          symbol: asset.symbol,
          balance: 0,
          price: asset.price,
          valueUsd: 0,
        };
      }
      acc[asset.symbol].balance += Number(asset.balance);
      acc[asset.symbol].valueUsd += Number(asset.valueUsd);
    });
    return acc;
  }, {} as Record<string, { symbol: string; balance: number; price: string; valueUsd: number }>);

  const assetList = aggregatedAssets ? Object.values(aggregatedAssets) : [];

  return (
    <div className="portfolio-card">
      <div className="portfolio-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h3 className="portfolio-title" style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          margin: 0,
          color: '#070709'
        }}>Portfolio</h3>
        <div className="portfolio-badge" style={{
          fontSize: '0.625rem',
          padding: '0.25rem 0.5rem',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          borderRadius: '9999px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
          Live
        </div>
      </div>

      <div className="portfolio-total" style={{
        padding: '0.75rem',
        background: 'rgba(7, 7, 9, 0.08)',
        borderRadius: '0.5rem',
        marginBottom: '0.75rem',
        border: '1px solid rgba(7, 7, 9, 0.15)'
      }}>
        <div className="portfolio-total-label" style={{
          fontSize: '0.75rem',
          color: 'rgba(7, 7, 9, 0.6)',
          marginBottom: '0.25rem',
          fontWeight: '500'
        }}>Total Value</div>
        <div className="portfolio-total-value" style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#070709',
          fontFamily: 'monospace'
        }}>
          ${portfolio?.grandTotalUsd || "0.00"}
        </div>
      </div>

      {assetList.length > 0 && (
        <div className="portfolio-assets" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {assetList.map((asset) => (
            <div key={asset.symbol} className="portfolio-asset-card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'rgba(7, 7, 9, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(7, 7, 9, 0.1)',
              transition: 'all 0.2s'
            }}>
              <div className="portfolio-asset-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem'
              }}>
                <div className="portfolio-asset-icon" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#070709',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E1C4E9',
                  flexShrink: 0
                }}>
                  {asset.symbol === "C2FLR" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                  {asset.symbol === "USDT0" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  )}
                  {asset.symbol === "FXRP" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  )}
                </div>
                <div className="portfolio-asset-info" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.125rem'
                }}>
                  <div className="portfolio-asset-symbol" style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: '#070709'
                  }}>{asset.symbol}</div>
                  <div className="portfolio-asset-balance" style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(7, 7, 9, 0.6)',
                    fontFamily: 'monospace'
                  }}>
                    {asset.balance.toFixed(asset.symbol === "C2FLR" || asset.symbol === "FXRP" ? DECIMAL_PLACES.BALANCE : 2)}
                  </div>
                </div>
              </div>
              <div className="portfolio-asset-value" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.125rem'
              }}>
                <div className="portfolio-asset-price" style={{
                  fontSize: '0.6875rem',
                  color: 'rgba(7, 7, 9, 0.5)',
                  fontFamily: 'monospace'
                }}>${asset.price}</div>
                <div className="portfolio-asset-usd" style={{
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#10b981',
                  fontFamily: 'monospace'
                }}>${asset.valueUsd}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
