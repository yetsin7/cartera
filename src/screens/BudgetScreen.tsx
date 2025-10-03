import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { getBudgets, saveBudget, deleteBudget, getTransactions, getSettings } from '../storage';
import { Budget, CategoryType } from '../types';
import { AddBudgetModal } from '../components/AddBudgetModal';

export const BudgetScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spending, setSpending] = useState<{ [key: string]: number }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [currency, setCurrency] = useState('USD');

  const loadData = async () => {
    const [loadedBudgets, transactions, settings] = await Promise.all([
      getBudgets(),
      getTransactions(),
      getSettings(),
    ]);

    setBudgets(loadedBudgets);
    setCurrency(settings.currency);

    // Calculate spending per category for current period
    const now = new Date();
    const spendingMap: { [key: string]: number } = {};

    loadedBudgets.forEach(budget => {
      const periodStart = getPeriodStart(budget.period);
      const categoryTransactions = transactions.filter(
        t => t.category === budget.category &&
             t.type === 'expense' &&
             new Date(t.date) >= periodStart
      );

      spendingMap[budget.id] = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    setSpending(spendingMap);

    // Check for budget alerts
    loadedBudgets.forEach(budget => {
      const spent = spendingMap[budget.id] || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 100 && percentage < 110) {
        Alert.alert(
          t('budgets.alert'),
          t('budgets.budgetExceeded', {
            category: t(`categories.${budget.category}`),
            amount: budget.amount.toFixed(2),
            currency: budget.currency
          })
        );
      } else if (percentage >= 90 && percentage < 100) {
        Alert.alert(
          t('budgets.warning'),
          t('budgets.budgetNearLimit', {
            category: t(`categories.${budget.category}`),
            percentage: percentage.toFixed(0)
          })
        );
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getPeriodStart = (period: 'weekly' | 'monthly' | 'yearly'): Date => {
    const now = new Date();
    switch (period) {
      case 'weekly':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.setDate(diff));
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
    }
  };

  const getPeriodLabel = (period: 'weekly' | 'monthly' | 'yearly'): string => {
    switch (period) {
      case 'weekly':
        return t('budgets.weekly');
      case 'monthly':
        return t('budgets.monthly');
      case 'yearly':
        return t('budgets.yearly');
    }
  };

  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setShowAddModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowAddModal(true);
  };

  const handleSaveBudget = async (budget: Budget) => {
    try {
      await saveBudget(budget);
      setShowAddModal(false);
      await loadData();
      Alert.alert(t('common.success'), t('budgets.saved'));
    } catch (error) {
      Alert.alert(t('common.error'), t('budgets.saveFailed'));
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      t('budgets.deleteConfirm'),
      t('budgets.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              await loadData();
              Alert.alert(t('common.success'), t('budgets.deleted'));
            } catch (error) {
              Alert.alert(t('common.error'), t('budgets.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return theme.error;
    if (percentage >= 90) return theme.warning;
    if (percentage >= 75) return '#FFA726';
    return theme.success;
  };

  const renderBudgetCard = (budget: Budget) => {
    const spent = spending[budget.id] || 0;
    const percentage = Math.min((spent / budget.amount) * 100, 100);
    const remaining = Math.max(budget.amount - spent, 0);

    return (
      <Card key={budget.id} style={styles.budgetCard}>
        <TouchableOpacity
          onPress={() => handleEditBudget(budget)}
          onLongPress={() => handleDeleteBudget(budget)}
        >
          <View style={styles.budgetHeader}>
            <View style={styles.budgetInfo}>
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {t(`categories.${budget.category}`)}
              </Text>
              <Text style={[styles.periodLabel, { color: theme.textSecondary }]}>
                {getPeriodLabel(budget.period)}
              </Text>
            </View>
            <View style={styles.budgetAmounts}>
              <Text style={[styles.spentAmount, { color: getProgressColor(percentage) }]}>
                {spent.toFixed(2)} {budget.currency}
              </Text>
              <Text style={[styles.totalAmount, { color: theme.textSecondary }]}>
                / {budget.amount.toFixed(2)} {budget.currency}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: getProgressColor(percentage),
                  },
                ]}
              />
            </View>
            <Text style={[styles.percentageText, { color: theme.textSecondary }]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>

          {remaining > 0 ? (
            <Text style={[styles.remainingText, { color: theme.success }]}>
              {t('budgets.remaining')}: {remaining.toFixed(2)} {budget.currency}
            </Text>
          ) : (
            <Text style={[styles.remainingText, { color: theme.error }]}>
              {t('budgets.exceeded')}: {Math.abs(remaining).toFixed(2)} {budget.currency}
            </Text>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('budgets.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('budgets.description')}
          </Text>
        </View>

        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t('budgets.noBudgets')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {t('budgets.noBudgetsDescription')}
            </Text>
          </Card>
        ) : (
          <View style={styles.budgetList}>
            {budgets.map(renderBudgetCard)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleAddBudget}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddBudgetModal
        visible={showAddModal}
        budget={selectedBudget}
        currency={currency}
        onSave={handleSaveBudget}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  budgetList: {
    padding: 16,
    paddingTop: 8,
  },
  budgetCard: {
    marginBottom: 16,
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
  },
  budgetAmounts: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
