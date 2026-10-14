import React from 'react';

export type PlatformType =
  | 'google_review'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'telegram'
  | 'youtube'
  | 'x'
  | 'custom'
  | 'call'
  | 'maps'
  | 'portfolio'
  | 'linkedin'
  | 'github';

export interface PlatformConfig {
  id: PlatformType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  defaultTitleAr: string;
  defaultUrl: string;
  brandColor: string;
  badgeBg: string;
  textColor: string;
  iconBgClass: string;
  borderColor: string;
}

export const PLATFORMS_CONFIG: Record<PlatformType, PlatformConfig> = {
  google_review: {
    id: 'google_review',
    nameAr: 'تقييم جوجل (Google Reviews)',
    nameEn: 'Google Review',
    descriptionAr: 'رابط مباشر لكتابة تقييم 5 نجوم على خرائط جوجل لزيادة ثقة عملائك',
    defaultTitleAr: '⭐ قيّمنا على جوجل بخمس نجوم',
    defaultUrl: 'https://g.page/r/',
    brandColor: '#4285F4',
    badgeBg: 'bg-white',
    textColor: 'text-slate-900',
    iconBgClass: 'bg-white shadow-md shadow-amber-500/10 border border-slate-200',
    borderColor: 'border-amber-400/40 hover:border-amber-400',
  },
  whatsapp: {
    id: 'whatsapp',
    nameAr: 'واتساب (WhatsApp)',
    nameEn: 'WhatsApp',
    descriptionAr: 'محادثة فورية مباشرة بضغطة زر دون الحاجة لتسجيل الرقم',
    defaultTitleAr: '💬 تواصل معنا مباشرة عبر واتساب',
    defaultUrl: 'https://wa.me/201515926729',
    brandColor: '#25D366',
    badgeBg: 'bg-[#25D366]',
    textColor: 'text-white',
    iconBgClass: 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20',
    borderColor: 'border-[#25D366]/40 hover:border-[#25D366]',
  },
  instagram: {
    id: 'instagram',
    nameAr: 'إنستغرام (Instagram)',
    nameEn: 'Instagram',
    descriptionAr: 'صفحتك على إنستغرام لمشاهدة الصور، القصص، وريلز المنتجات',
    defaultTitleAr: '📸 تابع حسابنا على إنستغرام',
    defaultUrl: 'https://instagram.com/',
    brandColor: '#E1306C',
    badgeBg: 'instagram-gradient',
    textColor: 'text-white',
    iconBgClass: 'instagram-gradient text-white shadow-lg shadow-pink-500/20',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
  },
  facebook: {
    id: 'facebook',
    nameAr: 'فيسبوك (Facebook)',
    nameEn: 'Facebook',
    descriptionAr: 'الصفحة الرسمية على فيسبوك للتفاعل ومتابعة التحديثات',
    defaultTitleAr: '👍 تابع صفحتنا الرسمية على فيسبوك',
    defaultUrl: 'https://facebook.com/',
    brandColor: '#1877F2',
    badgeBg: 'bg-[#1877F2]',
    textColor: 'text-white',
    iconBgClass: 'bg-[#1877F2] text-white shadow-lg shadow-blue-500/20',
    borderColor: 'border-[#1877F2]/40 hover:border-[#1877F2]',
  },
  tiktok: {
    id: 'tiktok',
    nameAr: 'تيك توك (TikTok)',
    nameEn: 'TikTok',
    descriptionAr: 'مقاطع الفيديو القصيرة والتريندات والعروض الترويجية',
    defaultTitleAr: '🎵 شاهد أحدث فيديوهاتنا على تيك توك',
    defaultUrl: 'https://tiktok.com/@',
    brandColor: '#000000',
    badgeBg: 'bg-black text-white tiktok-shadow',
    textColor: 'text-white',
    iconBgClass: 'bg-slate-950 text-white border border-slate-700 shadow-md',
    borderColor: 'border-cyan-400/40 hover:border-pink-500',
  },
  telegram: {
    id: 'telegram',
    nameAr: 'تيليجرام (Telegram)',
    nameEn: 'Telegram',
    descriptionAr: 'قناة أو مجموعة التليجرام للعروض الحصرية والتنبيهات',
    defaultTitleAr: '✈️ انضم لقناتنا على تيليجرام',
    defaultUrl: 'https://t.me/',
    brandColor: '#229ED9',
    badgeBg: 'bg-[#229ED9]',
    textColor: 'text-white',
    iconBgClass: 'bg-[#229ED9] text-white shadow-lg shadow-sky-500/20',
    borderColor: 'border-[#229ED9]/40 hover:border-[#229ED9]',
  },
  youtube: {
    id: 'youtube',
    nameAr: 'يوتيوب (YouTube)',
    nameEn: 'YouTube',
    descriptionAr: 'قناة اليوتيوب لمشاهدة الشروحات، الكورسات، ومراجعات الفيديو',
    defaultTitleAr: '🎥 اشترك في قناتنا على يوتيوب',
    defaultUrl: 'https://youtube.com/@',
    brandColor: '#FF0000',
    badgeBg: 'bg-[#FF0000]',
    textColor: 'text-white',
    iconBgClass: 'bg-[#FF0000] text-white shadow-lg shadow-red-500/20',
    borderColor: 'border-[#FF0000]/40 hover:border-[#FF0000]',
  },
  x: {
    id: 'x',
    nameAr: 'منصة إكس / تويتر (X)',
    nameEn: 'X (Twitter)',
    descriptionAr: 'الحساب الرسمي على منصة إكس لمتابعة الأخبار والتغريدات',
    defaultTitleAr: '🐦 تابعنا على منصة X',
    defaultUrl: 'https://x.com/',
    brandColor: '#FFFFFF',
    badgeBg: 'bg-black text-white border border-slate-700',
    textColor: 'text-white',
    iconBgClass: 'bg-black text-white border border-slate-700 shadow-md',
    borderColor: 'border-slate-600 hover:border-white',
  },
  custom: {
    id: 'custom',
    nameAr: 'رابط مخصص (Custom URL)',
    nameEn: 'Custom Link',
    descriptionAr: 'أي رابط لموقعك الإلكتروني أو متجرك أو مدونتك الخاصة',
    defaultTitleAr: '🌐 تصفح الموقع الإلكتروني',
    defaultUrl: 'https://',
    brandColor: '#8B5CF6',
    badgeBg: 'bg-purple-600',
    textColor: 'text-white',
    iconBgClass: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
  },
  call: {
    id: 'call',
    nameAr: 'اتصال هاتفي مباشر',
    nameEn: 'Phone Call',
    descriptionAr: 'زر اتصال مباشر برقم هاتفك لخدمة العملاء السريعة',
    defaultTitleAr: '📞 اتصل بنا هاتفياً الآن',
    defaultUrl: 'tel:01515926729',
    brandColor: '#10B981',
    badgeBg: 'bg-emerald-600',
    textColor: 'text-white',
    iconBgClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
  },
  maps: {
    id: 'maps',
    nameAr: 'موقعنا على الخريطة (Maps)',
    nameEn: 'Google Maps',
    descriptionAr: 'موقع فرعك أو شركتك على خرائط جوجل للوصول السهل',
    defaultTitleAr: '📍 تفضل بزيارة موقعنا على الخريطة',
    defaultUrl: 'https://maps.google.com/?q=',
    brandColor: '#EA4335',
    badgeBg: 'bg-red-500',
    textColor: 'text-white',
    iconBgClass: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    borderColor: 'border-red-500/40 hover:border-red-400',
  },
  portfolio: {
    id: 'portfolio',
    nameAr: 'معرض الأعمال (Portfolio)',
    nameEn: 'Portfolio / Projects',
    descriptionAr: 'استعرض دراسات الحالة ونماذج من أهم مشاريعك السابقة',
    defaultTitleAr: '💼 تصفح معرض أعمالنا ومشاريعنا',
    defaultUrl: 'https://',
    brandColor: '#F59E0B',
    badgeBg: 'bg-amber-500',
    textColor: 'text-slate-950',
    iconBgClass: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
  },
  linkedin: {
    id: 'linkedin',
    nameAr: 'لينكد إن (LinkedIn)',
    nameEn: 'LinkedIn',
    descriptionAr: 'الملف المهني الرسمي، الخبرات العملية، والتواصل الوظيفي',
    defaultTitleAr: '👔 تواصل معي على LinkedIn',
    defaultUrl: 'https://linkedin.com/in/',
    brandColor: '#0A66C2',
    badgeBg: 'bg-[#0A66C2]',
    textColor: 'text-white',
    iconBgClass: 'bg-[#0A66C2] text-white shadow-lg shadow-blue-600/20',
    borderColor: 'border-[#0A66C2]/40 hover:border-[#0A66C2]',
  },
  github: {
    id: 'github',
    nameAr: 'جيت هب (GitHub)',
    nameEn: 'GitHub',
    descriptionAr: 'مستودعات الأكواد، المشاريع البرمجية المفتوحة المصدر',
    defaultTitleAr: '💻 كود المشاريع على GitHub',
    defaultUrl: 'https://github.com/',
    brandColor: '#24292F',
    badgeBg: 'bg-slate-900',
    textColor: 'text-white',
    iconBgClass: 'bg-slate-900 text-white border border-slate-700 shadow-md',
    borderColor: 'border-slate-600 hover:border-slate-400',
  },
};

interface BrandIconProps {
  platform: PlatformType | string;
  className?: string;
  size?: number;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ platform, className = '', size = 20 }) => {
  const p = (platform as PlatformType) || 'custom';

  switch (p) {
    case 'google_review':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );

    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );

    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.75 1.45-.07 2.76-.98 3.32-2.31.25-.56.37-1.18.36-1.8V.02z" />
        </svg>
      );

    case 'telegram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );

    case 'github':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );

    case 'call':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );

    case 'maps':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );

    case 'portfolio':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );

    case 'custom':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
};
