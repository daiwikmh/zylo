"use client";

import { useWeb3AuthConnect } from "@web3auth/modal/react";

export const LoginScreen = () => {
  const { connect, loading, error } = useWeb3AuthConnect();

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">Z</div>
          <h1 className="login-title">Zylo Finance</h1>
          <p className="login-subtitle">Decentralized Finance on Flare Network</p>
        </div>

        {/* Login */}
        <div className="login-options">
          <h2 className="login-heading">Sign in to continue</h2>

          <button
            onClick={() => connect()}
            disabled={loading}
            className="login-btn login-btn-primary"
          >
            {loading ? (
              <div className="login-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            )}
            <span>Connect Wallet</span>
          </button>

          {loading && <div className="login-loading">Connecting...</div>}
          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>By continuing, you agree to our</p>
          <div className="login-links">
            <a href="#">Terms of Service</a>
            <span>&</span>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>
    </div>
  );
};
