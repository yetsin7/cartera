import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getWallets, saveWallet, deleteWallet, getGoals, saveGoal, deleteGoal, addToGoal, getSettings } from '../storage';
import { Wallet, FinancialGoal } from '../types';
import { formatCurrency, generateId } from '../utils/formatters';
import RecurringScreen from './RecurringScreen';
import { BudgetScreen } from './BudgetScreen';

const MoreScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'wallets' | 'goals' | 'recurring' | 'budgets'>('wallets');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [currency, setCurrency] = useState('USD');

  // Wallets modal
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletType, setWalletType] = useState<'cash' | 'bank' | 'card' | 'savings' | 'other'>('cash');

  // Goals modal
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  const loadData = async () => {
    const w = await getWallets();
    const g = await getGoals();
    const settings = await getSettings();
    setWallets(w);
    setGoals(g);
    setCurrency(settings.currency);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Wallet functions
  const openWalletModal = (wallet?: Wallet) => {
    if (wallet) {
      setEditingWallet(wallet);
      setWalletName(wallet.name);
      setWalletBalance(wallet.balance.toString());
      setWalletType(wallet.type);
    } else {
      setEditingWallet(null);
      setWalletName('');
      setWalletBalance('0');
      setWalletType('cash');
    }
    setWalletModalVisible(true);
  };

  const saveWalletHandler = async () => {
    if (!walletName) {
      Alert.alert(t('common.error'), 'Name is required');
      return;
    }

    const walletColors = {
      cash: '#4ECDC4',
      bank: '#0A84FF',
      card: '#FF3B30',
      savings: '#34C759',
      other: '#95A5A6',
    };

    const walletIcons = {
      cash: 'wallet',
      bank: 'business',
      card: 'card',
      savings: 'trending-up',
      other: 'ellipsis-horizontal',
    };

    const wallet: Wallet = {
      id: editingWallet?.id || generateId(),
      name: walletName,
      type: walletType,
      balance: parseFloat(walletBalance) || 0,
      currency,
      color: walletColors[walletType],
      icon: walletIcons[walletType],
      createdAt: editingWallet?.createdAt || new Date().toISOString(),
    };

    await saveWallet(wallet);
    await loadData();
    setWalletModalVisible(false);
  };

  const deleteWalletHandler = (wallet: Wallet) => {
    Alert.alert(
      t('common.delete'),
      `Delete ${wallet.name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteWallet(wallet.id);
            await loadData();
          },
        },
      ]
    );
  };

  // Goal functions
  const openGoalModal = (goal?: FinancialGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalName(goal.name);
      setGoalTarget(goal.targetAmount.toString());
      setGoalCurrent(goal.currentAmount.toString());
      setGoalDeadline(goal.deadline);
    } else {
      setEditingGoal(null);
      setGoalName('');
      setGoalTarget('');
      setGoalCurrent('0');
      setGoalDeadline('');
    }
    setGoalModalVisible(true);
  };

  const saveGoalHandler = async () => {
    if (!goalName || !goalTarget) {
      Alert.alert(t('common.error'), 'Name and target are required');
      return;
    }

    const targetAmount = parseFloat(goalTarget);
    const currentAmount = parseFloat(goalCurrent) || 0;

    const goal: FinancialGoal = {
      id: editingGoal?.id || generateId(),
      name: goalName,
      targetAmount,
      currentAmount,
      currency,
      deadline: goalDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'savings',
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      completed: currentAmount >= targetAmount,
    };

    await saveGoal(goal);
    await loadData();
    setGoalModalVisible(false);
  };

  const deleteGoalHandler = (goal: FinancialGoal) => {
    Alert.alert(
      t('common.delete'),
      `Delete ${goal.name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            await loadData();
          },
        },
      ]
    );
  };

  const addFundsToGoal = (goal: FinancialGoal) => {
    Alert.prompt(
      t('goals.addFunds'),
      `${goal.name}`,
      async (text) => {
        const amount = parseFloat(text);
        if (!isNaN(amount) && amount > 0) {
          await addToGoal(goal.id, amount);
          await loadData();
        }
      },
      'plain-text',
      '',
      'number-pad'
    );
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabSelector, { backgroundColor: theme.surface, borderBottomColor: theme.separator }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallets' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('wallets')}
        >
          <Ionicons name="wallet" size={20} color={activeTab === 'wallets' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'wallets' ? theme.primary : theme.textSecondary }]}>
            {t('wallets.title')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('goals')}
        >
          <Ionicons name="trophy" size={20} color={activeTab === 'goals' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'goals' ? theme.primary : theme.textSecondary }]}>
            {t('goals.title')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'recurring' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('recurring')}
        >
          <Ionicons name="repeat" size={20} color={activeTab === 'recurring' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'recurring' ? theme.primary : theme.textSecondary }]}>
            {t('recurring.title')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'budgets' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('budgets')}
        >
          <Ionicons name="calculator" size={20} color={activeTab === 'budgets' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'budgets' ? theme.primary : theme.textSecondary }]}>
            {t('budgets.title')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <ScrollView style={styles.content}>
          <Card style={styles.totalCard}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              {t('wallets.total')}
            </Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>
              {formatCurrency(totalBalance, currency)}
            </Text>
          </Card>

          {wallets.map(wallet => (
            <TouchableOpacity key={wallet.id} onPress={() => openWalletModal(wallet)}>
              <Card style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <View style={[styles.walletIcon, { backgroundColor: wallet.color }]}>
                    <Ionicons name={wallet.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={[styles.walletName, { color: theme.text }]}>
                      {wallet.name}
                    </Text>
                    <Text style={[styles.walletType, { color: theme.textSecondary }]}>
                      {t(`wallets.${wallet.type}`)}
                    </Text>
                  </View>
                  <Text style={[styles.walletBalance, { color: theme.text }]}>
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <ScrollView style={styles.content}>
          {goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <TouchableOpacity key={goal.id} onPress={() => openGoalModal(goal)} onLongPress={() => addFundsToGoal(goal)}>
                <Card style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <Text style={[styles.goalName, { color: theme.text }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.goalDeadline, { color: theme.textSecondary }]}>
                        {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencida'}
                      </Text>
                    </View>
                    {goal.completed && (
                      <Ionicons name="checkmark-circle" size={32} color={theme.success} />
                    )}
                  </View>

                  <View style={styles.goalProgress}>
                    <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: goal.completed ? theme.success : theme.primary,
                            width: `${Math.min(progress, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  <View style={styles.goalAmounts}>
                    <Text style={[styles.goalAmount, { color: theme.text }]}>
                      {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Recurring Tab */}
      {activeTab === 'recurring' && <RecurringScreen />}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && <BudgetScreen />}

      {/* FAB */}
      {activeTab !== 'recurring' && activeTab !== 'budgets' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => activeTab === 'wallets' ? openWalletModal() : openGoalModal()}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Wallet Modal */}
      <Modal visible={walletModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setWalletModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('wallets.addWallet')}</Text>
            <TouchableOpacity onPress={saveWalletHandler}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card>
              <Input label={t('wallets.name')} value={walletName} onChangeText={setWalletName} />
              <Input label={t('wallets.balance')} value={walletBalance} onChangeText={setWalletBalance} keyboardType="decimal-pad" />

              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('wallets.type')}</Text>
              <View style={styles.typeGrid}>
                {(['cash', 'bank', 'card', 'savings', 'other'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: walletType === type ? theme.primary : theme.surfaceSecondary },
                    ]}
                    onPress={() => setWalletType(type)}
                  >
                    <Text style={[styles.typeText, { color: walletType === type ? '#FFFFFF' : theme.text }]}>
                      {t(`wallets.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {editingWallet && (
              <Button title={t('common.delete')} onPress={() => {
                setWalletModalVisible(false);
                deleteWalletHandler(editingWallet);
              }} variant="danger" />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={goalModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setGoalModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('goals.addGoal')}</Text>
            <TouchableOpacity onPress={saveGoalHandler}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card>
              <Input label={t('goals.name')} value={goalName} onChangeText={setGoalName} />
              <Input label={t('goals.target')} value={goalTarget} onChangeText={setGoalTarget} keyboardType="decimal-pad" />
              <Input label={t('goals.current')} value={goalCurrent} onChangeText={setGoalCurrent} keyboardType="decimal-pad" />
            </Card>

            {editingGoal && (
              <Button title={t('common.delete')} onPress={() => {
                setGoalModalVisible(false);
                deleteGoalHandler(editingGoal);
              }} variant="danger" />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  walletCard: {
    marginBottom: 12,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletType: {
    fontSize: 14,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalCard: {
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalDeadline: {
    fontSize: 13,
  },
  goalProgress: {
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
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalAmount: {
    fontSize: 15,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MoreScreen;
