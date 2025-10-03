import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat_food', name: 'Food', type: 'expense', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'cat_transport', name: 'Transport', type: 'expense', icon: 'car', color: '#4ECDC4' },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', icon: 'game-controller', color: '#45B7D1' },
  { id: 'cat_health', name: 'Health', type: 'expense', icon: 'medical', color: '#96CEB4' },
  { id: 'cat_shopping', name: 'Shopping', type: 'expense', icon: 'cart', color: '#FFEAA7' },
  { id: 'cat_services', name: 'Services', type: 'expense', icon: 'construct', color: '#DDA15E' },
  { id: 'cat_other_expense', name: 'Other', type: 'expense', icon: 'ellipsis-horizontal', color: '#95A5A6' },

  // Income
  { id: 'cat_salary', name: 'Salary', type: 'income', icon: 'cash', color: '#00D2D3' },
  { id: 'cat_business', name: 'Business', type: 'income', icon: 'briefcase', color: '#55E6C1' },
  { id: 'cat_other_income', name: 'Other', type: 'income', icon: 'add-circle', color: '#7BED8D' },

  // Sales
  { id: 'cat_sale', name: 'Sale', type: 'sale', icon: 'storefront', color: '#FDA7DF' },
];
