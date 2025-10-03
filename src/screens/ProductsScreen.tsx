import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getProducts, saveProduct, deleteProduct, getSettings, sellProduct } from '../storage';
import { Product } from '../types';
import { formatCurrency, generateId } from '../utils/formatters';

interface QuickSaleItem {
  product: Product;
  quantity: number;
}

const ProductsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [quickSaleModalVisible, setQuickSaleModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [sellQuantity, setSellQuantity] = useState('1');

  // Quick sale state
  const [quickSaleItems, setQuickSaleItems] = useState<QuickSaleItem[]>([]);

  const loadData = async () => {
    const prods = await getProducts();
    const settings = await getSettings();
    setProducts(prods.sort((a, b) => a.name.localeCompare(b.name)));
    setCurrency(settings.currency);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormDescription(product.description);
      setFormPrice(product.price.toString());
      setFormCost(product.cost?.toString() || '');
      setFormStock(product.stock.toString());
      setFormCategory(product.category);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormDescription('');
      setFormPrice('');
      setFormCost('');
      setFormStock('');
      setFormCategory('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    if (!formName || !formPrice || !formStock) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    const now = new Date().toISOString();
    const product: Product = {
      id: editingProduct?.id || generateId(),
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      cost: formCost ? parseFloat(formCost) : undefined,
      stock: parseInt(formStock),
      category: formCategory,
      currency,
      createdAt: editingProduct?.createdAt || now,
      updatedAt: now,
    };

    await saveProduct(product);
    await loadData();
    closeModal();
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      t('products.deleteConfirm'),
      t('products.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
            await loadData();
          },
        },
      ]
    );
  };

  const openSellModal = (product: Product) => {
    setSellingProduct(product);
    setSellQuantity('1');
    setSellModalVisible(true);
  };

  const closeSellModal = () => {
    setSellModalVisible(false);
    setSellingProduct(null);
  };

  const handleSell = async () => {
    if (!sellingProduct) return;

    const quantity = parseInt(sellQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert(t('common.error'), t('products.invalidQuantity'));
      return;
    }

    if (quantity > sellingProduct.stock) {
      Alert.alert(t('common.error'), t('products.insufficientStock'));
      return;
    }

    const result = await sellProduct(sellingProduct.id, quantity, currency);

    if (result.success) {
      Alert.alert(t('common.success'), t('products.soldSuccess'));
      await loadData();
      closeSellModal();
    } else {
      Alert.alert(t('common.error'), result.error || t('products.saleError'));
    }
  };

  // Quick sale functions
  const openQuickSale = () => {
    setQuickSaleItems([]);
    setQuickSaleModalVisible(true);
  };

  const closeQuickSale = () => {
    setQuickSaleModalVisible(false);
    setQuickSaleItems([]);
  };

  const addToQuickSale = (product: Product) => {
    const existing = quickSaleItems.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setQuickSaleItems(quickSaleItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setQuickSaleItems([...quickSaleItems, { product, quantity: 1 }]);
    }
  };

  const removeFromQuickSale = (productId: string) => {
    setQuickSaleItems(quickSaleItems.filter(item => item.product.id !== productId));
  };

  const updateQuickSaleQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromQuickSale(productId);
      return;
    }
    const item = quickSaleItems.find(i => i.product.id === productId);
    if (item && quantity <= item.product.stock) {
      setQuickSaleItems(quickSaleItems.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      ));
    }
  };

  const processQuickSale = async () => {
    if (quickSaleItems.length === 0) {
      Alert.alert(t('common.error'), t('products.quickSaleEmpty'));
      return;
    }

    let hasErrors = false;
    for (const item of quickSaleItems) {
      const result = await sellProduct(item.product.id, item.quantity, currency);
      if (!result.success) {
        hasErrors = true;
        Alert.alert(t('common.error'), `${item.product.name}: ${result.error}`);
        break;
      }
    }

    if (!hasErrors) {
      Alert.alert(t('common.success'), t('products.quickSaleSuccess'));
      await loadData();
      closeQuickSale();
    }
  };

  const quickSaleTotal = quickSaleItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        {products.map(product => {
          const profit = product.cost ? product.price - product.cost : null;
          const stockStatus =
            product.stock === 0
              ? t('products.outOfStock')
              : product.stock < 5
              ? t('products.lowStock')
              : null;

          return (
            <Card key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.text }]}>
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text style={[styles.productDescription, { color: theme.textSecondary }]}>
                        {product.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.productPricing}>
                    <Text style={[styles.productPrice, { color: theme.primary }]}>
                      {formatCurrency(product.price, product.currency)}
                    </Text>
                  </View>
                </View>

                <View style={styles.productFooter}>
                  <View style={styles.productStats}>
                    <View style={styles.stat}>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        {t('products.stock')}
                      </Text>
                      <Text
                        style={[
                          styles.statValue,
                          {
                            color:
                              product.stock === 0
                                ? theme.error
                                : product.stock < 5
                                ? theme.warning
                                : theme.text,
                          },
                        ]}
                      >
                        {product.stock}
                      </Text>
                    </View>

                    {profit !== null && (
                      <View style={styles.stat}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                          {t('products.profit')}
                        </Text>
                        <Text style={[styles.statValue, { color: theme.success }]}>
                          {formatCurrency(profit, product.currency)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {stockStatus && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            product.stock === 0 ? theme.error : theme.warning,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{stockStatus}</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => openModal(product)}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.text} />
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>
                      {t('common.edit')}
                    </Text>
                  </TouchableOpacity>

                  {product.stock > 0 && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.success }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openSellModal(product);
                      }}
                    >
                      <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                        {t('products.sell')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
          );
        })}
      </ScrollView>

      {/* Quick Sale FAB */}
      <TouchableOpacity
        style={[styles.fabSecondary, { backgroundColor: theme.sale }]}
        onPress={openQuickSale}
      >
        <Ionicons name="cart" size={24} color="#FFFFFF" />
      </TouchableOpacity>

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
              {editingProduct ? t('common.edit') : t('products.addProduct')}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card>
              <Input
                label={t('products.name')}
                value={formName}
                onChangeText={setFormName}
                placeholder={t('products.enterName')}
              />

              <Input
                label={t('products.description')}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder={t('products.enterDescription')}
                multiline
                numberOfLines={3}
              />

              <Input
                label={t('products.price')}
                value={formPrice}
                onChangeText={setFormPrice}
                placeholder={t('products.enterPrice')}
                keyboardType="decimal-pad"
              />

              <Input
                label={`${t('products.cost')} (${t('common.optional')})`}
                value={formCost}
                onChangeText={setFormCost}
                placeholder={t('products.enterCost')}
                keyboardType="decimal-pad"
              />

              <Input
                label={t('products.stock')}
                value={formStock}
                onChangeText={setFormStock}
                placeholder={t('products.enterStock')}
                keyboardType="number-pad"
              />

              <Input
                label={`${t('products.category')} (${t('common.optional')})`}
                value={formCategory}
                onChangeText={setFormCategory}
                placeholder={t('products.category')}
              />
            </Card>

            {editingProduct && (
              <Button
                title={t('common.delete')}
                onPress={() => {
                  closeModal();
                  handleDelete(editingProduct);
                }}
                variant="danger"
              />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Sell Modal */}
      <Modal
        visible={sellModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSellModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <TouchableOpacity onPress={closeSellModal}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('products.sellProduct')}
            </Text>
            <TouchableOpacity onPress={handleSell}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('products.sell')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {sellingProduct && (
              <>
                <Card>
                  <Text style={[styles.sellProductName, { color: theme.text }]}>
                    {sellingProduct.name}
                  </Text>
                  <Text style={[styles.sellProductPrice, { color: theme.primary }]}>
                    {formatCurrency(sellingProduct.price, sellingProduct.currency)}
                  </Text>
                  <Text style={[styles.sellProductStock, { color: theme.textSecondary }]}>
                    {t('products.available')}: {sellingProduct.stock} {t('products.units')}
                  </Text>
                </Card>

                <Card style={{ marginTop: 16 }}>
                  <Input
                    label={t('products.quantity')}
                    value={sellQuantity}
                    onChangeText={setSellQuantity}
                    placeholder="1"
                    keyboardType="number-pad"
                  />

                  <View style={styles.totalContainer}>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                      {t('products.total')}:
                    </Text>
                    <Text style={[styles.totalAmount, { color: theme.success }]}>
                      {formatCurrency(
                        sellingProduct.price * (parseInt(sellQuantity) || 0),
                        sellingProduct.currency
                      )}
                    </Text>
                  </View>
                </Card>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Quick Sale Modal */}
      <Modal
        visible={quickSaleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeQuickSale}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}>
            <TouchableOpacity onPress={closeQuickSale}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('products.quickSale')}
            </Text>
            <TouchableOpacity onPress={processQuickSale}>
              <Text style={[styles.modalButton, { color: theme.primary }]}>
                {t('common.done')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Available Products */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('products.availableProducts')}
            </Text>
            <View style={styles.productGrid}>
              {products.filter(p => p.stock > 0).map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.quickSaleProductCard,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                  onPress={() => addToQuickSale(product)}
                >
                  <Text style={[styles.quickSaleProductName, { color: theme.text }]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.quickSaleProductPrice, { color: theme.textSecondary }]}>
                    {formatCurrency(product.price, currency)}
                  </Text>
                  <Text style={[styles.quickSaleProductStock, { color: theme.textSecondary }]}>
                    {product.stock} {t('products.units')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Items */}
            {quickSaleItems.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
                  {t('products.selectedItems')}
                </Text>
                {quickSaleItems.map(item => (
                  <Card key={item.product.id} style={styles.quickSaleItem}>
                    <View style={styles.quickSaleItemRow}>
                      <View style={styles.quickSaleItemInfo}>
                        <Text style={[styles.quickSaleItemName, { color: theme.text }]}>
                          {item.product.name}
                        </Text>
                        <Text style={[styles.quickSaleItemPrice, { color: theme.textSecondary }]}>
                          {formatCurrency(item.product.price, currency)} × {item.quantity}
                        </Text>
                      </View>
                      <View style={styles.quickSaleItemControls}>
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.surfaceSecondary }]}
                          onPress={() => updateQuickSaleQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={20} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityText, { color: theme.text }]}>
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          style={[styles.quantityButton, { backgroundColor: theme.surfaceSecondary }]}
                          onPress={() => updateQuickSaleQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Ionicons
                            name="add"
                            size={20}
                            color={item.quantity >= item.product.stock ? theme.textSecondary : theme.text}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.removeButton, { backgroundColor: theme.error }]}
                          onPress={() => removeFromQuickSale(item.product.id)}
                        >
                          <Ionicons name="trash" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.quickSaleItemTotal}>
                      <Text style={[styles.quickSaleItemTotalText, { color: theme.text }]}>
                        {formatCurrency(item.product.price * item.quantity, currency)}
                      </Text>
                    </View>
                  </Card>
                ))}

                {/* Total */}
                <Card style={StyleSheet.flatten([styles.totalCard, { backgroundColor: theme.primary }])}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('products.total')}</Text>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(quickSaleTotal, currency)}
                    </Text>
                  </View>
                </Card>
              </>
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
    padding: 16,
  },
  productCard: {
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStats: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sellProductName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sellProductPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  sellProductStock: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
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
  fabSecondary: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickSaleProductCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickSaleProductName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickSaleProductPrice: {
    fontSize: 13,
    marginBottom: 2,
  },
  quickSaleProductStock: {
    fontSize: 12,
  },
  quickSaleItem: {
    marginBottom: 8,
  },
  quickSaleItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSaleItemInfo: {
    flex: 1,
  },
  quickSaleItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickSaleItemPrice: {
    fontSize: 14,
  },
  quickSaleItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quickSaleItemTotal: {
    alignItems: 'flex-end',
  },
  quickSaleItemTotalText: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalCard: {
    marginTop: 16,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProductsScreen;
