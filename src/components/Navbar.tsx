import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Bell, 
  Search, 
  User as UserIcon, 
  Moon, 
  Sun, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  LogOut,
  Calendar,
  CheckCircle2,
  XCircle,
  Menu,
  X
} from 'lucide-react';
import { getNotifications, markNotificationRead, clearAllNotifications, getUserAuth, setUserAuth, getProfile } from '../services/storage';
import { AppNotification } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSOS: () => void;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const user = getUserAuth();
  const profile = getProfile();

  useEffect(() => {
    setNotifications(getNotifications());
    const interval = setInterval(() => setNotifications(getNotifications()), 3000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setUserAuth({ isLoggedIn: false });
    onOpenAuth();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'medicines', label: 'Medicines' },
    { id: 'ai-hub', label: 'AI Health Hub', icon: Sparkles },
    { id: 'history', label: 'History' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'family', label: 'Family Alerts' },
    { id: 'statistics', label: 'Stats' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/60 dark:border-slate-800/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">MediCare</span>
                <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" /> AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">Smart Medicine Reminder</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search medicine, doctor, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
          </div>

          {/* Main Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              className="bg-red-500 hover:bg-red-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-500/25 animate-bounce transition-all"
              title="Emergency SOS Helper"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">SOS Emergency</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-800 dark:text-white">Notifications ({notifications.length})</span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs border cursor-pointer transition-all ${
                            n.read
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-transparent text-slate-500'
                              : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-medium mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Auth */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="View Profile"
                >
                  <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                    alt={profile.fullName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline max-w-[90px] truncate">
                    {profile.fullName.split(' ')[0]}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2">
          <div className="mb-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMenu(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveTab('profile');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Profile & Medical Card
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
