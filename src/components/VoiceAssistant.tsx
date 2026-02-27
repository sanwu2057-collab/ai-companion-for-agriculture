import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant() {
  const { i18n, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = i18n.language;

    recognitionInstance.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleCommand(command);
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setSpeechError(t('microphone_permission_denied'));
      } else {
        setSpeechError(t('speech_recognition_error'));
      }
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    // Clear speech error after 5 seconds
    const timer = setTimeout(() => {
      setSpeechError(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [i18n.language]);

  const handleCommand = (command: string) => {
    if (command.includes('hello')) {
      speak('Hello! How can I help you today?');
    } else if (command.includes("what's the weather")) {
      speak('The weather is sunny with a high of 25 degrees Celsius.');
    } else {
      speak("I'm sorry, I don't understand that command.");
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-2">
      {speechError && (
        <p className="bg-red-500 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
          {speechError}
        </p>
      )}
      <button onClick={toggleListening} className={`glassmorphism rounded-full p-4 transition-colors ${isListening ? 'bg-red-600 text-white shadow-red-500/50' : 'bg-[var(--color-glass-bg)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-glass-border)]'} shadow-lg`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v3m0 0v-3m0 0h.01M12 17a3 3 0 01-3-3V6a3 3 0 116 0v8a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
}
