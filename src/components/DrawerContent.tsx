import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { getTransactions, getSettings } from '../storage';
import { formatCurrency } from '../utils/formatters';

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadBalance();
  }, [props.state]);

  const loadBalance = async () => {
    const transactions = await getTransactions();
    const settings = await getSettings();

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

    setBalance(income + sales - expenses);
    setCurrency(settings.currency);
  };

  const menuItems = [
    {
      name: 'Home',
      label: t('drawer.home'),
      icon: 'apps' as const,
      color: theme.primary,
      description: t('drawer.homeDesc'),
    },
    {
      name: 'Settings',
      label: t('tabs.settings'),
      icon: 'settings' as const,
      color: '#95A5A6',
      description: t('drawer.settingsDesc'),
    },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.drawerContent}
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.separator }]}>
        <View style={styles.appInfo}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="wallet" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Cartera</Text>
        </View>

        <View style={styles.balanceContainer}>
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
          <Text style={[styles.balanceSubtext, { color: theme.textSecondary }]}>
            {t('dashboard.thisMonth')}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MENÚ</Text>
        {menuItems.map((item, index) => {
          const isActive = props.state.routeNames[props.state.index] === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isActive ? theme.primary + '15' : 'transparent',
                },
              ]}
              onPress={() => props.navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text
                  style={[
                    styles.menuLabel,
                    {
                      color: isActive ? theme.primary : theme.text,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {item.description && (
                  <Text
                    style={[styles.menuDescription, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.separator }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Cartera v1.0.0
        </Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
  balanceContainer: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceSubtext: {
    fontSize: 13,
  },
  menuSection: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
    position: 'relative',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
  },
  menuDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
