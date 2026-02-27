import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface TranslationOptionProps {
  textToTranslate: string;
  onTranslated: (translatedText: string) => void;
}

export default function TranslationOption({ textToTranslate, onTranslated }: TranslationOptionProps) {
  const { t, i18n } = useTranslation();
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ];

  const handleTranslate = async () => {
    if (!textToTranslate || !targetLanguage) return;
    setLoading(true);
    try {
      const { translateText } = await import('../services/geminiService');
      const translated = await translateText(textToTranslate, targetLanguage);
      onTranslated(translated);
    } catch (error) {
      console.error('Error translating text:', error);
      onTranslated(t('translation_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <label htmlFor="language-select" className="text-[var(--color-text-secondary)] text-sm font-mono">{t('translate_to')}:</label>
      <div className="relative">
        <select
          id="language-select"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="glassmorphism appearance-none bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] py-2 pl-3 pr-8 rounded-md text-sm font-mono focus:outline-none focus:border-[var(--color-neon-blue)]"
          disabled={loading}
        >
          <option value="">{t('select_language')}</option>
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)] pointer-events-none" />
      </div>
      <button
        onClick={handleTranslate}
        disabled={!textToTranslate || !targetLanguage || loading}
        className="bg-[var(--color-neon-blue)] text-white py-2 px-4 rounded-md text-sm font-display font-semibold hover:bg-[var(--color-neon-purple)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]"
      >
        {loading ? t('translating') : t('translate')}
      </button>
    </div>
  );
}
