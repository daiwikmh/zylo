"use client";

export default function HistoryPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>
            Transaction History
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            View all your past transactions
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="bento-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
              Transaction History Coming Soon
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Track all your transaction history in one place
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
