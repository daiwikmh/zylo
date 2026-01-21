"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <div className="sidebar-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Top Section - Logo and Navigation */}
        <div className="sidebar-top">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-wrapper">
              <span className="sidebar-logo-text">Z</span>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="sidebar-nav">
            {/* Dashboard Icon */}
            <Link
              href="/dashboard"
              className={`sidebar-tab ${pathname === '/dashboard' ? 'active' : ''}`}
              title="Dashboard"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </Link>

            {/* analytics Icon */}
            <Link
              href="/analytics"
              className={`sidebar-tab ${pathname === '/analytics' ? 'active' : ''}`}
              title="analytics"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </Link>

            {/* Wallet Icon */}
            <Link
              href="/wallet"
              className={`sidebar-tab ${pathname === '/wallet' ? 'active' : ''}`}
              title="Wallet"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <circle cx="16" cy="14" r="2" />
              </svg>
            </Link>

            {/* Send/Receive Icon */}
            <Link
              href="/send"
              className={`sidebar-tab ${pathname === '/send' ? 'active' : ''}`}
              title="Send & Receive"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </Link>

            {/* Swap Icon */}
            <Link
              href="/swap"
              className={`sidebar-tab ${pathname === '/swap' ? 'active' : ''}`}
              title="Swap"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </Link>

            {/* History Icon */}
            <Link
              href="/history"
              className={`sidebar-tab ${pathname === '/history' ? 'active' : ''}`}
              title="History"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Section - Settings */}
        <div className="sidebar-bottom">
          {/* Settings Button */}
          <Link
            href="/settings"
            className={`sidebar-tab ${pathname === '/settings' ? 'active' : ''}`}
            title="Settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};
