import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './es';
import en from './en';

const LANGUAGE_STORAGE_KEY = 'language';

const initI18n = async () => {
  let savedLanguage = 'es';

  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) {
      savedLanguage = stored;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: es },
        en: { translation: en },
      },
      lng: savedLanguage,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export { initI18n };
export default i18n;
