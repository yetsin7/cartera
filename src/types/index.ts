export type TransactionType = 'income' | 'expense' | 'sale';

export type CategoryType = 'food' | 'transport' | 'entertainment' | 'health' | 'shopping' | 'services' | 'salary' | 'business' | 'sale' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: CategoryType;
  description: string;
  date: string;
  productId?: string;
  walletId?: string;
  notes?: string;
  tags?: string[];
  recurring?: boolean;
  recurringId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  cost?: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AppSettings {
  language: 'es' | 'en';
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  cloudSync: boolean;
  cloudProvider?: 'drive' | 'icloud';
  defaultWallet?: string;
  biometricsEnabled?: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'savings' | 'other';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: string;
  category: 'savings' | 'purchase' | 'debt' | 'investment' | 'emergency' | 'other';
  createdAt: string;
  completed: boolean;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: CategoryType;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastExecuted?: string;
  active: boolean;
  walletId?: string;
}

export interface Budget {
  id: string;
  category: CategoryType;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

export interface SaleSession {
  id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  currency: string;
  date: string;
  walletId?: string;
}
