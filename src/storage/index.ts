import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Product, AppSettings, Wallet, FinancialGoal, RecurringTransaction, Budget } from '../types';
import { DEFAULT_CURRENCY } from '../constants/currencies';

const KEYS = {
  TRANSACTIONS: 'transactions',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  WALLETS: 'wallets',
  GOALS: 'financial_goals',
  RECURRING: 'recurring_transactions',
  BUDGETS: 'budgets',
};

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);

    if (index >= 0) {
      transactions[index] = transaction;
    } else {
      transactions.push(transaction);
    }

    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<void> => {
  try {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const products = await getProducts();
    const filtered = products.filter(p => p.id !== id);
    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Settings
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }

    const defaultSettings: AppSettings = {
      language: 'es',
      currency: DEFAULT_CURRENCY,
      theme: 'auto',
      cloudSync: false,
    };

    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      language: 'es',
      currency: DEFAULT_CURRENCY,
      theme: 'auto',
      cloudSync: false,
    };
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([KEYS.TRANSACTIONS, KEYS.PRODUCTS]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Export/Import
export const exportData = async (): Promise<string> => {
  try {
    const transactions = await getTransactions();
    const products = await getProducts();
    const settings = await getSettings();

    return JSON.stringify({
      transactions,
      products,
      settings,
      exportDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);

    if (data.transactions) {
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    }

    if (data.products) {
      await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data.products));
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Sell product - reduce stock and create transaction
export const sellProduct = async (
  productId: string,
  quantity: number,
  currency: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex < 0) {
      return { success: false, error: 'Product not found' };
    }

    const product = products[productIndex];

    if (product.stock < quantity) {
      return { success: false, error: 'Insufficient stock' };
    }

    // Update product stock
    products[productIndex] = {
      ...product,
      stock: product.stock - quantity,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

    // Create sale transaction
    const transaction: Transaction = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'sale',
      amount: product.price * quantity,
      currency,
      category: 'sale',
      description: `Venta de ${quantity}x ${product.name}`,
      date: new Date().toISOString(),
      productId: product.id,
    };

    await saveTransaction(transaction);

    return { success: true };
  } catch (error) {
    console.error('Error selling product:', error);
    return { success: false, error: 'Error processing sale' };
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

// ===== WALLETS =====
export const getWallets = async (): Promise<Wallet[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.WALLETS);
    if (data) return JSON.parse(data);

    // Create default wallet
    const defaultWallet: Wallet = {
      id: 'wallet_default',
      name: 'Efectivo',
      type: 'cash',
      balance: 0,
      currency: DEFAULT_CURRENCY,
      color: '#4ECDC4',
      icon: 'wallet',
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify([defaultWallet]));
    return [defaultWallet];
  } catch (error) {
    console.error('Error loading wallets:', error);
    return [];
  }
};

export const saveWallet = async (wallet: Wallet): Promise<void> => {
  try {
    const wallets = await getWallets();
    const index = wallets.findIndex(w => w.id === wallet.id);
    if (index >= 0) {
      wallets[index] = wallet;
    } else {
      wallets.push(wallet);
    }
    await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify(wallets));
  } catch (error) {
    console.error('Error saving wallet:', error);
    throw error;
  }
};

export const deleteWallet = async (id: string): Promise<void> => {
  try {
    const wallets = await getWallets();
    const filtered = wallets.filter(w => w.id !== id);
    await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting wallet:', error);
    throw error;
  }
};

// ===== FINANCIAL GOALS =====
export const getGoals = async (): Promise<FinancialGoal[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const saveGoal = async (goal: FinancialGoal): Promise<void> => {
  try {
    const goals = await getGoals();
    const index = goals.findIndex(g => g.id === goal.id);
    if (index >= 0) {
      goals[index] = goal;
    } else {
      goals.push(goal);
    }
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  try {
    const goals = await getGoals();
    const filtered = goals.filter(g => g.id !== id);
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const addToGoal = async (goalId: string, amount: number): Promise<void> => {
  try {
    const goals = await getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index >= 0) {
      goals[index].currentAmount += amount;
      if (goals[index].currentAmount >= goals[index].targetAmount) {
        goals[index].completed = true;
      }
      await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
    }
  } catch (error) {
    console.error('Error adding to goal:', error);
    throw error;
  }
};

// ===== RECURRING TRANSACTIONS =====
export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECURRING);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recurring transactions:', error);
    return [];
  }
};

export const saveRecurringTransaction = async (recurring: RecurringTransaction): Promise<void> => {
  try {
    const recurrings = await getRecurringTransactions();
    const index = recurrings.findIndex(r => r.id === recurring.id);
    if (index >= 0) {
      recurrings[index] = recurring;
    } else {
      recurrings.push(recurring);
    }
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(recurrings));
  } catch (error) {
    console.error('Error saving recurring transaction:', error);
    throw error;
  }
};

export const deleteRecurringTransaction = async (id: string): Promise<void> => {
  try {
    const recurrings = await getRecurringTransactions();
    const filtered = recurrings.filter(r => r.id !== id);
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    throw error;
  }
};

// ===== BUDGETS =====
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudget = async (budget: Budget): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index >= 0) {
      budgets[index] = budget;
    } else {
      budgets.push(budget);
    }
    await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// ===== ANALYTICS =====
export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    const transactions = await getTransactions();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  } catch (error) {
    console.error('Error getting transactions by date range:', error);
    return [];
  }
};

export const getTransactionsByCategory = async (category: string): Promise<Transaction[]> => {
  try {
    const transactions = await getTransactions();
    return transactions.filter(t => t.category === category);
  } catch (error) {
    console.error('Error getting transactions by category:', error);
    return [];
  }
};

export const getTopCategories = async (type: 'expense' | 'income', limit: number = 5): Promise<{ category: string; total: number }[]> => {
  try {
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.type === type);

    const categoryTotals: { [key: string]: number } = {};
    filtered.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top categories:', error);
    return [];
  }
};
