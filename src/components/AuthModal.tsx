import React, { useState } from 'react';
import {
  UserCheck,
  X,
  Mail,
  Lock,
  User,
  Shield,
  Phone,
  CheckCircle2,
  LogIn,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'profile'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState<UserProfile['role']>(currentUser.role || 'Patient');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...currentUser,
      email: email || currentUser.email,
      name: name || email.split('@')[0] || 'MediCare User',
      role,
    });
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      id: 'usr-' + Date.now(),
      name: name || 'MediCare User',
      email: email || 'user@medicare.ai',
      role,
      phone,
    });
    onClose();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>
              {view === 'profile'
                ? 'User Profile & Auth'
                : view === 'login'
                ? 'Sign In to MediCare AI'
                : view === 'register'
                ? 'Create MediCare Account'
                : 'Reset Password'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setView('profile')}
            className={`flex-1 py-1.5 rounded-xl transition-colors ${
              view === 'profile' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-1.5 rounded-xl transition-colors ${
              view === 'login' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setView('register')}
            className={`flex-1 py-1.5 rounded-xl transition-colors ${
              view === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Register
          </button>
        </div>

        {/* PROFILE VIEW */}
        {view === 'profile' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{currentUser.name}</h4>
                <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                  Role: {currentUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Patient">Patient</option>
                <option value="Caregiver">Caregiver</option>
                <option value="Family Member">Family Member</option>
              </select>
            </div>

            <button
              onClick={() => {
                onSaveUser({ ...currentUser, name, role });
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="eleanor@medicare.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="eleanor@medicare.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
            >
              Register Account
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <div className="space-y-3 text-xs">
            {forgotSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Password Reset Link Sent</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  If an account exists for {email}, a password reset email has been sent.
                </p>
                <button
                  onClick={() => setView('login')}
                  className="mt-2 text-emerald-600 font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
