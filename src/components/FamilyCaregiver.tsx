import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Bell,
  Phone,
  Mail,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  X,
  Send,
} from 'lucide-react';
import { FamilyMember, CaregiverAlert } from '../types';

interface FamilyCaregiverProps {
  members: FamilyMember[];
  alerts: CaregiverAlert[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onTriggerSos: () => void;
}

export const FamilyCaregiver: React.FC<FamilyCaregiverProps> = ({
  members,
  alerts,
  onAddMember,
  onDeleteMember,
  onTriggerSos,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Daughter');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notifyOnMissed, setNotifyOnMissed] = useState(true);
  const [notifyOnEmergencySkipped, setNotifyOnEmergencySkipped] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddMember({
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notifyOnMissed,
      notifyOnEmergencySkipped,
    });

    setName('');
    setPhone('');
    setEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Family Caregiver Sync</span>
          </div>
          <h2 className="text-2xl font-bold">Keep loved ones & caregivers informed</h2>
          <p className="text-teal-100 text-xs leading-relaxed">
            Registered family members receive instant notification alerts when critical doses are missed or ignored.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onTriggerSos}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Trigger SOS Caregiver Alert</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Add Caregiver</span>
          </button>
        </div>
      </div>

      {/* Grid of Registered Family Members */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <span>Registered Family & Caregivers ({members.length})</span>
        </h3>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No family members added yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Add your family members or caregivers to ensure they get notified when a dose is missed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h4>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold mt-0.5">
                        {m.relationship}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteMember(m.id)}
                      title="Remove Caregiver"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{m.phone}</span>
                    </div>
                    {m.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{m.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Alerts on missed medicine: <strong>Yes</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Alerts on 3 ignored reminders: <strong>Yes</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caregiver Alert History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Delivered Caregiver Alert Log</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{alerts.length} notifications</span>
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
            No caregiver alerts delivered yet. Alerts automatically trigger when doses are missed.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {alt.alertType}: {alt.medicineName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sent to: {alt.memberName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    {alt.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{alt.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Caregiver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Add Family Caregiver</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Nurse / Caregiver">Nurse / Caregiver</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
                  Add Caregiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
