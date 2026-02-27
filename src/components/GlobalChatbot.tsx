import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAI } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function GlobalChatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));
      
      const response = await chatWithAI(input, history);
      const botMessage: Message = { role: 'model', parts: [{ text: response || 'No response' }] };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="bg-[var(--color-neon-purple)] text-white p-4 rounded-full shadow-2xl hover:bg-[var(--color-neon-blue)] transition-all duration-300 group"
          >
            <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              width: isExpanded ? '600px' : '380px',
              height: isExpanded ? '700px' : '500px'
            }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="glassmorphism flex flex-col overflow-hidden shadow-2xl border border-[var(--color-glass-border)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Agri-Helper AI</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-white/70 text-[10px] uppercase tracking-wider font-mono">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[var(--color-bg-dark)]/50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <Bot size={48} className="text-[var(--color-neon-cyan)]" />
                  <div>
                    <p className="text-[var(--color-text-primary)] font-medium">How can I help you today?</p>
                    <p className="text-[var(--color-text-secondary)] text-xs">Ask about crops, soil, pests, or market prices.</p>
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 p-1 rounded-full ${msg.role === 'user' ? 'bg-[var(--color-neon-blue)]/20' : 'bg-[var(--color-neon-purple)]/20'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-[var(--color-neon-blue)]" /> : <Bot size={14} className="text-[var(--color-neon-purple)]" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-[var(--color-neon-blue)] text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                        : 'glassmorphism text-[var(--color-text-primary)] rounded-tl-none'
                    }`}>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.parts[0].text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex space-x-2">
                    <div className="mt-1 p-1 rounded-full bg-[var(--color-neon-purple)]/20">
                      <Bot size={14} className="text-[var(--color-neon-purple)]" />
                    </div>
                    <div className="glassmorphism p-3 rounded-2xl rounded-tl-none">
                      <Loader2 size={16} className="animate-spin text-[var(--color-neon-cyan)]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-glass-border)] bg-[var(--color-bg-dark)]">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Type your agricultural query..." 
                  className="w-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-full py-3 pl-4 pr-12 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-[var(--color-neon-purple)] text-white rounded-full hover:bg-[var(--color-neon-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] text-center mt-2 font-mono uppercase tracking-tighter">
                Powered by Gemini 3.1 Pro
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
