import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../security/AuthContext';

export const SetupPinScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { setupPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const handleNumberPress = (num: string) => {
    if (step === 'enter') {
      if (pin.length < 4) {
        setPin(pin + num);
        if (pin.length === 3) {
          setTimeout(() => setStep('confirm'), 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + num;
        setConfirmPin(newConfirm);
        if (newConfirm.length === 4) {
          setTimeout(() => verifyPins(pin, newConfirm), 300);
        }
      }
    }
  };

  const verifyPins = async (first: string, second: string) => {
    if (first === second) {
      try {
        await setupPin(first);
        Alert.alert(
          t('security.success'),
          t('security.pinCreated'),
          [{ text: 'OK', onPress: onComplete }]
        );
      } catch (error) {
        Alert.alert(t('common.error'), t('security.pinSetupFailed'));
        reset();
      }
    } else {
      Alert.alert(
        t('security.error'),
        t('security.pinsDoNotMatch'),
        [{ text: 'OK', onPress: reset }]
      );
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={64} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {step === 'enter' ? t('security.createPin') : t('security.confirmPin')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('security.pinDescription')}
        </Text>
      </View>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { borderColor: theme.primary },
              index < currentPin.length && { backgroundColor: theme.primary },
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '') {
                return <View key="empty" style={styles.keyButton} />;
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

      <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>
          {t('security.skipForNow')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
