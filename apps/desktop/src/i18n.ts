/**
 * i18n configuration — i18next with react-i18next.
 *
 * This file initializes the internationalization system.
 * Import it as a side-effect in main.tsx before rendering.
 *
 * To add a new language:
 * 1. Create src/locales/<code>.json (copy en.json and translate)
 * 2. Import it below and add to `resources`
 * 3. Add the option to LANGUAGE_OPTIONS in pages/index.tsx
 * See docs/TRANSLATION_GUIDE.md for details.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en', // Default language, overridden by settings on load.
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes.
  },
});

export default i18n;
