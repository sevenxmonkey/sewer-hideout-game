import React, { createContext, useContext, useMemo, useState } from 'react';
import en from '../locales/en-US.json';
import zh from '../locales/zh-CN.json';

type Locales = typeof en;

type LocaleKey = 'en-US' | 'zh-CN';

interface ILocalizationContext {
  t: (key: string) => string;
  locale: LocaleKey;
  setLocale: (l: LocaleKey) => void;
}

const LocalizationContext = createContext<ILocalizationContext | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // default to Chinese as requested
  const [locale, setLocale] = useState<LocaleKey>('zh-CN');
  const resources: Record<LocaleKey, Locales> = useMemo(
    () => ({ 'en-US': en as Locales, 'zh-CN': zh as Locales }),
    []
  );

  const t = (key: string) => {
    const parts = key.split('.');
    let cur: any = resources[locale] || resources['en-US'];
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) return key;
    }
    return cur as string;
  };

  return (
    <LocalizationContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error('useLocalization must be used within LocalizationProvider');
  return ctx;
};
