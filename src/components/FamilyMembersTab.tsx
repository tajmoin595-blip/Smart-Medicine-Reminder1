import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, UserCheck, ShieldAlert, Trash2, Edit2, Send } from 'lucide-react';
import { FamilyMember } from '../types';
import { getFamilyMembers, saveFamilyMember, deleteFamilyMember, addNotification } from '../services/storage';

export const FamilyMembersTab: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(getFamilyMembers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    phone: '',
    email: '',
    relationship: 'Son',
    notifyOnMissed: true,
    notifyOnEmergency: true
  });

  const handleRefresh = () => {
    setFamilyMembers(getFamilyMembers());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      alert('Please provide at least a name and phone number.');
      return;
    }
    saveFamilyMember(formData as FamilyMember);
    handleRefresh();
    setShowAddModal(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove ${name} from emergency family contacts?`)) {
      deleteFamilyMember(id);
      handleRefresh();
    }
  };

  const triggerTestAlert = (member: FamilyMember) => {
    addNotification(
      'Test Alert Sent',
      `Alert notification sent to ${member.name} (${member.phone}): "Your family member Eleanor has missed 3 medication reminders today."`,
      'family_alert'
    );
    alert(`Test SMS/Email alert sent to ${member.name} (${member.phone})!`);
  };

  const relationshipOptions: FamilyMember['relationship'][] = [
    'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Doctor', 'Other'
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Family Member & Caregiver Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically notifies loved ones or doctors if you repeatedly miss medicines
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              relationship: 'Son',
              notifyOnMissed: true,
              notifyOnEmergency: true
            });
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Family Member
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/50 p-4 rounded-3xl border border-blue-200/60 dark:border-blue-900/40 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-200">Automatic Missed Medicine Alert System</h4>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
            If you miss 3 scheduled doses in a row, MediCare AI triggers an automatic alert to contacts with <strong>"Notify on Missed Doses"</strong> enabled:
            <em className="block text-blue-700 dark:text-blue-300 font-semibold mt-1">
              "Alert: Your family member has missed today's medicine."
            </em>
          </p>
        </div>
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {familyMembers.map((member) => (
          <div
            key={member.id}
            className="glass-card rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{member.name}</h3>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                    {member.relationship}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setFormData(member);
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${member.phone}`} className="hover:underline font-semibold">{member.phone}</a>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${member.email}`} className="hover:underline truncate">{member.email}</a>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Notify on Missed Doses:</span>
                  <span className={member.notifyOnMissed ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {member.notifyOnMissed ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Emergency Contacts:</span>
                  <span className={member.notifyOnEmergency ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {member.notifyOnEmergency ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerTestAlert(member)}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Send Test Alert SMS
            </button>
          </div>
        ))}
      </div>

      {/* Add / Edit Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingMember ? 'Edit Caregiver Contact' : 'Add Caregiver Contact'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Vance"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="robert@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Relationship</label>
                <select
                  value={formData.relationship || 'Son'}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                >
                  {relationshipOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.notifyOnMissed ?? true}
                    onChange={(e) => setFormData({ ...formData, notifyOnMissed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Notify if medicines missed 3 times
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.notifyOnEmergency ?? true}
                    onChange={(e) => setFormData({ ...formData, notifyOnEmergency: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Include in Emergency SOS Call List
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
