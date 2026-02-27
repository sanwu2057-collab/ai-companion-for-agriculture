import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  documents: string[];
  benefits: string;
  farmer_type: string[];
  category: string;
  state: string;
}

interface SchemeCardProps {
  scheme: Scheme;
}

export default function SchemeCard({ scheme }: SchemeCardProps) {
  const { t, i18n } = useTranslation();

  const speak = (text: string) => {
    speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const handleSpeak = () => {
    const textToSpeak = `
      Scheme: ${scheme.name}. 
      Description: ${scheme.description}. 
      Eligibility: ${scheme.eligibility}.
    `;
    speak(textToSpeak);
  };

  return (
    <div className="bg-white text-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-[#5e35b1] font-display">{scheme.name}</h3>
        <button onClick={handleSpeak} className="text-gray-500 hover:text-[#5e35b1]">
          <Volume2 size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{scheme.description}</p>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-1 text-gray-700">Eligibility:</h4>
        <p className="text-xs text-gray-500">{scheme.eligibility}</p>
      </div>

      <button className="mt-auto w-full bg-[#5e35b1] text-white py-2 rounded-full font-semibold hover:bg-[#4527a0] transition-colors">
        Apply Now
      </button>
    </div>
  );
}
