import React, { useState } from 'react';
import type { UserProfile, LinkItem } from '../types';
import { getThemeById } from '../utils/themes';
import { PLATFORMS_CONFIG, BrandIcon, PlatformType } from './BrandIcons';
import {
  ExternalLink,
  Share2,
  CheckCircle2,
  QrCode,
  Check,
  Sparkles,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { api } from '../services/api';

interface PhonePreviewProps {
  profile: UserProfile | null;
  onLinkClick?: (linkId: string) => void;
  onOpenQR?: () => void;
  deviceType?: 'iphone' | 'android';
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  profile,
  onLinkClick,
  onOpenQR,
}) => {
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'android'>('iphone');
  const [copied, setCopied] = useState(false);

  if (!profile) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-[#121218]/50 p-8 text-center text-slate-500">
        لا توجد بيانات متاحة للملف الشخصي
      </div>
    );
  }

  const theme = getThemeById(profile.themeId);

  const handleLinkClick = async (e: React.MouseEvent, link: LinkItem) => {
    if (onLinkClick) {
      onLinkClick(link.id);
    }
    try {
      await api.profile.trackClick(profile.username, link.id);
    } catch (err) {
      // Non-blocking
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?u=${profile.username}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} على تقييمك (Taqeemk)`,
        text: profile.bio,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getHighlightClass = (highlight?: string) => {
    switch (highlight) {
      case 'glow':
        return 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25 animate-subtle-pulse';
      case 'pulse':
        return 'animate-pulse ring-1 ring-amber-400/80';
      case 'bounce':
        return 'hover:-translate-y-1 hover:shadow-xl transition-all';
      default:
        return 'hover:-translate-y-0.5 transition-transform';
    }
  };

  const coverIsImage = profile.coverType === 'image' && (profile.coverUrl || profile.coverValue);
  const coverImageUrl = profile.coverUrl || profile.coverValue;
  const coverGradientClass = profile.coverValue || 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900';

  return (
    <div className="relative mx-auto flex flex-col items-center">
      {/* Device Switcher Toggle Buttons */}
      <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#121218] p-1 shadow-md">
        <button
          onClick={() => setDeviceModel('iphone')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
            deviceModel === 'iphone'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>iPhone 16 Pro</span>
        </button>
        <button
          onClick={() => setDeviceModel('android')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
            deviceModel === 'android'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Android Ultra</span>
        </button>
      </div>

      {/* Outer Smartphone Hardware Frame */}
      <div className="relative h-[720px] w-[350px] sm:w-[360px] rounded-[52px] border-[10px] border-[#1a1a24] bg-black p-1.5 shadow-2xl shadow-black ring-1 ring-white/10 transition-all duration-300">
        {/* Hardware Status Buttons on Left/Right */}
        <div className="absolute -left-[13px] top-24 h-10 w-[3px] rounded-l bg-slate-700" />
        <div className="absolute -left-[13px] top-38 h-12 w-[3px] rounded-l bg-slate-700" />
        <div className="absolute -right-[13px] top-28 h-16 w-[3px] rounded-r bg-slate-700" />

        {/* Dynamic Island or Android Punch Hole */}
        {deviceModel === 'iphone' ? (
          <div className="absolute left-1/2 top-4.5 z-30 flex h-6 w-28 -translate-x-1/2 items-center justify-between rounded-full bg-black px-2 shadow-inner ring-1 ring-white/10">
            <div className="h-2 w-2 rounded-full bg-slate-900" />
            <div className="h-3 w-3 rounded-full bg-slate-950 ring-1 ring-slate-800" />
          </div>
        ) : (
          <div className="absolute left-1/2 top-4 z-30 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
        )}

        {/* Screen Bezel & Content Container */}
        <div
          dir="rtl"
          className={`relative h-full w-full overflow-y-auto rounded-[42px] ${theme.background} ${theme.textColor} no-scrollbar transition-colors duration-300 flex flex-col justify-between`}
        >
          {/* Top Status Bar (Battery, Wifi, Time) */}
          <div className="absolute top-2.5 left-6 right-6 flex items-center justify-between text-[11px] font-bold text-white/90 pointer-events-none z-30" dir="ltr">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 drop-shadow">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          <div>
            {/* TOP QUARTER BACKGROUND BANNER (خلفية الربع العلوي) */}
            <div className="relative h-36 w-full overflow-hidden">
              {coverIsImage ? (
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className={`h-full w-full ${coverGradientClass}`} />
              )}

              {/* Gradient Vignette overlay for smooth blend */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

              {/* Floating Top Action Icons over Banner */}
              <div className="absolute top-11 left-4 right-4 flex items-center justify-between z-20">
                <button
                  onClick={handleShare}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition border border-white/15 shadow-lg"
                  title="مشاركة الملف الشخصي"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                </button>

                {onOpenQR && (
                  <button
                    onClick={onOpenQR}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition border border-white/15 shadow-lg"
                    title="عرض الباركود QR"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Avatar & Identity overlapping the Top Quarter Banner */}
            <div className="px-4 -mt-12 flex flex-col items-center text-center relative z-20">
              <div className="relative group">
                {/* Glowing ring border */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 opacity-90 blur-sm" />
                <img
                  src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                  alt={profile.displayName}
                  className="relative h-22 w-22 rounded-full border-4 border-[#0c0c12] object-cover shadow-2xl"
                />
                {profile.verified && (
                  <div
                    className="absolute bottom-0 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md ring-2 ring-[#0c0c12]"
                    title="حساب موثق"
                  >
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <h2 className="mt-2.5 text-base font-extrabold tracking-tight">
                {profile.displayName || profile.username}
              </h2>
              <p className="text-[11px] opacity-75 font-mono dir-ltr">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-2 text-xs leading-relaxed opacity-90 max-w-[270px] line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {/* Social Quick Tap Bar */}
              {profile.socials && profile.socials.length > 0 && (
                <div className="mt-3.5 flex flex-wrap justify-center gap-2">
                  {profile.socials.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md transition shadow-md"
                      title={social.platform}
                    >
                      <BrandIcon platform={social.platform} size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Unified Vertical Links Stack - Seamless Pill Design, No Section Grouping */}
            <div className="px-4 mt-6 space-y-2.5">
              {(() => {
                const activeLinks = (Array.isArray(profile.links) && profile.links.length > 0)
                  ? profile.links.filter(l => l.isActive)
                  : (profile.lists?.flatMap(l => l.links || []) || []).filter(l => l.isActive);

                if (activeLinks.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs opacity-60">
                      لا توجد روابط منشورة بعد. أضف روابطك من لوحة التحكم!
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
                      onClick={e => handleLinkClick(e, link)}
                      className={`group relative flex items-center justify-between p-3.5 transition-all duration-200 border shadow-md ${
                        theme.cardBg
                      } ${theme.cardBorder} ${theme.buttonStyle} ${getHighlightClass(
                        link.highlight
                      )}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        {/* Official SVG Brand Icon Badge */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 shadow-sm ${platformConf.iconBgClass}`}
                        >
                          <BrandIcon platform={platformKey} size={18} />
                        </div>

                        <div className="truncate text-right flex-1">
                          <p className="text-xs font-bold tracking-tight truncate">
                            {link.title}
                          </p>
                          {link.subtitle && (
                            <p className="text-[10px] opacity-75 truncate mt-0.5">
                              {link.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                });
              })()}
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="pt-6 pb-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1 text-[10px] opacity-85 hover:opacity-100 transition border border-white/10"
            >
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>مدعوم بواسطة <strong>Taqeemk (تقييمك)</strong></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
