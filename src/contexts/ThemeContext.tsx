import { createContext, useState, useMemo, useEffect } from 'react';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
