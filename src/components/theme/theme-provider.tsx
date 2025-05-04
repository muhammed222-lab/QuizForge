import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'quizforge_theme',
  ...props
}: ThemeProviderProps) {
  // Always use dark theme
  const [theme, setTheme] = useState<Theme>('dark');

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Function to update the DOM based on theme
  const updateDOM = (value: string) => {
    const root = window.document.documentElement;

    const isDark = value === 'dark';

    // First remove both classes to ensure clean state
    root.classList.remove('light');
    root.classList.remove('dark');

    // Then add the current theme
    root.classList.add(isDark ? 'dark' : 'light');

    // Update html attribute for better CSS targeting
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Update resolved theme state
    setResolvedTheme(isDark ? 'dark' : 'light');

    // Log for debugging
    console.log('Theme updated to:', isDark ? 'dark' : 'light');
  };

  // Watch for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        updateDOM(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Update DOM when theme changes
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      updateDOM(systemTheme);
    } else {
      updateDOM(theme);
    }
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <div className={resolvedTheme === 'dark' ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
