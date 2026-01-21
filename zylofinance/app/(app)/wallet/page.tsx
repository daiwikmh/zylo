"use client";

export default function WalletPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>
            Wallet
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            Manage your wallet and assets
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="bento-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <circle cx="16" cy="14" r="2" />
            </svg>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
              Wallet Management Coming Soon
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              View and manage all your wallet assets in one place
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
