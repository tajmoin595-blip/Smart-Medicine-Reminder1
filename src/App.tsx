import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MedicineManager } from './components/MedicineManager';
import { DoseHistory } from './components/DoseHistory';
import { FamilyCaregiver } from './components/FamilyCaregiver';
import { AiHealthAssistant } from './components/AiHealthAssistant';
import { Statistics } from './components/Statistics';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ProjectDocsModal } from './components/ProjectDocsModal';

import { MedicineItem, DoseLog, DoseStatus, FamilyMember, CaregiverAlert, AppSettings, UserProfile } from './types';
import { StorageService } from './services/storage';
import { soundEngine } from './utils/audio';
import { requestNotificationPermission, sendBrowserNotification } from './utils/notifications';
import { Bell, ShieldAlert, CheckCircle2, Clock, X, Volume2, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // State loaded from StorageService
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [caregiverAlerts, setCaregiverAlerts] = useState<CaregiverAlert[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getUserProfile());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Active Reminder Alarm Banner State
  const [activeAlarmMed, setActiveAlarmMed] = useState<MedicineItem | null>(null);

  // Initial load
  useEffect(() => {
    setMedicines(StorageService.getMedicines());
    setDoseLogs(StorageService.getDoseLogs());
    setFamilyMembers(StorageService.getFamilyMembers());
    setCaregiverAlerts(StorageService.getCaregiverAlerts());

    // Request notification permission
    requestNotificationPermission();
  }, []);

  // Sync dark mode class on document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Interval checker for active reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHoursStr = String(now.getHours()).padStart(2, '0');
      const currentMinsStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHoursStr}:${currentMinsStr}`;

      const todayStr = now.toISOString().split('T')[0];

      medicines.forEach((med) => {
        if (med.specificTime === currentTimeStr) {
          // Check if already logged today
          const exists = doseLogs.some((l) => l.medicineId === med.id && l.date === todayStr);
          if (!exists) {
            setActiveAlarmMed(med);

            if (settings.notificationSound) {
              soundEngine.playReminderAlarm();
            }

            if (settings.voiceReminders) {
              soundEngine.speakText(`Time to take your medicine: ${med.name}. Dosage: ${med.dosage}.`);
            }

            sendBrowserNotification(`Time for ${med.name}!`, {
              body: `Dosage: ${med.dosage} (${med.foodRequirement})`,
              tag: med.id,
            });
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, [medicines, doseLogs, settings]);

  // Medicine CRUD Operations
  const handleAddMedicine = (newMed: Omit<MedicineItem, 'id' | 'createdAt'>) => {
    const created = StorageService.addMedicine(newMed);
    setMedicines(StorageService.getMedicines());

    if (settings.notificationSound) {
      soundEngine.playSuccessChime();
    }
  };

  const handleUpdateMedicine = (updated: MedicineItem) => {
    StorageService.updateMedicine(updated);
    setMedicines(StorageService.getMedicines());
  };

  const handleDeleteMedicine = (id: string) => {
    StorageService.deleteMedicine(id);
    setMedicines(StorageService.getMedicines());
  };

  // Dose Logging
  const handleUpdateDoseLog = (
    medicineId: string,
    medicineName: string,
    status: DoseStatus,
    timeScheduled: string,
    type: any,
    color: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    StorageService.logDose({
      medicineId,
      medicineName,
      status,
      date: todayStr,
      scheduledTime: timeScheduled,
      type,
      color,
    });
    setDoseLogs(StorageService.getDoseLogs());

    // If missed or critical emergency medicine skipped -> trigger caregiver alert
    if (status === 'Missed') {
      const activeMembers = StorageService.getFamilyMembers();
      activeMembers.forEach((mem) => {
        if (mem.notifyOnMissed) {
          StorageService.addCaregiverAlert({
            memberId: mem.id,
            memberName: mem.name,
            alertType: 'Missed Dose Alert',
            medicineName,
            status: 'Delivered',
          });
        }
      });
      setCaregiverAlerts(StorageService.getCaregiverAlerts());
    }

    if (activeAlarmMed && activeAlarmMed.id === medicineId) {
      setActiveAlarmMed(null);
    }
  };

  // Caregiver CRUD
  const handleAddFamilyMember = (mem: Omit<FamilyMember, 'id'>) => {
    StorageService.addFamilyMember(mem);
    setFamilyMembers(StorageService.getFamilyMembers());
  };

  const handleDeleteFamilyMember = (id: string) => {
    StorageService.deleteFamilyMember(id);
    setFamilyMembers(StorageService.getFamilyMembers());
  };

  const handleTriggerSos = () => {
    const activeMembers = StorageService.getFamilyMembers();
    activeMembers.forEach((mem) => {
      StorageService.addCaregiverAlert({
        memberId: mem.id,
        memberName: mem.name,
        alertType: '🚨 SOS EMERGENCY ALERT',
        medicineName: 'Patient Triggered Instant Help Request',
        status: 'Delivered (High Priority)',
      });
    });
    setCaregiverAlerts(StorageService.getCaregiverAlerts());

    if (settings.notificationSound) {
      soundEngine.playReminderAlarm();
    }
    if (settings.voiceReminders) {
      soundEngine.speakText('SOS Emergency Alert delivered to all family caregivers.');
    }
    alert('🚨 Emergency SOS alert sent to all registered family caregivers!');
  };

  // Update Settings & User Profile
  const handleUpdateSettings = (newSet: AppSettings) => {
    setSettings(newSet);
    StorageService.saveSettings(newSet);
  };

  const handleSaveUser = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.saveUserProfile(user);
  };

  // Quick navigation helpers
  const handleExplainMedicineFromCabinet = (medName: string) => {
    setActiveTab('ai');
  };

  return (
    <div className="min-[#0f172a] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onTriggerSos={handleTriggerSos}
        settings={settings}
        currentUser={currentUser}
      />

      {/* Live Alarm Banner when a dose reminder fires */}
      {activeAlarmMed && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base">
                ⏰ REMINDER: Time to take {activeAlarmMed.name}!
              </div>
              <div className="text-xs text-red-100">
                Dosage: {activeAlarmMed.dosage} • Requirement: {activeAlarmMed.foodRequirement}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleUpdateDoseLog(
                  activeAlarmMed.id,
                  activeAlarmMed.name,
                  'Taken',
                  activeAlarmMed.specificTime || '08:00',
                  activeAlarmMed.type,
                  activeAlarmMed.color
                )
              }
              className="px-5 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow-md hover:bg-red-50 transition-colors"
            >
              ✓ Take Now
            </button>
            <button
              onClick={() => setActiveAlarmMed(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Snooze 15m
            </button>
          </div>
        </div>
      )}

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            medicines={medicines}
            doseLogs={doseLogs}
            onUpdateDoseLog={handleUpdateDoseLog}
            onNavigateToMedicines={() => setActiveTab('medicines')}
            onNavigateToAi={() => setActiveTab('ai')}
            settings={settings}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicineManager
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onExplainMedicine={handleExplainMedicineFromCabinet}
          />
        )}

        {activeTab === 'history' && <DoseHistory logs={doseLogs} />}

        {activeTab === 'family' && (
          <FamilyCaregiver
            members={familyMembers}
            alerts={caregiverAlerts}
            onAddMember={handleAddFamilyMember}
            onDeleteMember={handleDeleteFamilyMember}
            onTriggerSos={handleTriggerSos}
          />
        )}

        {activeTab === 'ai' && <AiHealthAssistant medicines={medicines} doseLogs={doseLogs} />}

        {activeTab === 'stats' && <Statistics medicines={medicines} logs={doseLogs} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">MediCare AI</span>
            <span>• Smart Medicine Reminder & Health Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDocsOpen(true)} className="hover:underline">
              Project Documentation
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:underline">
              Settings
            </button>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
      />

      <ProjectDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
