import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import schemesData from '../data/schemes.json';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function SchemeChatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const schemeContext = JSON.stringify(schemesData);
      const prompt = `You are a helpful assistant for farmers in India. Your goal is to provide clear and simple information about government schemes. Use the following data as your primary source of information: ${schemeContext}. Answer the user's question based on this data. The user's question is: "${input}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const botMessage: Message = { text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { text: 'Sorry, I am having trouble connecting. Please try again later.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-8 right-8 bg-[#5e35b1] text-white p-4 rounded-full shadow-2xl hover:bg-[#4527a0] transition-transform hover:scale-110"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="bg-[#5e35b1] text-white p-4 rounded-t-2xl flex justify-between items-center">
        <h3 className="font-bold">Scheme Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto text-gray-700">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-gray-200 ml-auto' : 'bg-[#e9e7f7] mr-auto'}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex">
        <input 
          type="text" 
          placeholder="Ask about a scheme..." 
          className="w-full p-2 border rounded-full flex-grow"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="ml-2 bg-[#5e35b1] text-white p-3 rounded-full hover:bg-[#4527a0] disabled:bg-gray-400" disabled={loading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
