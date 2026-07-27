import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  X, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  BellRing, 
  Pill, 
  Calendar, 
  ChevronRight, 
  Info,
  ShieldCheck,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Medicine, MedicineHistoryItem, TimeSlot } from '../types';
import { getMedicines, getHistory, recordDose, getFamilyMembers } from '../services/storage';
import { fetchDailyHealthTipAI, getDailyHealthSummaryAI } from '../services/aiService';
import { triggerBrowserNotification } from '../services/notificationService';

interface DashboardProps {
  onOpenAddMedicine: () => void;
  onOpenAIHub: (tool?: string) => void;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAddMedicine,
  onOpenAIHub,
  setActiveTab,
  searchQuery = ''
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<MedicineHistoryItem[]>([]);
  const [healthTip, setHealthTip] = useState<{ tip: string; category: string } | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    setMedicines(getMedicines());
    setHistory(getHistory());
  };

  useEffect(() => {
    fetchTip();
  }, []);

  const fetchTip = async () => {
    setLoadingTip(true);
    const data = await fetchDailyHealthTipAI();
    setHealthTip(data);
    setLoadingTip(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHistory = history.filter(h => h.date === todayStr);

  // Derive today's scheduled doses
  interface DailyDoseItem {
    medicine: Medicine;
    slot: TimeSlot;
    time: string;
    status: 'Taken' | 'Missed' | 'Skipped' | 'Pending';
  }

  const dailyDoses: DailyDoseItem[] = [];
  medicines.forEach(med => {
    med.times.forEach(t => {
      if (t.enabled) {
        // check history status
        const recorded = todayHistory.find(h => h.medicineId === med.id && h.slot === t.slot);
        let status: DailyDoseItem['status'] = 'Pending';
        if (recorded) {
          status = recorded.status as DailyDoseItem['status'];
        } else {
          // If past time today, consider missed
          const [hStr, mStr] = t.time.split(':');
          const schedDate = new Date();
          schedDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
          if (now > schedDate && now.getTime() - schedDate.getTime() > 30 * 60 * 1000) {
            status = 'Missed';
          }
        }

        dailyDoses.push({
          medicine: med,
          slot: t.slot,
          time: t.time,
          status
        });
      }
    });
  });

  // Filter by search query if present
  const filteredDoses = dailyDoses.filter(d => 
    d.medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.medicine.disease?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.medicine.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = dailyDoses.filter(d => d.status === 'Taken').length;
  const missedCount = dailyDoses.filter(d => d.status === 'Missed').length;
  const totalCount = dailyDoses.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Next upcoming reminder logic
  const upcomingDoses = dailyDoses
    .filter(d => d.status === 'Pending')
    .sort((a, b) => a.time.localeCompare(b.time));

  const nextReminder = upcomingDoses[0];

  const handleAction = (med: Medicine, slot: TimeSlot, time: string, actionStatus: 'Taken' | 'Missed' | 'Skipped') => {
    recordDose(
      med.id,
      med.name,
      med.dosage,
      med.type,
      time,
      slot,
      actionStatus
    );
    loadData();

    if (actionStatus === 'Taken') {
      triggerBrowserNotification(
        'Medicine Taken! Great Job!',
        `You marked ${med.name} (${med.dosage}) as taken for ${slot}.`
      );
    }
  };

  const toggleSpeakSchedule = () => {
    if (!('speechSynthesis' in window)) {
      alert("Voice speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    let text = "Hello! Here is your medicine status for today. ";
    if (dailyDoses.length === 0) {
      text += "You have no medicines scheduled for today.";
    } else {
      const pending = dailyDoses.filter(d => d.status === 'Pending');
      if (pending.length === 0) {
        text += "Wonderful news! You have taken all your scheduled medicines for today.";
      } else {
        text += `You have ${completedCount} taken and ${pending.length} remaining doses. `;
        if (nextReminder) {
          text += `Your next medicine is ${nextReminder.medicine.name}, dosage ${nextReminder.medicine.dosage}, scheduled for ${nextReminder.slot} at ${nextReminder.time}. `;
          if (nextReminder.medicine.foodTiming) {
            text += `Take it ${nextReminder.medicine.foodTiming}.`;
          }
        }
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const timeSlots: { name: TimeSlot; icon: any; color: string; bg: string }[] = [
    { name: 'Morning', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Afternoon', icon: CloudSun, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
    { name: 'Evening', icon: Sunset, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { name: 'Night', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Top Banner & Quick Add */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Good day, Eleanor!</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-md">
              {progressPercent === 100 && totalCount > 0
                ? "🎉 Fantastic! You have completed all scheduled medicines for today."
                : `You have completed ${completedCount} of ${totalCount} doses today. Keep up the great health routine!`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleSpeakSchedule}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                isSpeaking 
                  ? 'bg-amber-400 text-amber-950 animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop Audio' : '🔊 Listen Schedule'}
            </button>
            <button
              onClick={onOpenAddMedicine}
              className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
            <button
              onClick={() => onOpenAIHub()}
              className="bg-blue-500/40 hover:bg-blue-500/60 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> AI Schedule Review
            </button>
          </div>
        </div>
      </div>

      {/* Missed Threshold Alert Banner */}
      {missedCount >= 2 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Attention: Missed Doses Detected</h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              You have missed {missedCount} doses today. If 3 doses are missed consecutively, MediCare AI will automatically send an SMS/Email alert to your emergency contact.
            </p>
          </div>
          <button
            onClick={() => onOpenAIHub('missed')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Ask AI Advice →
          </button>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Progress Circle Card */}
        <div className="glass-card rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Adherence Progress</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{progressPercent}%</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{completedCount} of {totalCount} Taken</p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-blue-600 transition-all duration-700"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-800 dark:text-white">{progressPercent}%</span>
          </div>
        </div>

        {/* Completed Medicines */}
        <div className="glass-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center backdrop-blur-md">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Taken Today</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{completedCount}</h3>
            <span className="text-[10px] text-slate-400">Doses completed</span>
          </div>
        </div>

        {/* Missed / Pending */}
        <div className="glass-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50/80 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center backdrop-blur-md">
            <X className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Missed / Pending</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{dailyDoses.length - completedCount}</h3>
            <span className="text-[10px] text-rose-500 font-medium">{missedCount} Missed</span>
          </div>
        </div>

        {/* Total Active Medicines */}
        <div className="glass-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center backdrop-blur-md">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Prescriptions</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{medicines.length}</h3>
            <span className="text-[10px] text-slate-400">In schedule</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Next Reminder & Schedule vs AI Tip & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Next Reminder & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Reminder Hero Card */}
          {nextReminder ? (
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-400/20">
                  <BellRing className="w-3.5 h-3.5 text-amber-300 animate-bounce" /> Next Upcoming Reminder
                </span>
                <span className="text-xs text-slate-300 font-mono font-medium">
                  Scheduled for {nextReminder.time} ({nextReminder.slot})
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{nextReminder.medicine.name}</h2>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Dosage: <strong className="text-white">{nextReminder.medicine.dosage}</strong> • {nextReminder.medicine.foodTiming}
                  </p>
                  {nextReminder.medicine.purpose && (
                    <p className="text-xs text-slate-300 mt-2 bg-white/10 px-3 py-1.5 rounded-xl inline-block max-w-md">
                      💡 {nextReminder.medicine.purpose}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/50 flex items-center justify-center text-white text-xl font-bold border border-white/20">
                  💊
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleAction(nextReminder.medicine, nextReminder.slot, nextReminder.time, 'Taken')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Mark as Taken
                </button>
                <button
                  onClick={() => handleAction(nextReminder.medicine, nextReminder.slot, nextReminder.time, 'Skipped')}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Skip Dose
                </button>
                <button
                  onClick={() => {
                    alert("Reminder snoozed for 10 minutes!");
                    triggerBrowserNotification("Reminder Snoozed", `Snoozed ${nextReminder.medicine.name} for 10 minutes.`);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" /> Snooze 10m
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 text-emerald-900 dark:text-emerald-200 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base">All Reminders Up To Date!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  You have completed or responded to all upcoming medicine reminders for today.
                </p>
              </div>
            </div>
          )}

          {/* Today's Schedule by Time Slots */}
          <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Schedule</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Organized by time of day</p>
              </div>
              <button
                onClick={() => setActiveTab('medicines')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All ({medicines.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {timeSlots.map((slotInfo) => {
              const SlotIcon = slotInfo.icon;
              const slotDoses = filteredDoses.filter(d => d.slot === slotInfo.name);

              return (
                <div key={slotInfo.name} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${slotInfo.bg} ${slotInfo.color}`}>
                        <SlotIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{slotInfo.name} Slot</span>
                      <span className="text-[10px] text-slate-400 font-medium">({slotDoses.length} items)</span>
                    </div>
                  </div>

                  {slotDoses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1 pl-2">No medicines scheduled for {slotInfo.name.toLowerCase()}.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {slotDoses.map((item, idx) => (
                        <div
                          key={`${item.medicine.id}_${item.slot}_${idx}`}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            item.status === 'Taken'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                              : item.status === 'Missed'
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">{item.medicine.name}</span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700">
                                {item.medicine.dosage}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              ⏰ {item.time} • {item.medicine.foodTiming}
                            </p>
                          </div>

                          <div>
                            {item.status === 'Taken' ? (
                              <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                <Check className="w-3 h-3" /> Taken
                              </span>
                            ) : item.status === 'Missed' ? (
                              <button
                                onClick={() => handleAction(item.medicine, item.slot, item.time, 'Taken')}
                                className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-rose-700 transition-colors"
                              >
                                Take Late
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleAction(item.medicine, item.slot, item.time, 'Taken')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg text-[10px] font-bold"
                                  title="Mark as Taken"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAction(item.medicine, item.slot, item.time, 'Skipped')}
                                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-lg text-[10px]"
                                  title="Skip"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (1 col): AI Health Tip, Quick AI Hub & Refill Alert */}
        <div className="space-y-6">
          
          {/* Today's AI Health Tip Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/60 rounded-3xl p-5 border border-blue-200/60 dark:border-blue-900/40 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Today's AI Health Tip
              </span>
              <button
                onClick={fetchTip}
                disabled={loadingTip}
                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Refresh AI tip"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTip ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{healthTip ? healthTip.tip : "Loading daily health insight..."}"
            </p>

            <div className="mt-3 pt-3 border-t border-blue-200/40 dark:border-blue-900/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Category: <strong>{healthTip?.category || 'Wellness'}</strong></span>
              <span>By MediCare AI</span>
            </div>
          </div>

          {/* AI Features Quick Access Hub */}
          <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> AI Assistant Shortcuts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gemini AI models trained for elderly medication safety and schedule optimization.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => onOpenAIHub('explain')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-white/60 dark:border-slate-700/60 text-left transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    📖 Medicine Explanation
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Simple English breakdown for elderly users</p>
              </button>

              <button
                onClick={() => onOpenAIHub('conflict')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-white/60 dark:border-slate-700/60 text-left transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    ⚠️ Schedule Conflict Checker
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Detect close reminders & food timing issues</p>
              </button>

              <button
                onClick={() => onOpenAIHub('summary')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-white/60 dark:border-slate-700/60 text-left transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    📊 Daily Health Summary
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Nightly adherence report & encouragement</p>
              </button>
            </div>
          </div>

          {/* Refill Reminders Card */}
          <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-500" /> Pill Inventory & Refills
            </h3>

            <div className="space-y-2">
              {medicines.map((med) => {
                if (med.remainingPills === undefined) return null;
                const isLow = med.remainingPills <= 20;
                return (
                  <div key={med.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{med.name}</span>
                      <p className="text-[10px] text-slate-500">{med.dosage}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {med.remainingPills} pills left
                      </span>
                      {isLow && (
                        <p className="text-[9px] text-rose-500 font-semibold">Refill soon!</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
