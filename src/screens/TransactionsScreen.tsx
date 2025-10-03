import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getTransactions, saveTransaction, deleteTransaction, getSettings } from '../storage';
import { Transaction, TransactionType, CategoryType } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';
import { validateAmount, validateText, formatInputAmount, sanitizeText } from '../utils/validation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const TransactionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('other');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadData = async () => {
    try {
      const txs = await getTransactions();
      const settings = await getSettings();
      setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCurrency(settings.currency);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert(t('common.error'), 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormType(transaction.type);
      setFormAmount(transaction.amount.toString());
      setFormDescription(transaction.description);
      setFormCategory(transaction.category);
    } else {
      setEditingTransaction(null);
      setFormType('expense');
      setFormAmount('');
      setFormDescription('');
      setFormCategory('other');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  const handleSave = async () => {
    // Validate amount
    const amountValidation = validateAmount(formAmount);
    if (!amountValidation.valid) {
      Alert.alert(t('common.error'), amountValidation.error || 'Invalid amount');
      return;
    }

    // Validate description
    const descriptionValidation = validateText(formDescription, t('transactions.description'), 1, 100);
    if (!descriptionValidation.valid) {
      Alert.alert(t('common.error'), descriptionValidation.error || 'Invalid description');
      return;
    }

    setSaving(true);

    try {
      const transaction: Transaction = {
        id: editingTransaction?.id || generateId(),
        type: formType,
        amount: parseFloat(formAmount),
        currency,
        category: formCategory,
        description: sanitizeText(formDescription),
        date: editingTransaction?.date || new Date().toISOString(),
      };

      await saveTransaction(transaction);
      await loadData();
      closeModal();

      // Show success feedback
      Alert.alert(
        t('common.success'),
        editingTransaction ? t('transactions.updated') : t('transactions.created')
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert(t('common.error'), t('transactions.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      t('transactions.deleteConfirm'),
      t('transactions.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            await loadData();
          },
        },
      ]
    );
  };

  const availableCategories = DEFAULT_CATEGORIES.filter(
    c => c.type === formType || c.name === 'Other'
  );

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Category filter
    if (filterCategory !== 'all' && transaction.category !== filterCategory) {
      return false;
    }

    return true;
  });

  const allCategories = DEFAULT_CATEGORIES;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search and Filters */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderBottomColor: theme.separator }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.search')}
            style={styles.searchInput}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: showFilters ? theme.primary : theme.surfaceSecondary }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? '#FFFFFF' : theme.text} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.surface, borderBottomColor: theme.separator }]}>
          {/* Type Filter */}
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{t('transactions.type')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'expense', 'income', 'sale'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterType === type ? theme.primary : theme.surfaceSecondary,
                  },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[styles.filterChipText, { color: filterType === type ? '#FFFFFF' : theme.text }]}>
                  {type === 'all' ? t('common.all') : t(`transactions.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <Text style={[styles.filterLabel, { color: theme.textSecondary, marginTop: 12 }]}>
            {t('transactions.category')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: filterCategory === 'all' ? theme.primary : theme.surfaceSecondary,
                },
              ]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterChipText, { color: filterCategory === 'all' ? '#FFFFFF' : theme.text }]}>
                {t('common.all')}
              </Text>
            </TouchableOpacity>
            {allCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterCategory === category.name.toLowerCase() ? theme.primary : theme.surfaceSecondary,
                  },
                ]}
                onPress={() => setFilterCategory(category.name.toLowerCase() as CategoryType)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={filterCategory === category.name.toLowerCase() ? '#FFFFFF' : theme.text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: filterCategory === category.name.toLowerCase() ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {t(`categories.${category.name.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                ? t('transactions.noResults')
                : t('dashboard.noTransactions')}
            </Text>
          </View>
        ) : (
          filteredTransactions.map(transaction => (
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
              onPress={() => openModal(transaction)}
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
              {editingTransaction ? t('common.edit') : t('transactions.addTransaction')}
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
                onChangeText={(text) => setFormAmount(formatInputAmount(text))}
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
            </Card>

            {editingTransaction && (
              <Button
                title={t('common.delete')}
                onPress={() => {
                  closeModal();
                  handleDelete(editingTransaction);
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
});

export default TransactionsScreen;
