import React, { useState, useEffect } from 'react';
import {
  Pill,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ShieldAlert,
  UserCheck,
  BookOpen,
  Settings,
  LayoutDashboard,
  Clock,
  Users,
  Bot,
  BarChart3,
  ListFilter,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenDocs: () => void;
  onTriggerSos: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  user,
  onOpenAuth,
  onOpenDocs,
  onTriggerSos,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: "Today's Schedule", icon: LayoutDashboard },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'history', label: 'History & Logs', icon: Clock },
    { id: 'family', label: 'Caregivers', icon: Users },
    { id: 'ai-assistant', label: 'MediCare AI', icon: Bot, badge: 'AI' },
    { id: 'statistics', label: 'Adherence Stats', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Pill className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  MediCare<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">.AI</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Smart Reminder
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Simple, reliable medication tracking for elderly & family care
              </p>
            </div>
          </div>

          {/* Clock & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Clock Display */}
            <div className="hidden md:flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold tracking-wider font-mono text-slate-800 dark:text-slate-200">
                {timeStr}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {dateStr}
              </span>
            </div>

            {/* SOS Emergency Button */}
            <button
              onClick={onTriggerSos}
              title="Emergency SOS Alert to Caregivers"
              className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-600/30 active:scale-95 transition-all"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>SOS Alert</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const updated = !settings.notificationSound;
                onUpdateSettings({ ...settings, notificationSound: updated });
                if (updated) soundEngine.playSuccessChime();
              }}
              title={settings.notificationSound ? 'Mute Sound' : 'Enable Sound'}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {settings.notificationSound ? (
                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() =>
                onUpdateSettings({ ...settings, darkMode: !settings.darkMode })
              }
              title="Toggle Theme"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {settings.darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Docs / Readme Button */}
            <button
              onClick={onOpenDocs}
              title="Project Requirements & Docs"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">Docs</span>
            </button>

            {/* User Profile */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all text-emerald-900 dark:text-emerald-100"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                {user.name}
              </span>
            </button>

          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
