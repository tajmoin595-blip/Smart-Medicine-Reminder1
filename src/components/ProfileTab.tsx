import React, { useState } from 'react';
import { User, Phone, Heart, Activity, AlertOctagon, Save, Edit3, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';
import { getProfile, saveProfile } from '../services/storage';

export const ProfileTab: React.FC = () => {
  const [profile, setProfileState] = useState<UserProfile>(getProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formData);
    setProfileState(formData);
    setIsEditing(false);
    alert('Medical Profile Updated Successfully!');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Patient Medical Profile & Card
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emergency medical parameters, allergies, and paramedic info card
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(profile);
            setIsEditing(!isEditing);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <img
            src={profile.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
            alt={profile.fullName}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{profile.fullName}</h2>
            <p className="text-xs text-slate-500 font-medium">{profile.email} • {profile.phoneNumber}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {profile.age} Years Old ({profile.gender})
              </span>
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Blood Group: {profile.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                <Activity className="w-4 h-4 text-blue-600" /> Physical Parameters & Vitals
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px]">Height</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{profile.height}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px]">Weight</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{profile.weight}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-bold text-sm text-rose-600">{profile.bloodGroup}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px]">Emergency Phone</span>
                  <span className="font-bold text-xs text-blue-600">{profile.emergencyContact}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" /> Chronic Conditions & Allergies
              </h3>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diagnosed Conditions</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.medicalConditions.map((c, i) => (
                    <span key={i} className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Known Allergies</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.allergies.map((a, i) => (
                    <span key={i} className="bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Blood Group</label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Weight / Height</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="65 kg"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-1/2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                  />
                  <input
                    type="text"
                    placeholder="162 cm"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-1/2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
