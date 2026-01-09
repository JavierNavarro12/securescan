export const locales = ['es', 'en', 'fr', 'de', 'pt', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
  fr: 'FR',
  de: 'DE',
  pt: 'PT',
  ja: 'JA',
};

export const localeFullNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
};
