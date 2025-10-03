import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { DrawerContent } from '../components/DrawerContent';
import { TabNavigator } from './TabNavigator';

import SettingsScreen from '../screens/SettingsScreen';
import MoreScreen from '../screens/MoreScreen';

const Drawer = createDrawerNavigator();

export const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: theme.surface,
            borderBottomColor: theme.separator,
            borderBottomWidth: 0.5,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ paddingLeft: 16 }}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color={theme.text} />
            </TouchableOpacity>
          ),
          drawerType: 'slide',
          drawerStyle: {
            backgroundColor: theme.background,
            width: 300,
          },
          sceneContainerStyle: {
            backgroundColor: theme.background,
          },
        })}
      >
        <Drawer.Screen
          name="Home"
          component={TabNavigator}
          options={{
            title: 'Cartera',
          }}
        />
        <Drawer.Screen
          name="More"
          component={MoreScreen}
          options={{
            title: t('drawer.more'),
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('tabs.settings'),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
