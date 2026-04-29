import { useState, useEffect, useCallback } from 'react';
import { getTranslations, isRTL } from '../lib/i18n';

export default function useLanguage() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('khidma_lang') || 'en';
  });

  const t = getTranslations(lang);
  const rtl = isRTL(lang);

  const switchLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('khidma_lang', newLang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, rtl]);

  return { lang, t, rtl, switchLanguage };
}