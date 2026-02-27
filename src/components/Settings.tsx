import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold font-display mb-8 text-center text-gray-800 dark:text-white">{t('settings')}</h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('language_selection')}</h2>
          <select 
            onChange={handleLanguageChange} 
            value={i18n.language}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Theme</h2>
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-800 dark:text-gray-200">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
