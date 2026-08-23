import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import DashboardApp from './App';

type Stage = 'login' | 'welcome' | 'app';

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
        <Shield size={24} />
      </span>
      <div>
        <strong className="block text-xl font-bold text-slate-900">FinGuard AI</strong>
        <small className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Smart Fraud Protection
        </small>
      </div>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSuccess();
    }, 400);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <Brand />
        <div className="my-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <ShieldCheck size={14} /> Secure Access
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your FinGuard AI fraud detection control center.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">Email or username</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 text-slate-400 focus-within:border-blue-500">
              <Mail size={16} />
              <input
                type="text"
                autoComplete="username"
                defaultValue="admin@finguard.ai"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">Password</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 text-slate-400 focus-within:border-blue-500">
              <LockKeyhole size={16} />
              <input
                type="password"
                autoComplete="current-password"
                defaultValue="••••••••••••"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                required
              />
            </div>
          </label>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-800 accent-blue-600" />
              Remember me
            </label>
            <button type="button" className="text-blue-400 hover:underline">Forgot password?</button>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Sign in as Admin</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck size={14} className="text-emerald-400" />
          Enterprise-grade protection with 256-bit encryption
        </p>
      </section>
    </main>
  );
}

function Welcome({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
          <Shield size={32} />
        </span>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          <Sparkles size={14} /> Systems Initialized
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white">
          Welcome to <span className="text-blue-400">FinGuard AI</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          Your fraud intelligence workspace is live. Monitor risk, investigate transactions, and protect every payment flow in real-time.
        </p>
        <button
          className="mx-auto mt-8 flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
          onClick={onContinue}
        >
          <span>Open Control Center</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}

export default function AuthApp() {
  const [stage, setStage] = useState<Stage>('app');

  if (stage === 'login') return <Login onSuccess={() => setStage('welcome')} />;
  if (stage === 'welcome') return <Welcome onContinue={() => setStage('app')} />;
  return <DashboardApp />;
}
