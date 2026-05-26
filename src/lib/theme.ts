export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ecoplay-theme';

export const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark';

export const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(storedTheme) ? storedTheme : null;
};

export const getPreferredTheme = (): Theme => getStoredTheme() ?? 'light';

export const applyThemeToDocument = (theme: Theme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};
