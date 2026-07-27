import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { MedicineHistoryItem, DoseStatus } from '../types';
import { getHistory, getProfile } from '../services/storage';

export const HistoryTab: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<MedicineHistoryItem[]>(getHistory());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'weekly' | 'monthly' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);

  const profile = getProfile();

  const handleRefresh = () => {
    setHistoryItems(getHistory());
  };

  const filteredHistory = historyItems.filter((item) => {
    // Status filter
    if (statusFilter !== 'All' && item.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.date) >= weekAgo;
    }

    if (dateFilter === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return new Date(item.date) >= monthAgo;
    }

    if (dateFilter === 'custom') {
      if (customStartDate && new Date(item.date) < new Date(customStartDate)) return false;
      if (customEndDate && new Date(item.date) > new Date(customEndDate)) return false;
    }

    return true;
  });

  const totalDoses = filteredHistory.length;
  const takenDoses = filteredHistory.filter(h => h.status === 'Taken').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Medicine History Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track taken, missed, and skipped medication doses over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCertificate(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Award className="w-4 h-4" /> Adherence Certificate
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Export PDF / Print
          </button>
        </div>
      </div>

      {/* Filter Bar - Print Hidden */}
      <div className="glass-panel p-4 rounded-3xl space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Range Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="font-semibold text-slate-500 mr-1">Range:</span>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                dateFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('weekly')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                dateFilter === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDateFilter('monthly')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                dateFilter === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                dateFilter === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Taken">Taken</option>
              <option value="Missed">Missed</option>
              <option value="Skipped">Skipped</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if Custom Range selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 font-medium mr-1">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border"
              />
            </div>
            <div>
              <span className="text-slate-500 font-medium mr-1">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border"
              />
            </div>
          </div>
        )}
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-slate-900 mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">MediCare AI – Official Medication History Report</h1>
        <p className="text-sm text-slate-600 mt-1">Patient: {profile.fullName} | Age: {profile.age} | Generated on: {new Date().toLocaleDateString()}</p>
        <p className="text-xs text-slate-500 mt-1">Adherence Rate: {adherenceRate}% across {totalDoses} doses</p>
      </div>

      {/* History Log Table */}
      <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Medicine</th>
                <th className="p-4">Dosage</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No history records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.date} ({item.scheduledTime})
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {item.medicineName}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {item.dosage}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {item.slot}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.status === 'Taken' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        item.status === 'Missed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {item.status === 'Taken' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Missed' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {item.actionTime ? new Date(item.actionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adherence Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-3xl p-8 border-4 border-amber-400 shadow-2xl space-y-6 text-center relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🏆
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Official Award</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Medication Adherence Excellence</h2>
              <p className="text-xs text-slate-500 mt-1">Presented by MediCare AI Smart Health System</p>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800 p-4 rounded-2xl border border-amber-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                This certifies that <strong className="text-blue-600">{profile.fullName}</strong> has maintained an outstanding medication adherence rate of:
              </p>
              <div className="text-4xl font-black text-amber-600 my-2">{adherenceRate}%</div>
              <p className="text-xs text-slate-500">
                Recognized for exemplary consistency and dedication to personal healthcare.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
