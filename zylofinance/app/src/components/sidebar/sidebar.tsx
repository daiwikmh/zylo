"use client";

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleMetaMaskClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: metaMask() });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sidebar-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Top Section - Logo and Navigation */}
        <div className="sidebar-top">
          {/* Logo */}
          <div className="sidebar-logo">
            Z
          </div>

          {/* Navigation Icons */}
          <div className="sidebar-nav">
            {/* Dashboard Icon */}
            <button className="sidebar-tab active">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>

            {/* Chart Icon */}
            <button className="sidebar-tab">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </button>

            {/* Wallet Icon */}
            <button className="sidebar-tab">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Section - Profile with Expandable Menu */}
        <div className="sidebar-bottom">
          {/* Expandable Menu */}
          {isMenuOpen && (
            <div className="sidebar-menu">
              {/* Wallet Address Card (shown when connected) */}
              {isConnected && address && (
                <div className="wallet-address-card">
                  <span className="wallet-address-label">Connected</span>
                  <span className="wallet-address">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                </div>
              )}

              {/* MetaMask Button */}
              <button
                onClick={handleMetaMaskClick}
                className={`sidebar-tab ${isConnected ? 'connected' : ''}`}
                title={isConnected ? 'Disconnect Wallet' : 'Connect MetaMask'}
              >
                {isConnected && (
                  <div className="connection-indicator" />
                )}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </button>

              {/* Settings Button */}
              <button className="sidebar-tab" title="Settings">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          )}

          {/* Profile Button (Toggle) */}
          <button
            onClick={toggleMenu}
            className={`sidebar-profile-tab ${isMenuOpen ? 'active' : ''}`}
            title="Profile"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Content will be rendered here */}
      </div>
    </div>
  );
};
