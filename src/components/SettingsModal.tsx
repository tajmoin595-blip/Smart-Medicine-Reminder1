import React from 'react';
import {
  Settings,
  X,
  Volume2,
  Moon,
  Sun,
  Globe,
  Clock,
  Mic,
  Type,
  Check,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Application Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Theme Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Dark Mode Theme</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Eye-safe high-contrast dark theme</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.darkMode ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound & Volume */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Notification Sound</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Audio chime when reminder arrives</div>
                </div>
              </div>

              <button
                onClick={() => onUpdateSettings({ ...settings, notificationSound: !settings.notificationSound })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.notificationSound ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notificationSound ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.notificationSound && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Sound Volume</span>
                  <span>{settings.soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) => onUpdateSettings({ ...settings, soundVolume: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Voice Reminders */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-teal-600" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Voice Readout (TTS)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Speaks medicine reminders out loud</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ ...settings, voiceReminders: !settings.voiceReminders })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.voiceReminders ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.voiceReminders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reminder Interval */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Escalation Reminder Interval</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Re-trigger chime if dose ignored</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[15, 30].map((interval) => (
                <button
                  key={interval}
                  onClick={() => onUpdateSettings({ ...settings, reminderInterval: interval })}
                  className={`py-2 rounded-xl font-bold transition-colors ${
                    settings.reminderInterval === interval
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  Every {interval} mins
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Language Selection</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Interface language preference</div>
              </div>
            </div>

            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-semibold"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="French">French (Français)</option>
              <option value="Tagalog">Tagalog</option>
            </select>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
