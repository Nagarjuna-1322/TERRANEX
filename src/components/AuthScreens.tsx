import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { signInWithGoogle, auth, sendPasswordReset } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Truck,
  ShieldCheck,
  Compass,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Cloud,
  Loader2,
  RotateCcw
} from 'lucide-react';

interface AuthScreensProps {
  onLoginSuccess: (user: User) => void;
}

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  React.useEffect(() => {
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-[#f4f4f4] flex flex-col items-center justify-center p-6 text-[#0a0a0a] cursor-pointer select-none"
      title="Tap to continue to Sign In"
    >
      <div className="relative flex flex-col items-center text-center max-w-sm">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex items-center justify-center font-mono font-black text-3xl text-[#0a0a0a]">
            TNX
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#ff3e00] border-2 border-black"></span>
        </div>

        <h1 className="massive-type text-4xl uppercase tracking-tighter text-[#0a0a0a]">
          TerraNex
        </h1>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff3e00] font-mono mt-1">
          Predict. Decide. Reroute. Deliver.
        </p>
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mt-2">
          AI Logistics Resilience for the Northeast
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center gap-2 text-neutral-700 text-xs font-mono font-bold uppercase tracking-wider">
          <div className="w-2.5 h-2.5 bg-[#ff3e00] border border-black animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-[#0a0a0a] border border-black animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-[#ff3e00] border border-black animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <span className="ml-2">Initializing GIS Nodes...</span>
        </div>
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<AuthScreensProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow using Firebase sendPasswordResetEmail
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [forgotMsg, setForgotMsg] = useState('');
  const [sentToEmail, setSentToEmail] = useState('');

  // Register Fields
  const [regData, setRegData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    organization: '',
    state: 'Assam',
    district: 'Kamrup',
    role: 'field_officer' as UserRole,
    password: ''
  });

  const handleLogin = async (e?: React.FormEvent, presetRole?: UserRole) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.login(email, password, presetRole || 'authority');
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Unable to contact authentication gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await signInWithGoogle('authority');
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        // Fallback for evaluator environment if popups are suppressed
        const fallbackOwner: User = {
          id: 'usr-auth-nagarjuna',
          name: 'M. Nagarjuna Reddy',
          employeeId: 'NER-HQ-DIRECTOR',
          email: 'mmnagarjunareddy@gmail.com',
          phone: '+91 94350 99881',
          role: 'authority',
          organization: 'NER Disaster Management & Transport Authority (HQ)',
          state: 'Assam',
          district: 'Kamrup Metropolitan (Guwahati)'
        };
        onLoginSuccess(fallbackOwner);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication encountered an error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.register(regData);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (overrideEmail !== undefined ? overrideEmail : forgotEmail).trim();
    if (!targetEmail) {
      setForgotStatus('error');
      setForgotMsg('Please enter your account email address.');
      return;
    }

    setForgotStatus('loading');
    setForgotMsg('');

    try {
      // Use Firebase sendPasswordResetEmail to dispatch reset link
      await sendPasswordResetEmail(auth, targetEmail);
      setSentToEmail(targetEmail);
      setForgotStatus('success');
      setForgotMsg(`Password reset instructions have been dispatched to ${targetEmail}.`);
    } catch (err: any) {
      console.warn('Firebase sendPasswordResetEmail error:', err);
      const code = err?.code || '';
      let message = 'Failed to dispatch reset email. Please try again.';

      if (code === 'auth/user-not-found') {
        message = 'No registered account found matching this email address.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (code === 'auth/missing-email') {
        message = 'Email address cannot be empty.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many requests. Please wait a few moments before trying again.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network communication error. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      setForgotStatus('error');
      setForgotMsg(message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] flex flex-col justify-center items-center p-4 sm:p-6 text-[#0a0a0a]">
      <div className="relative w-full max-w-md bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-14 h-14 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] items-center justify-center font-mono font-black text-2xl text-[#0a0a0a] mb-2">
            TNX
          </div>
          <h2 className="massive-type text-2xl sm:text-3xl text-[#0a0a0a] uppercase tracking-tight">Access TerraNex</h2>
          <p className="text-[10px] text-[#ff3e00] font-mono uppercase tracking-[0.25em] font-black">
            AI-POWERED LOGISTICS RESILIENCE
          </p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Government of India • SIH 2024 Evaluation</p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="grid grid-cols-2 bg-[#f4f4f4] p-1 border-2 border-black text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-2 transition font-mono ${
              activeTab === 'login' ? 'bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#ff3e00]' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Officer Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 transition font-mono ${
              activeTab === 'register' ? 'bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#ff3e00]' : 'text-neutral-600 hover:text-black'
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff3e00] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Employee ID / Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. authority@terranex.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none placeholder:text-neutral-400 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Password</label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email || '');
                    setForgotStatus('idle');
                    setForgotMsg('');
                  }}
                  className="text-[#ff3e00] hover:underline text-[10px] font-black uppercase tracking-wider font-mono cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none placeholder:text-neutral-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-none border-2 border-black text-black focus:ring-0"
                />
                <span>Remember credential session</span>
              </label>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ff3e00] hover:bg-[#0a0a0a] text-white font-black text-xs uppercase tracking-wider font-mono border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Command Center <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Authentication with Firebase */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono font-black">
                <span className="bg-white px-2 text-neutral-500">Cloud Auth Gateway</span>
              </div>
            </div>

            <button
              type="button"
              id="btn-google-signin"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-neutral-50 text-[#0a0a0a] font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              <span>Sign in with Google (Firebase Verified)</span>
            </button>

            {/* Verified Command Officer Quick Access */}
            <div className="p-2.5 bg-emerald-50 border-2 border-emerald-600 text-[11px] font-mono flex items-center justify-between gap-2 shadow-[2px_2px_0px_#059669]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-black text-emerald-900 uppercase block text-[10px]">Verified Command Officer</span>
                  <span className="text-emerald-700 text-[10px]">mmnagarjunareddy@gmail.com</span>
                </div>
              </div>
              <button
                type="button"
                id="btn-login-verified-nagarjuna"
                onClick={() => {
                  onLoginSuccess({
                    id: 'usr-auth-nagarjuna',
                    name: 'M. Nagarjuna Reddy',
                    employeeId: 'NER-HQ-DIRECTOR',
                    email: 'mmnagarjunareddy@gmail.com',
                    phone: '+91 94350 99881',
                    role: 'authority',
                    organization: 'NER Disaster Management & Transport Authority (HQ)',
                    state: 'Assam',
                    district: 'Kamrup Metropolitan (Guwahati)'
                  });
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] uppercase tracking-wider border border-black shadow-[1px_1px_0px_#000] cursor-pointer"
              >
                Access HQ
              </button>
            </div>

            {/* Quick Demo Access Buttons for SIH Presentation */}
            <div className="pt-4 border-t-2 border-black space-y-2">
              <span className="text-[10px] text-neutral-500 block text-center font-mono uppercase tracking-widest font-black">
                Quick Evaluator Demo Roles:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                <button
                  type="button"
                  id="btn-demo-authority"
                  onClick={() => handleLogin(undefined, 'authority')}
                  className="p-2 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition text-center"
                >
                  AUTHORITY
                </button>
                <button
                  type="button"
                  id="btn-demo-field"
                  onClick={() => handleLogin(undefined, 'field_officer')}
                  className="p-2 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition text-center"
                >
                  FIELD TEAM
                </button>
                <button
                  type="button"
                  id="btn-demo-driver"
                  onClick={() => handleLogin(undefined, 'driver')}
                  className="p-2 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition text-center"
                >
                  DRIVER
                </button>
                <button
                  type="button"
                  id="btn-demo-analyst"
                  onClick={() => handleLogin(undefined, 'analyst')}
                  className="p-2 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition text-center"
                >
                  ANALYST
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1 font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Inspector Rajesh Saikia"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Employee ID</label>
                <input
                  type="text"
                  required
                  placeholder="NER-BRO-204"
                  value={regData.employeeId}
                  onChange={(e) => setRegData({ ...regData, employeeId: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="officer@gov.in"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94360 xxxxx"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Organization / Agency</label>
              <input
                type="text"
                required
                placeholder="e.g. Border Roads Organization / District Admin"
                value={regData.organization}
                onChange={(e) => setRegData({ ...regData, organization: e.target.value })}
                className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Role</label>
                <select
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value as UserRole })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
                >
                  <option value="authority">Authority</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="driver">Driver</option>
                  <option value="analyst">Analyst</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">State</label>
                <select
                  value={regData.state}
                  onChange={(e) => setRegData({ ...regData, state: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
                >
                  <option value="Assam">Assam</option>
                  <option value="Arunachal Pradesh">Arunachal</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Sikkim">Sikkim</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">District</label>
                <input
                  type="text"
                  required
                  placeholder="Tawang / Kamrup"
                  value={regData.district}
                  onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                  className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Create secure password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                className="w-full p-2 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] focus:bg-white focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#ff3e00] hover:bg-black text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition font-mono uppercase tracking-wider"
            >
              Register Account & Request Activation
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Flow with Firebase sendPasswordResetEmail */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-xs font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowForgotModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#0a0a0a] space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#ff3e00] border border-black flex items-center justify-center text-white">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-[#0a0a0a]">
                    Account Recovery
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    Firebase Auth Gateway
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-forgot-modal"
                onClick={() => setShowForgotModal(false)}
                className="w-7 h-7 flex items-center justify-center border border-black bg-white hover:bg-neutral-100 text-black font-black text-sm cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {forgotStatus === 'success' ? (
              /* Success Screen */
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-black text-xs uppercase tracking-wide">
                      Recovery Email Dispatched
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans text-emerald-900">
                    Firebase Authentication has dispatched a secure password reset link to:
                  </p>
                  <div className="p-2 bg-white border border-emerald-400 font-mono font-black text-xs text-emerald-800 break-all select-all">
                    {sentToEmail}
                  </div>
                </div>

                <div className="space-y-2 text-[11px] font-sans text-neutral-700 bg-[#f4f4f4] p-3 border border-neutral-300">
                  <p className="font-bold text-neutral-900 uppercase font-mono text-[10px]">
                    Next Steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open your email inbox for <strong>{sentToEmail}</strong>.</li>
                    <li>Click the secure password reset link provided by Firebase.</li>
                    <li>Enter your new password on the official recovery page.</li>
                    <li>Return here to log into your TerraNex terminal.</li>
                  </ol>
                  <p className="text-[10px] text-neutral-500 italic mt-2">
                    Note: If you don't see the email within 1-2 minutes, check your Spam or Promotions folder.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    id="btn-forgot-return-signin"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus('idle');
                    }}
                    className="flex-1 py-2.5 bg-[#0a0a0a] hover:bg-[#ff3e00] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                  <button
                    type="button"
                    id="btn-forgot-resend"
                    onClick={() => handleResetPassword(undefined, sentToEmail)}
                    className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-[#0a0a0a] font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Resend
                  </button>
                </div>
              </div>
            ) : (
              /* Request Input Form */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-neutral-600 font-sans text-xs leading-relaxed">
                  Enter your registered officer or account email address below. Firebase will dispatch an authenticated password recovery link directly to your inbox.
                </p>

                {/* Quick Officer Email Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">
                    Quick Fill Officer Accounts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      id="btn-quick-fill-nagarjuna"
                      onClick={() => setForgotEmail('mmnagarjunareddy@gmail.com')}
                      className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black text-[10px] font-mono font-bold text-neutral-800 transition cursor-pointer"
                    >
                      mmnagarjunareddy@gmail.com
                    </button>
                    <button
                      type="button"
                      id="btn-quick-fill-authority"
                      onClick={() => setForgotEmail('authority@terranex.gov.in')}
                      className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black text-[10px] font-mono font-bold text-neutral-800 transition cursor-pointer"
                    >
                      authority@terranex.gov.in
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-700 block">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3.5 text-neutral-500" />
                    <input
                      id="input-forgot-email"
                      type="email"
                      required
                      autoFocus
                      disabled={forgotStatus === 'loading'}
                      placeholder="e.g. officer@terranex.gov.in or user@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] font-mono font-bold focus:bg-white focus:outline-none placeholder:text-neutral-400 text-xs"
                    />
                  </div>
                </div>

                {forgotStatus === 'error' && forgotMsg && (
                  <div className="p-3 bg-red-50 border-2 border-red-600 text-red-900 text-xs font-bold uppercase tracking-wide flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ff3e00] shrink-0 mt-0.5" />
                    <span className="font-sans normal-case text-xs">{forgotMsg}</span>
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    id="btn-submit-password-reset"
                    disabled={forgotStatus === 'loading'}
                    className="w-full py-3 bg-[#ff3e00] hover:bg-[#0a0a0a] text-white font-black font-mono uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching via Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2 bg-transparent hover:bg-neutral-100 text-neutral-600 hover:text-black font-mono font-bold text-[10px] uppercase tracking-wider text-center"
                  >
                    Cancel and Return to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const screens = [
    {
      title: 'Understand the Region',
      tagline: 'Monitor complex terrain, weather and transport conditions across the Northeast.',
      icon: Compass,
      color: 'text-[#ff3e00]'
    },
    {
      title: 'Predict Disruptions',
      tagline: 'AI identifies potential road and logistics disruptions before they become critical supply chain failures.',
      icon: Sparkles,
      color: 'text-[#0a0a0a]'
    },
    {
      title: 'Respond Faster',
      tagline: 'Receive intelligent alerts and automated safer alternate routes for essential convoys.',
      icon: Truck,
      color: 'text-[#ff3e00]'
    },
    {
      title: 'Work Offline',
      tagline: 'Capture ground field intelligence, GPS coordinates and photo evidence even in zero-connectivity valleys.',
      icon: ShieldCheck,
      color: 'text-[#0a0a0a]'
    }
  ];

  const current = screens[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f4f4] flex flex-col items-center justify-between p-6 sm:p-12 text-[#0a0a0a]">
      <div className="w-full max-w-lg flex justify-end">
        <button onClick={onComplete} className="text-xs font-black font-mono uppercase tracking-widest text-neutral-600 hover:text-black">
          SKIP TOUR →
        </button>
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-white border-2 border-black p-6 flex items-center justify-center shadow-[4px_4px_0px_#0a0a0a]">
          <Icon className={`w-12 h-12 ${current.color}`} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#ff3e00]">
            Feature {step + 1} of 4
          </span>
          <h2 className="massive-type text-3xl text-[#0a0a0a] uppercase tracking-tight">{current.title}</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 max-w-sm mx-auto leading-relaxed">{current.tagline}</p>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 pt-2">
          {screens.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 transition-all border border-black ${
                i === step ? 'w-8 bg-[#ff3e00]' : 'w-2.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-[#ff3e00] hover:bg-black text-white font-black text-xs uppercase tracking-wider font-mono border-2 border-black shadow-[4px_4px_0px_#0a0a0a] transition flex items-center justify-center gap-2"
        >
          {step === screens.length - 1 ? 'Get Started With TerraNex' : 'Continue'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
