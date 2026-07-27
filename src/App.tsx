import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MedicineList } from './components/MedicineList';
import { MedicineModal } from './components/MedicineModal';
import { AIStudioModal } from './components/AIStudioModal';
import { HistoryTab } from './components/HistoryTab';
import { FamilyMembersTab } from './components/FamilyMembersTab';
import { MedicineCalendar } from './components/MedicineCalendar';
import { StatisticsTab } from './components/StatisticsTab';
import { ProfileTab } from './components/ProfileTab';
import { SettingsTab } from './components/SettingsTab';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { AuthModal } from './components/AuthModal';
import { Medicine } from './types';
import { getMedicines, getSettings, subscribeStorage } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(() => getSettings().darkMode);

  // Modal States
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [isAIHubOpen, setIsAIHubOpen] = useState(false);
  const [aiInitialTool, setAiInitialTool] = useState<string>('explain');
  const [aiSelectedMedicine, setAiSelectedMedicine] = useState<Medicine | null>(null);

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [medicines, setMedicines] = useState<Medicine[]>(getMedicines());

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setMedicines(getMedicines());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleOpenAIHub = (tool: string = 'explain', medicine: Medicine | null = null) => {
    setAiInitialTool(tool);
    setAiSelectedMedicine(medicine);
    setIsAIHubOpen(true);
  };

  const handleEditMedicine = (med: Medicine) => {
    setEditingMedicine(med);
    setIsAddMedicineOpen(true);
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 relative overflow-x-hidden`}>
      
      {/* Background Ambient Frosted Glass Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-1" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float-2" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl animate-float-1" />
      </div>

      <div className="relative z-10">
        {/* Navbar Header */}
        <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenAddMedicine={() => {
              setEditingMedicine(null);
              setIsAddMedicineOpen(true);
            }}
            onOpenAIHub={handleOpenAIHub}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicineList
            medicines={medicines}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddMedicineOpen(true);
            }}
            onEditMedicine={handleEditMedicine}
            onExplainAI={(med) => handleOpenAIHub('explain', med)}
            onRefresh={() => setMedicines(getMedicines())}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'ai-hub' && (
          <div className="py-4 space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-lg flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold">MediCare AI Intelligence Suite</h1>
                <p className="text-xs text-blue-100 mt-1">Explaining medicines, scanning conflicts & summarizing health</p>
              </div>
              <button
                onClick={() => handleOpenAIHub('explain')}
                className="bg-white text-blue-700 font-bold px-4 py-2 rounded-2xl text-xs shadow"
              >
                Launch AI Hub Modal
              </button>
            </div>
            {/* Directly Render AI Hub Inside Page */}
            <Dashboard
              onOpenAddMedicine={() => setIsAddMedicineOpen(true)}
              onOpenAIHub={handleOpenAIHub}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {activeTab === 'history' && <HistoryTab />}

        {activeTab === 'calendar' && <MedicineCalendar />}

        {activeTab === 'family' && <FamilyMembersTab />}

        {activeTab === 'statistics' && <StatisticsTab />}

        {activeTab === 'profile' && <ProfileTab />}

        {activeTab === 'settings' && (
          <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </main>

      {/* Modals & Overlays */}
      <MedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => {
          setIsAddMedicineOpen(false);
          setEditingMedicine(null);
        }}
        medicineToEdit={editingMedicine}
        onSaved={() => setMedicines(getMedicines())}
        onExplainAI={(med) => handleOpenAIHub('explain', med)}
      />

      <AIStudioModal
        isOpen={isAIHubOpen}
        onClose={() => setIsAIHubOpen(false)}
        initialTool={aiInitialTool}
        selectedMedicine={aiSelectedMedicine}
      />

      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoggedIn={() => setMedicines(getMedicines())}
      />

      </div>
    </div>
  );
}
