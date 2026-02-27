import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { OrganicIcon } from './icons';
import { useTranslation } from 'react-i18next';
import CameraModal from './CameraModal';
import TranslationOption from './TranslationOption';

export default function OrganicDetector() {
  const { t, i18n } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const detectOrganic = async () => {
    if (!image && !description) return;
    setLoading(true);
    setResult(null);
    setTranslatedResult(null);
    try {
      const { checkOrganic } = await import('../services/geminiService');
      const analysis = await checkOrganic(image || '', description);
      const finalResult = analysis ?? 'Could not analyze the product.';
      setResult(finalResult);
      speak(finalResult);
    } catch (error) {
      console.error('Error checking organic status:', error);
      const errorMessage = 'An error occurred while analyzing the product.';
      setResult(errorMessage);
      speak(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setImage(imageData);
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (translatedResult) {
      speak(translatedResult);
    }
  }, [translatedResult, i18n.language]);

  return (
    <div className="glassmorphism p-8">
      <div className="flex items-center mb-4">
        <OrganicIcon className="h-8 w-8 text-[var(--color-neon-cyan)] mr-3" />
        <h2 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">{t('organic_detector_title')}</h2>
      </div>
      
      <p className="text-[var(--color-text-secondary)] mb-6">
        {t('organic_detector_desc')}
      </p>

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex space-x-4">
          <label className="flex-1 block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-glass-bg)] file:text-[var(--color-neon-blue)] hover:file:bg-[var(--color-glass-border)]">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
            <div className="text-center p-4 border-2 border-dashed rounded-xl cursor-pointer border-[var(--color-glass-border)] hover:border-[var(--color-neon-blue)] transition-colors h-full flex items-center justify-center">
              Upload Image
            </div>
          </label>
          <button onClick={() => setIsCameraOpen(true)} className="flex-1 text-sm text-[var(--color-text-secondary)] py-2 px-4 rounded-full border-0 font-semibold bg-[var(--color-glass-bg)] text-[var(--color-neon-blue)] hover:bg-[var(--color-glass-border)] transition-colors">
            <div className="text-center p-4 border-2 border-dashed rounded-xl cursor-pointer border-[var(--color-glass-border)] hover:border-[var(--color-neon-blue)] transition-colors h-full flex items-center justify-center">
              Use Camera
            </div>
          </button>
        </div>

        {image && (
          <div className="relative">
            <img src={image} alt="Product" className="rounded-xl mb-4 max-h-64 mx-auto border border-[var(--color-glass-border)]" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-red-500/50 hover:bg-red-500 text-white p-1 rounded-full text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {t('product_description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., This is a pack of tomatoes from a local farm. It has a green label but no USDA seal."
            className="w-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-xl p-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors min-h-[100px]"
          />
        </div>
      </div>

      <button 
        onClick={detectOrganic} 
        disabled={(!image && !description) || loading} 
        className="w-full bg-[var(--color-neon-purple)] text-white py-3 rounded-full font-display font-semibold hover:bg-[var(--color-neon-blue)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]"
      >
        {loading ? t('analyzing') : t('check_organic')}
      </button>

      {result && (
        <div className="mt-8 p-6 glassmorphism prose max-w-none text-[var(--color-text-primary)]">
          <h3 className="font-bold font-display text-[var(--color-neon-cyan)] mb-4">{t('organic_estimation')}</h3>
          <div className="text-[var(--color-text-secondary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedResult || result}</ReactMarkdown>
          </div>
          <TranslationOption textToTranslate={result || ''} onTranslated={setTranslatedResult} />
        </div>
      )}
      
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
    </div>
  );
}
