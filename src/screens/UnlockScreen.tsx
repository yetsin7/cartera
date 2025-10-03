import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../security/AuthContext';

export const UnlockScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { unlock, unlockWithBiometrics, hasBiometrics } = useAuth();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (hasBiometrics) {
      // Auto-trigger biometrics on mount
      setTimeout(() => {
        handleBiometricUnlock();
      }, 500);
    }
  }, [hasBiometrics]);

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => verifyPin(newPin), 300);
      }
    }
  };

  const verifyPin = async (pinToVerify: string) => {
    const success = await unlock(pinToVerify);
    if (!success) {
      Vibration.vibrate(500);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        Alert.alert(
          t('security.tooManyAttempts'),
          t('security.tooManyAttemptsMessage')
        );
      } else {
        Alert.alert(
          t('security.wrongPin'),
          `${t('security.attemptsLeft')}: ${5 - newAttempts}`
        );
      }
    }
  };

  const handleBiometricUnlock = async () => {
    const success = await unlockWithBiometrics();
    if (!success) {
      // Silently fail, user can use PIN
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.surfaceSecondary }]}>
          <Ionicons name="lock-closed" size={48} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('security.unlockCartera')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('security.enterPin')}
        </Text>
      </View>

      <View style={[styles.dotsContainer, isShaking && styles.shake]}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { borderColor: theme.primary },
              index < pin.length && { backgroundColor: theme.primary },
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['bio', '0', 'delete']].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === 'bio') {
                return hasBiometrics ? (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyButton}
                    onPress={handleBiometricUnlock}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="finger-print" size={32} color={theme.primary} />
                  </TouchableOpacity>
                ) : (
                  <View key="empty" style={styles.keyButton} />
                );
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="backspace-outline" size={28} color={theme.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyButton, { backgroundColor: theme.surface }]}
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: theme.text }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  shake: {
    // Visual shake effect handled by state
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 32,
    fontWeight: '400',
  },
});
