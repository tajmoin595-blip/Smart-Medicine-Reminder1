import React, { useState } from 'react';
import { Pill, Plus, Search, Edit3, Trash2, Sparkles, Filter, Stethoscope, Clock, AlertCircle } from 'lucide-react';
import { Medicine } from '../types';
import { deleteMedicine } from '../services/storage';

interface MedicineListProps {
  medicines: Medicine[];
  onOpenAddModal: () => void;
  onEditMedicine: (med: Medicine) => void;
  onExplainAI: (med: Medicine) => void;
  onRefresh: () => void;
  searchQuery: string;
}

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  onOpenAddModal,
  onEditMedicine,
  onExplainAI,
  onRefresh,
  searchQuery
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');

  const query = searchQuery || localSearch;

  const filteredMedicines = medicines.filter((med) => {
    const matchesQuery =
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(query.toLowerCase()) ||
      med.disease?.toLowerCase().includes(query.toLowerCase()) ||
      med.doctorName?.toLowerCase().includes(query.toLowerCase());

    const matchesType = filterType === 'All' || med.type === filterType;

    return matchesQuery && matchesType;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from your schedule?`)) {
      deleteMedicine(id);
      onRefresh();
    }
  };

  const medicineTypes = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Cream'];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" /> Prescribed Medicines List
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your active prescriptions, refill levels, and doctor instructions
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, disease, doctor..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {medicineTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Cards Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
            💊
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No Medicines Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {query || filterType !== 'All'
              ? 'No medicines match your active search or filter criteria.'
              : 'You have not added any medicines yet. Click "Add New Medicine" to create your first prescription schedule.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const enabledSlots = med.times.filter(t => t.enabled);

            return (
              <div
                key={med.id}
                className="glass-card rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {med.name}
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
                          {med.dosage}
                        </span>
                      </div>
                      {med.genericName && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">{med.genericName}</p>
                      )}
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {med.type}
                    </span>
                  </div>

                  {/* Disease / Purpose Tag */}
                  {med.disease && (
                    <div className="mb-3">
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800">
                        Condition: {med.disease}
                      </span>
                    </div>
                  )}

                  {/* Schedule Timings Badges */}
                  <div className="space-y-1.5 mb-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Daily Schedule:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {enabledSlots.map((s) => (
                        <span
                          key={s.slot}
                          className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg border dark:border-slate-700 shadow-2xs"
                        >
                          {s.slot} ({s.time})
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">🍽️ {med.foodTiming}</p>
                  </div>

                  {/* Doctor Info if available */}
                  {med.doctorName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{med.doctorName} {med.hospital ? `(${med.hospital})` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onExplainAI(med)}
                    className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Ask AI
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditMedicine(med)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Medicine"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id, med.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete Medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
