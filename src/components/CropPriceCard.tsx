import { useTranslation } from 'react-i18next';
import { Volume2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CropPrice {
  id: number;
  crop: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  previous_modal_price?: number;
  unit: string;
  state: string;
  historical_data?: { date: string; price: number }[];
}

interface CropPriceCardProps {
  crop: CropPrice;
  onClick: () => void;
}

export default function CropPriceCard({ crop, onClick }: CropPriceCardProps) {
  const { i18n } = useTranslation();

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToSpeak = `
      Crop: ${crop.crop}. 
      Market: ${crop.market}, ${crop.state}. 
      Minimum price: ${crop.min_price}. 
      Maximum price: ${crop.max_price}. 
      Modal price: ${crop.modal_price} per ${crop.unit}.
    `;
    speak(textToSpeak);
  };

  const getPriceChange = () => {
    if (!crop.previous_modal_price) return { change: 0, percentage: '0.00' };
    const change = crop.modal_price - crop.previous_modal_price;
    const percentage = ((change / crop.previous_modal_price) * 100).toFixed(2);
    return { change, percentage };
  };

  const { change, percentage } = getPriceChange();

  const PriceChangeIndicator = () => {
    if (change > 0) {
      return <span className="flex items-center text-sm text-green-600"><ArrowUp size={16} className="mr-1" /> +{percentage}%</span>;
    }
    if (change < 0) {
      return <span className="flex items-center text-sm text-red-600"><ArrowDown size={16} className="mr-1" /> {percentage}%</span>;
    }
    return <span className="flex items-center text-sm text-gray-500"><Minus size={16} className="mr-1" /> 0.00%</span>;
  };

  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full border border-gray-200 hover:shadow-lg hover:border-green-500 transition-all duration-300 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-green-700 font-display">{crop.crop}</h3>
        <button onClick={handleSpeak} className="text-gray-400 hover:text-green-700">
          <Volume2 size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{crop.market}, {crop.state}</p>
      
      <div className="grid grid-cols-3 gap-2 text-center mb-4 text-sm">
        <div>
          <p className="font-semibold text-gray-700">Min Price</p>
          <p className="text-gray-600">₹{crop.min_price}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Max Price</p>
          <p className="text-gray-600">₹{crop.max_price}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Modal Price</p>
          <p className="text-gray-800 font-bold">₹{crop.modal_price}</p>
        </div>
      </div>

      <div className="flex justify-center items-center my-2">
        <PriceChangeIndicator />
      </div>

      <p className="mt-auto text-xs text-center text-gray-400">Price per {crop.unit}</p>
    </div>
  );
}
