import React, { useState } from 'react';
import { X, HeartPulse, Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';
import { setUserAuth, saveProfile, getProfile } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedIn: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoggedIn }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('68');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      const existing = getProfile();
      saveProfile({
        ...existing,
        fullName: fullName || 'Eleanor Vance',
        email: email || 'eleanor.vance@example.com',
        age: Number(age) || 68,
        phoneNumber: phone || '+1 (555) 234-5678'
      });
      setUserAuth({ isLoggedIn: true, email, name: fullName });
      onLoggedIn();
      onClose();
    } else if (mode === 'login') {
      setUserAuth({ isLoggedIn: true, email: email || 'eleanor.vance@example.com', name: 'Eleanor Vance' });
      onLoggedIn();
      onClose();
    } else if (mode === 'forgot') {
      setMessage('Password reset code sent to your email address!');
      setTimeout(() => setMode('reset'), 1500);
    } else if (mode === 'reset') {
      alert('Password updated successfully! Please sign in.');
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <HeartPulse className="w-6 h-6 animate-pulse text-white" />
          </div>
          <h2 className="text-xl font-extrabold">MediCare AI Account</h2>
          <p className="text-xs text-blue-100 mt-0.5">Secure Patient Authentication</p>
        </div>

        {/* Auth Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl font-bold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Register
            </button>
          </div>

          {message && (
            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 text-center font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="68"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="eleanor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-semibold mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all mt-2"
            >
              {mode === 'login' && 'Sign In to Account'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Email'}
              {mode === 'reset' && 'Update Password'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
