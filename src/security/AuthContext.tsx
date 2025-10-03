import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface AuthContextType {
  isLocked: boolean;
  isSetup: boolean;
  hasPin: boolean;
  hasBiometrics: boolean;
  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  enableBiometrics: (enabled: boolean) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: (pin: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PIN_KEY = 'user_pin';
const BIOMETRICS_ENABLED_KEY = 'biometrics_enabled';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isSetup, setIsSetup] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    checkAuthSetup();
  }, []);

  const checkAuthSetup = async () => {
    try {
      // Check if PIN exists
      const pin = await SecureStore.getItemAsync(PIN_KEY);
      const pinExists = pin !== null;
      setHasPin(pinExists);

      // Check if biometrics available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricsAvailable = hasHardware && isEnrolled;
      setHasBiometrics(biometricsAvailable);

      // Check if biometrics enabled
      const biometricsEnabledStr = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
      const biometricsOn = biometricsEnabledStr === 'true' && biometricsAvailable;
      setBiometricsEnabled(biometricsOn);

      // If no PIN, app is not locked
      if (!pinExists) {
        setIsLocked(false);
        setIsSetup(true);
      } else {
        setIsLocked(true);
        setIsSetup(true);

        // Auto-unlock with biometrics if enabled
        if (biometricsOn) {
          setTimeout(() => {
            unlockWithBiometrics();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error checking auth setup:', error);
      setIsSetup(true);
      setIsLocked(false);
    }
  };

  const hashPin = (pin: string): string => {
    // Simple hash for demo - in production use proper encryption
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const setupPin = async (pin: string): Promise<void> => {
    try {
      const hashed = hashPin(pin);
      await SecureStore.setItemAsync(PIN_KEY, hashed);
      setHasPin(true);
      setIsLocked(false);
    } catch (error) {
      console.error('Error setting up PIN:', error);
      throw new Error('Failed to setup PIN');
    }
  };

  const unlock = async (pin: string): Promise<boolean> => {
    try {
      const storedHash = await SecureStore.getItemAsync(PIN_KEY);
      if (!storedHash) return false;

      const inputHash = hashPin(pin);
      if (inputHash === storedHash) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlocking:', error);
      return false;
    }
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Cartera',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error with biometrics:', error);
      return false;
    }
  };

  const enableBiometrics = async (enabled: boolean): Promise<void> => {
    try {
      if (enabled && !hasBiometrics) {
        throw new Error('Biometrics not available');
      }
      await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, enabled.toString());
      setBiometricsEnabled(enabled);
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      throw new Error('Failed to enable biometrics');
    }
  };

  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const isValid = await unlock(oldPin);
      if (!isValid) return false;

      await setupPin(newPin);
      return true;
    } catch (error) {
      console.error('Error changing PIN:', error);
      return false;
    }
  };

  const removePin = async (pin: string): Promise<boolean> => {
    try {
      const isValid = await unlock(pin);
      if (!isValid) return false;

      await SecureStore.deleteItemAsync(PIN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
      setHasPin(false);
      setBiometricsEnabled(false);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.error('Error removing PIN:', error);
      return false;
    }
  };

  const lock = () => {
    if (hasPin) {
      setIsLocked(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        isSetup,
        hasPin,
        hasBiometrics,
        setupPin,
        unlock,
        unlockWithBiometrics,
        enableBiometrics,
        changePin,
        removePin,
        lock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
