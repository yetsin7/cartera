import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { getSettings, saveSettings, clearAllData, exportData } from '../storage';
import { changeLanguage } from '../i18n';
import { CURRENCIES } from '../constants/currencies';
import { AppSettings } from '../types';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    language: 'es',
    currency: 'USD',
    theme: 'auto',
    cloudSync: false,
  });

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    setSettings(updated);
  };

  const handleLanguageChange = () => {
    const options = ['Español', 'English', t('common.cancel')];
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            await changeLanguage('es');
            await updateSettings({ language: 'es' });
          } else if (buttonIndex === 1) {
            await changeLanguage('en');
            await updateSettings({ language: 'en' });
          }
        }
      );
    } else {
      Alert.alert(
        t('settings.language'),
        '',
        [
          {
            text: 'Español',
            onPress: async () => {
              await changeLanguage('es');
              await updateSettings({ language: 'es' });
            },
          },
          {
            text: 'English',
            onPress: async () => {
              await changeLanguage('en');
              await updateSettings({ language: 'en' });
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleCurrencyChange = () => {
    const options = [...CURRENCIES.map(c => `${c.code} (${c.symbol})`), t('common.cancel')];
    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async buttonIndex => {
          if (buttonIndex < CURRENCIES.length) {
            await updateSettings({ currency: CURRENCIES[buttonIndex].code });
          }
        }
      );
    } else {
      Alert.alert(
        t('settings.currency'),
        '',
        [
          ...CURRENCIES.map(c => ({
            text: `${c.code} (${c.symbol})`,
            onPress: async () => {
              await updateSettings({ currency: c.code });
            },
          })),
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleThemeChange = () => {
    const options = [
      t('settings.themeLight'),
      t('settings.themeDark'),
      t('settings.themeAuto'),
      t('common.cancel'),
    ];
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            setThemeMode('light');
            await updateSettings({ theme: 'light' });
          } else if (buttonIndex === 1) {
            setThemeMode('dark');
            await updateSettings({ theme: 'dark' });
          } else if (buttonIndex === 2) {
            setThemeMode('auto');
            await updateSettings({ theme: 'auto' });
          }
        }
      );
    } else {
      Alert.alert(
        t('settings.theme'),
        '',
        [
          {
            text: t('settings.themeLight'),
            onPress: async () => {
              setThemeMode('light');
              await updateSettings({ theme: 'light' });
            },
          },
          {
            text: t('settings.themeDark'),
            onPress: async () => {
              setThemeMode('dark');
              await updateSettings({ theme: 'dark' });
            },
          },
          {
            text: t('settings.themeAuto'),
            onPress: async () => {
              setThemeMode('auto');
              await updateSettings({ theme: 'auto' });
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const filename = `cartera_backup_${new Date().toISOString().split('T')[0]}.json`;

      // @ts-ignore - documentDirectory exists at runtime
      if (!FileSystem.documentDirectory) {
        Alert.alert('Error', 'Document directory not available');
        return;
      }

      // @ts-ignore - documentDirectory exists at runtime
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    // First confirmation
    Alert.alert(
      t('settings.clearDataConfirm'),
      t('settings.clearDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clearDataButton'),
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              t('settings.areYouSure'),
              t('settings.lastChance'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('settings.deleteEverything'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Create backup before clearing
                      await handleExportData();

                      // Clear data
                      await clearAllData();

                      Alert.alert(
                        t('common.success'),
                        t('settings.dataCleared')
                      );
                    } catch (error) {
                      console.error('Error clearing data:', error);
                      Alert.alert(
                        t('common.error'),
                        t('settings.clearDataFailed')
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return t('settings.themeLight');
      case 'dark':
        return t('settings.themeDark');
      case 'auto':
        return t('settings.themeAuto');
      default:
        return t('settings.themeAuto');
    }
  };

  const getLanguageLabel = () => {
    return settings.language === 'es' ? 'Español' : 'English';
  };

  const getCurrencyLabel = () => {
    const currency = CURRENCIES.find(c => c.code === settings.currency);
    return currency ? `${currency.code} (${currency.symbol})` : settings.currency;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.appearance')}
          </Text>

          <ListItem
            title={t('settings.theme')}
            rightText={getThemeLabel()}
            onPress={handleThemeChange}
            showChevron
          />

          <ListItem
            title={t('settings.language')}
            rightText={getLanguageLabel()}
            onPress={handleLanguageChange}
            showChevron
          />

          <ListItem
            title={t('settings.currency')}
            rightText={getCurrencyLabel()}
            onPress={handleCurrencyChange}
            showChevron
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.data')}
          </Text>

          <ListItem
            title={t('settings.exportData')}
            icon="cloud-upload"
            iconColor={theme.primary}
            onPress={handleExportData}
            showChevron
          />

          <ListItem
            title={t('settings.clearData')}
            icon="trash"
            iconColor={theme.error}
            onPress={handleClearData}
            showChevron
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.about')}
          </Text>

          <ListItem title={t('settings.version')} rightText="1.0.0" />
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
  section: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});

export default SettingsScreen;
