import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  ScanLine,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { MedicineItem, MedicineType, FoodRequirement } from '../types';

interface MedicineManagerProps {
  medicines: MedicineItem[];
  onAddMedicine: (med: Omit<MedicineItem, 'id' | 'createdAt'>) => void;
  onUpdateMedicine: (med: MedicineItem) => void;
  onDeleteMedicine: (id: string) => void;
  onExplainMedicine: (medName: string, purpose: string, dosage: string) => void;
}

const COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const MedicineManager: React.FC<MedicineManagerProps> = ({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onExplainMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicineItem | null>(null);

  // AI OCR Label Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanText, setScanText] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formTimesOfDay, setFormTimesOfDay] = useState<('Morning' | 'Afternoon' | 'Evening' | 'Night')[]>(['Morning']);
  const [formSpecificTime, setFormSpecificTime] = useState('08:00');
  const [formFoodReq, setFormFoodReq] = useState<FoodRequirement>('After Food');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formType, setFormType] = useState<MedicineType>('Tablet');
  const [formNotes, setFormNotes] = useState('');
  const [formIsEmergency, setFormIsEmergency] = useState(false);

  const openAddModal = () => {
    setEditingMed(null);
    setFormName('');
    setFormPurpose('');
    setFormDosage('1 tablet');
    setFormTimesOfDay(['Morning']);
    setFormSpecificTime('08:00');
    setFormFoodReq('After Food');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormColor('#3b82f6');
    setFormType('Tablet');
    setFormNotes('');
    setFormIsEmergency(false);
    setIsModalOpen(true);
  };

  const openEditModal = (med: MedicineItem) => {
    setEditingMed(med);
    setFormName(med.name);
    setFormPurpose(med.purpose);
    setFormDosage(med.dosage);
    setFormTimesOfDay(med.timesOfDay);
    setFormSpecificTime(med.specificTime || '08:00');
    setFormFoodReq(med.foodRequirement);
    setFormStartDate(med.startDate);
    setFormEndDate(med.endDate || '');
    setFormColor(med.color);
    setFormType(med.type);
    setFormNotes(med.notes || '');
    setFormIsEmergency(!!med.isEmergency);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMed) {
      onUpdateMedicine({
        ...editingMed,
        name: formName.trim(),
        purpose: formPurpose.trim(),
        dosage: formDosage.trim(),
        timesOfDay: formTimesOfDay,
        specificTime: formSpecificTime,
        foodRequirement: formFoodReq,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        color: formColor,
        type: formType,
        notes: formNotes.trim(),
        isEmergency: formIsEmergency,
      });
    } else {
      onAddMedicine({
        name: formName.trim(),
        purpose: formPurpose.trim(),
        dosage: formDosage.trim(),
        timesOfDay: formTimesOfDay,
        specificTime: formSpecificTime,
        foodRequirement: formFoodReq,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        color: formColor,
        type: formType,
        notes: formNotes.trim(),
        isEmergency: formIsEmergency,
      });
    }

    setIsModalOpen(false);
  };

  const handleScanLabelSubmit = async () => {
    if (!scanText.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleText: scanText }),
      });
      const data = await res.json();
      if (data.result) {
        if (data.result.name) setFormName(data.result.name);
        if (data.result.purpose) setFormPurpose(data.result.purpose);
        if (data.result.dosage) setFormDosage(data.result.dosage);
        if (data.result.foodRequirement) setFormFoodReq(data.result.foodRequirement);
        setIsScanModalOpen(false);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'All' || m.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-600" />
            <span>Medicine Cabinet</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your prescriptions, dosages, schedules, and custom reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Scan Label Button */}
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <ScanLine className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Scan Box Label</span>
          </button>

          {/* Add Medicine Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search medicine name or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTypeFilter === type
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No medicines match your search
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Try resetting your search filter or add a new medicine to your schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: med.color || '#10b981' }}
                    >
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {med.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {med.type} • {med.dosage}
                      </span>
                    </div>
                  </div>

                  {med.isEmergency && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-300 dark:border-red-800">
                      Emergency
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  <strong>Purpose:</strong> {med.purpose || 'Not specified'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {med.specificTime} ({med.timesOfDay.join(', ')})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>{med.foodRequirement}</span>
                  </div>
                  {med.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      "{med.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onExplainMedicine(med.name, med.purpose, med.dosage)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain AI</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(med)}
                    title="Edit Medicine"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMedicine(med.id)}
                    title="Delete Medicine"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <span>{editingMed ? 'Edit Medicine' : 'Add New Medicine'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Metformin"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg, 1 tablet"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medicine Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MedicineType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood pressure control, pain relief"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Time of Day Checkboxes & Time Picker */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Times of Day & Specific Reminder Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Morning', 'Afternoon', 'Evening', 'Night'] as const).map((tod) => {
                    const selected = formTimesOfDay.includes(tod);
                    return (
                      <button
                        type="button"
                        key={tod}
                        onClick={() => {
                          if (selected) {
                            if (formTimesOfDay.length > 1) {
                              setFormTimesOfDay(formTimesOfDay.filter((t) => t !== tod));
                            }
                          } else {
                            setFormTimesOfDay([...formTimesOfDay, tod]);
                          }
                        }}
                        className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                          selected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tod}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Exact Time:</span>
                  <input
                    type="time"
                    value={formSpecificTime}
                    onChange={(e) => setFormSpecificTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Food Requirement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Before Food', 'After Food', 'With Food', 'No Preference'] as const).map((req) => (
                    <button
                      type="button"
                      key={req}
                      onClick={() => setFormFoodReq(req)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                        formFoodReq === req
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {req}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preset Picker */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Color Badge
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formColor === c ? 'scale-125 border-slate-900 dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Emergency Flag */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emergencyCheck"
                  checked={formIsEmergency}
                  onChange={(e) => setFormIsEmergency(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="emergencyCheck" className="font-bold text-red-600 dark:text-red-400">
                  Critical Emergency Medicine (Triggers instant caregiver alert if missed)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with a full glass of water, do not chew."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Label OCR Scanner Modal */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-teal-600" />
                <span>AI Medicine Box Scanner</span>
              </h3>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste text from your prescription box or medicine bottle label. MediCare AI will auto-fill your medicine entry!
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Metformin Hydrochloride 500mg - Take 1 tablet twice daily with meals for blood sugar."
              value={scanText}
              onChange={(e) => setScanText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleScanLabelSubmit}
                disabled={isScanning || !scanText.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {isScanning ? (
                  <span>Extracting AI...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Fill Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
