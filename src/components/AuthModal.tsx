import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Zap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          username,
          displayName: displayName || username
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشلت عملية المصادقة. يرجى التحقق من صحة البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick direct login for Super Admin
  const loginAsSuperAdmin = async () => {
    setMode('login');
    setEmail('elemamyoussef34@gmail.com');
    setPassword('KkK#6060');
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login('elemamyoussef34@gmail.com', 'KkK#6060');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول كمدير عام.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setMode('login');
    setEmail('elemamyoussef34@gmail.com');
    setPassword('KkK#6060');
    setErrorMsg(null);
  };

  // Quick fill helper for Demo user
  const fillDemoUser = () => {
    setMode('login');
    setEmail('sarah.designer@example.com');
    setPassword('demo1234');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-['Cairo',sans-serif]" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#121218] p-6 sm:p-8 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0c12] font-black text-emerald-400 text-xl">
              تق
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-3">
            {mode === 'login' ? 'مرحباً بك مجدداً في تقييمك' : 'إنشاء حساب جديد في تقييمك'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'سجّل دخولك للوصول إلى لوحة الروابط، الباركود الذكي، والتحليلات.'
              : 'انضم لأفضل منصة لإدارة الروابط المهنية وبطاقات تقييم جوجل والـ QR.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="my-4 flex rounded-2xl border border-white/10 bg-[#0c0c12] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/15 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">اسم المستخدم (المعرّف الخاص) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    dir="ltr"
                    placeholder="username"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] pl-8 pr-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">الاسم المعروض</label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="مثال: يوسف الإمام"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                dir="ltr"
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none text-left font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">كلمة المرور *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                dir="ltr"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0c0c12] pl-10 pr-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono text-left"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 disabled:opacity-50 active:scale-95"
          >
            <span>{isSubmitting ? 'جارِ التحقق...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب الآن'}</span>
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
          </button>
        </form>

        {/* 1-Click Fast Pre-configured Login Buttons */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            حسابات تجريبية بضغطة زر واحدة:
          </p>

          <button
            type="button"
            onClick={loginAsSuperAdmin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-950/20 px-4 py-2.5 text-xs text-amber-300 hover:bg-amber-950/40 transition group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <div className="text-right">
                <p className="font-black text-white">حساب المدير العام (Super Admin)</p>
                <p className="text-[10px] text-amber-400/90 font-mono" dir="ltr">elemamyoussef34@gmail.com</p>
              </div>
            </div>
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[10px] font-mono text-amber-300 font-bold border border-amber-500/30">
              دخول مباشر فوري
            </span>
          </button>

          <button
            type="button"
            onClick={fillDemoUser}
            className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] px-4 py-2.5 text-xs text-slate-300 hover:bg-[#1a1a28] transition"
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="h-5 w-5 text-slate-400" />
              <div className="text-right">
                <p className="font-bold text-white">حساب تجريبي (قيد مراجعة الدفع)</p>
                <p className="text-[10px] text-slate-400 font-mono" dir="ltr">sarah.designer@example.com</p>
              </div>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-mono text-slate-400 border border-white/5">
              تعبئة تلقائية
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
