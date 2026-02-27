import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-4 flex justify-end items-center">
      <button 
        onClick={() => changeLanguage('en')} 
        className={`px-3 py-1 rounded-md text-sm font-mono transition-colors duration-200 ${i18n.language === 'en' ? 'bg-[var(--color-neon-blue)] text-white' : 'bg-[var(--color-glass-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)]'}`}
      >
        EN
      </button>
      <button 
        onClick={() => changeLanguage('es')} 
        className={`ml-2 px-3 py-1 rounded-md text-sm font-mono transition-colors duration-200 ${i18n.language === 'es' ? 'bg-[var(--color-neon-blue)] text-white' : 'bg-[var(--color-glass-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)]'}`}>
        ES
      </button>
      <button 
        onClick={() => changeLanguage('te')} 
        className={`ml-2 px-3 py-1 rounded-md text-sm font-mono transition-colors duration-200 ${i18n.language === 'te' ? 'bg-[var(--color-neon-blue)] text-white' : 'bg-[var(--color-glass-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)]'}`}>
        TE
      </button>
      <button 
        onClick={() => changeLanguage('hi')} 
        className={`ml-2 px-3 py-1 rounded-md text-sm font-mono transition-colors duration-200 ${i18n.language === 'hi' ? 'bg-[var(--color-neon-blue)] text-white' : 'bg-[var(--color-glass-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)]'}`}>
        HI
      </button>
    </div>
  );
}
