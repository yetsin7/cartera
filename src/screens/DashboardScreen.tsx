import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { getTransactions, getSettings } from '../storage';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const txs = await getTransactions();
      const settings = await getSettings();
      setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCurrency(settings.currency);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const sales = monthlyTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income + sales - expenses;

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="wallet-outline"
        title={t('dashboard.welcomeTitle')}
        message={t('dashboard.welcomeMessage')}
        actionLabel={t('transactions.addTransaction')}
        onAction={() => navigation.navigate('TransactionsTab' as never)}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <View style={styles.content}>
        <Card style={styles.balanceCard}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
            {t('dashboard.balance')}
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: balance >= 0 ? theme.success : theme.error },
            ]}
          >
            {formatCurrency(balance, currency)}
          </Text>
          <Text style={[styles.monthLabel, { color: theme.textSecondary }]}>
            {t('dashboard.thisMonth')}
          </Text>
        </Card>

        <View style={styles.statsRow}>
          <View style={styles.statCardContainer}>
            <Card style={styles.statCard}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('dashboard.income')}
              </Text>
              <Text style={[styles.statAmount, { color: theme.income }]}>
                {formatCurrency(income, currency)}
              </Text>
            </Card>
          </View>

          <View style={styles.statCardContainer}>
            <Card style={styles.statCard}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('dashboard.expenses')}
              </Text>
              <Text style={[styles.statAmount, { color: theme.expense }]}>
                {formatCurrency(expenses, currency)}
              </Text>
            </Card>
          </View>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('dashboard.recentTransactions')}
            </Text>
          </View>

          {recentTransactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t('dashboard.noTransactions')}
            </Text>
          ) : (
            recentTransactions.map(transaction => (
              <ListItem
                key={transaction.id}
                title={transaction.description}
                subtitle={formatDate(transaction.date)}
                rightText={formatCurrency(transaction.amount, transaction.currency)}
                iconColor={
                  transaction.type === 'income'
                    ? theme.income
                    : transaction.type === 'expense'
                    ? theme.expense
                    : theme.sale
                }
                icon={
                  transaction.type === 'income'
                    ? 'arrow-down'
                    : transaction.type === 'expense'
                    ? 'arrow-up'
                    : 'cart'
                }
              />
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 15,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCardContainer: {
    flex: 1,
  },
  statCard: {
    paddingVertical: 20,
  },
  statLabel: {
    fontSize: 15,
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 15,
  },
});

export default DashboardScreen;
