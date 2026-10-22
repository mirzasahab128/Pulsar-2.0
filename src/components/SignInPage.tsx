import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const SignInPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMessage('Password reset link sent to your email. Please check your inbox.');
      } else if (mode === 'signup') {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
        setSuccessMessage('Account created! Verification email has been sent.');
      } else {
        if (!password) {
          throw new Error('Please enter your password.');
        }
        await signInWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in window closed before authentication finished.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage('Network connection error. Please check your internet connection.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please check your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Google sign-in could not be completed. Please ensure popups are permitted.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg-aurora-bg relative overflow-hidden bg-[var(--lg-bg-base)] text-[var(--lg-text-primary)]">
      {/* Top Controls: Branding & Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="lg-glass lg-btn-ghost p-2.5 rounded-full text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-cyan-600" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full lg-glass mb-4 border border-[var(--lg-emerald)]/30">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--lg-emerald)] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--lg-emerald)]">
              Enterprise Workspace
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display">Pulsar</h1>
          </div>
          <p className="text-sm text-[var(--lg-text-secondary)] max-w-xs mx-auto">
            AI-Powered Business Development &amp; Revenue Intelligence
          </p>
        </div>

        {/* Liquid Glass Auth Card */}
        <div className="lg-glass p-6 sm:p-8 rounded-3xl relative">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl p-1 bg-[var(--lg-bg-elevated)] border border-[var(--lg-border-glass)] mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div 
              role="alert" 
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div 
              role="status" 
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google 1-Click Auth */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border border-[var(--lg-border-glass)] bg-[var(--lg-bg-elevated)] hover:border-emerald-500/50 hover:bg-[var(--lg-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--lg-border-glass)]" />
                </div>
                <span className="relative px-3 text-xs uppercase tracking-wider text-[var(--lg-text-muted)] bg-[var(--lg-bg-card)]">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label 
                  htmlFor="displayName" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--lg-text-secondary)] mb-1.5"
                >
                  Full Name / Title
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lg-text-muted)]" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Alex Vance, MD"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--lg-bg-elevated)] border border-[var(--lg-border-glass)] text-sm placeholder-[var(--lg-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--lg-emerald)] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--lg-text-secondary)] mb-1.5"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lg-text-muted)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@practice.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--lg-bg-elevated)] border border-[var(--lg-border-glass)] text-sm placeholder-[var(--lg-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--lg-emerald)] transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="password" 
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--lg-text-secondary)]"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
                      className="text-xs text-[var(--lg-emerald)] hover:underline focus:outline-none"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lg-text-muted)]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--lg-bg-elevated)] border border-[var(--lg-border-glass)] text-sm placeholder-[var(--lg-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--lg-emerald)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lg-text-muted)] hover:text-[var(--lg-text-primary)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full lg-btn lg-btn-primary mt-2 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/25"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : mode === 'forgot' ? (
                <span>Send Password Reset Link</span>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Cancel */}
          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                className="text-xs text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Security & Role Enforcement Guarantee */}
          <div className="mt-6 pt-5 border-t border-[var(--lg-border-glass)] text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--lg-text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--lg-emerald)]" />
              <span>Multi-tenant isolation &bull; Verified Firebase authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
