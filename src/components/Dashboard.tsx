import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Volume2,
  Calendar,
  Pill,
  ArrowRight,
  RotateCcw,
  Plus,
  ShieldCheck,
  Check,
  X,
  MinusCircle,
  Bell,
  HeartPulse,
} from 'lucide-react';
import { MedicineItem, DoseLog, DoseStatus, AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { soundEngine } from '../utils/audio';

interface DashboardProps {
  medicines: MedicineItem[];
  doseLogs: DoseLog[];
  onUpdateDoseLog: (
    medicineId: string,
    medicineName: string,
    status: DoseStatus,
    timeScheduled: string,
    type: any,
    color: string
  ) => void;
  onNavigateToMedicines: () => void;
  onNavigateToAi: () => void;
  settings: AppSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  doseLogs,
  onUpdateDoseLog,
  onNavigateToMedicines,
  onNavigateToAi,
  settings,
}) => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('All');
  const [nextCountdownStr, setNextCountdownStr] = useState<string>('');
  const [upcomingMed, setUpcomingMed] = useState<MedicineItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Map today's medicine items with their log status
  const todayDoses = medicines.map((med) => {
    const existingLog = doseLogs.find((l) => l.medicineId === med.id && l.date === todayStr);
    const status: DoseStatus = existingLog ? existingLog.status : 'Pending';
    return {
      med,
      log: existingLog,
      status,
    };
  });

  const filteredDoses = todayDoses.filter((item) => {
    if (selectedTimeFilter === 'All') return true;
    return item.med.timesOfDay.includes(selectedTimeFilter);
  });

  const totalToday = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.status === 'Taken').length;
  const missedCount = todayDoses.filter((d) => d.status === 'Missed').length;
  const skippedCount = todayDoses.filter((d) => d.status === 'Skipped').length;
  const pendingCount = todayDoses.filter((d) => d.status === 'Pending').length;

  const adherencePercentage = totalToday > 0 ? Math.round((takenCount / totalToday) * 100) : 100;

  // Live countdown ticker to next upcoming dose
  useEffect(() => {
    const calculateNextDose = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let minDiff = Infinity;
      let closest: MedicineItem | null = null;

      medicines.forEach((m) => {
        if (!m.specificTime) return;
        const [h, min] = m.specificTime.split(':').map(Number);
        const medMinutes = h * 60 + min;

        let diff = medMinutes - currentMinutes;
        if (diff <= 0) diff += 24 * 60; // next day if passed

        if (diff < minDiff) {
          minDiff = diff;
          closest = m;
        }
      });

      setUpcomingMed(closest);
      if (minDiff !== Infinity) {
        const hrs = Math.floor(minDiff / 60);
        const mins = minDiff % 60;
        if (hrs > 0) {
          setNextCountdownStr(`${hrs} hr ${mins} min`);
        } else {
          setNextCountdownStr(`${mins} min`);
        }
      } else {
        setNextCountdownStr('None scheduled');
      }
    };

    calculateNextDose();
    const interval = setInterval(calculateNextDose, 30000);
    return () => clearInterval(interval);
  }, [medicines]);

  const handleAction = (item: typeof todayDoses[0], newStatus: DoseStatus) => {
    onUpdateDoseLog(
      item.med.id,
      item.med.name,
      newStatus,
      item.med.specificTime || '08:00',
      item.med.type,
      item.med.color
    );

    if (newStatus === 'Taken' && settings.notificationSound) {
      soundEngine.playSuccessChime();
    } else if (newStatus === 'Missed' && settings.notificationSound) {
      soundEngine.playReminderAlarm();
    }

    if (settings.voiceReminders && newStatus === 'Taken') {
      soundEngine.speakText(`Great job! ${item.med.name} marked as taken.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Good day! Keep up your health routine.
            </h2>
            <p className="text-emerald-100 text-sm max-w-xl">
              You have completed <strong className="text-white underline">{takenCount}</strong> of{' '}
              <strong className="text-white">{totalToday}</strong> scheduled doses today.
            </p>
          </div>

          {/* Quick Progress Dial / Bar */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 min-w-[220px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * adherencePercentage) / 100}
                  className="text-white transition-all duration-700 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-sm font-extrabold">{adherencePercentage}%</span>
            </div>
            <div>
              <div className="text-xs text-emerald-100 font-medium">Daily Adherence</div>
              <div className="text-lg font-bold text-white">
                {takenCount}/{totalToday} Taken
              </div>
              <div className="text-[11px] text-emerald-200">
                {missedCount > 0 ? `⚠️ ${missedCount} Missed` : '✓ On track'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Reminder Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Next Reminder</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {nextCountdownStr}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            {upcomingMed ? `${upcomingMed.name} at ${upcomingMed.specificTime}` : 'All doses complete for today'}
          </p>
        </div>

        {/* Completed Doses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {takenCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalToday > 0 ? `${Math.round((takenCount / totalToday) * 100)}% of today's plan` : '0 doses'}
          </p>
        </div>

        {/* Missed Doses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Missed</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            {missedCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {missedCount > 0 ? 'Caregivers automatically notified' : 'No missed doses today'}
          </p>
        </div>

        {/* Pending Doses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scheduled for later today
          </p>
        </div>
      </div>

      {/* Main Section: Today's Medicines Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>Today's Medicines</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click Taken, Skipped, or Missed to update your log instantly.
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
            {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTimeFilter === filter
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* List of Today's Doses */}
        {filteredDoses.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Pill className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No medicines found for {selectedTimeFilter === 'All' ? 'today' : selectedTimeFilter}.
            </p>
            <button
              onClick={onNavigateToMedicines}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Medicine</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoses.map(({ med, status }) => {
              const isTaken = status === 'Taken';
              const isMissed = status === 'Missed';
              const isSkipped = status === 'Skipped';

              return (
                <div
                  key={med.id}
                  className={`group p-5 rounded-2xl border transition-all ${
                    isTaken
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : isMissed
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      : isSkipped
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Med Details */}
                    <div className="flex items-start gap-4">
                      {/* Color Tag / Pill Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ backgroundColor: med.color || '#10b981' }}
                      >
                        <Pill className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {med.name}
                          </h4>

                          {/* Status Badge */}
                          {isTaken && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                              <Check className="w-3.5 h-3.5" /> Taken
                            </span>
                          )}
                          {isMissed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200">
                              <X className="w-3.5 h-3.5" /> Missed
                            </span>
                          )}
                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <MinusCircle className="w-3.5 h-3.5" /> Skipped
                            </span>
                          )}
                          {med.isEmergency && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                              CRITICAL
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <strong>Dosage:</strong> {med.dosage} • <strong>Time:</strong> {med.specificTime || '08:00 AM'} ({med.timesOfDay.join(', ')})
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                            {med.foodRequirement}
                          </span>
                          <span>•</span>
                          <span>{med.purpose}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons (Large, high-contrast, accessible) */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleAction({ med, log: undefined, status }, 'Taken')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                          isTaken
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Taken</span>
                      </button>

                      <button
                        onClick={() => handleAction({ med, log: undefined, status }, 'Skipped')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                          isSkipped
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <MinusCircle className="w-4 h-4" />
                        <span>Skip</span>
                      </button>

                      <button
                        onClick={() => handleAction({ med, log: undefined, status }, 'Missed')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                          isMissed
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Missed</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MediCare AI Quick Assistant Teaser */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Health Assistant</span>
          </div>
          <h3 className="text-xl font-bold">Unsure about medicine schedule or interactions?</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            MediCare AI can explain any medicine in simple English, check your active schedule for conflicts, and generate daily adherence reports.
          </p>
        </div>

        <button
          onClick={onNavigateToAi}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
        >
          <span>Ask MediCare AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
