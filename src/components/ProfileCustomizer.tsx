import React, { useState } from 'react';
import type { UserProfile, SocialLink } from '../types';
import { THEMES } from '../utils/themes';
import { api } from '../services/api';
import { BrandIcon, PlatformType } from './BrandIcons';
import {
  Palette,
  User,
  Sparkles,
  Save,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Share2,
  Upload,
  RefreshCw,
  Layers
} from 'lucide-react';

interface ProfileCustomizerProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=techie',
  'https://api.dicebear.com/7.x/identicon/svg?seed=egypt'
];

export const COVER_GRADIENT_PRESETS = [
  {
    id: 'grad_burgundy',
    name: 'عنابي فاخر (Royal Burgundy)',
    class: 'bg-gradient-to-r from-[#4c0519] via-[#881337] to-[#1e030b]',
    previewClass: 'from-[#4c0519] via-[#881337] to-[#1e030b]'
  },
  {
    id: 'grad_emerald',
    name: 'زمرد سايبر (Emerald Cyber)',
    class: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900',
    previewClass: 'from-emerald-600 via-teal-700 to-slate-900'
  },
  {
    id: 'grad_neon_violet',
    name: 'نيون بنفسجي (Cyber Violet)',
    class: 'bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600',
    previewClass: 'from-purple-700 via-indigo-600 to-pink-600'
  },
  {
    id: 'grad_sunset',
    name: 'غروب الشفق (Sunset Flame)',
    class: 'bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800',
    previewClass: 'from-amber-600 via-rose-600 to-purple-800'
  },
  {
    id: 'grad_sapphire',
    name: 'أزرق ملكي (Royal Azure)',
    class: 'bg-gradient-to-r from-blue-700 via-cyan-600 to-slate-900',
    previewClass: 'from-blue-700 via-cyan-600 to-slate-900'
  },
  {
    id: 'grad_gold',
    name: 'الذهب الملكي (Royal Gold)',
    class: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-stone-900',
    previewClass: 'from-amber-600 via-yellow-600 to-stone-900'
  },
  {
    id: 'grad_dark_mesh',
    name: 'أوبسيديان داكن (Dark Obsidian)',
    class: 'bg-gradient-to-r from-neutral-900 via-slate-800 to-black',
    previewClass: 'from-neutral-900 via-slate-800 to-black'
  },
  {
    id: 'grad_ocean',
    name: 'محيط استوائي (Deep Lagoon)',
    class: 'bg-gradient-to-r from-teal-600 via-emerald-700 to-cyan-900',
    previewClass: 'from-teal-600 via-emerald-700 to-cyan-900'
  },
  {
    id: 'grad_crimson',
    name: 'قرمزي كوني (Cosmic Crimson)',
    class: 'bg-gradient-to-r from-red-700 via-rose-800 to-slate-950',
    previewClass: 'from-red-700 via-rose-800 to-slate-950'
  }
];

export const COVER_IMAGE_PRESETS = [
  {
    id: 'img_abstract_tech',
    name: 'تجريدي تقني داكن',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'img_cyber_waves',
    name: 'تموجات ثلاثية الأبعاد',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'img_dark_space',
    name: 'سديم فضائي عميق',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'img_minimal_architecture',
    name: 'معماري عصري فخم',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  }
];

export const ProfileCustomizer: React.FC<ProfileCustomizerProps> = ({
  profile,
  setProfile,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [selectedThemeId, setSelectedThemeId] = useState(profile.themeId || 'cyber_emerald');
  const [socials, setSocials] = useState<SocialLink[]>(profile.socials || []);

  // Cover Image / Top Quarter Background state
  const [coverType, setCoverType] = useState<'gradient' | 'image'>(profile.coverType || 'gradient');
  const [coverValue, setCoverValue] = useState<string>(
    profile.coverValue || COVER_GRADIENT_PRESETS[0].class
  );
  const [coverUrl, setCoverUrl] = useState<string>(profile.coverUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (themeToSave = selectedThemeId, cType = coverType, cVal = coverValue, cUrl = coverUrl) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.profile.updateProfile({
        displayName,
        bio,
        avatarUrl,
        coverType: cType,
        coverValue: cVal,
        coverUrl: cUrl,
        themeId: themeToSave,
        socials
      });
      setProfile(prev => (prev ? { ...prev, ...res.profile } : null));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (id: string) => {
    setSelectedThemeId(id);
    handleSave(id, coverType, coverValue, coverUrl);
  };

  const handleSelectGradientCover = (gradientClass: string) => {
    setCoverType('gradient');
    setCoverValue(gradientClass);
    // Instant live preview
    setProfile(prev => prev ? { ...prev, coverType: 'gradient', coverValue: gradientClass } : null);
  };

  const handleSelectImageCover = (url: string) => {
    setCoverType('image');
    setCoverUrl(url);
    setCoverValue(url);
    // Instant live preview
    setProfile(prev => prev ? { ...prev, coverType: 'image', coverUrl: url, coverValue: url } : null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2.5 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverType('image');
      setCoverUrl(result);
      setCoverValue(result);
      setProfile(prev => prev ? { ...prev, coverType: 'image', coverUrl: result, coverValue: result } : null);
    };
    reader.readAsDataURL(file);
  };

  const addSocial = () => {
    const newSocial: SocialLink = {
      platform: 'whatsapp',
      url: 'https://wa.me/201515926729',
      label: 'واتساب'
    };
    const updated = [...socials, newSocial];
    setSocials(updated);
  };

  const updateSocial = (idx: number, updates: Partial<SocialLink>) => {
    const updated = socials.map((s, i) => (i === idx ? { ...s, ...updates } : s));
    setSocials(updated);
  };

  const removeSocial = (idx: number) => {
    const updated = socials.filter((_, i) => i !== idx);
    setSocials(updated);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner and Quick Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Palette className="h-5 w-5" />
            </div>
            <span>تخصيص المظهر والهوية البصرية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اختر الثيم المفضل لصفحتك، عيّن خلفية الربع العلوي (الغلاف)، الصورة الرمزية، وأيقونات التواصل السريع.
          </p>
        </div>

        <button
          onClick={() => handleSave(selectedThemeId, coverType, coverValue, coverUrl)}
          disabled={isSaving}
          className="flex items-center gap-2 self-start sm:self-auto rounded-2xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 active:scale-95"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'جارِ الحفظ...' : saveSuccess ? 'تم الحفظ بنجاح!' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      {/* NEW: Cover Image / Top Quarter Background Section (خلفية الربع العلوي) */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>خلفية الربع العلوي / صورة الغلاف (Cover Banner)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              خلفية أنيقة تظهر في الربع العلوي من صفحتك خلف الصورة الشخصية لتعطي انطباعاً احترافياً وفخماً لزوارك.
            </p>
          </div>

          {/* Toggle Type: Gradient vs Image */}
          <div className="flex rounded-2xl border border-white/10 bg-[#0c0c12] p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setCoverType('gradient');
                setProfile(prev => prev ? { ...prev, coverType: 'gradient' } : null);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                coverType === 'gradient'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>تدرج لوني (Gradient)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCoverType('image');
                setProfile(prev => prev ? { ...prev, coverType: 'image' } : null);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                coverType === 'image'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>صورة أو رفع ملف (Image)</span>
            </button>
          </div>
        </div>

        {/* Live Banner Preview Card */}
        <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-white/15 shadow-xl flex items-center justify-center">
          {coverType === 'image' && (coverUrl || coverValue) ? (
            <img
              src={coverUrl || coverValue}
              alt="Cover Preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 h-full w-full ${coverValue || COVER_GRADIENT_PRESETS[0].class}`} />
          )}

          {/* Dark Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Centered Avatar badge preview */}
          <div className="relative z-10 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
              alt="Avatar"
              className="h-10 w-10 rounded-full border-2 border-white object-cover"
            />
            <div className="text-right">
              <span className="text-xs font-bold text-white block">{displayName || profile.username}</span>
              <span className="text-[10px] text-emerald-400 font-mono block" dir="ltr">@{profile.username}</span>
            </div>
          </div>
        </div>

        {/* Option 1: Gradient Presets */}
        {coverType === 'gradient' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">
              اختر التدرج اللوني لخلفية الربع العلوي:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COVER_GRADIENT_PRESETS.map(preset => {
                const isSelected = coverValue === preset.class;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectGradientCover(preset.class)}
                    className={`group cursor-pointer rounded-2xl border p-2.5 transition-all text-right ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-400/50'
                        : 'border-white/10 bg-[#161622]/80 hover:border-white/20 hover:bg-[#1a1a24]'
                    }`}
                  >
                    <div className={`h-12 w-full rounded-xl ${preset.class} shadow-inner flex items-center justify-center relative`}>
                      {isSelected && (
                        <div className="rounded-full bg-slate-950/80 p-1 text-emerald-400 shadow">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 mt-2 block truncate">
                      {preset.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Option 2: Image Upload or URL */}
        {coverType === 'image' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File upload from computer/mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  <span>رفع صورة من جهازك (مباشر):</span>
                </label>
                <label className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed border-white/15 bg-[#0c0c12] hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition p-4 text-center">
                  <Upload className="h-6 w-6 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-slate-200">اضغط لاختيار صورة الغلاف</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG أو WebP (أقصى حجم 2.5 ميجابايت)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct Image URL input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>أو أدخل رابط صورة مباشر (URL):</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={e => handleSelectImageCover(e.target.value)}
                    dir="ltr"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono text-left"
                  />
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => handleSelectImageCover('')}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                    >
                      إزالة صورة الغلاف
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Curated Cover Image Presets */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300">
                أو اختر من تصاميم وأغلفة تقييمك المقترحة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COVER_IMAGE_PRESETS.map(preset => {
                  const isSelected = coverUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectImageCover(preset.url)}
                      className={`group cursor-pointer rounded-2xl border p-2 transition-all text-right ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-400/50'
                          : 'border-white/10 bg-[#161622]/80 hover:border-white/20'
                      }`}
                    >
                      <div className="relative h-14 w-full rounded-xl overflow-hidden shadow">
                        <img src={preset.url} alt={preset.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 rounded-full bg-emerald-500 p-0.5 text-slate-950 shadow">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 mt-1.5 block truncate">
                        {preset.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Presets Grid */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>اختر الثيم والألوان (Theme Preset)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {THEMES.map(theme => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`group relative cursor-pointer rounded-2xl border p-3.5 transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-400/50 scale-[1.02]'
                    : 'border-white/10 bg-[#161622]/80 hover:border-white/25 hover:bg-[#1a1a24] hover:-translate-y-1'
                }`}
              >
                {/* Visual miniature preview */}
                <div className={`h-24 w-full rounded-xl ${theme.background} p-2 flex flex-col items-center justify-center gap-1 shadow-inner relative overflow-hidden`}>
                  <div className="h-4 w-4 rounded-full bg-white/20" />
                  <div className="h-2 w-16 rounded bg-white/30" />
                  <div className="h-2 w-12 rounded bg-white/20" />
                  <div className="mt-1 h-3 w-20 rounded bg-white/10 border border-white/20" />

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-emerald-500 p-0.5 text-slate-950 shadow-md">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {theme.name}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Details & Bio */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" />
          <span>بيانات الملف الشخصي (Profile Identity)</span>
        </h3>

        {/* Avatar Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>الصورة الشخصية / الشعار (Avatar)</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                alt="Avatar preview"
                className="h-20 w-20 rounded-full border-2 border-emerald-500/50 object-cover shadow-xl"
              />
              {profile.verified && (
                <div className="absolute bottom-0 left-0 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                  <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <input
                type="text"
                value={avatarUrl}
                onChange={e => {
                  setAvatarUrl(e.target.value);
                  setProfile(prev => prev ? { ...prev, avatarUrl: e.target.value } : null);
                }}
                dir="ltr"
                placeholder="رابط الصورة المباشر (URL)..."
                className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none text-left font-mono"
              />

              {/* Preset Avatars */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">صور مقترحة:</span>
                {AVATAR_PRESETS.map((pUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(pUrl);
                      setProfile(prev => prev ? { ...prev, avatarUrl: pUrl } : null);
                    }}
                    className="h-7 w-7 rounded-full border border-slate-700 overflow-hidden hover:scale-110 transition shrink-0"
                  >
                    <img src={pUrl} alt="preset" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Display Name & Custom Profile Handle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">الاسم المعروض (Display Name)</label>
            <input
              type="text"
              value={displayName}
              onChange={e => {
                setDisplayName(e.target.value);
                setProfile(prev => prev ? { ...prev, displayName: e.target.value } : null);
              }}
              placeholder="مثال: يوسف الإمام - مهندس برمجيات"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">معرّف الرابط المخصص (Handle)</label>
            <div className="flex items-center rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2.5 text-xs text-slate-400" dir="ltr">
              <span className="font-mono text-slate-500">taqeemk.app/</span>
              <span className="font-mono text-emerald-400 font-bold">{profile.username}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">النبذة التعريفية (Bio & Headline)</label>
            <span className="text-[11px] text-slate-500 font-mono">{bio.length}/200</span>
          </div>
          <textarea
            value={bio}
            onChange={e => {
              const val = e.target.value.slice(0, 200);
              setBio(val);
              setProfile(prev => prev ? { ...prev, bio: val } : null);
            }}
            rows={3}
            placeholder="أخبر زوارك بنبذة مختصرة عنك أو عن نشاطك التجاري، وكيف يمكنهم التواصل معك..."
            className="w-full rounded-xl border border-white/10 bg-[#0c0c12] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Social Media Links Section */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              شريط أيقونات التواصل السريع
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تظهر هذه الأيقونات كأزرار دائرية فورية أسفل صورتك التعريفية في أعلى الصفحة.
            </p>
          </div>

          <button
            onClick={addSocial}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>إضافة منصة</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {socials.map((social, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[#161622]/80 p-3"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  <BrandIcon platform={social.platform} size={16} />
                </div>
                <select
                  value={social.platform}
                  onChange={e => updateSocial(idx, { platform: e.target.value as any })}
                  className="w-full sm:w-44 rounded-xl border border-white/10 bg-[#0c0c12] px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                  <option value="google_review">تقييم جوجل (Google Review)</option>
                  <option value="instagram">إنستغرام (Instagram)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="youtube">يوتيوب (YouTube)</option>
                  <option value="x">إكس / تويتر (X)</option>
                  <option value="telegram">تيليجرام (Telegram)</option>
                  <option value="linkedin">لينكد إن (LinkedIn)</option>
                  <option value="github">جيت هب (GitHub)</option>
                  <option value="email">البريد الإلكتروني (Email)</option>
                  <option value="website">موقع إلكتروني (Website)</option>
                </select>
              </div>

              <input
                type="text"
                value={social.url}
                onChange={e => updateSocial(idx, { url: e.target.value })}
                dir="ltr"
                placeholder="https://..."
                className="flex-1 rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-1.5 text-xs text-slate-200 font-mono text-left focus:border-emerald-500 focus:outline-none w-full"
              />

              <button
                type="button"
                onClick={() => removeSocial(idx)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 self-end sm:self-auto"
                title="حذف الأيقونة"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
