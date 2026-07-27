import React from 'react';
import { ShieldAlert, X, PhoneCall, AlertTriangle, Heart, User, MapPin, Share2 } from 'lucide-react';
import { getProfile, getFamilyMembers } from '../services/storage';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const profile = getProfile();
  const familyMembers = getFamilyMembers().filter(f => f.notifyOnEmergency);

  if (!isOpen) return null;

  const handleCallParamedic = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border-2 border-rose-500/80 overflow-hidden animate-scale-up my-6">
        
        {/* Red Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">EMERGENCY SOS CARD</h2>
              <p className="text-xs text-rose-100">Quick Paramedic Medical Information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Quick Call Emergency Hotline */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCallParamedic('911')}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold p-3 rounded-2xl text-center shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm"
            >
              <PhoneCall className="w-4 h-4" /> Call 911 / 112
            </button>
            <button
              onClick={() => handleCallParamedic(profile.emergencyContact)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-3 rounded-2xl text-center shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-4 h-4" /> Emergency Contact
            </button>
          </div>

          {/* Paramedic Critical Info Card */}
          <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900 pb-2">
              <span className="font-extrabold text-sm text-rose-900 dark:text-rose-200">{profile.fullName}</span>
              <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                BLOOD GROUP: {profile.bloodGroup}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 font-semibold block">Age & Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{profile.age} Yrs ({profile.gender})</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Height / Weight</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{profile.height} / {profile.weight}</span>
              </div>
            </div>

            <div>
              <span className="text-rose-800 dark:text-rose-300 font-bold block mb-1">⚠️ KNOWN SEVERE ALLERGIES</span>
              <div className="flex flex-wrap gap-1">
                {profile.allergies.map((a, i) => (
                  <span key={i} className="bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold px-2 py-0.5 rounded">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Diagnosed Medical Conditions</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.medicalConditions.join(', ')}
              </p>
            </div>
          </div>

          {/* Family Contact List */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Emergency Family Contacts</h4>
            <div className="space-y-2">
              {familyMembers.map((fam) => (
                <div key={fam.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{fam.name} ({fam.relationship})</span>
                    <p className="text-[10px] text-slate-500">{fam.phone}</p>
                  </div>
                  <button
                    onClick={() => handleCallParamedic(fam.phone)}
                    className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
