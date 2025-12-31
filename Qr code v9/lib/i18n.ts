
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import pt from '../locales/pt';
import en from '../locales/en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // Acopla o i18next ao React
  .init({
    fallbackLng: 'pt',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: {
        translation: pt
      },
      en: {
        translation: en
      }
    },
    react: {
      useSuspense: false // Evita telas brancas se as traduções demorarem
    }
  });

export default i18n;
