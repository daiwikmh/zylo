"use client";

import { useState } from 'react';
import {
  useWeb3Auth,
  useWeb3AuthUser,
  useWeb3AuthDisconnect,
} from '@web3auth/modal/react';

export const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isConnected } = useWeb3Auth();
  const { user } = useWeb3AuthUser();
  const { disconnect, loading: isDisconnecting } = useWeb3AuthDisconnect();

  const handleLogout = async () => {
    try {
      await disconnect();
      setShowProfileMenu(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name || 'User';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-greeting">
          {getGreeting()}, {userName.split(' ')[0]}!
        </h1>
      </div>

      <div className="header-right">
        {/* Notification Icons */}
        <button className="header-icon-btn" title="Messages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button className="header-icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-badge">3</span>
        </button>

        <button className="header-icon-btn" title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Profile Button */}
        <div className="header-profile-container">
          <button
            className="header-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {isConnected && <span className="profile-status-dot" />}
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="header-profile-img" />
            ) : (
              <div className="header-profile-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="header-profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" />
                  ) : (
                    <span>{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">{userName}</span>
                  {user?.email && <span className="profile-dropdown-email">{user.email}</span>}
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button className="profile-dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>

              <button className="profile-dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Wallet
              </button>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-dropdown-item logout"
                onClick={handleLogout}
                disabled={isDisconnecting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {isDisconnecting ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
