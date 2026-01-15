"use client";

import { ReactNode } from 'react';
import { useWeb3Auth } from '@web3auth/modal/react';
import { LoginScreen } from './LoginScreen';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isConnected, isInitialized } = useWeb3Auth();

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-content">
          <div className="auth-loading-logo">Z</div>
          <div className="auth-loading-spinner" />
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not connected
  if (!isConnected) {
    return <LoginScreen />;
  }

  // Render protected content
  return <>{children}</>;
};
