import React, { useState, useEffect } from 'react';
import type { UserProfile, QRCodeScanLog } from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  QrCode,
  TrendingUp,
  Smartphone,
  Laptop,
  Tablet,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsViewProps {
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ profile }) => {
  const [qrStats, setQrStats] = useState<{ totalScans: number; logs: QRCodeScanLog[] }>({
    totalScans: profile.dynamicQrScans || 0,
    logs: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.qr.getStats();
        setQrStats({
          totalScans: data.totalScans,
          logs: data.logs || []
        });
      } catch (e) {
        // Fallback to profile stats
      }
    };
    fetchStats();
  }, []);

  let totalClicks = 0;
  const linkPerformances: { id: string; title: string; clicks: number }[] = [];

  const allLinks = (Array.isArray(profile.links) && profile.links.length > 0)
    ? profile.links
    : (profile.lists?.flatMap(l => l.links || []) || []);

  allLinks.forEach(link => {
    totalClicks += (link.clicks || 0);
    linkPerformances.push({
      id: link.id,
      title: link.title,
      clicks: link.clicks || 0,
    });
  });

  linkPerformances.sort((a, b) => b.clicks - a.clicks);

  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  qrStats.logs.forEach(l => {
    if (l.deviceType === 'mobile') deviceCounts.mobile++;
    else if (l.deviceType === 'tablet') deviceCounts.tablet++;
    else deviceCounts.desktop++;
  });

  const views = profile.views || 0;
  const clickThroughRate = views > 0 ? ((totalClicks / views) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-xl shadow-2xl">
        <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span>لوحة التحليلات والإحصائيات اللحظية</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          راقب عدد الزيارات، النقرات على كل رابط، أجهزة مسح الباركود، ومعدل تحويل الزوار.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              مشاهدات الصفحة (Views)
            </span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">{views}</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <ArrowUpRight className="h-3 w-3" />
            <span>مشاهدات مباشرة للصفحة</span>
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              إجمالي النقرات (Clicks)
            </span>
            <MousePointerClick className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">{totalClicks}</p>
          <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-bold">
            <span>على جميع الروابط والقوائم</span>
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              مسحات الباركود (QR Scans)
            </span>
            <QrCode className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">{qrStats.totalScans}</p>
          <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-bold">
            <span>مسحات واقعية ورقمية</span>
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#121218]/90 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              معدل التفاعل (CTR)
            </span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">{clickThroughRate}%</p>
          <span className="text-[11px] text-purple-400 flex items-center gap-1 mt-1 font-bold">
            <span>نسبة النقرات إلى الزيارات</span>
          </span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Links (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>الروابط الأكثر تفاعلاً ونقراً</span>
          </h3>

          {linkPerformances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
              لم تتم إضافة روابط بعد. أضف روابطك من تبويب اللينكات!
            </div>
          ) : (
            <div className="space-y-3.5">
              {linkPerformances.map((link, idx) => {
                const percentage = totalClicks > 0 ? ((link.clicks / totalClicks) * 100).toFixed(0) : '0';
                return (
                  <div key={link.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono font-bold">#{idx + 1}</span>
                        <span className="font-bold text-white">{link.title}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono" dir="ltr">
                        <span className="text-white font-bold">{link.clicks} clicks</span>
                        <span className="text-slate-400">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device Distribution (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#121218]/90 p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            توزيع أجهزة مسح الباركود
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300 font-bold">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>الهواتف الذكية</span>
              </div>
              <span className="font-mono font-bold text-white">{deviceCounts.mobile}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300 font-bold">
                <Laptop className="h-4 w-4 text-indigo-400" />
                <span>أجهزة الكمبيوتر</span>
              </div>
              <span className="font-mono font-bold text-white">{deviceCounts.desktop}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300 font-bold">
                <Tablet className="h-4 w-4 text-cyan-400" />
                <span>الأجهزة اللوحية (Tablets)</span>
              </div>
              <span className="font-mono font-bold text-white">{deviceCounts.tablet}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
