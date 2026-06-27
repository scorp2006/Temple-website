'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Lightweight i18n. The PRD specifies next-intl for the production build with
// EN + Telugu + Hindi; this dictionary-based context is a working scaffold with
// the same shape (a language switcher that persists), ready to swap to next-intl.

export type Lang = 'en' | 'te' | 'hi';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
];

const dict: Record<Lang, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.poojas': 'Book Pooja',
    'nav.stay': 'Accommodation',
    'nav.donate': 'Donate',
    'nav.news': 'News',
    'nav.live': 'Live Darshan',
    'nav.admin': 'Admin',
    'nav.staff': 'Staff',
    'hero.title': 'Sri Jagajjanani Temple',
    'hero.subtitle': 'A sacred abode of the Divine Mother. Book poojas, seek darshan, and offer your devotion.',
    'hero.bookPooja': 'Book a Pooja',
    'hero.donate': 'Donate',
    'common.book': 'Book Now',
    'common.viewAll': 'View all',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.about': 'మా గురించి',
    'nav.poojas': 'పూజ బుక్',
    'nav.stay': 'వసతి',
    'nav.donate': 'విరాళం',
    'nav.news': 'వార్తలు',
    'nav.live': 'ప్రత్యక్ష దర్శనం',
    'nav.admin': 'అడ్మిన్',
    'nav.staff': 'సిబ్బంది',
    'hero.title': 'శ్రీ జగజ్జనని ఆలయం',
    'hero.subtitle': 'జగన్మాత పవిత్ర నిలయం. పూజలు బుక్ చేసుకోండి, దర్శనం పొందండి.',
    'hero.bookPooja': 'పూజ బుక్ చేయండి',
    'hero.donate': 'విరాళం ఇవ్వండి',
    'common.book': 'ఇప్పుడే బుక్ చేయండి',
    'common.viewAll': 'అన్నీ చూడండి',
  },
  hi: {
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.poojas': 'पूजा बुक करें',
    'nav.stay': 'आवास',
    'nav.donate': 'दान करें',
    'nav.news': 'समाचार',
    'nav.live': 'लाइव दर्शन',
    'nav.admin': 'एडमिन',
    'nav.staff': 'स्टाफ',
    'hero.title': 'श्री जगज्जननी मंदिर',
    'hero.subtitle': 'जगन्माता का पवित्र धाम। पूजा बुक करें, दर्शन करें और अपनी भक्ति अर्पित करें।',
    'hero.bookPooja': 'पूजा बुक करें',
    'hero.donate': 'दान करें',
    'common.book': 'अभी बुक करें',
    'common.viewAll': 'सभी देखें',
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('temple_lang') as Lang | null;
    if (saved && dict[saved]) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('temple_lang', l);
  };

  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
