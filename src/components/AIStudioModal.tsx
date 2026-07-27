import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  HelpCircle, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Medicine } from '../types';
import { getMedicines, getHistory } from '../services/storage';
import { 
  explainMedicineAI, 
  checkScheduleConflictsAI, 
  getDailyHealthSummaryAI, 
  getMissedDoseAdviceAI 
} from '../services/aiService';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: string;
  selectedMedicine?: Medicine | null;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  isOpen,
  onClose,
  initialTool = 'explain',
  selectedMedicine = null
}) => {
  const [activeTool, setActiveTool] = useState<string>(initialTool);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  // Tool 1: Explanation State
  const [explainQuery, setExplainQuery] = useState('');
  const [selectedMedForExplain, setSelectedMedForExplain] = useState<Medicine | null>(selectedMedicine);
  const [explainResult, setExplainResult] = useState<any>(null);

  // Tool 2: Conflict Checker State
  const [conflictReport, setConflictReport] = useState<any>(null);

  // Tool 3: Daily Summary State
  const [summaryReport, setSummaryReport] = useState<any>(null);

  // Tool 4: Missed Dose Assistant State
  const [missedMedName, setMissedMedName] = useState('');
  const [missedAdvice, setMissedAdvice] = useState<any>(null);

  useEffect(() => {
    setActiveTool(initialTool);
    if (selectedMedicine) {
      setSelectedMedForExplain(selectedMedicine);
      setExplainQuery(selectedMedicine.name);
    }
  }, [initialTool, selectedMedicine, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const loaded = getMedicines();
      setMedicines(loaded);
      if (loaded.length > 0 && !selectedMedForExplain) {
        setSelectedMedForExplain(loaded[0]);
        setExplainQuery(loaded[0].name);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Run Tool 1: Explain Medicine
  const handleRunExplain = async (medToUse?: Medicine) => {
    const med = medToUse || selectedMedForExplain;
    const nameToExplain = med?.name || explainQuery;
    if (!nameToExplain.trim()) return;

    setLoading(true);
    setExplainResult(null);

    const result = await explainMedicineAI(med || { name: nameToExplain });
    setExplainResult(result);
    setLoading(false);
  };

  // Run Tool 2: Conflict Checker
  const handleRunConflictCheck = async () => {
    setLoading(true);
    setConflictReport(null);
    const result = await checkScheduleConflictsAI(medicines);
    setConflictReport(result);
    setLoading(false);
  };

  // Run Tool 3: Daily Summary
  const handleRunDailySummary = async () => {
    setLoading(true);
    setSummaryReport(null);

    const history = getHistory();
    const today = new Date().toISOString().split('T')[0];
    const todayHist = history.filter(h => h.date === today);

    const takenCount = todayHist.filter(h => h.status === 'Taken').length;
    const missedCount = todayHist.filter(h => h.status === 'Missed').length;
    const skippedCount = todayHist.filter(h => h.status === 'Skipped').length;

    const result = await getDailyHealthSummaryAI(takenCount, missedCount, skippedCount, medicines);
    setSummaryReport(result);
    setLoading(false);
  };

  // Run Tool 4: Missed Dose Advice
  const handleRunMissedAdvice = async () => {
    const name = missedMedName || (medicines[0]?.name || 'Medication');
    setLoading(true);
    setMissedAdvice(null);
    const result = await getMissedDoseAdviceAI(name);
    setMissedAdvice(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">MediCare AI Intelligence Hub</h2>
              <p className="text-xs text-blue-100">Powered by Google Gemini 3.6 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Tools Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTool('explain')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all ${
              activeTool === 'explain'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Medicine Explainer
          </button>

          <button
            onClick={() => setActiveTool('conflict')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all ${
              activeTool === 'conflict'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Schedule Conflict Checker
          </button>

          <button
            onClick={() => setActiveTool('summary')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all ${
              activeTool === 'summary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Daily Health Summary
          </button>

          <button
            onClick={() => setActiveTool('missed')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all ${
              activeTool === 'missed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Missed Dose Assistant
          </button>
        </div>

        {/* Modal Tool Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* TOOL 1: MEDICINE EXPLANATION */}
          {activeTool === 'explain' && (
            <div className="space-y-4">
              <div className="bg-blue-50/80 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
                <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">Simple English Medicine Explainer</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Select a medicine from your active list or type any medication name to receive a clear, plain-language explanation designed for elderly patients.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {medicines.length > 0 && (
                  <select
                    value={selectedMedForExplain?.id || ''}
                    onChange={(e) => {
                      const found = medicines.find(m => m.id === e.target.value);
                      setSelectedMedForExplain(found || null);
                      if (found) setExplainQuery(found.name);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                  >
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="Or enter medication name..."
                  value={explainQuery}
                  onChange={(e) => setExplainQuery(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />

                <button
                  onClick={() => handleRunExplain()}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Explain
                </button>
              </div>

              {explainResult && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="font-extrabold text-sm text-blue-700 dark:text-blue-300">
                      📖 {explainResult.medicineName} Overview
                    </h4>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">Senior Friendly</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Summary</h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{explainResult.summary}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">How It Works</h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{explainResult.howItWorks}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Food Instructions</h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{explainResult.foodInstructions}</p>
                  </div>

                  {explainResult.commonSideEffects?.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Common Mild Side Effects</h5>
                      <ul className="list-disc pl-5 space-y-0.5 text-slate-600 dark:text-slate-300">
                        {explainResult.commonSideEffects.map((se: string, i: number) => (
                          <li key={i}>{se}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-medium italic mt-3">
                    {explainResult.safetyDisclaimer}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 2: CONFLICT CHECKER */}
          {activeTool === 'conflict' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 mb-1">Schedule Conflict & Timing Review</h3>
                <p className="text-amber-800 dark:text-amber-300">
                  Gemini AI will scan your active prescription schedule ({medicines.length} medicines) for close timing overlaps, duplicate drug groups, or food requirement clashes.
                </p>
              </div>

              <button
                onClick={handleRunConflictCheck}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Run Schedule Conflict Scan Now
              </button>

              {conflictReport && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Analysis Results</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      conflictReport.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                      conflictReport.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      Severity: {conflictReport.severity?.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Findings</h5>
                    <ul className="space-y-1">
                      {conflictReport.findings?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <span className="text-blue-500 font-bold">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Recommendations</h5>
                    <ul className="space-y-1">
                      {conflictReport.recommendations?.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-700">
                    {conflictReport.disclaimer || 'For personal medical advice, please consult your doctor or pharmacist.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TOOL 3: DAILY SUMMARY */}
          {activeTool === 'summary' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40">
                <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 mb-1">Daily Health Adherence Summary</h3>
                <p className="text-indigo-800 dark:text-indigo-300">
                  Generates an encouraging, personalized nightly report summarizing today's medication completion rate and adherence tips.
                </p>
              </div>

              <button
                onClick={handleRunDailySummary}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                Generate Today's AI Summary
              </button>

              {summaryReport && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{summaryReport.summaryTitle}</h4>
                    <span className="text-xs font-bold text-emerald-600">{summaryReport.completionRate}% Adherence</span>
                  </div>

                  <div className="space-y-1">
                    {summaryReport.insights?.map((ins: string, i: number) => (
                      <p key={i} className="text-slate-600 dark:text-slate-300 font-medium">✨ {ins}</p>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold italic">
                    "{summaryReport.motivationalMessage}"
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 4: MISSED DOSE ASSISTANT */}
          {activeTool === 'missed' && (
            <div className="space-y-4">
              <div className="bg-rose-50/80 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200 mb-1">Missed Dose Guidance Assistant</h3>
                <p className="text-rose-800 dark:text-rose-300">
                  Select a medicine you missed to receive clear, calm instructions on what to do safely.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter missed medicine name..."
                  value={missedMedName}
                  onChange={(e) => setMissedMedName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />

                <button
                  onClick={handleRunMissedAdvice}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />} Get Advice
                </button>
              </div>

              {missedAdvice && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                  <h4 className="font-extrabold text-sm text-rose-600">Guidance for Missed Dose: {missedAdvice.medicineName}</h4>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {missedAdvice.importanceExplanation}
                  </p>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Recommended Safety Steps</h5>
                    <ul className="space-y-1">
                      {missedAdvice.recommendedActions?.map((act: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <span className="text-rose-500 font-bold">✓</span> {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-semibold italic">
                    {missedAdvice.disclaimer}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
