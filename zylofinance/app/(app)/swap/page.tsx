"use client";

export default function SwapPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>
            Swap
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            Exchange tokens instantly
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="bento-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
              Token Swap Coming Soon
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Swap between different tokens at the best rates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
