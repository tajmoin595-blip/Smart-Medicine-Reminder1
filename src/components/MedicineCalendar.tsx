import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pill, CheckCircle2, Clock } from 'lucide-react';
import { getMedicines, getHistory } from '../services/storage';

export const MedicineCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const medicines = getMedicines();
  const history = getHistory();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Medication Calendar Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View past adherence and upcoming scheduled medicines day-by-day
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs px-2 text-slate-800 dark:text-white">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-xs">
          {blankDays.map((b) => (
            <div key={`blank_${b}`} className="h-24 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20" />
          ))}

          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayHistory = history.filter(h => h.date === dateStr);
            const takenCount = dayHistory.filter(h => h.status === 'Taken').length;
            const missedCount = dayHistory.filter(h => h.status === 'Missed').length;

            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day}
                className={`h-24 rounded-2xl p-2 border flex flex-col justify-between transition-all ${
                  isToday
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 font-bold ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isToday ? 'text-blue-600 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayHistory.length > 0 ? (
                    <>
                      {takenCount > 0 && (
                        <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {takenCount} Taken
                        </div>
                      )}
                      {missedCount > 0 && (
                        <div className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {missedCount} Missed
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Pill className="w-2.5 h-2.5" /> {medicines.length} scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
