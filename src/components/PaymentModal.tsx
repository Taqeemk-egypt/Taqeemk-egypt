import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, isLifetimeActive } = useAuth();
  const [referenceId, setReferenceId] = useState('');
  const [phone, setPhone] = useState(user?.paymentPhone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletNumber = '01515926729';
  const feeEGP = 100;

  const copyWalletNumber = () => {
    navigator.clipboard.writeText(walletNumber);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim() || !phone.trim()) {
      setErrorMsg('يرجى إدخال كلٍ من رقم هاتف المحول والرقم المرجعي للعملية.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.payment.submitProof({
        referenceId: referenceId.trim(),
        phone: phone.trim(),
        notes: notes.trim()
      });
      setUser(res.user);
      setSuccessMsg(res.message);
      if (res.status === 'approved') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إرسال بيانات التحويل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxInstantVerify = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.payment.sandboxInstantVerify();
      setUser(res.user);
      setSuccessMsg('⚡ تمت محاكاة التحقق بنجاح! تم فتح اشتراك مدى الحياة.');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      setErrorMsg(err.message || 'فشلت محاكاة الدفع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-['Cairo',sans-serif]" dir="rtl">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#121218] p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>تفعيل الحساب مدى الحياة (Lifetime Access)</span>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-400 font-black">
                {feeEGP} ج.م فقط
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              احصل على وصول غير محدود لروابط تقييم جوجل، القوائم المنظمة، الباركود الديناميكي، وشارة التوثيق.
            </p>
          </div>
        </div>

        {/* Status Alert if Already Approved or Pending */}
        {isLifetimeActive ? (
          <div className="mt-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="h-7 w-7 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-white">
              اشتراكك مفعل لمدى الحياة بنجاح!
            </h3>
            <p className="text-xs text-emerald-300 leading-relaxed max-w-md mx-auto font-medium">
              حسابك يتمتع بكامل صلاحيات باقة المحترفين: باركود ديناميكي غير محدود، روابط وتقييمات غير محدودة، وتحليلات فورية.
            </p>
            <button
              onClick={onClose}
              className="mt-3 rounded-2xl bg-emerald-500 px-7 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25"
            >
              متابعة إلى لوحة التحكم
            </button>
          </div>
        ) : user?.paymentStatus === 'pending' ? (
          <div className="mt-6 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-6 space-y-4">
            <div className="flex items-center gap-3 text-yellow-400">
              <Clock className="h-5 w-5 shrink-0 animate-spin" />
              <h3 className="text-sm font-black">طلب التحويل قيد المراجعة السريعة</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              تم استلام بيانات تحويل مبلغ <strong>{user.paymentAmount || feeEGP} ج.م</strong> بنجاح (الرقم المرجعي: <code className="text-yellow-300 font-mono font-bold" dir="ltr">{user.paymentReference}</code>). يقوم فريق الإدارة بتأكيد العملية.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSandboxInstantVerify}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-black text-white hover:opacity-90 transition shadow-lg shadow-emerald-600/20"
              >
                <Zap className="h-4 w-4" />
                <span>محاكاة التأكيد الفوري (Sandbox Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Egyptian Cash Instructions Card */}
            <div className="rounded-3xl border border-white/10 bg-[#161622] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  الخطوة 1: تحويل المبلغ عبر المحفظة
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  المبلغ: {feeEGP} جنيه مصري
                </span>
              </div>

              {/* Supported Egyptian Wallets */}
              <div className="flex flex-wrap items-center gap-2">
                {['فودافون كاش', 'إنستاباي (InstaPay)', 'أورنج كاش', 'اتصالات كاش', 'وي باي'].map(w => (
                  <span
                    key={w}
                    className="rounded-xl border border-white/10 bg-[#121218] px-3 py-1 text-[11px] font-bold text-slate-300"
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Cash Wallet Number Box */}
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold">رقم المحفظة الرسمية للتحويل:</p>
                  <p className="text-2xl font-black font-mono tracking-wider text-emerald-400 mt-0.5" dir="ltr">
                    {walletNumber}
                  </p>
                </div>

                <button
                  onClick={copyWalletNumber}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                >
                  {copiedWallet ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedWallet ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed pr-1 font-medium">
                <p>1. افتح تطبيق محفظتك (فودافون كاش، إنستاباي، أو أي محفظة بنكية).</p>
                <p>2. حوّل مبلغ <strong>{feeEGP} ج.م</strong> إلى الرقم: <strong className="font-mono text-emerald-400" dir="ltr">{walletNumber}</strong>.</p>
                <p>3. اكتب الرقم المرجعي للعملية ورقم الهاتف المحول منه في النموذج أدناه.</p>
              </div>
            </div>

            {/* Step 2: Submit Proof Form */}
            <form onSubmit={handleSubmitProof} className="rounded-3xl border border-white/10 bg-[#161622] p-5 sm:p-6 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                الخطوة 2: إرسال بيانات التأكيد
              </span>

              {errorMsg && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/15 p-3 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    رقم الهاتف المحوّل منه *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    dir="ltr"
                    placeholder="مثال: 01012345678"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white font-mono text-left focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    الرقم المرجعي للعملية (Reference ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceId}
                    onChange={e => setReferenceId(e.target.value)}
                    dir="ltr"
                    placeholder="مثال: TXN-8947219 أو كود الرسالة"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white font-mono text-left focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  ملاحظات إضافية (وقت التحويل / اسم المحفظة)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مثال: تم التحويل عبر فودافون كاش الساعة 4:30 عصراً"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'جارِ الإرسال...' : 'إرسال بيانات التحويل للتأكيد'}</span>
                </button>

                {/* Instant Sandbox Test Button */}
                <button
                  type="button"
                  onClick={handleSandboxInstantVerify}
                  disabled={isSubmitting}
                  title="تفعيل فوري لغرض الاختبار السريع"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>محاكاة التفعيل الفوري</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin note hint */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0c12] p-3.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>حساب المدير العام: <code className="text-white font-mono" dir="ltr">elemamyoussef34@gmail.com</code> يتمتع بتخطي كامل غير محدود.</span>
          </span>
        </div>
      </div>
    </div>
  );
};
