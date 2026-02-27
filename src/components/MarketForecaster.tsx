import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import marketData from '../data/market.json';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export default function MarketForecaster() {
  const [crop, setCrop] = useState('');
  const [region, setRegion] = useState('');
  const [forecast, setForecast] = useState('');
  const [loading, setLoading] = useState(false);

  const getForecast = async () => {
    if (!crop || !region) {
      setForecast('Please select a crop and region.');
      return;
    }

    setLoading(true);
    setForecast('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const marketContext = JSON.stringify(marketData);
      const prompt = `
        You are an expert agricultural market analyst. Based on the following market data, provide a brief market analysis and price forecast for ${crop} in the ${region} region. 
        Analyze trends, but clearly state that this is a simplified forecast based on limited data and not financial advice.
        
        Market Data: ${marketContext}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setForecast(text);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecast('Sorry, there was an error generating the forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold font-display mb-4 text-center text-gray-800">AI Market Forecaster</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select value={crop} onChange={e => setCrop(e.target.value)} className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Select Crop</option>
          {[...new Set(marketData.map(c => c.crop))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={region} onChange={e => setRegion(e.target.value)} className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Select Region</option>
          {[...new Set(marketData.map(c => c.state))].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={getForecast} disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors">
          {loading ? 'Analyzing...' : 'Get Forecast'}
        </button>
      </div>
      {forecast && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <p className="text-gray-700 whitespace-pre-wrap">{forecast}</p>
        </div>
      )}
    </div>
  );
}
