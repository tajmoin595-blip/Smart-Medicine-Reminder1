import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  RefreshCw,
  Send,
  HelpCircle,
  FileCheck2,
  CalendarCheck2,
  CheckCircle2,
  Pill,
} from 'lucide-react';
import { MedicineItem, DoseLog } from '../types';
import { soundEngine } from '../utils/audio';

interface AiHealthAssistantProps {
  medicines: MedicineItem[];
  doseLogs: DoseLog[];
  initialMedName?: string;
}

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  medicines,
  doseLogs,
  initialMedName = '',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'explain' | 'conflict' | 'summary'>('explain');

  // Explain Feature State
  const [explainMedName, setExplainMedName] = useState(initialMedName || 'Metformin');
  const [explainPurpose, setExplainPurpose] = useState('');
  const [explainDosage, setExplainDosage] = useState('');
  const [explainResult, setExplainResult] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Conflict Checker State
  const [conflictResult, setConflictResult] = useState<string>('');
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  // Daily Summary State
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [summaryPercent, setSummaryPercent] = useState<number | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Run Explain AI
  const handleExplain = async () => {
    if (!explainMedName.trim()) return;
    setIsExplaining(true);
    setExplainResult('');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: explainMedName,
          purpose: explainPurpose,
          dosage: explainDosage,
        }),
      });
      const data = await res.json();
      setExplainResult(data.result || 'Unable to generate explanation.');
    } catch (e: any) {
      setExplainResult('Error generating explanation. Please try again or consult your doctor.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Run Conflict Check AI
  const handleConflictCheck = async () => {
    if (medicines.length === 0) {
      setConflictResult('Please add medicines to your list first to check for schedule conflicts.');
      return;
    }
    setIsCheckingConflict(true);
    setConflictResult('');
    try {
      const res = await fetch('/api/ai/conflict-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines }),
      });
      const data = await res.json();
      setConflictResult(data.result || 'No conflicts detected.');
    } catch (e: any) {
      setConflictResult('Unable to run conflict check. Please check network connection.');
    } finally {
      setIsCheckingConflict(false);
    }
  };

  // Run Daily Summary AI
  const handleDailySummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryResult('');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = doseLogs.filter((l) => l.date === todayStr);
    const takenCount = todayLogs.filter((l) => l.status === 'Taken').length;
    const missedCount = todayLogs.filter((l) => l.status === 'Missed').length;
    const totalCount = medicines.length;

    try {
      const res = await fetch('/api/ai/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takenCount,
          missedCount,
          totalCount,
          medicines,
        }),
      });
      const data = await res.json();
      setSummaryResult(data.report || 'Unable to generate report.');
      setSummaryPercent(data.adherencePercent ?? 100);
    } catch (e: any) {
      setSummaryResult('Error generating summary report.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Bot className="w-4 h-4 text-emerald-300" />
            <span>MediCare AI Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Simple, friendly health guidance</h2>
          <p className="text-emerald-100 text-xs leading-relaxed">
            Get plain English explanations of your medicines, check your schedule for potential timing conflicts, and generate daily adherence reports.
          </p>
        </div>

        {/* Safety Disclaimer Badge */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs text-emerald-100 max-w-xs shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Educational AI Only</span>
          </div>
          <p className="text-[11px]">
            MediCare AI never diagnoses or changes dosages. Always consult your doctor or pharmacist.
          </p>
        </div>
      </div>

      {/* AI Tool Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('explain')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'explain'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Medicine Explanation</span>
        </button>

        <button
          onClick={() => setActiveSubTab('conflict')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'conflict'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Schedule Conflict Checker</span>
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'summary'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Daily AI Summary</span>
        </button>
      </div>

      {/* SUB-TAB 1: Medicine Explanation */}
      {activeSubTab === 'explain' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>Medicine Simple Explanation</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type or select a medicine name to get a clear, easy-to-understand explanation suitable for elderly patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Metformin, Paracetamol, Amlodipine"
                value={explainMedName}
                onChange={(e) => setExplainMedName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purpose / Condition (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes, High Blood Pressure"
                value={explainPurpose}
                onChange={(e) => setExplainPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dosage (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 500 mg tablet"
                value={explainDosage}
                onChange={(e) => setExplainDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleExplain}
            disabled={isExplaining || !explainMedName.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {isExplaining ? (
              <span>Asking MediCare AI...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain Medicine</span>
              </>
            )}
          </button>

          {/* Result Card */}
          {explainResult && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>MediCare AI Explanation for {explainMedName}:</span>
                </span>
                
                <button
                  onClick={() => soundEngine.speakText(explainResult)}
                  title="Read Aloud Voice"
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm hover:scale-105 transition-transform text-xs font-semibold flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Voice</span>
                </button>
              </div>

              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-serif">
                {explainResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Schedule Conflict Checker */}
      {activeSubTab === 'conflict' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Medicine Schedule Conflict Checker</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MediCare AI will analyze your active schedule for timing conflicts, food requirement overlap, or duplicate medicines.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Medicines Currently in Your Schedule ({medicines.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {medicines.map((m) => (
                <span
                  key={m.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  {m.name} ({m.specificTime}, {m.foodRequirement})
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleConflictCheck}
            disabled={isCheckingConflict || medicines.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {isCheckingConflict ? (
              <span>Checking Schedule...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Run Schedule Conflict Analysis</span>
              </>
            )}
          </button>

          {conflictResult && (
            <div className="bg-amber-50/60 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>AI Schedule Conflict Report:</span>
                </span>

                <button
                  onClick={() => soundEngine.speakText(conflictResult)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 shadow-sm text-xs font-semibold flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Voice</span>
                </button>
              </div>

              <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif">
                {conflictResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Daily Summary */}
      {activeSubTab === 'summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
              <span>Daily AI Adherence Report & Encouragement</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate a personalized nightly summary report celebrating your completed doses and encouraging adherence.
            </p>
          </div>

          <button
            onClick={handleDailySummary}
            disabled={isGeneratingSummary}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {isGeneratingSummary ? (
              <span>Generating Report...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Today's AI Summary</span>
              </>
            )}
          </button>

          {summaryResult && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-4">
              {summaryPercent !== null && (
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                  Adherence Rate: {summaryPercent}%
                </div>
              )}

              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-serif">
                {summaryResult}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
