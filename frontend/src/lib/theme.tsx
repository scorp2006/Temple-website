'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {}, setTheme: () => {} });

// Inline script injected before paint to apply the saved theme and avoid a
// flash of the wrong theme. Light is the default when nothing is stored.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('temple_theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Sync state with whatever the init script already applied to <html>.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setThemeState(isDark ? 'dark' : 'light');
  }, []);

  const apply = (t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('temple_theme', t); } catch {}
  };

  const toggle = () => apply(theme === 'dark' ? 'light' : 'dark');

  return <Ctx.Provider value={{ theme, toggle, setTheme: apply }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
