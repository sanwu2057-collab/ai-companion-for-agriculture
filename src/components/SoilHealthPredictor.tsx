import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Microscope, MapPin, Sprout, Loader2, Camera, Upload, X, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import CameraModal from './CameraModal';
import { analyzeSoilAndPredictYield } from '../services/geminiService';

export default function SoilHealthPredictor() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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

  const handleAnalyze = async () => {
    if (!location || !cropType) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeSoilAndPredictYield(image || '', location, cropType);
      setResult(analysis || 'Unable to analyze soil data.');
    } catch (error) {
      console.error('Error analyzing soil:', error);
      setResult('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (imageData: string) => {
    setImage(imageData);
    setIsCameraOpen(false);
  };

  return (
    <div className="glassmorphism p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="bg-[var(--color-neon-cyan)]/20 p-3 rounded-2xl mr-4">
          <Microscope className="h-8 w-8 text-[var(--color-neon-cyan)]" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text-primary)]">Soil Health & Yield Predictor</h2>
          <p className="text-[var(--color-text-secondary)]">Advanced AI analysis for precision farming.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center">
              <MapPin size={16} className="mr-2 text-[var(--color-neon-blue)]" />
              Location / Region
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Punjab, India or 30.7333° N, 76.7794° E"
              className="w-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-xl p-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center">
              <Sprout size={16} className="mr-2 text-[var(--color-neon-cyan)]" />
              Intended Crop
            </label>
            <input
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              placeholder="e.g., Wheat, Basmati Rice, Cotton"
              className="w-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-xl p-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 flex items-center justify-center space-x-2 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] py-3 rounded-xl hover:bg-[var(--color-glass-border)] transition-all"
            >
              <Camera size={18} />
              <span>Camera</span>
            </button>
            <label className="flex-1 flex items-center justify-center space-x-2 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] py-3 rounded-xl hover:bg-[var(--color-glass-border)] cursor-pointer transition-all">
              <Upload size={18} />
              <span>Upload Soil</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-glass-border)] rounded-2xl p-4 bg-[var(--color-bg-dark)]/30">
          {image ? (
            <div className="relative w-full h-full min-h-[200px]">
              <img src={image} alt="Soil sample" className="w-full h-full object-cover rounded-xl" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2 opacity-40">
              <Microscope size={48} className="mx-auto" />
              <p className="text-sm">Upload a photo of your soil for visual analysis</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!location || !cropType || loading}
        className="w-full bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] text-white py-4 rounded-xl font-display font-bold text-lg shadow-lg hover:shadow-[var(--color-neon-blue)]/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>Processing Advanced Analytics...</span>
          </>
        ) : (
          <>
            <Zap size={20} />
            <span>Generate Soil & Yield Report</span>
          </>
        )}
      </button>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-8 glassmorphism border-t-4 border-[var(--color-neon-cyan)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-display text-[var(--color-neon-cyan)]">Analysis Report</h3>
            <div className="text-[10px] font-mono text-[var(--color-text-secondary)] uppercase tracking-widest bg-[var(--color-glass-bg)] px-3 py-1 rounded-full">
              AI Generated • Precision Level: High
            </div>
          </div>
          <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
    </div>
  );
}
