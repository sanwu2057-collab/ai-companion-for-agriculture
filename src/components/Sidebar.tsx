import { LayoutDashboard, BrainCircuit, Database, BarChart, Settings, Rocket, Bot } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: BrainCircuit, label: 'Models' },
  { icon: Database, label: 'Datasets' },
  { icon: Bot, label: 'Training' },
  { icon: Rocket, label: 'Deployments' },
  { icon: BarChart, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 glassmorphism border-r border-white/10 flex flex-col">
      <div className="flex items-center space-x-2 mb-12">
        <BrainCircuit className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-display font-bold text-white">AI Studio</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item, index) => (
          <a href="#" key={index} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${index === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="w-6 h-6" />
            <span className="font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600 to-blue-800 text-white text-center">
          <p className="font-semibold mb-2">Upgrade to Pro</p>
          <p className="text-sm mb-4">Unlock advanced features and unlimited access.</p>
          <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
