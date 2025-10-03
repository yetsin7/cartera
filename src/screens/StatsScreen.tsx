import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { getTransactions, getTopCategories, getSettings } from '../storage';
import { formatCurrency } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const screenWidth = Dimensions.get('window').width;

const StatsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [currency, setCurrency] = useState('USD');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSales: 0,
    categoryData: [] as { name: string; amount: number; color: string }[],
    dailyData: [] as { date: string; amount: number }[],
  });

  const loadData = async () => {
    const transactions = await getTransactions();
    const settings = await getSettings();
    setCurrency(settings.currency);

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filtered = transactions.filter(t => new Date(t.date) >= startDate);

    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSales = filtered
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category data for pie chart
    const topExpenses = await getTopCategories('expense', 5);
    const categoryData = topExpenses.map(cat => {
      const category = DEFAULT_CATEGORIES.find(c => c.name.toLowerCase() === cat.category);
      return {
        name: t(`categories.${cat.category}`),
        amount: cat.total,
        color: category?.color || '#95A5A6',
      };
    });

    // Daily data for line chart
    const dailyMap: { [key: string]: number } = {};
    filtered.forEach(t => {
      if (t.type === 'expense') {
        const dateKey = new Date(t.date).toLocaleDateString();
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + t.amount;
      }
    });

    const dailyData = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7);

    setStats({ totalIncome, totalExpense, totalSales, categoryData, dailyData });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [period])
  );

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => `rgba(${isDark ? '10, 132, 255' : '0, 122, 255'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
      fill: theme.textSecondary,
    },
  };

  const balance = stats.totalIncome + stats.totalSales - stats.totalExpense;
  const savingsRate = stats.totalIncome > 0
    ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100
    : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                {
                  backgroundColor: period === p ? theme.primary : theme.surfaceSecondary,
                },
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: period === p ? '#FFFFFF' : theme.text },
                ]}
              >
                {t(`stats.${p}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginRight: 8 }])}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {t('stats.balance')}
            </Text>
            <Text style={[styles.summaryAmount, { color: balance >= 0 ? theme.success : theme.error }]}>
              {formatCurrency(balance, currency)}
            </Text>
          </Card>

          <Card style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginLeft: 8 }])}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {t('stats.savings')}
            </Text>
            <Text style={[styles.summaryAmount, { color: savingsRate >= 0 ? theme.success : theme.error }]}>
              {savingsRate.toFixed(1)}%
            </Text>
          </Card>
        </View>

        <View style={styles.summaryGrid}>
          <Card style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginRight: 8 }])}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {t('dashboard.income')}
            </Text>
            <Text style={[styles.summaryAmount, { color: theme.income }]}>
              {formatCurrency(stats.totalIncome, currency)}
            </Text>
          </Card>

          <Card style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginLeft: 8 }])}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              {t('dashboard.expenses')}
            </Text>
            <Text style={[styles.summaryAmount, { color: theme.expense }]}>
              {formatCurrency(stats.totalExpense, currency)}
            </Text>
          </Card>
        </View>

        {/* Expense by Category - Pie Chart */}
        {stats.categoryData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              {t('stats.expensesByCategory')}
            </Text>
            <PieChart
              data={stats.categoryData.map(cat => ({
                name: cat.name,
                population: cat.amount,
                color: cat.color,
                legendFontColor: theme.textSecondary,
                legendFontSize: 12,
              }))}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card>
        )}

        {/* Daily Expenses - Line Chart */}
        {stats.dailyData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              {t('stats.dailyExpenses')}
            </Text>
            <LineChart
              data={{
                labels: stats.dailyData.map(d => {
                  const date = new Date(d.date);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }),
                datasets: [
                  {
                    data: stats.dailyData.map(d => d.amount),
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
              }}
            />
          </Card>
        )}

        {/* Top Categories List */}
        {stats.categoryData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              {t('stats.topCategories')}
            </Text>
            {stats.categoryData.map((cat, index) => {
              const percentage = (cat.amount / stats.totalExpense) * 100;
              return (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.categoryName, { color: theme.text }]}>
                      {cat.name}
                    </Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryAmount, { color: theme.text }]}>
                      {formatCurrency(cat.amount, currency)}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.textSecondary }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    paddingVertical: 16,
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default StatsScreen;
