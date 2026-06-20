'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { type Lang, type TranslationKey, type Translations, LANGS, getTranslations } from './translations';

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  dir: 'ltr',
});

const STORAGE_KEY = 'kulmis_lang';

function readLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'en' || v === 'so' || v === 'ar') return v;
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [translations, setTranslations] = useState<Translations>(getTranslations('en'));

  useEffect(() => {
    const saved = readLang();
    if (saved !== 'en') {
      setLangState(saved);
      setTranslations(getTranslations(saved));
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setTranslations(getTranslations(l));
    localStorage.setItem(STORAGE_KEY, l);
    const isRtl = LANGS.find((x) => x.code === l)?.rtl ?? false;
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return (translations as Record<string, string>)[key] ?? key;
  }, [translations]);

  const dir = LANGS.find((x) => x.code === lang)?.rtl ? 'rtl' : 'ltr';

  return (
    <Ctx.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </Ctx.Provider>
  );
}

export function useT() {
  return useContext(Ctx);
}
