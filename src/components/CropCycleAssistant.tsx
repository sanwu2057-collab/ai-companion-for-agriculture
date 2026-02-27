import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CropRotationModal from './CropRotationModal';
import { Repeat, Zap } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

function CropCycleManager() {
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [growthStage, setGrowthStage] = useState('Planting');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (!crop || !location) {
      setAdvice('Please enter a crop and location.');
      return;
    }

    setLoading(true);
    setAdvice('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
      const prompt = `
        Act as an expert agronomist. Provide a detailed crop cycle management plan to maximize the yield for the following:
        - Crop: ${crop}
        - Location: ${location}
        - Soil Type: ${soilType}
        - Current Growth Stage: ${growthStage}

        Your advice should be practical and easy to follow. Include recommendations for:
        1. Fertilization (type, amount, and schedule)
        2. Irrigation (frequency and water amount)
        3. Pest and Disease Management (common threats and preventative measures)
        4. General care tips for the specified growth stage.

        Format the response clearly using markdown.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAdvice(text);
    } catch (error) {
      console.error('Crop cycle advice error:', error);
      setAdvice('Sorry, there was an error generating advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold font-display mb-4 text-gray-800 dark:text-white flex items-center"><Zap size={24} className="mr-2 text-green-500" /> Crop Cycle Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" value={crop} onChange={e => setCrop(e.target.value)} placeholder="Enter Crop Name (e.g., Tomato)" className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter Location (e.g., California, USA)" className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option>Loamy</option>
          <option>Clay</option>
          <option>Sandy</option>
          <option>Silty</option>
          <option>Peaty</option>
        </select>
        <select value={growthStage} onChange={e => setGrowthStage(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option>Planting</option>
          <option>Vegetative</option>
          <option>Flowering</option>
          <option>Fruiting</option>
          <option>Harvest</option>
        </select>
      </div>
      <button onClick={getAdvice} disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors">
        {loading ? 'Generating Advice...' : 'Get Expert Advice'}
      </button>
      {advice && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}></div>
        </div>
      )}
    </div>
  );
}

export default function CropCycleAssistant() {
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold font-display mb-8 text-center text-gray-800 dark:text-white">Crop Cycle Assistant</h1>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CropCycleManager />
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold font-display mb-4 text-gray-800 dark:text-white flex items-center"><Repeat size={24} className="mr-2 text-blue-500" /> Crop Rotation Guide</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Get AI-powered recommendations for crop rotation to improve soil health and boost long-term yield.</p>
          <button onClick={() => setIsRotationModalOpen(true)} className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Open Guide
          </button>
        </div>
      </div>

      {isRotationModalOpen && <CropRotationModal onClose={() => setIsRotationModalOpen(false)} />}
    </div>
  );
}
