import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Volume2, Moon, Sun, Shield, Save, Play } from 'lucide-react';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../services/storage';
import { playReminderSound, requestBrowserNotificationPermission } from '../services/notificationService';

interface SettingsTabProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ darkMode, setDarkMode }) => {
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, reminderVolume: vol };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleNotificationToggle = async (val: boolean) => {
    if (val) {
      const granted = await requestBrowserNotificationPermission();
      if (!granted) {
        alert('Browser notification permission was denied or blocked in browser settings.');
      }
    }
    const updated = { ...settings, browserNotificationsEnabled: val };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleTestChime = () => {
    playReminderSound();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" /> App Preferences & Reminders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize alert sounds, notification permissions, theme, and family safety thresholds
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-6 text-xs">
        
        {/* Sound & Volume */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <Volume2 className="w-4 h-4 text-blue-600" /> Reminder Sound & Volume
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Volume ({settings.reminderVolume}%)</span>
              <button
                onClick={handleTestChime}
                className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 hover:bg-blue-100"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Test Gentle Chime
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.reminderVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <Bell className="w-4 h-4 text-indigo-600" /> Desktop & Browser Notifications
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Push Browser Notifications</span>
              <p className="text-[11px] text-slate-500">Receive alert popups when a dose time arrives</p>
            </div>
            <input
              type="checkbox"
              checked={settings.browserNotificationsEnabled}
              onChange={(e) => handleNotificationToggle(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />} Theme Mode
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                !darkMode ? 'bg-blue-50 border-blue-600 font-bold text-blue-900' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Light Blue Medical Theme</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                darkMode ? 'bg-blue-950 border-blue-500 font-bold text-blue-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Eye-Safe Dark Mode</span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Family Safety Threshold */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <Shield className="w-4 h-4 text-rose-600" /> Family Alert Sensitivity
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Missed Doses Threshold</span>
              <p className="text-[11px] text-slate-500">Number of missed doses before notifying emergency contacts</p>
            </div>
            <span className="font-extrabold text-sm text-rose-600 bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-xl">
              3 Missed Doses
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
