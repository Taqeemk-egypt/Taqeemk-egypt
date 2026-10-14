import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Link2,
  Palette,
  QrCode,
  BarChart3,
  ShieldCheck,
  CreditCard,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Eye,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'links' | 'design' | 'qr' | 'analytics' | 'admin';
  setActiveTab: (tab: 'links' | 'design' | 'qr' | 'analytics' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenPayment: () => void;
  onOpenPublicView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPayment,
  onOpenPublicView
}) => {
  const { user, profile, logout, isLifetimeActive, isSuperAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!profile?.username) return;
    const url = `${window.location.origin}?u=${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c0c12]/85 backdrop-blur-2xl" dir="rtl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Profile URL */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveTab('links')}
            className="group flex cursor-pointer items-center gap-2.5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0c12] font-black text-emerald-400 text-base">
                تق
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-white text-lg">تقييمك</span>
                <span className="text-xs text-slate-400 font-mono font-bold">Taqeemk</span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">الروابط الذكية وبطاقات التقييم والـ QR</p>
            </div>
          </div>

          {user && profile && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-[#121218] px-3 py-1 text-xs text-slate-300">
              <span className="text-slate-500 font-mono" dir="ltr">taqeemk.app/</span>
              <span className="font-bold text-emerald-400 font-mono" dir="ltr">{profile.username}</span>
              <button
                onClick={handleCopyLink}
                title="نسخ رابط صفحتك"
                className="mr-1 rounded p-1 hover:bg-slate-800 hover:text-white transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              </button>
              <button
                onClick={onOpenPublicView}
                title="معاينة الصفحة العامة"
                className="rounded p-1 hover:bg-slate-800 hover:text-white transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Center Navigation Tabs (RTL) */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-[#121218]/90 p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'links'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Link2 className="h-4 w-4" />
              <span>اللينكات (Links)</span>
            </button>

            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'design'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Palette className="h-4 w-4" />
              <span>المظهر (Design)</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'qr'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>باركود QR</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>التحليلات (Analytics)</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black transition ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/25 text-amber-300 shadow-sm border border-amber-500/50'
                    : 'text-amber-400/90 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>لوحة الإدارة (Admin)</span>
              </button>
            )}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="text-slate-400">100 جنيه مصري فقط لمدى الحياة</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-emerald-400 font-mono font-bold">فودافون كاش وإنستاباي: 01515926729</span>
          </div>
        )}

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {isSuperAdmin ? (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>المدير العام (Super Admin)</span>
                </div>
              ) : isLifetimeActive ? (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>اشتراك مدى الحياة مفعّل</span>
                </div>
              ) : user.paymentStatus === 'pending' ? (
                <button
                  onClick={onOpenPayment}
                  className="flex items-center gap-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-xs font-bold text-yellow-300 hover:bg-yellow-500/30 transition animate-pulse"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>قيد مراجعة الدفع</span>
                </button>
              ) : (
                <button
                  onClick={onOpenPayment}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-400 transition"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>تفعيل الحساب (100 ج.م)</span>
                </button>
              )}

              {/* Public Preview Button */}
              <button
                onClick={onOpenPublicView}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#121218] px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">معاينة</span>
              </button>

              {/* User Dropdown */}
              <div className="flex items-center gap-2 pr-1 border-r border-white/10">
                <img
                  src={profile?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                  alt={user.username}
                  className="h-8 w-8 rounded-full border border-emerald-500/40 object-cover"
                />
                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="rounded-xl border border-white/10 bg-[#121218] px-4 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/25 hover:bg-emerald-400 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>أنشئ صفحتك</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      {user && (
        <div className="flex md:hidden border-t border-white/10 bg-[#0c0c12] px-2 py-1.5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold ${
              activeTab === 'links' ? 'bg-emerald-500/25 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>اللينكات</span>
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold ${
              activeTab === 'design' ? 'bg-emerald-500/25 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>المظهر</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold ${
              activeTab === 'qr' ? 'bg-emerald-500/25 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>باركود QR</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold ${
              activeTab === 'analytics' ? 'bg-emerald-500/25 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>التحليلات</span>
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-black ${
                activeTab === 'admin' ? 'bg-amber-500/25 text-amber-300' : 'text-amber-400'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>الإدارة</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
