import React, { useState, useEffect } from 'react';
import type { UserProfile, LinkItem } from '../types';
import { api } from '../services/api';
import {
  PLATFORMS_CONFIG,
  BrandIcon,
  PlatformType
} from './BrandIcons';
import {
  Plus,
  Trash2,
  MoveUp,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Link as LinkIcon,
  Save,
  MousePointerClick,
  ExternalLink,
  Flame,
  Star,
  Sliders
} from 'lucide-react';

interface LinksEditorProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onSaveSuccess?: () => void;
}

export const LinksEditor: React.FC<LinksEditorProps> = ({
  profile,
  setProfile,
  onSaveSuccess
}) => {
  // Extract initial flat links list from profile.links or flattened lists
  const extractFlatLinks = (): LinkItem[] => {
    if (Array.isArray(profile.links) && profile.links.length > 0) {
      return profile.links;
    }
    if (Array.isArray(profile.lists) && profile.lists.length > 0) {
      return profile.lists.flatMap(l => l.links || []);
    }
    return [];
  };

  const [links, setLinks] = useState<LinkItem[]>(extractFlatLinks());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Platform Selector Drawer / Modal state
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('google_review');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');

  // Synchronize when profile updates
  useEffect(() => {
    setLinks(extractFlatLinks());
  }, [profile.links, profile.lists]);

  const handleSave = async (updatedLinks: LinkItem[] = links) => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.profile.updateLinks(updatedLinks);
      const newLinks = res.links || updatedLinks;

      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          links: newLinks,
          lists: [{
            id: 'default_unified_list',
            title: 'روابطي',
            order: 1,
            links: newLinks
          }]
        };
      });

      setSaveMessage('تم حفظ وتحديث جميع الروابط بنجاح!');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage('خطأ أثناء الحفظ: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setIsSaving(false);
    }
  };

  // Open the "إختار نوع اللينك" creator
  const openPlatformPicker = () => {
    setShowPlatformPicker(true);
    const defaultConf = PLATFORMS_CONFIG['google_review'];
    setSelectedPlatform('google_review');
    setCustomTitle(defaultConf.defaultTitleAr);
    setCustomUrl(defaultConf.defaultUrl);
    setCustomSubtitle(defaultConf.descriptionAr);
  };

  const handleSelectPlatform = (pKey: PlatformType) => {
    setSelectedPlatform(pKey);
    const conf = PLATFORMS_CONFIG[pKey];
    setCustomTitle(conf.defaultTitleAr);
    setCustomUrl(conf.defaultUrl);
    setCustomSubtitle(conf.descriptionAr);
  };

  const confirmAddLinkWithPlatform = () => {
    const conf = PLATFORMS_CONFIG[selectedPlatform];

    const newLink: LinkItem = {
      id: 'lnk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: customTitle.trim() || conf.defaultTitleAr,
      url: customUrl.trim() || conf.defaultUrl,
      subtitle: customSubtitle.trim() || conf.descriptionAr,
      platform: selectedPlatform,
      type: selectedPlatform,
      isActive: true,
      clicks: 0,
      highlight: selectedPlatform === 'google_review' ? 'glow' : 'none',
      createdAt: new Date().toISOString()
    };

    const updated = [newLink, ...links];
    setLinks(updated);
    setShowPlatformPicker(false);
    handleSave(updated);
  };

  // Link controls
  const updateLink = (linkId: string, updates: Partial<LinkItem>) => {
    const updated = links.map(lnk => (lnk.id === linkId ? { ...lnk, ...updates } : lnk));
    setLinks(updated);
  };

  const removeLink = (linkId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    const updated = links.filter(lnk => lnk.id !== linkId);
    setLinks(updated);
    handleSave(updated);
  };

  const moveLink = (linkIdx: number, direction: 'up') => {
    if (direction === 'up' && linkIdx === 0) return;

    const targetIdx = linkIdx - 1;
    const newLinks = [...links];
    const temp = newLinks[linkIdx];
    newLinks[linkIdx] = newLinks[targetIdx];
    newLinks[targetIdx] = temp;

    setLinks(newLinks);
    handleSave(newLinks);
  };

  const availablePlatforms = Object.keys(PLATFORMS_CONFIG) as PlatformType[];

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md">
              <LinkIcon className="h-5 w-5" />
            </div>
            <span>إدارة الروابط (Links Management)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            روابطك تظهر كقائمة رأسية موحدة ومنسقة مباشرة للزوار بدون فواصل أو تقسيم أقسام معقدة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Primary Action Button: + إضافة رابط جديد */}
          <button
            onClick={openPlatformPicker}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ إضافة رابط جديد</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* DRAWER / POPUP: "إختار نوع اللينك" Platform Cards Grid */}
      {showPlatformPicker && (
        <div className="rounded-3xl border-2 border-emerald-500/50 bg-[#161622] p-6 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 mb-1">
                <Sparkles className="h-3 w-3" />
                <span>إختار نوع اللينك</span>
              </span>
              <h3 className="text-lg font-black text-white">
                اختر المنصة لإضافتها إلى قائمتك
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                بطاقات مصممة مسبقاً بألوان وهويات العلامات التجارية الرسمية لتجربة مستخدم فاخرة.
              </p>
            </div>

            <button
              onClick={() => setShowPlatformPicker(false)}
              className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              ✕
            </button>
          </div>

          {/* Platform Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {availablePlatforms.map(pKey => {
              const conf = PLATFORMS_CONFIG[pKey];
              const isSelected = selectedPlatform === pKey;

              return (
                <div
                  key={pKey}
                  onClick={() => handleSelectPlatform(pKey)}
                  className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 text-right flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-400/50 scale-[1.02]'
                      : 'border-white/10 bg-[#121218]/80 hover:border-white/25 hover:bg-[#1a1a24] hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${conf.iconBgClass}`}
                    >
                      <BrandIcon platform={pKey} size={22} />
                    </div>

                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-md">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {conf.nameAr}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {conf.descriptionAr}
                    </p>
                  </div>

                  {/* Active highlight bar indicator */}
                  <div
                    className={`mt-3 h-1 w-full rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-emerald-400' : 'bg-transparent group-hover:bg-white/20'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Platform Quick Customizer Form */}
          <div className="rounded-2xl border border-white/10 bg-[#121218] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${PLATFORMS_CONFIG[selectedPlatform].iconBgClass}`}>
                <BrandIcon platform={selectedPlatform} size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  تخصيص بيانات {PLATFORMS_CONFIG[selectedPlatform].nameAr}
                </h4>
                <p className="text-[11px] text-slate-400">
                  عدّل العنوان والرابط المباشر للزر
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">نص الزر / العنوان المعروض</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="مثال: قيمنا 5 نجوم على جوجل ⭐"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">الرابط المستهدف (URL)</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2 text-xs text-white font-mono text-left focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">وصف توضيحي قصير (Subtitle - اختياري)</label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={e => setCustomSubtitle(e.target.value)}
                  placeholder="مثال: شاركنا رأيك وساعدنا على التطوير المستمر"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPlatformPicker(false)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmAddLinkWithPlatform}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>إضافة الرابط إلى القائمة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED VERTICAL LINKS LIST (قائمة الروابط الموحدة - بدون أقسام أو تصنيفات) */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-[#121218]/50 p-12 text-center text-slate-400 space-y-3 shadow-xl">
            <LinkIcon className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">لا توجد روابط في قائمتك بعد</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              اضغط على زر "+ إضافة رابط جديد" أعلاه لاختيار منصتك المفضلة (تقييم جوجل، واتساب، إنستغرام...) وإضافتها فوراً.
            </p>
            <button
              onClick={openPlatformPicker}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>إضافة رابطك الأول الآن</span>
            </button>
          </div>
        ) : (
          links.map((link, linkIdx) => {
            const platformKey = (link.platform as PlatformType) || 'custom';
            const platformConf = PLATFORMS_CONFIG[platformKey] || PLATFORMS_CONFIG.custom;

            return (
              <div
                key={link.id}
                className={`group rounded-2xl border p-4 transition-all duration-200 shadow-xl ${
                  link.isActive
                    ? 'border-white/10 bg-[#14141e]/90 hover:border-white/20'
                    : 'border-white/5 bg-[#0e0e14]/50 opacity-60'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Row 1: Brand Icon Badge + Title + URL */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto">
                      <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ${platformConf.iconBgClass}`}
                        title={platformConf.nameAr}
                      >
                        <BrandIcon platform={platformKey} size={20} />
                      </div>
                      <input
                        type="text"
                        value={link.title}
                        onChange={e => updateLink(link.id, { title: e.target.value })}
                        placeholder="عنوان الرابط"
                        className="flex-1 rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        value={link.url}
                        onChange={e => updateLink(link.id, { url: e.target.value })}
                        dir="ltr"
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-slate-200 font-mono text-left focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Subtitle, Platform selector, Highlight Style, Clicks, Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/5 text-xs">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={link.subtitle || ''}
                        onChange={e => updateLink(link.id, { subtitle: e.target.value })}
                        placeholder="وصف توضيحي قصير (اختياري)"
                        className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none w-48"
                      />

                      {/* Platform selector */}
                      <select
                        value={link.platform || 'custom'}
                        onChange={e => updateLink(link.id, { platform: e.target.value })}
                        className="rounded-xl border border-white/10 bg-[#0c0c12] px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                      >
                        {availablePlatforms.map(p => (
                          <option key={p} value={p}>
                            {PLATFORMS_CONFIG[p].nameAr}
                          </option>
                        ))}
                      </select>

                      {/* Highlight effect */}
                      <select
                        value={link.highlight || 'none'}
                        onChange={e => updateLink(link.id, { highlight: e.target.value as any })}
                        className="rounded-xl border border-white/10 bg-[#0c0c12] px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="none">مظهر عادي</option>
                        <option value="glow">🟢 توهج مشع (Glow)</option>
                        <option value="pulse">🟡 نبض حركي (Pulse)</option>
                        <option value="bounce">🔵 تفاعل حركي (Hover Bounce)</option>
                      </select>
                    </div>

                    {/* Clicks counter & Link actions */}
                    <div className="flex items-center gap-2">
                      <span
                        title="عدد النقرات المسجلة"
                        className="flex items-center gap-1 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400 font-bold"
                      >
                        <MousePointerClick className="h-3 w-3" />
                        <span>{link.clicks || 0} نقرة</span>
                      </span>

                      <button
                        onClick={() => updateLink(link.id, { isActive: !link.isActive })}
                        title={link.isActive ? 'الرابط مفعّل' : 'الرابط معطّل'}
                        className={`rounded-xl p-1.5 transition ${
                          link.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        {link.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => moveLink(linkIdx, 'up')}
                        disabled={linkIdx === 0}
                        title="تحريك لأعلى"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => removeLink(link.id)}
                        title="حذف الرابط"
                        className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
