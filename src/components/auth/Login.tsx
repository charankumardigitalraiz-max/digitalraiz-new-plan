import React, { useState } from 'react';
import {
  Globe2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Car,
  Music,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Check
} from 'lucide-react';
import { authService } from '../../services/authService';
import { apiClient } from '../../services/apiClient';
import type { AdminUser } from '../../types/auth';

export type { AdminUser };

interface LoginProps {
  onLogin: (user: AdminUser) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const PRESET_ACCOUNTS: { label: string; user: AdminUser }[] = [
  {
    label: 'Operations Lead',
    user: {
      id: 'usr_1',
      name: 'Elena Rostova',
      email: 'elena@digitalraiz.internal',
      role: 'Operations Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: 'Fleet & KYC Safety'
    }
  },
  {
    label: 'Super Admin',
    user: {
      id: 'usr_2',
      name: 'Marcus Vance',
      email: 'admin@wayfer.com',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      department: 'Global Infrastructure'
    }
  },
  {
    label: 'Event Curator',
    user: {
      id: 'usr_3',
      name: 'Aria Chen',
      email: 'aria.events@digitalraiz.internal',
      role: 'Event Curator',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      department: 'Live Concerts & Festivals'
    }
  }
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Common Fields
  const [email, setEmail] = useState('admin@wayfer.com');
  const [password, setPassword] = useState('AdminPassword@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+919876543210');
  const [role, setRole] = useState('admin');

  // Reset Password Fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validation State for Register
  const [registerErrors, setRegisterErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});
  const [registerTouched, setRegisterTouched] = useState<{
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    password?: boolean;
  }>({});

  const validateName = (val: string): string | undefined => {
    const clean = val.trim();
    if (!clean) return 'Full name is required.';
    if (clean.length < 2) return 'Full name must be at least 2 characters.';
    if (clean.length > 60) return 'Full name cannot exceed 60 characters.';
    if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
      return 'Name should only contain letters, spaces, hyphens, or periods.';
    }
    return undefined;
  };

  const validateEmail = (val: string): string | undefined => {
    const clean = val.trim();
    if (!clean) return 'Email address is required.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return 'Enter a valid email address (e.g. admin@wayfer.com).';
    }
    return undefined;
  };

  const validatePhone = (val: string): string | undefined => {
    const clean = val.trim();
    if (!clean) return 'Phone number is required.';
    if (/[^\d+\s\-()]/.test(clean)) {
      return 'Phone number contains invalid characters (digits and + only).';
    }
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must have at least 10 digits.';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number cannot exceed 15 digits.';
    }
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(val)) return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(val)) return 'Password must include at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(val)) return 'Password must include at least one number (0-9).';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) {
      return 'Password must include at least one special character (!@#$%^&*).';
    }
    return undefined;
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Real API Call: POST /api/admin/auth/login
      const result = await authService.loginAdmin({
        email: email.trim(),
        password: password
      });

      setIsLoading(false);
      onLogin(result.user);
    } catch (err: any) {
      setIsLoading(false);

      // Check if user credentials match demo presets for seamless local resilience
      const matched = PRESET_ACCOUNTS.find(
        (p) => p.user.email.toLowerCase() === email.toLowerCase().trim()
      );

      // If backend is offline or returned an error, give user choice / notify
      if (err?.status === 0 || err?.message?.includes('Network connectivity error')) {
        setErrorMessage(
          `Backend is currently unreachable on ${apiClient.getBaseUrl()}. You can verify server status or click any quick-demo preset below to sign in.`
        );
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
      }

      if (matched && password.length >= 6) {
        console.info('Demo fallback available for:', matched.user.email);
      }
    }
  };

  // 2. Handle Register Admin
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);

    setRegisterTouched({ name: true, email: true, phone: true, password: true });
    setRegisterErrors({
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      password: passErr
    });

    if (nameErr || emailErr || phoneErr || passErr) {
      setErrorMessage('Please correct the highlighted validation errors below.');
      return;
    }

    setIsLoading(true);

    try {
      // Real API Call: POST /api/admin/auth/register
      const response = await authService.registerAdmin({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        role: role || 'admin'
      });

      setIsLoading(false);
      setSuccessMessage(response?.message || 'Admin account registered successfully! You may now sign in.');
      setAuthMode('login');
      setRegisterErrors({});
      setRegisterTouched({});
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.message || `Registration failed. Verify server is running on ${apiClient.getBaseUrl()}.`
      );
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    const emailErr = validateEmail(email);
    setRegisterErrors({
      // name: nameErr,
      email: emailErr,
      // phone: phoneErr,
      // password: passErr
    });

    if (emailErr) {
      setErrorMessage('Please correct the highlighted validation errors below.');
      return;
    }
    setIsLoading(true);

    try {
      // Real API Call: POST /api/admin/auth/forgot-password
      const res = await authService.forgotPassword(email.trim());
      setIsLoading(false);
      setSuccessMessage(res.message || 'Password reset token generated! Please check your inbox or use the token to reset.');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Unable to request password reset token. Ensure backend server is active.');
    }
  };

  // 4. Handle Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetToken.trim() || !newPassword.trim()) {
      setErrorMessage('Please provide both the reset token and your new password.');
      return;
    }

    setIsLoading(true);

    try {
      // Real API Call: POST /api/admin/auth/reset-password
      const res = await authService.resetPassword({
        token: resetToken.trim(),
        newPassword: newPassword
      });

      setIsLoading(false);
      setSuccessMessage(res.message || 'Password reset successfully! You can now sign in with your new password.');
      setPassword(newPassword);
      setAuthMode('login');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Failed to reset password. Please check your token.');
    }
  };

  const selectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setEmail(preset.user.email);
    setPassword('AdminPassword@123');
    setErrorMessage('');
    setSuccessMessage('');
    setAuthMode('login');
  };

  const bypassWithDemoUser = (preset: typeof PRESET_ACCOUNTS[0]) => {
    authService.setCurrentUser(preset.user);
    onLogin(preset.user);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-center relative overflow-hidden antialiased">
      {/* Light Soft Background Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-50/80 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Brand & Platform Highlights */}
          <div className="lg:col-span-6 space-y-6 lg:pr-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 p-[1.5px] shadow-sm">
                <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
                  <Globe2 className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                  Wayfer
                </h1>
                <p className="text-xs text-slate-500 font-normal">Global Mobility & Events Ecosystem</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-snug">
                Unified administration for shared rides, live stages, and curated trips.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect directly to your local Wayfer API at <code className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-600 font-mono text-xs">{apiClient.getBaseUrl()}</code> with full JWT authentication, driver KYC auditing, and event ticketing controls.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Carpool Network</div>
                  <div className="text-[11px] text-slate-500">Live routes & seats</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Concerts & Stages</div>
                  <div className="text-[11px] text-slate-500">Festivals & ticketing</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Trip Planner</div>
                  <div className="text-[11px] text-slate-500">Curated itineraries</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Driver KYC</div>
                  <div className="text-[11px] text-slate-500">License verification</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200/70">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Wayfer JWT Auth Integrated
              </span>
              <span>•</span>
              <span>Active REST Endpoints</span>
            </div>
          </div>

          {/* Right Column: Dynamic Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">

              {/* Mode Switcher Tabs */}
              <div className="flex items-center border-b border-slate-100 pb-4 mb-5 justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {authMode === 'login' && 'Administrator Sign In'}
                    {authMode === 'register' && 'Register Admin Account'}
                    {authMode === 'forgot' && 'Reset Access Passcode'}
                    {authMode === 'reset' && 'Create New Passcode'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    {authMode === 'login' && 'Authenticate with your Wayfer admin account.'}
                    {authMode === 'register' && 'Create a verified administrative identity.'}
                    {authMode === 'forgot' && 'Request a password reset token via API.'}
                    {authMode === 'reset' && 'Provide your security token and new passcode.'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${authMode === 'login'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${authMode === 'register'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMessage}</span>
                    {errorMessage.includes('offline') && (
                      <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bypassWithDemoUser(PRESET_ACCOUNTS[0])}
                          className="inline-flex items-center gap-1 font-semibold text-rose-900 bg-white px-2.5 py-1 rounded-md border border-rose-300 hover:bg-rose-100 cursor-pointer text-[11px]"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Continue in Demo Mode</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Administrator Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@wayfer.com"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Security Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-600">Remember this device</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Endpoint: POST /api/admin/auth/login</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating via API...
                      </span>
                    ) : (
                      <>
                        <span>Authenticate & Enter Console</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2. REGISTER ADMIN FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      {registerTouched.name && !registerErrors.name && name.trim() && (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <User
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${registerTouched.name && registerErrors.name
                          ? 'text-rose-400'
                          : registerTouched.name && name.trim()
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                          }`}
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setName(val);
                          setRegisterTouched((prev) => ({ ...prev, name: true }));
                          setRegisterErrors((prev) => ({
                            ...prev,
                            name: validateName(val)
                          }));
                        }}
                        onBlur={() => {
                          setRegisterTouched((prev) => ({ ...prev, name: true }));
                          setRegisterErrors((prev) => ({
                            ...prev,
                            name: validateName(name)
                          }));
                        }}
                        placeholder="Super Admin"
                        className={`w-full rounded-xl bg-slate-50 border pl-10 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${registerTouched.name && registerErrors.name
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                          : registerTouched.name && name.trim()
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                          }`}
                        required
                      />
                      {registerTouched.name && !registerErrors.name && name.trim() && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    {registerTouched.name && registerErrors.name && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{registerErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        {registerTouched.email && !registerErrors.email && email.trim() && (
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${registerTouched.email && registerErrors.email
                            ? 'text-rose-400'
                            : registerTouched.email && email.trim()
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                            }`}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEmail(val);
                            setRegisterTouched((prev) => ({ ...prev, email: true }));
                            setRegisterErrors((prev) => ({
                              ...prev,
                              email: validateEmail(val)
                            }));
                          }}
                          onBlur={() => {
                            setRegisterTouched((prev) => ({ ...prev, email: true }));
                            setRegisterErrors((prev) => ({
                              ...prev,
                              email: validateEmail(email)
                            }));
                          }}
                          placeholder="admin@wayfer.com"
                          className={`w-full rounded-xl bg-slate-50 border pl-10 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${registerTouched.email && registerErrors.email
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                            : registerTouched.email && email.trim()
                              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                              : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                            }`}
                          required
                        />
                        {registerTouched.email && !registerErrors.email && email.trim() && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      {registerTouched.email && registerErrors.email && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
                          <span>{registerErrors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        {registerTouched.phone && !registerErrors.phone && phone.trim() && (
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${registerTouched.phone && registerErrors.phone
                            ? 'text-rose-400'
                            : registerTouched.phone && phone.trim()
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                            }`}
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhone(val);
                            setRegisterTouched((prev) => ({ ...prev, phone: true }));
                            setRegisterErrors((prev) => ({
                              ...prev,
                              phone: validatePhone(val)
                            }));
                          }}
                          onBlur={() => {
                            setRegisterTouched((prev) => ({ ...prev, phone: true }));
                            setRegisterErrors((prev) => ({
                              ...prev,
                              phone: validatePhone(phone)
                            }));
                          }}
                          placeholder="+919876543210"
                          className={`w-full rounded-xl bg-slate-50 border pl-10 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${registerTouched.phone && registerErrors.phone
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                            : registerTouched.phone && phone.trim()
                              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                              : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                            }`}
                          required
                        />
                        {registerTouched.phone && !registerErrors.phone && phone.trim() && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      {registerTouched.phone && registerErrors.phone && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
                          <span>{registerErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Administrative Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrative Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="admin">Platform Admin (Standard)</option>
                      <option value="Super Admin">Super Administrator</option>
                      <option value="Operations Lead">Operations Lead</option>
                      <option value="Event Curator">Event Curator</option>
                      <option value="Driver Auditor">Driver Auditor</option>
                    </select>
                  </div>

                  {/* Set Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Set Password <span className="text-rose-500">*</span>
                      </label>
                      {registerTouched.password && !registerErrors.password && password && (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Strong
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${registerTouched.password && registerErrors.password
                          ? 'text-rose-400'
                          : registerTouched.password && !registerErrors.password && password
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                          }`}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassword(val);
                          setRegisterTouched((prev) => ({ ...prev, password: true }));
                          setRegisterErrors((prev) => ({
                            ...prev,
                            password: validatePassword(val)
                          }));
                        }}
                        onBlur={() => {
                          setRegisterTouched((prev) => ({ ...prev, password: true }));
                          setRegisterErrors((prev) => ({
                            ...prev,
                            password: validatePassword(password)
                          }));
                        }}
                        placeholder="AdminPassword@123"
                        className={`w-full rounded-xl bg-slate-50 border pl-10 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${registerTouched.password && registerErrors.password
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                          : registerTouched.password && !registerErrors.password && password
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                          }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Inline Error Message */}
                    {registerTouched.password && registerErrors.password && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{registerErrors.password}</span>
                      </p>
                    )}

                    {/* Live Password Strength Checklist */}
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Security Requirements:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <span
                          className={`flex items-center gap-1 font-medium ${password.length >= 8 ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                          />
                          8+ characters
                        </span>
                        <span
                          className={`flex items-center gap-1 font-medium ${/[A-Z]/.test(password) ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                          />
                          1 uppercase (A-Z)
                        </span>
                        <span
                          className={`flex items-center gap-1 font-medium ${/[a-z]/.test(password) ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                          />
                          1 lowercase (a-z)
                        </span>
                        <span
                          className={`flex items-center gap-1 font-medium ${/[0-9]/.test(password) ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                          />
                          1 number (0-9)
                        </span>
                        <span
                          className={`col-span-2 flex items-center gap-1 font-medium ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                              }`}
                          />
                          1 special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">POST /api/admin/auth/register</code> on <span className="font-mono">{apiClient.getBaseUrl()}</span>
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Validating & Registering Admin...
                      </span>
                    ) : (
                      <>
                        <span>Register Administrator Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

              )}

              {/* 3. FORGOT PASSWORD FORM */}
              {authMode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Registered Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@wayfer.com"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">Endpoint: POST /api/admin/auth/forgot-password</p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Reset Request...
                      </span>
                    ) : (
                      <>
                        <span>Generate Reset Token</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMode('reset')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Have a token? Reset password
                    </button>
                  </div>
                </form>
              )}

              {/* 4. RESET PASSWORD FORM */}
              {authMode === 'reset' && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Reset Security Token
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="e.g. a4f89d318e47d48375e244d2d488581f..."
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Passcode
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="NewAdminPassword@456"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">Endpoint: POST /api/admin/auth/reset-password</p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Passcode...
                      </span>
                    ) : (
                      <>
                        <span>Submit New Password</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Fast 1-Click Role Presets */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
                  <span>Quick Demo Access (Click to autofill):</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_ACCOUNTS.map((preset) => {
                    const isSelected = email.toLowerCase() === preset.user.email.toLowerCase();
                    return (
                      <button
                        key={preset.user.id}
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className={`flex flex-col items-center text-center p-2 rounded-md border text-[11px] transition-all cursor-pointer ${isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                      >
                        <img
                          src={preset.user.avatar}
                          alt={preset.user.name}
                          className="h-7 w-7 rounded-full object-cover mb-1 ring-1 ring-slate-200"
                        />
                        <span className="truncate w-full">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div >
    </div >
  );
};
