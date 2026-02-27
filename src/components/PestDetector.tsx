import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CameraModal from './CameraModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TranslationOption from './TranslationOption';

export default function PestDetector() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const detectPest = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const { detectPest } = await import('../services/geminiService');
      const analysis = await detectPest(image);
      setResult(analysis ?? 'Could not analyze the image.');
    } catch (error) {
      console.error('Error detecting pest:', error);
      setResult('An error occurred while analyzing the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setImage(imageData);
    setIsCameraOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="glassmorphism p-8 text-center">
        <h1 className="text-4xl font-bold font-display text-[var(--color-text-primary)] mb-4">{t('pest_detector_title')}</h1>
        <div className="flex space-x-4 mb-4">
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
        {image && <img src={image} alt="Uploaded pest" className="rounded-xl mb-4 max-h-64 mx-auto border border-[var(--color-glass-border)]" />}
        <button onClick={detectPest} disabled={!image || loading} className="w-full bg-[var(--color-neon-purple)] text-white py-3 rounded-full font-display font-semibold hover:bg-[var(--color-neon-blue)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]">
          {loading ? t('analyzing') : t('analyze_pest')}
        </button>
        {result && (
          <div className="mt-4 p-4 glassmorphism prose max-w-none text-[var(--color-text-primary)]">
            <h3 className="font-bold font-display text-[var(--color-neon-cyan)] mb-2">{t('analysis_result')}</h3>
            <div className="text-[var(--color-text-secondary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedResult || result}</ReactMarkdown>
          </div>
          <TranslationOption textToTranslate={result || ''} onTranslated={setTranslatedResult} />
          </div>
        )}
      </div>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
    </div>
  );
}
