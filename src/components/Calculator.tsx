import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface CalculatorProps {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
}

export const Calculator: React.FC<CalculatorProps> = ({
  visible,
  initialValue = '0',
  onClose,
  onConfirm,
  title,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [display, setDisplay] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const handleNumberPress = (num: string) => {
    if (display === '0' || display === initialValue) {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimalPress = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperationPress = (op: string) => {
    setPreviousValue(display);
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (previousValue !== null && operation !== null) {
      const prev = parseFloat(previousValue);
      const current = parseFloat(display);
      let result = 0;

      switch (operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '×':
          result = prev * current;
          break;
        case '÷':
          result = current !== 0 ? prev / current : 0;
          break;
        case '%':
          result = (prev * current) / 100;
          break;
      }

      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleConfirm = () => {
    onConfirm(display);
    onClose();
  };

  const renderButton = (label: string, onPress: () => void, style?: any, textStyle?: any) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.surface }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, { color: theme.text }, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOperationButton = (label: string, onPress: () => void) =>
    renderButton(
      label,
      onPress,
      { backgroundColor: theme.primaryDark },
      { color: '#FFFFFF', fontWeight: '600' }
    );

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
          <Text style={[styles.title, { color: theme.text }]}>
            {title || t('calculator.title')}
          </Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={[styles.confirmText, { color: theme.primary }]}>
              {t('common.done')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.displayContainer}>
          {operation && (
            <Text style={[styles.operationText, { color: theme.textSecondary }]}>
              {previousValue} {operation}
            </Text>
          )}
          <Text style={[styles.display, { color: theme.text }]} numberOfLines={1}>
            {display}
          </Text>
        </View>

        <View style={styles.keypad}>
          <View style={styles.row}>
            {renderButton('C', handleClear, { backgroundColor: theme.error }, { color: '#FFFFFF' })}
            {renderButton('⌫', handleBackspace)}
            {renderOperationButton('%', () => handleOperationPress('%'))}
            {renderOperationButton('÷', () => handleOperationPress('÷'))}
          </View>

          <View style={styles.row}>
            {renderButton('7', () => handleNumberPress('7'))}
            {renderButton('8', () => handleNumberPress('8'))}
            {renderButton('9', () => handleNumberPress('9'))}
            {renderOperationButton('×', () => handleOperationPress('×'))}
          </View>

          <View style={styles.row}>
            {renderButton('4', () => handleNumberPress('4'))}
            {renderButton('5', () => handleNumberPress('5'))}
            {renderButton('6', () => handleNumberPress('6'))}
            {renderOperationButton('-', () => handleOperationPress('-'))}
          </View>

          <View style={styles.row}>
            {renderButton('1', () => handleNumberPress('1'))}
            {renderButton('2', () => handleNumberPress('2'))}
            {renderButton('3', () => handleNumberPress('3'))}
            {renderOperationButton('+', () => handleOperationPress('+'))}
          </View>

          <View style={styles.row}>
            {renderButton('0', () => handleNumberPress('0'), { flex: 2 })}
            {renderButton('.', handleDecimalPress)}
            {renderButton('=', handleEquals, { backgroundColor: theme.primary }, { color: '#FFFFFF', fontSize: 28 })}
          </View>
        </View>
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
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  confirmButton: {
    padding: 4,
  },
  confirmText: {
    fontSize: 17,
    fontWeight: '600',
  },
  displayContainer: {
    padding: 24,
    alignItems: 'flex-end',
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  operationText: {
    fontSize: 20,
    marginBottom: 8,
  },
  display: {
    fontSize: 48,
    fontWeight: '300',
  },
  keypad: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
  },
});
