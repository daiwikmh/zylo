'use client';

import { Home, PieChart, Wallet, Send, History, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import '../../styles/mobile-neo-brutalist.css';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const tabs: Tab[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: <Home size={24} strokeWidth={2.5} />,
    path: '/dashboard',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: <Wallet size={24} strokeWidth={2.5} />,
    path: '/wallet',
  },
  {
    id: 'send',
    label: 'Send',
    icon: <Send size={24} strokeWidth={2.5} />,
    path: '/send',
  },
  {
    id: 'history',
    label: 'History',
    icon: <History size={24} strokeWidth={2.5} />,
    path: '/history',
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="mobile-bottom-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`mobile-tab ${isActive(tab.path) ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <div className="mobile-tab-icon">{tab.icon}</div>
          <div className="mobile-tab-label">{tab.label}</div>
        </div>
      ))}
    </div>
  );
}
