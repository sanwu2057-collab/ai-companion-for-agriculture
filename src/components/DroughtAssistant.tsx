import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TranslationOption from './TranslationOption';

export default function DroughtAssistant() {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [translatedAdvice, setTranslatedAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDroughtAdvice = async () => {
    if (!query) return;
    setLoading(true);
    setAdvice('');
    try {
      const { getCropTips } = await import('../services/geminiService'); // Reusing getCropTips for drought advice
      const result = await getCropTips(`Drought advice for ${query}`);
      setAdvice(result ?? 'Could not retrieve advice.');
    } catch (error) {
      console.error('Error getting drought advice:', error);
      setAdvice('An error occurred while fetching advice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism p-8">
      <h2 className="text-2xl font-bold font-display text-[var(--color-text-primary)] mb-4">AI Drought Assistant</h2>
      <div className="flex space-x-2 mb-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for drought advice (e.g., for corn)" 
          className="w-full p-3 border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-text-primary)] rounded-full font-sans focus:outline-none focus:border-[var(--color-neon-blue)]"
        />
        <button onClick={getDroughtAdvice} disabled={!query || loading} className="bg-[var(--color-neon-purple)] text-white py-3 px-8 rounded-full font-display font-semibold hover:bg-[var(--color-neon-blue)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]">
          {loading ? 'Getting Advice...' : 'Get Advice'}
        </button>
      </div>
      {advice && (
        <div className="mt-4 p-4 glassmorphism prose max-w-none text-[var(--color-text-primary)]">
          <div className="text-[var(--color-text-secondary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedAdvice || advice}</ReactMarkdown>
          </div>
          <TranslationOption textToTranslate={advice || ''} onTranslated={setTranslatedAdvice} />
        </div>
      )}
    </div>
  );
}
