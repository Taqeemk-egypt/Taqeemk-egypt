import React, { useState, useEffect } from 'react';
import type { User, SystemSettings, AuditLog } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Search,
  Check,
  X,
  Settings,
  ShieldAlert,
  Save,
  RefreshCw,
  ExternalLink,
  Ban,
  Unlock,
  QrCode,
  MousePointerClick,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenUserProfile?: (username: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenUserProfile }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'settings' | 'audit'>('pending');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, usersData, logsData] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getUsers(),
        api.admin.getAuditLogs()
      ]);

      setMetrics(overviewData.metrics);
      setSettings(overviewData.settings);
      setUsers(usersData.users);
      setAuditLogs(logsData.logs);
    } catch (err: any) {
      setActionMessage('فشل تحميل بيانات لوحة الإدارة: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handlePaymentAction = async (userId: string, action: 'approve' | 'reject' | 'grant_unlimited') => {
    try {
      await api.admin.updatePayment(userId, action);
      setActionMessage(`تم تحديث حالة الدفع إلى: ${action === 'approve' ? 'موافق عليه' : action === 'reject' ? 'مرفوض' : 'اشتراك مفتوح'}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage('خطأ في تنفيذ الإجراء: ' + err.message);
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      await api.admin.updateUserStatus(userId, !currentBanned);
      setActionMessage(`تم تحديث حالة تفعيل الحساب`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage('خطأ في تحديث الحالة: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await api.admin.updateSettings(settings);
      setSettings(res.settings);
      setActionMessage('تم حفظ وتحديث إعدادات النظام وأرقام الكاش بنجاح!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage('خطأ أثناء حفظ الإعدادات: ' + err.message);
    }
  };

  const pendingUsers = users.filter(u => u.paymentStatus === 'pending');
  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      {/* Admin Suite Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#121218] to-[#121218] p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>لوحة التحكم الرئيسية للمدير العام (Super Admin)</span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/40 uppercase">
                  MASTER
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                مسجّل بحساب: <code className="text-amber-300 font-mono" dir="ltr">elemamyoussef34@gmail.com</code> (صلاحية كاملة لمدى الحياة بدون دفع)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#161622] px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-[#1f1f2e] hover:text-white transition shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تحديث البيانات اللحظية</span>
        </button>
      </div>

      {actionMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              إجمالي المستخدمين
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{metrics.totalUsers}</span>
              <Users className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              طلبات بانتظار التأكيد
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-300 font-mono">{metrics.pendingApprovals}</span>
              <CreditCard className="h-4 w-4 text-amber-400" />
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              إجمالي الأرباح
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-emerald-400">{metrics.totalRevenueEGP}</span>
              <span className="text-xs text-emerald-500 font-bold">ج.م</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              مشتركين مدى الحياة
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{metrics.lifetimeUsers}</span>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              إجمالي النقرات
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{metrics.totalClicks}</span>
              <MousePointerClick className="h-4 w-4 text-indigo-400" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-4 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              مسحات الباركود
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{metrics.totalQrScans}</span>
              <QrCode className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === 'pending'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>طلبات التحويل قيد المراجعة</span>
          {pendingUsers.length > 0 && (
            <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-mono">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === 'users'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>إدارة المستخدمين</span>
          <span className="text-slate-500 text-[10px]">({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === 'settings'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>إعدادات النظام وأرقام الكاش</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === 'audit'
              ? 'border-rose-400 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>سجلات الأمان والرقابة (Audit Logs)</span>
        </button>
      </div>

      {/* Tab 1: Pending Verifications Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              طابور مراجعة تحويلات محافظ الكاش المصرية
            </h3>
            <span className="text-xs text-slate-400">
              تأكيد أرقام العمليات المحولة إلى 01515926729
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-8 text-center text-slate-500 shadow-xl">
              <Check className="mx-auto h-9 w-9 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-slate-200">لا توجد طلبات معلقة!</p>
              <p className="text-xs text-slate-500 mt-1">
                تمت مراجعة واعتماد جميع طلبات تحويل الكاش بنجاح.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-[#121218] p-5 shadow-xl"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{user.username}</span>
                      <span className="text-xs text-slate-400 font-mono" dir="ltr">({user.email})</span>
                      <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
                        بانتظار 100 ج.م
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500">الرقم المرجعي للعملية: </span>
                        <code className="text-emerald-400 font-mono font-bold" dir="ltr">
                          {user.paymentReference || 'N/A'}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">رقم الهاتف المحوّل منه: </span>
                        <code className="text-cyan-400 font-mono font-bold" dir="ltr">
                          {user.paymentPhone || 'N/A'}
                        </code>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono">
                      وقت التقديم: {new Date(user.paymentSubmittedAt || user.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handlePaymentAction(user.id, 'approve')}
                      className="flex items-center gap-1.5 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>تأكيد التحويل وتفعيل مدى الحياة</span>
                    </button>
                    <button
                      onClick={() => handlePaymentAction(user.id, 'reject')}
                      className="flex items-center gap-1 rounded-2xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                    >
                      <X className="h-4 w-4" />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث بالبريد أو اسم المستخدم..."
                className="w-full rounded-2xl border border-white/10 bg-[#121218] pr-9 pl-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 self-start sm:self-auto">
              عرض {filteredUsers.length} مستخدم مسجل
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#121218]/90 shadow-2xl">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-white/10 bg-[#0c0c12] text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">الدور (Role)</th>
                  <th className="p-4">حالة الدفع</th>
                  <th className="p-4">الروابط والزيارات</th>
                  <th className="p-4">مسحات الـ QR</th>
                  <th className="p-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                          alt={u.username}
                          className="h-9 w-9 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.displayName || u.username}</span>
                            {u.role === 'super_admin' && (
                              <span className="text-[10px] text-amber-400 font-mono font-bold">👑 مديرة عام</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono" dir="ltr">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          u.role === 'super_admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                          u.paymentStatus === 'approved' || u.paymentStatus === 'lifetime_unlimited'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : u.paymentStatus === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.paymentStatus === 'approved' ? 'مفعل مدى الحياة' : u.paymentStatus === 'pending' ? 'قيد المراجعة' : u.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-slate-300">
                        {u.linksCount || 0} روابط ({u.views || 0} زيارة)
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-cyan-400 font-bold">
                        {u.qrScans || 0} مسحة
                      </span>
                    </td>

                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'super_admin' && (
                          <>
                            {u.paymentStatus !== 'approved' && u.paymentStatus !== 'lifetime_unlimited' ? (
                              <button
                                onClick={() => handlePaymentAction(u.id, 'grant_unlimited')}
                                title="منح وصول مدى الحياة مجاناً"
                                className="rounded-xl p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                              >
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleToggleBan(u.id, Boolean(u.isBanned))}
                              title={u.isBanned ? 'إلغاء حظر الحساب' : 'حظر الحساب'}
                              className={`rounded-xl p-1.5 transition ${
                                u.isBanned ? 'text-red-400 hover:text-emerald-400' : 'text-slate-500 hover:text-red-400'
                              }`}
                            >
                              {u.isBanned ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                          </>
                        )}

                        {onOpenUserProfile && (
                          <button
                            onClick={() => onOpenUserProfile(u.username)}
                            title="معاينة الصفحة العامة"
                            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System & Wallet Settings */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                إعدادات التسعير ومحفظة الكاش
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تعديل رسوم التفعيل ورقم محفظة فودافون كاش المعروض لجميع المشتركين الجدد.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25"
            >
              <Save className="h-4 w-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                رسوم اشتراك مدى الحياة (بالجنيه المصري)
              </label>
              <input
                type="number"
                value={settings.lifetimeFeeEGP}
                onChange={e => setSettings({ ...settings, lifetimeFeeEGP: Number(e.target.value) })}
                className="w-full rounded-2xl border border-white/10 bg-[#0c0c12] px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                رقم محفظة الكاش الرسمية (فودافون كاش / إنستاباي)
              </label>
              <input
                type="text"
                value={settings.walletNumber}
                onChange={e => setSettings({ ...settings, walletNumber: e.target.value })}
                dir="ltr"
                className="w-full rounded-2xl border border-white/10 bg-[#0c0c12] px-4 py-2.5 text-xs text-white font-mono text-left focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sandbox Auto-Verify Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-5">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">
                وضع التفعيل التلقائي السريع (Sandbox Auto-Verify)
              </p>
              <p className="text-[11px] text-slate-400">
                عند التفعيل، يتم قبول وتفعيل اشتراك مدى الحياة تلقائياً بمجرد إرسال المستخدم لبيانات التحويل دون الحاجة لمراجعة يدوية.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.sandboxAutoVerify}
              onChange={e => setSettings({ ...settings, sandboxAutoVerify: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </form>
      )}

      {/* Tab 4: Security & Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            سجلات الأمان والعمليات الإدارية (Audit Logs)
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/5 bg-[#161622] p-3 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-amber-400 ml-2">[{log.action}]</span>
                  <span className="text-white font-mono" dir="ltr">{log.actorEmail}</span>
                  {log.details && <span className="text-slate-400 mr-2">— {log.details}</span>}
                </div>
                <span className="text-[11px] font-mono text-slate-500" dir="ltr">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
