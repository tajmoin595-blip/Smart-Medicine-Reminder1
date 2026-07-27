import React from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Code,
  Terminal,
  Layers,
  Bot,
  Pill,
} from 'lucide-react';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                MediCare AI – Project Documentation & System Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete README submission requirements & specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* Section 1: Overview & Problem Statement */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Project Overview & Problem Statement</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <p>
                <strong>MediCare AI</strong> is a modern, responsive, AI-powered web application designed to ensure patients—especially elderly people and chronic disease patients—take their medicines correctly and on time.
              </p>
              <p>
                <strong>Problem Addressed:</strong> Many elderly patients struggle with complex medication schedules, leading to missed doses, incorrect dosages, unintended drug interactions, or severe caregiver anxiety. MediCare AI solves this through visual reminders, dose tracking logs, family caregiver alerts, and simple English AI assistance.
              </p>
            </div>
          </section>

          {/* Section 2: AI Features & System Prompt */}
          <section className="space-y-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>AI System Prompt & Features</span>
            </h4>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">AI System Prompt Rules:</div>
              <pre className="font-mono text-[11px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
{`You are MediCare AI Assistant.
Your role is to help users understand their medicines in simple, friendly language.

Rules:
1. Never diagnose diseases.
2. Never prescribe medicines.
3. Never change dosages.
4. Never tell users to stop medications.
5. If there may be interactions or schedule conflicts, clearly explain that only a doctor or pharmacist can provide medical advice.
6. Use very simple English suitable for elderly users.
7. Be encouraging and supportive.
8. Explain medicines in 3–6 short sentences.
9. Always prioritize user safety.`}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">1. Medicine Explanation</div>
                <p className="text-[11px] text-slate-500">Explains purpose, food requirements, and safety tips in 3-6 sentences for elderly users.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">2. Schedule Conflict Checker</div>
                <p className="text-[11px] text-slate-500">Scans active schedule for timing conflicts, food requirement overlap, and duplicate medicines.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">3. Daily Adherence Report</div>
                <p className="text-[11px] text-slate-500">Generates nightly summary report with adherence score and encouraging feedback.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Tech Stack & Architecture */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Technology Stack</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white">Frontend</strong>
                <span className="text-slate-500">React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white">Backend Server</strong>
                <span className="text-slate-500">Express.js, Node.js, Vite Middleware</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white">AI Engine</strong>
                <span className="text-slate-500">@google/genai (Gemini 3.6 Flash model)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white">Persistence</strong>
                <span className="text-slate-500">Firestore & Local State Sync</span>
              </div>
            </div>
          </section>

          {/* Section 4: Installation & Environment Variables */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Installation & Environment Setup</span>
            </h4>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs space-y-2">
              <div># 1. Clone repo & install dependencies</div>
              <div className="text-emerald-400">npm install</div>
              <div className="pt-2"># 2. Configure environment variable in .env</div>
              <div className="text-amber-300">GEMINI_API_KEY="your_gemini_api_key_here"</div>
              <div className="pt-2"># 3. Start development server</div>
              <div className="text-emerald-400">npm run dev</div>
            </div>
          </section>

          {/* Section 5: Future Improvements */}
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Future Roadmaps & Improvements</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>QR Code scanning on physical medicine boxes for instant auto-scheduling</li>
              <li>Multi-language voice synthesizer in Spanish, Hindi, Tagalog, and French</li>
              <li>Google Calendar / Apple Health sync for appointment & refill integration</li>
              <li>Offline Progressive Web App (PWA) push notification worker</li>
            </ul>
          </section>

        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors text-xs"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
