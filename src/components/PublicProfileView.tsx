import React, { useState, useEffect } from 'react';
import type { UserProfile, LinkItem } from '../types';
import { getThemeById } from '../utils/themes';
import { PLATFORMS_CONFIG, BrandIcon, PlatformType } from './BrandIcons';
import { api } from '../services/api';
import QRCode from 'qrcode';
import {
  ExternalLink,
  Share2,
  CheckCircle2,
  QrCode,
  Check,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface PublicProfileViewProps {
  username: string;
  onBack?: () => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ username, onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.profile.getPublicProfile(username);
        setProfile(res.profile);
      } catch (err: any) {
        setError(err.message || 'الملف الشخصي غير موجود أو تم تعطيله');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (showQrModal && profile) {
      const url = `${window.location.origin}?u=${profile.username}`;
      QRCode.toDataURL(url, { width: 320, margin: 2 }, (err, dataUrl) => {
        if (!err) setQrDataUrl(dataUrl);
      });
    }
  }, [showQrModal, profile]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c12] text-white" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-bold">جارِ تحميل صفحة تقييمك...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c12] p-6 text-center text-white" dir="rtl">
        <div className="rounded-3xl border border-white/10 bg-[#121218] p-8 max-w-md shadow-2xl">
          <h1 className="text-xl font-black text-white">الصفحة غير متوفرة</h1>
          <p className="text-xs text-slate-400 mt-2">{error || 'هذا الحساب غير موجود أو تم إيقافه.'}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-6 rounded-2xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              العودة للرئيسية
            </button>
          )}
        </div>
      </div>
    );
  }

  const theme = getThemeById(profile.themeId);

  const handleLinkClick = async (link: LinkItem) => {
    try {
      await api.profile.trackClick(profile.username, link.id);
    } catch (e) {
      // Non-blocking
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?u=${profile.username}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} على تقييمك`,
        text: profile.bio,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const coverIsImage = profile.coverType === 'image' && (profile.coverUrl || profile.coverValue);
  const coverImageUrl = profile.coverUrl || profile.coverValue;
  const coverGradientClass = profile.coverValue || 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900';

  return (
    <div className={`min-h-screen ${theme.background} ${theme.textColor} transition-colors duration-300 font-['Cairo',sans-serif]`} dir="rtl">
      {/* Top Floating Controls */}
      <div className="fixed top-4 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between pointer-events-none">
        {onBack ? (
          <button
            onClick={onBack}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-xl px-4 py-2 text-xs font-bold text-white border border-white/15 hover:bg-black/70 transition shadow-xl"
          >
            <ArrowRight className="h-4 w-4" />
            <span>لوحة التحكم</span>
          </button>
        ) : <div />}

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl text-white border border-white/15 hover:bg-black/70 transition shadow-xl"
            title="مسح كود QR"
          >
            <QrCode className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-xl text-white border border-white/15 hover:bg-black/70 transition shadow-xl"
            title="مشاركة الصفحة"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* TOP QUARTER BACKGROUND BANNER (خلفية الربع العلوي) */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden shadow-2xl">
        {coverIsImage ? (
          <img
            src={coverImageUrl}
            alt="Cover Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full ${coverGradientClass}`} />
        )}

        {/* Gradient Vignette overlay for seamless visual blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Main Profile Container */}
      <div className="mx-auto max-w-md px-5 -mt-16 sm:-mt-20 pb-16 relative z-30">
        {/* Profile Card Header overlapping Cover */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 opacity-90 blur-sm" />
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
              alt={profile.displayName}
              className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-[#0c0c12] object-cover shadow-2xl"
            />
            {profile.verified && (
              <div
                className="absolute bottom-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg ring-3 ring-[#0c0c12]"
                title="حساب موثق ومؤكد"
              >
                <CheckCircle2 className="h-4.5 w-4.5 stroke-[3]" />
              </div>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight">
            {profile.displayName || profile.username}
          </h1>

          <p className="text-xs font-mono opacity-80 mt-1 dir-ltr text-emerald-400 font-bold">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="mt-3 text-sm leading-relaxed opacity-90 max-w-sm">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Bar */}
          {profile.socials && profile.socials.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {profile.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md transition-all shadow-md hover:scale-110 active:scale-95"
                  title={social.platform}
                >
                  <BrandIcon platform={social.platform} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Unified Vertical Links Stack - Seamless Pill Design, No Section Grouping */}
        <div className="mt-8 space-y-3">
          {(() => {
            const activeLinks = (Array.isArray(profile.links) && profile.links.length > 0)
              ? profile.links.filter(l => l.isActive)
              : (profile.lists?.flatMap(l => l.links || []) || []).filter(l => l.isActive);

            if (activeLinks.length === 0) {
              return (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-xs opacity-70">
                  لم يقم هذا المستخدم بنشر روابط حتى الآن.
                </div>
              );
            }

            return activeLinks.map(link => {
              const platformKey = (link.platform as PlatformType) || (link.type as PlatformType) || 'custom';
              const platformConf = PLATFORMS_CONFIG[platformKey] || PLATFORMS_CONFIG.custom;

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className={`group relative flex items-center justify-between p-4 transition-all duration-300 border shadow-md hover:scale-[1.01] hover:-translate-y-0.5 ${
                    theme.cardBg
                  } ${theme.cardBorder} ${theme.buttonStyle}`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                    {/* Official SVG Brand Icon Badge */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform group-hover:scale-110 ${platformConf.iconBgClass}`}>
                      <BrandIcon platform={platformKey} size={22} />
                    </div>

                    <div className="truncate text-right flex-1">
                      <p className="text-sm font-black tracking-tight truncate">
                        {link.title}
                      </p>
                      {link.subtitle && (
                        <p className="text-xs opacity-75 truncate mt-0.5">
                          {link.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ExternalLink className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:-translate-x-0.5 transition" />
                </a>
              );
            });
          })()}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-5 py-2 text-xs font-bold opacity-85 hover:opacity-100 transition border border-white/10 shadow-lg"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>أنشئ صفحتك المجانية عبر <strong>Taqeemk (تقييمك)</strong></span>
          </a>
        </div>
      </div>

      {/* QR Code Modal for Visitors */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#121218] p-6 text-center text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 left-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-white">{profile.displayName}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono dir-ltr">@{profile.username}</p>

            <div className="my-5 flex justify-center">
              {qrDataUrl ? (
                <div className="rounded-2xl bg-white p-3.5 shadow-2xl ring-4 ring-emerald-500/20">
                  <img src={qrDataUrl} alt="QR Code" className="h-56 w-56 rounded-xl" />
                </div>
              ) : (
                <div className="h-56 w-56 animate-pulse bg-slate-800 rounded-2xl" />
              )}
            </div>

            <p className="text-xs text-slate-300 font-semibold">
              وجّه كاميرا هاتفك الذكي نحو هذا الباركود لفتح الصفحة مباشرة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
