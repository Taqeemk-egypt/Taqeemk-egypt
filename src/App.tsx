import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PhonePreview } from './components/PhonePreview';
import { LinksEditor } from './components/LinksEditor';
import { ProfileCustomizer } from './components/ProfileCustomizer';
import { QRCodeManager } from './components/QRCodeManager';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminDashboard } from './components/AdminDashboard';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { PublicProfileView } from './components/PublicProfileView';
import {
  Sparkles,
  Layers,
  QrCode,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Smartphone,
  Zap,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Lock,
  Star,
  CheckCircle2
} from 'lucide-react';

function DashboardContent() {
  const { user, profile, setProfile, isLifetimeActive, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'qr' | 'analytics' | 'admin'>('links');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [publicViewUsername, setPublicViewUsername] = useState<string | null>(null);

  // Check URL query on mount for public profile view (e.g. ?u=youssef)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uParam = params.get('u');
    if (uParam) {
      setPublicViewUsername(uParam);
    }
  }, []);

  // If a public profile is requested via URL or user preview
  if (publicViewUsername) {
    return (
      <PublicProfileView
        username={publicViewUsername}
        onBack={() => {
          setPublicViewUsername(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // Logged-in View
  if (user && profile) {
    return (
      <div className="min-h-screen bg-[#0c0c12] text-slate-100 flex flex-col font-['Cairo',sans-serif]" dir="rtl">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenPayment={() => setShowPaymentModal(true)}
          onOpenPublicView={() => setPublicViewUsername(profile.username)}
        />

        {/* Lifetime Activation Alert Banner for non-approved users */}
        {!isLifetimeActive && (
          <div className="bg-gradient-to-r from-amber-950/70 via-[#161622] to-amber-950/70 border-b border-amber-500/30 px-4 py-2.5">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <CreditCard className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {user.paymentStatus === 'pending'
                    ? 'طلبك قيد مراجعة التحويل (100 ج.م). يتم تأكيد التحويلات عبر فودافون كاش ومحافظ مصر بسرعة.'
                    : 'فعّل اشتراكك لمدى الحياة برسم لمرة واحدة قدره 100 ج.م عبر المحافظ الإلكترونية وإنستاباي.'}
                </span>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20 active:scale-95"
              >
                {user.paymentStatus === 'pending' ? 'عرض حالة الطلب / تجربة المحاكي' : 'تفعيل مدى الحياة (100 ج.م)'}
              </button>
            </div>
          </div>
        )}

        {/* Main Split Layout: Editor on Right (in RTL), Live Device Frame on Left */}
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor Workspace (7-8 cols) */}
            <div className={`${activeTab === 'admin' ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'} space-y-6`}>
              {activeTab === 'links' && (
                <LinksEditor
                  profile={profile}
                  setProfile={setProfile}
                />
              )}

              {activeTab === 'design' && (
                <ProfileCustomizer
                  profile={profile}
                  setProfile={setProfile}
                />
              )}

              {activeTab === 'qr' && (
                <QRCodeManager profile={profile} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView profile={profile} />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  onOpenUserProfile={username => setPublicViewUsername(username)}
                />
              )}
            </div>

            {/* Middle Live Phone Mockup (Sticky on Left in RTL) */}
            {activeTab !== 'admin' && (
              <div className="lg:col-span-5 xl:col-span-4 sticky top-24 hidden lg:block">
                <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-4 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 mb-3 text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <span>المعاينة اللحظية الحية (Live Mockup)</span>
                    </span>
                    <button
                      onClick={() => setPublicViewUsername(profile.username)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition"
                    >
                      <span>شاشة كاملة</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  <PhonePreview
                    profile={profile}
                    onOpenQR={() => setActiveTab('qr')}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    );
  }

  // Logged-out Landing Page
  return (
    <div className="min-h-screen bg-[#0c0c12] text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-slate-950" dir="rtl">
      <Navbar
        activeTab="links"
        setActiveTab={() => {}}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPayment={() => setShowAuthModal(true)}
        onOpenPublicView={() => {}}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[650px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text (7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-right space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>الجيل القادم من صفحات البايو والتقييمات والـ QR</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                جميع روابطك، تقييماتك، وقوائمك في <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-cyan-400">صفحة ذكية واحدة.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                تقييمك (Taqeemk) يمنحك تصميماً عصرياً فائق الأناقة مع بطاقات مخصصة لتقييمات جوجل، الواتساب، السوشيال ميديا، باركود QR ديناميكي، وتفعيل فوري عبر محافظ الكاش المصرية.
              </p>

              {/* Lifetime Access Promotion Box */}
              <div className="rounded-3xl border border-emerald-500/30 bg-[#121218]/90 p-5 max-w-lg mx-auto lg:mx-0 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">تفعيل الحساب لمدى الحياة</p>
                    <p className="text-2xl font-black text-white mt-0.5">100 جنيه مصري فقط</p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="text-[11px] text-slate-400 font-bold">فودافون كاش & إنستاباي</p>
                    <p className="text-base font-mono font-black text-emerald-400">01515926729</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-black text-slate-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 active:scale-95"
                >
                  <span>احجز رابطك الخاص الآن</span>
                  <ArrowLeft className="h-4 w-4 stroke-[3]" />
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#121218] px-6 py-4 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white transition"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>دخول المدير العام والمستخدمين</span>
                </button>
              </div>

              {/* Super Admin Notice */}
              <div className="pt-2 text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>حساب المدير العام جاهز: <code className="text-slate-200 font-mono font-bold" dir="ltr">elemamyoussef34@gmail.com</code> (كلمة المرور: <code className="text-slate-200 font-mono font-bold" dir="ltr">KkK#6060</code>)</span>
              </div>
            </div>

            {/* Right Hero Showcase Frame (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <PhonePreview
                profile={{
                  id: 'demo_youssef',
                  userId: 'demo_user',
                  username: 'youssef',
                  displayName: 'يوسف الإمام | مهندس برمجيات',
                  bio: 'مؤسس منصة تقييمك (Taqeemk) • متخصص في بناء الأنظمة السحابية وتطبيقات الويب الذكية',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                  themeId: 'cyber_emerald',
                  verified: true,
                  views: 1420,
                  dynamicQrScans: 89,
                  updatedAt: new Date().toISOString(),
                  socials: [
                    { platform: 'whatsapp', url: 'https://wa.me/201515926729', label: 'واتساب' },
                    { platform: 'google_review', url: 'https://g.page/r/', label: 'تقييم جوجل' },
                    { platform: 'instagram', url: 'https://instagram.com', label: 'إنستغرام' },
                    { platform: 'linkedin', url: 'https://linkedin.com', label: 'لينكد إن' }
                  ],
                  lists: [
                    {
                      id: 'l1',
                      title: '⭐ التقييمات وقنوات التواصل المباشرة',
                      order: 1,
                      links: [
                        {
                          id: 'demo1',
                          title: '⭐ قيّمنا على جوجل بـ 5 نجوم',
                          url: 'https://g.page/r/',
                          subtitle: 'ساعد عملاءنا الآخرين برأيك وتجربتك معنا',
                          platform: 'google_review',
                          type: 'link',
                          isActive: true,
                          clicks: 580,
                          highlight: 'glow',
                          createdAt: new Date().toISOString()
                        },
                        {
                          id: 'demo2',
                          title: '💬 محادثة واتساب فورية مباشرة',
                          url: 'https://wa.me/201515926729',
                          subtitle: 'استشارات وتطوير مشاريع مخصصة',
                          platform: 'whatsapp',
                          type: 'whatsapp',
                          isActive: true,
                          clicks: 420,
                          highlight: 'pulse',
                          createdAt: new Date().toISOString()
                        }
                      ]
                    }
                  ]
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="border-t border-white/10 bg-[#0e0e14]/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              مصمم لتحويل الزوار إلى عملاء وتقييمات إيجابية
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              كل الأدوات الاحترافية لتعزيز ظهور علامتك التجارية وثقة عملائك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 space-y-3 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">قوائم ذكية منظمة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                وداعاً للقوائم الطويلة المزدحمة. قسّم روابطك في أقسام قابلة للفتح والغلق مع بطاقات رسمية لكل منصة.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 space-y-3 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">باركود QR ذكي ديناميكي</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                اطبع الباركود مرة واحدة على كروتك وطاولاتك، وغيّر جهة التحويل في أي وقت دون إعادة الطباعة.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 space-y-3 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-white">بطاقات تقييم جوجل المباشرة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ضاعف تقييماتك على خرائط جوجل بضغطة زر واحدة توجه الزبون فوراً لكتابة 5 نجوم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0c0c12] py-8 text-center text-xs text-slate-500">
        <p>© 2026 تقييمك (Taqeemk). جميع الحقوق محفوظة. تحويلات المحافظ الإلكترونية المصرية: 01515926729 (100 ج.م مدى الحياة).</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
