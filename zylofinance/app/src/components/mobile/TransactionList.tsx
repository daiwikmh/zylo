'use client';

import { Check, ArrowRight } from 'lucide-react';
import '../../styles/mobile-neo-brutalist.css';

export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'success' | 'pending';
  avatar?: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
  title?: string;
}

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    name: 'John Doe',
    date: 'Today, 2:30 PM',
    amount: 250.00,
    status: 'success',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    date: 'Today, 11:15 AM',
    amount: -89.99,
    status: 'success',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    date: 'Yesterday, 5:45 PM',
    amount: -150.00,
    status: 'pending',
  },
  {
    id: '4',
    name: 'Emily Davis',
    date: 'Jan 19, 3:20 PM',
    amount: 500.00,
    status: 'success',
  },
];

export default function TransactionList({
  transactions = defaultTransactions,
  title = 'Recent Transactions'
}: TransactionListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="mobile-transaction-list">
      <h2 className="mobile-transaction-header">{title}</h2>

      {transactions.map((transaction) => (
        <div key={transaction.id} className="mobile-transaction-item">
          <div className="mobile-transaction-avatar">
            {transaction.avatar || getInitials(transaction.name)}
          </div>

          <div className="mobile-transaction-details">
            <div className="mobile-transaction-name">{transaction.name}</div>
            <div className="mobile-transaction-date">{transaction.date}</div>
          </div>

          <div
            className={`mobile-transaction-amount ${
              transaction.amount >= 0 ? 'positive' : 'negative'
            }`}
          >
            {formatAmount(transaction.amount)}
          </div>

          <div
            className={`mobile-transaction-status ${transaction.status}`}
          >
            {transaction.status === 'success' ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <ArrowRight size={16} strokeWidth={3} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
