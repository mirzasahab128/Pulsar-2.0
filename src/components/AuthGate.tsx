import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SignInPage } from './SignInPage';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Clock, ShieldOff, LogOut } from 'lucide-react';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading, resendVerification, access, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center lg-aurora-bg bg-[var(--lg-bg-base)] text-[var(--lg-text-primary)]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white mb-4 animate-pulse">
          <span className="font-extrabold text-xl">P</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--lg-text-secondary)]">
          <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying security session...</span>
        </div>
      </div>
    );
  }

  // Not signed in: strictly show only the sign-in page
  if (!currentUser) {
    return <SignInPage />;
  }

  // Phases 1–3 (§3d): platform account status gate. The server enforces the
  // same statuses on feature endpoints (403 ACCOUNT_NOT_ACTIVE); these
  // screens are the client reflection. A null access (server unreachable)
  // does not block — enforcement lives server-side.
  if (access && access.status === 'pending_approval') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center lg-aurora-bg bg-[var(--lg-bg-base)] text-[var(--lg-text-primary)] px-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-white mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold mb-2">Your account is awaiting approval</h1>
        <p className="text-sm text-[var(--lg-text-secondary)] max-w-md text-center mb-6">
          Thanks for signing up. A Pulsar administrator needs to approve your account and
          assign a plan before you can access the workspace. You'll get an email once you're approved.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="px-4 py-2 rounded-xl border border-slate-600 text-sm font-semibold flex items-center gap-2 hover:bg-white/5 transition"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    );
  }

  if (access && access.status === 'disabled') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center lg-aurora-bg bg-[var(--lg-bg-base)] text-[var(--lg-text-primary)] px-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-rose-500/25 text-white mb-4">
          <ShieldOff className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold mb-2">Account disabled</h1>
        <p className="text-sm text-[var(--lg-text-secondary)] max-w-md text-center mb-6">
          This account has been disabled. If you believe this is a mistake, contact your Pulsar administrator.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="px-4 py-2 rounded-xl border border-slate-600 text-sm font-semibold flex items-center gap-2 hover:bg-white/5 transition"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    );
  }

  const isPasswordProvider = currentUser.providerData.some(p => p.providerId === 'password');
  const isUnverified = isPasswordProvider && !currentUser.emailVerified;

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      await resendVerification();
      setResendStatus('Verification email resent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setResendStatus(err?.message || 'Could not resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {isUnverified && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3 relative z-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Your email <strong>{currentUser.email}</strong> is unverified. Please confirm your email address.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {resendStatus ? (
              <span className="text-emerald-400 font-medium text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {resendStatus}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Verification'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </>
  );
};
