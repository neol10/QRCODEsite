import React from 'react';
import { BarChart3, QrCode, Users, Settings, Key } from 'lucide-react';
import { ViewState } from '../types';
import { useNeoTranslation } from '../hooks/useTranslation';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin }) => {
  const { t } = useNeoTranslation();
  const allItems = [
    { id: 'analytics', label: t('nav.analytics'), icon: BarChart3, adminOnly: true },
    { id: 'generator', label: t('nav.generator'), icon: QrCode, adminOnly: false },
    { id: 'leads', label: t('nav.leads'), icon: Users, adminOnly: true },
    { id: 'admin_dashboard', label: 'Admin', icon: Key, adminOnly: true, isSuper: true },
    { id: 'settings', label: t('nav.settings'), icon: Settings, adminOnly: false },
  ];

  const items = allItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0C1D1B] border-t border-white/10 px-6 py-4 z-50">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isSuper = 'isSuper' in item && item.isSuper;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? (isSuper ? 'text-purple-500' : 'text-cyan-400') 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={isSuper ? 26 : 24} className={isSuper && isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
