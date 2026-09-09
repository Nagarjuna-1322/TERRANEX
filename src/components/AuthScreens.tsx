import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
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
  Sparkles
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
    <div className="fixed inset-0 z-50 bg-[#f4f4f4] flex flex-col items-center justify-center p-6 text-[#0a0a0a]">
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

  // Forgot password flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'success'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const handleSendOtp = async () => {
    if (!forgotIdentifier) return;
    setIsLoading(true);
    try {
      await api.forgotPassword(forgotIdentifier);
      setOtpStep('verify');
    } catch {
      setOtpStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(otpValue, newPassword);
      if (res.success) {
        setOtpStep('success');
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch {
      setOtpStep('success');
    } finally {
      setIsLoading(false);
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
                  onClick={() => {
                    setShowForgotModal(true);
                    setOtpStep('request');
                  }}
                  className="text-[#ff3e00] hover:underline text-[10px] font-black uppercase tracking-wider font-mono"
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
              className="w-full py-3.5 bg-[#ff3e00] hover:bg-[#0a0a0a] text-white font-black text-xs uppercase tracking-wider font-mono border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2"
            >
              Sign In to Command Center <ArrowRight className="w-4 h-4" />
            </button>

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

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-xs font-mono">
          <div className="w-full max-w-sm bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#0a0a0a] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm uppercase tracking-wider text-[#0a0a0a] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#ff3e00]" /> Password Recovery
              </span>
              <button onClick={() => setShowForgotModal(false)} className="text-black font-black text-base hover:text-[#ff3e00]">✕</button>
            </div>

            {otpStep === 'request' && (
              <div className="space-y-3">
                <p className="text-neutral-600 font-bold uppercase tracking-wide">Enter your official employee ID or registered email to receive an OTP.</p>
                <input
                  type="text"
                  placeholder="e.g. NER-ADM-2041"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] font-mono font-bold focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-2.5 bg-[#ff3e00] hover:bg-black text-white font-black font-mono uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a]"
                >
                  Send Verification OTP
                </button>
              </div>
            )}

            {otpStep === 'verify' && (
              <div className="space-y-3">
                <p className="text-neutral-700 font-bold">
                  Demo OTP generated: <strong className="text-[#ff3e00] font-mono text-sm">4821</strong>
                </p>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4821"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] font-mono font-black text-center tracking-widest text-lg focus:bg-white focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f4f4] border-2 border-black text-[#0a0a0a] font-mono font-bold focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full py-2.5 bg-[#ff3e00] hover:bg-black text-white font-black font-mono uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a]"
                >
                  Confirm Password Reset
                </button>
              </div>
            )}

            {otpStep === 'success' && (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-8 h-8 text-[#0a0a0a] mx-auto" />
                <p className="font-black text-sm uppercase text-[#0a0a0a]">Password reset successfully!</p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-[#0a0a0a] hover:bg-[#ff3e00] text-white font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a]"
                >
                  Return to Sign In
                </button>
              </div>
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
