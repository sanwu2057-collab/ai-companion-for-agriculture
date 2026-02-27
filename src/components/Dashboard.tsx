import { Search, Bell, Leaf, ShieldCheck, Microscope, Droplets, Sun, Bug, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const quickActions = [
  { name: 'Plant Disease', icon: Leaf, color: 'text-green-400', path: '/plant-disease-detector', desc: 'Identify crop diseases instantly' },
  { name: 'Organic Check', icon: ShieldCheck, color: 'text-blue-400', path: '/organic-detector', desc: 'Verify organic status' },
  { name: 'Soil Health', icon: Microscope, color: 'text-cyan-400', path: '/soil-health', desc: 'Predict yield & soil quality' },
  { name: 'Drought Assist', icon: Droplets, color: 'text-indigo-400', path: '/drought-assistant', desc: 'Water management tips' },
  { name: 'Climate Advisor', icon: Sun, color: 'text-yellow-400', path: '/climate-detector', desc: 'AI weather insights' },
  { name: 'Pest Control', icon: Bug, color: 'text-red-400', path: '/pest-detector', desc: 'Detect & manage pests' },
  { name: 'Market Trends', icon: TrendingUp, color: 'text-emerald-400', path: '/market', desc: 'Live crop prices' },
  { name: 'Crop Cycle', icon: Zap, color: 'text-purple-400', path: '/crop-cycle-assistant', desc: 'Harvesting schedules' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white font-display tracking-tight">Agri-Helper Dashboard</h1>
          <p className="text-[var(--color-text-secondary)]">Precision farming powered by Gemini 3.1 Pro</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search features..." 
              className="w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-blue)] transition-all" 
            />
          </div>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative">
            <Bell className="text-gray-300" size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--color-bg-dark)]"></span>
          </button>
          <div className="flex items-center space-x-3 bg-white/5 p-1 pr-4 rounded-full border border-white/10">
            <img src="https://i.pravatar.cc/40?u=farmer" alt="User Avatar" className="w-8 h-8 rounded-full border border-[var(--color-neon-cyan)]" />
            <span className="text-xs font-mono text-white/80">Farmer #42</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-neon-blue)]/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-[var(--color-neon-purple)]/20 transition-all duration-1000"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to optimize your harvest?</h2>
          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            Our advanced AI models are currently monitoring 12 different environmental factors to provide you with the most accurate farming advice.
          </p>
          <div className="flex space-x-4">
            <Link to="/soil-health" className="bg-[var(--color-neon-blue)] text-white px-6 py-2 rounded-full font-semibold hover:bg-[var(--color-neon-purple)] transition-all shadow-lg shadow-blue-500/20">
              Analyze Soil
            </Link>
            <Link to="/market" className="bg-white/10 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all">
              View Market
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                to={action.path}
                className="glassmorphism p-6 block hover:border-[var(--color-neon-blue)] transition-all hover:-translate-y-1 group"
              >
                <div className={`${action.color} mb-4 p-3 bg-white/5 w-fit rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-white font-bold mb-1">{action.name}</h3>
                <p className="text-[var(--color-text-secondary)] text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glassmorphism p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Active Alerts</p>
            <h4 className="text-2xl font-bold text-red-400">2 Warnings</h4>
          </div>
          <div className="bg-red-400/10 p-3 rounded-full">
            <Bell className="text-red-400" size={24} />
          </div>
        </div>
        <div className="glassmorphism p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Market Sentiment</p>
            <h4 className="text-2xl font-bold text-emerald-400">Bullish</h4>
          </div>
          <div className="bg-emerald-400/10 p-3 rounded-full">
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
        </div>
        <div className="glassmorphism p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">AI Confidence</p>
            <h4 className="text-2xl font-bold text-[var(--color-neon-cyan)]">98.4%</h4>
          </div>
          <div className="bg-[var(--color-neon-cyan)]/10 p-3 rounded-full">
            <Zap className="text-[var(--color-neon-cyan)]" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
