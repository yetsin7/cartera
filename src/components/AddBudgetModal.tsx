import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Budget, CategoryType } from '../types';
import { EXPENSE_CATEGORIES } from '../constants/categories';

interface AddBudgetModalProps {
  visible: boolean;
  budget?: Budget;
  currency: string;
  onSave: (budget: Budget) => void;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  budget,
  currency,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [category, setCategory] = useState<CategoryType>('food');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
    } else {
      setCategory('food');
      setAmount('');
      setPeriod('monthly');
    }
  }, [budget, visible]);

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common.error'), t('budgets.invalidAmount'));
      return;
    }

    const budgetData: Budget = {
      id: budget?.id || `budget_${Date.now()}`,
      category,
      amount: parseFloat(amount),
      currency,
      period,
      createdAt: budget?.createdAt || new Date().toISOString(),
    };

    onSave(budgetData);
  };

  const periods: Array<'weekly' | 'monthly' | 'yearly'> = ['weekly', 'monthly', 'yearly'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {budget ? t('budgets.editBudget') : t('budgets.addBudget')}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveText, { color: theme.primary }]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {t('budgets.category')}
            </Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    category === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: theme.text },
                      category === cat && { color: '#FFFFFF', fontWeight: '600' },
                    ]}
                  >
                    {t(`categories.${cat}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {t('budgets.amount')}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>
                {currency}
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {t('budgets.period')}
            </Text>
            <View style={styles.periodContainer}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    period === p && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setPeriod(p)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: theme.text },
                      period === p && { color: '#FFFFFF', fontWeight: '600' },
                    ]}
                  >
                    {t(`budgets.${p}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {t('budgets.info')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
