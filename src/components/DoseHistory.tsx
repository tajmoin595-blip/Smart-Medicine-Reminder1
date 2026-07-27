import React, { useState } from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Calendar,
  Printer,
  FileText,
  Filter,
  Check,
  X,
  Pill,
} from 'lucide-react';
import { DoseLog, DoseStatus } from '../types';

interface DoseHistoryProps {
  logs: DoseLog[];
}

export const DoseHistory: React.FC<DoseHistoryProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.medicineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesDate = !dateFilter || log.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalLogs = filteredLogs.length;
  const takenCount = filteredLogs.filter((l) => l.status === 'Taken').length;
  const missedCount = filteredLogs.filter((l) => l.status === 'Missed').length;
  const skippedCount = filteredLogs.filter((l) => l.status === 'Skipped').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            <span>Medication History Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete record of taken, skipped, and missed doses over time for your doctor's review.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start md:self-auto print:hidden"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Doses</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalLogs}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Taken Doses</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{takenCount}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-800 dark:text-red-300 font-medium">Missed Doses</div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">{missedCount}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">Skipped Doses</div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-200">{skippedCount}</div>
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Medicine Name Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 hidden sm:block" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {['All', 'Taken', 'Missed', 'Skipped'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No dose logs match your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Medicine</th>
                  <th className="p-4">Scheduled Time</th>
                  <th className="p-4">Log Date</th>
                  <th className="p-4">Recorded Status</th>
                  <th className="p-4">Action Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredLogs.map((log) => {
                  const isTaken = log.status === 'Taken';
                  const isMissed = log.status === 'Missed';
                  const isSkipped = log.status === 'Skipped';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: log.color || '#10b981' }}
                        >
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{log.medicineName}</div>
                          <span className="text-[11px] text-slate-500 font-normal">{log.type}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {log.time || log.scheduledTime}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {log.date}
                      </td>
                      <td className="p-4">
                        {isTaken && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Taken
                          </span>
                        )}
                        {isMissed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
                            <X className="w-3.5 h-3.5" /> Missed
                          </span>
                        )}
                        {isSkipped && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <MinusCircle className="w-3.5 h-3.5" /> Skipped
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {log.actionTime || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
