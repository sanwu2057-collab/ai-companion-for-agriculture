import { NavLink } from 'react-router-dom';
import { Home, Leaf, Droplets, Sun, Bug, Settings, BarChart2, Zap, TrendingUp, ShieldCheck, Microscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SideNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', text: t('dashboard'), icon: Home },
    { to: '/plant-disease-detector', text: t('plant_detector'), icon: Leaf },
    { to: '/organic-detector', text: t('organic_detector'), icon: ShieldCheck },
    { to: '/soil-health', text: 'Soil Health', icon: Microscope },
    { to: '/drought-assistant', text: t('drought_assistant'), icon: Droplets },
    { to: '/climate-detector', text: t('climate_detector'), icon: Sun },
    { to: '/pest-detector', text: t('pest_detector'), icon: Bug },
    { to: '/government-schemes', text: t('government_schemes'), icon: BarChart2 },
    { to: '/market', text: t('market'), icon: TrendingUp },
    { to: '/crop-cycle-assistant', text: t('crop_cycle_assistant'), icon: Zap },
    { to: '/weather-alerts', text: t('weather_alerts'), icon: Sun },
  ];

  return (
    <nav className="glassmorphism w-20 flex flex-col items-center py-8 z-50 m-4">
      <div className="mb-10">
        <Zap className="h-10 w-10 text-[var(--color-neon-cyan)]" />
      </div>
      <div className="flex flex-col space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full text-xs font-mono transition-colors duration-200 p-2 rounded-lg ${isActive ? 'text-[var(--color-neon-cyan)] bg-[var(--color-glass-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-neon-blue)]'}`
              }
              end
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.text}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="mt-auto pt-8">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full text-xs font-mono transition-colors duration-200 p-2 rounded-lg ${isActive ? 'text-[var(--color-neon-cyan)] bg-[var(--color-glass-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-neon-blue)]'}`
          }
        >
          <Settings className="h-6 w-6 mb-1" />
          <span>{t('settings')}</span>
        </NavLink>
      </div>
    </nav>
  );
}
