import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import {
  getRecurringTransactions,
  saveRecurringTransaction,
  deleteRecurringTransaction,
  getSettings,
} from '../storage';
import { RecurringTransaction, TransactionType, CategoryType } from '../types';
import { formatCurrency, generateId } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const RecurringScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('other');
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [formActive, setFormActive] = useState(true);

  const loadData = async () => {
    const recs = await getRecurringTransactions();
    const settings = await getSettings();
    setRecurrings(recs.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1)));
    setCurrency(settings.currency);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const openModal = (recurring?: RecurringTransaction) => {
    if (recurring) {
      setEditingRecurring(recurring);
      setFormType(recurring.type);
      setFormAmount(recurring.amount.toString());
      setFormDescription(recurring.description);
      setFormCategory(recurring.category);
      setFormFrequency(recurring.frequency);
      setFormActive(recurring.active);
    } else {
      setEditingRecurring(null);
      setFormType('expense');
      setFormAmount('');
      setFormDescription('');
      setFormCategory('other');
      setFormFrequency('monthly');
      setFormActive(true);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingRecurring(null);
  };

  const handleSave = async () => {
    if (!formAmount || !formDescription) {
      Alert.alert(t('common.error'), 'Please fill all fields');
      return;
    }

    const recurring: RecurringTransaction = {
      id: editingRecurring?.id || generateId(),
      type: formType,
      amount: parseFloat(formAmount),
      currency,
      category: formCategory,
      description: formDescription,
      frequency: formFrequency,
      startDate: editingRecurring?.startDate || new Date().toISOString(),
      active: formActive,
      lastExecuted: editingRecurring?.lastExecuted,
    };

    await saveRecurringTransaction(recurring);
    await loadData();
    closeModal();
  };

  const handleDelete = (recurring: RecurringTransaction) => {
    Alert.alert(
      t('common.delete'),
      `${t('common.delete')} ${recurring.description}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteRecurringTransaction(recurring.id);
            await loadData();
          },
        },
      ]
    );
  };

  const toggleActive = async (recurring: RecurringTransaction) => {
    const updated = { ...recurring, active: !recurring.active };
    await saveRecurringTransaction(updated);
    await loadData();
  };

  const availableCategories = DEFAULT_CATEGORIES.filter(
    c => c.type === formType || c.name === 'Other'
  );

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'sunny';
      case 'weekly': return 'calendar';
      case 'monthly': return 'calendar-outline';
      case 'yearly': return 'calendar-number';
      default: return 'time';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        {recurrings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="repeat-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t('recurring.noRecurring')}
            </Text>
          </View>
        ) : (
          recurrings.map(recurring => (
            <ListItem
              key={recurring.id}
              title={recurring.description}
              subtitle={`${t(`recurring.${recurring.frequency}`)} • ${t(`transactions.${recurring.type}`)}${!recurring.active ? ` • ${t('recurring.inactive')}` : ''}`}
              rightText={formatCurrency(recurring.amount, recurring.currency)}
              iconColor={
                !recurring.active
                  ? theme.textSecondary
                  : recurring.type === 'income'
                  ? theme.income
                  : recurring.type === 'expense'
                  ? theme.expense
                  : theme.sale
              }
              icon={getFrequencyIcon(recurring.frequency) as any}
              onPress={() => openModal(recurring)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => openModal()}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingRecurring ? t('common.edit') : t('recurring.addRecurring')}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('transactions.type')}
              </Text>
              <View style={styles.typeButtons}>
                {(['expense', 'income', 'sale'] as TransactionType[]).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: formType === type ? theme.primary : theme.surfaceSecondary,
                      },
                    ]}
                    onPress={() => setFormType(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: formType === type ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {t(`transactions.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <Input
                label={t('transactions.amount')}
                value={formAmount}
                onChangeText={setFormAmount}
                placeholder={t('transactions.enterAmount')}
                keyboardType="decimal-pad"
              />

              <Input
                label={t('transactions.description')}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder={t('transactions.enterDescription')}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('recurring.frequency')}
              </Text>
              <View style={styles.frequencyButtons}>
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      {
                        backgroundColor: formFrequency === freq ? theme.primary : theme.surfaceSecondary,
                      },
                    ]}
                    onPress={() => setFormFrequency(freq)}
                  >
                    <Ionicons
                      name={getFrequencyIcon(freq) as any}
                      size={20}
                      color={formFrequency === freq ? '#FFFFFF' : theme.text}
                    />
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        { color: formFrequency === freq ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {t(`recurring.${freq}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('transactions.category')}
              </Text>
              <View style={styles.categoryGrid}>
                {availableCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          formCategory === category.name.toLowerCase()
                            ? theme.primary
                            : theme.surfaceSecondary,
                      },
                    ]}
                    onPress={() => setFormCategory(category.name.toLowerCase() as CategoryType)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={formCategory === category.name.toLowerCase() ? '#FFFFFF' : theme.text}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            formCategory === category.name.toLowerCase() ? '#FFFFFF' : theme.text,
                        },
                      ]}
                    >
                      {t(`categories.${category.name.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.activeRow}>
                <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>
                  {t('recurring.active')}
                </Text>
                <Switch
                  value={formActive}
                  onValueChange={setFormActive}
                  trackColor={{ false: theme.separator, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            {editingRecurring && (
              <Button
                title={t('common.delete')}
                onPress={() => {
                  closeModal();
                  handleDelete(editingRecurring);
                }}
                variant="danger"
              />
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  frequencyButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  categoryButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default RecurringScreen;
