import React, { useState, useEffect } from 'react';
import { X, Save, Pill, Plus, Calendar, Clock, Stethoscope, FileText, Check, Sparkles } from 'lucide-react';
import { Medicine, MedicineType, FoodTiming, FrequencyType, TimeSlot } from '../types';
import { saveMedicine } from '../services/storage';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
  onSaved: () => void;
  onExplainAI?: (med: Medicine) => void;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
  onSaved,
  onExplainAI
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    genericName: '',
    brandName: '',
    disease: '',
    dosage: '1 Tablet',
    type: 'Tablet',
    color: '#2563eb',
    description: '',
    purpose: '',
    times: [
      { slot: 'Morning', time: '08:00', enabled: true },
      { slot: 'Afternoon', time: '13:00', enabled: false },
      { slot: 'Evening', time: '19:00', enabled: false },
      { slot: 'Night', time: '22:00', enabled: false }
    ],
    foodTiming: 'After Food',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'Every Day',
    doctorName: '',
    hospital: '',
    prescriptionNumber: '',
    notes: '',
    remainingPills: 30,
    totalPills: 30,
    refillReminder: true
  });

  useEffect(() => {
    if (medicineToEdit) {
      setFormData(medicineToEdit);
    } else {
      setFormData({
        name: '',
        genericName: '',
        brandName: '',
        disease: '',
        dosage: '1 Tablet',
        type: 'Tablet',
        color: '#2563eb',
        description: '',
        purpose: '',
        times: [
          { slot: 'Morning', time: '08:00', enabled: true },
          { slot: 'Afternoon', time: '13:00', enabled: false },
          { slot: 'Evening', time: '19:00', enabled: false },
          { slot: 'Night', time: '22:00', enabled: false }
        ],
        foodTiming: 'After Food',
        startDate: new Date().toISOString().split('T')[0],
        frequency: 'Every Day',
        doctorName: '',
        hospital: '',
        prescriptionNumber: '',
        notes: '',
        remainingPills: 30,
        totalPills: 30,
        refillReminder: true
      });
    }
  }, [medicineToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Please enter a medicine name.');
      return;
    }
    saveMedicine(formData as Medicine);
    onSaved();
    onClose();
  };

  const handleTimeSlotChange = (slotName: TimeSlot, field: 'enabled' | 'time', val: any) => {
    const updatedTimes = (formData.times || []).map(t => {
      if (t.slot === slotName) {
        return { ...t, [field]: val };
      }
      return t;
    });
    setFormData({ ...formData, times: updatedTimes });
  };

  const medicineTypes: MedicineType[] = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Cream'];
  const foodTimingOptions: FoodTiming[] = ['Before Food', 'After Food', 'With Food', 'Any Time'];
  const frequencyOptions: FrequencyType[] = ['Every Day', 'Alternate Days', 'Weekly', 'Monthly'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              💊
            </div>
            <div>
              <h2 className="text-lg font-bold">{medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <p className="text-xs text-blue-100">Set schedule, dosage & doctor instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" /> Basic Medicine Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Metformin, Lisinopril"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Generic / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g., Glucophage"
                  value={formData.brandName || ''}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Disease / Condition</label>
                <input
                  type="text"
                  placeholder="e.g., Type 2 Diabetes, Blood Pressure"
                  value={formData.disease || ''}
                  onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g., 500 mg, 10 ml, 2 Drops"
                  value={formData.dosage || ''}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Form Type & Food Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicine Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {medicineTypes.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-1.5 px-2 rounded-xl font-medium text-[11px] border text-center transition-all ${
                        formData.type === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Food Relationship</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {foodTimingOptions.map(ft => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => setFormData({ ...formData, foodTiming: ft })}
                      className={`py-1.5 px-2 rounded-xl font-medium text-[11px] border text-center transition-all ${
                        formData.foodTiming === ft
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timing & Schedule Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Daily Schedule & Reminder Times
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.times || []).map(t => (
                <div
                  key={t.slot}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    t.enabled
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.enabled}
                      onChange={(e) => handleTimeSlotChange(t.slot, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t.slot}</span>
                  </label>

                  {t.enabled && (
                    <input
                      type="time"
                      value={t.time}
                      onChange={(e) => handleTimeSlotChange(t.slot, 'time', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-mono text-xs font-semibold"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                <select
                  value={formData.frequency || 'Every Day'}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as FrequencyType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {frequencyOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Prescription & Doctor Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Prescribing Doctor & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Jenkins"
                  value={formData.doctorName || ''}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital / Clinic</label>
                <input
                  type="text"
                  placeholder="City Medical Center"
                  value={formData.hospital || ''}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prescription Rx #</label>
                <input
                  type="text"
                  placeholder="RX-99812"
                  value={formData.prescriptionNumber || ''}
                  onChange={(e) => setFormData({ ...formData, prescriptionNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Doctor Notes / Purpose</label>
              <textarea
                rows={2}
                placeholder="e.g. Take after breakfast, avoid consuming with calcium-fortified juice..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {onExplainAI && formData.name && (
              <button
                type="button"
                onClick={() => onExplainAI(formData as Medicine)}
                className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Explain with Gemini AI
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Save className="w-4 h-4" /> Save Medicine
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
