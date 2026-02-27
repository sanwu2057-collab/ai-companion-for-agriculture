import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

interface CropRotationModalProps {
  onClose: () => void;
}

export default function CropRotationModal({ onClose }: CropRotationModalProps) {
  const [previousCrops, setPreviousCrops] = useState('');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getRotationAdvice = async () => {
    if (!previousCrops || !location) {
      setAdvice('Please enter the previous crops and location.');
      return;
    }

    setLoading(true);
    setAdvice('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
      const prompt = `
        Act as an expert agronomist. Provide a detailed crop rotation plan to improve soil health and maximize yield.
        - Previous Crops (last 1-2 seasons): ${previousCrops}
        - Location: ${location}
        - Soil Type: ${soilType}

        Your advice should include:
        1. A recommended crop rotation sequence for the next 3 seasons.
        2. The benefits of this rotation (e.g., nutrient management, pest control, soil structure).
        3. Recommendations for cover crops or green manure to use between main crop seasons.
        4. Any specific considerations for the given location and soil type.

        Format the response clearly using markdown.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAdvice(text);
    } catch (error) {
      console.error('Crop rotation advice error:', error);
      setAdvice('Sorry, there was an error generating advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-3xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white">Crop Rotation Guide</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" value={previousCrops} onChange={e => setPreviousCrops(e.target.value)} placeholder="Previous Crops (e.g., Corn, Soybeans)" className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (e.g., Iowa, USA)" className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 md:col-span-2">
            <option>Loamy</option>
            <option>Clay</option>
            <option>Sandy</option>
            <option>Silty</option>
            <option>Peaty</option>
          </select>
        </div>
        <button onClick={getRotationAdvice} disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors">
          {loading ? 'Generating Plan...' : 'Get Rotation Plan'}
        </button>

        {advice && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 max-h-60 overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
