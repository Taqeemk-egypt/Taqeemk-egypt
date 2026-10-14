import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { UserProfile, QRCodeItem } from '../types';
import { api } from '../services/api';
import {
  QrCode,
  Plus,
  Edit3,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Link as LinkIcon,
  Search,
  Filter,
  X,
  Sliders,
  Printer,
  Smartphone,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface QRCodeManagerProps {
  profile: UserProfile;
}

// Small Live Thumbnail Component for each row
const QRThumbnail: React.FC<{
  content: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
}> = ({ content, fgColor = '#0f172a', bgColor = '#ffffff', size = 52 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const finalUrl = content.startsWith('http') || content.startsWith('/')
      ? (content.startsWith('/') ? `${window.location.origin}${content}` : content)
      : `https://${content}`;

    QRCode.toCanvas(
      canvasRef.current,
      finalUrl,
      {
        width: size,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      },
      err => {
        if (err) console.error(err);
      }
    );
  }, [content, fgColor, bgColor, size]);

  return (
    <div className="relative rounded-xl bg-white p-1 shadow-md border border-white/20 shrink-0">
      <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-lg" />
    </div>
  );
};

export const QRCodeManager: React.FC<QRCodeManagerProps> = ({ profile }) => {
  const [qrList, setQrList] = useState<QRCodeItem[]>(profile.qrCodes || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dynamic' | 'static'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeItem | null>(null);

  // Form State for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'dynamic' | 'static'>('dynamic');
  const [formContent, setFormContent] = useState('');
  const [formFgColor, setFormFgColor] = useState('#0f172a');
  const [formBgColor, setFormBgColor] = useState('#ffffff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Canvas ref for high-res preview & downloads
  const viewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const baseUrl = window.location.origin;

  // Fetch initial QR list
  const loadQRList = async () => {
    setIsLoading(true);
    try {
      const res = await api.qr.getList();
      if (res && res.qrCodes) {
        setQrList(res.qrCodes);
      }
    } catch (e) {
      console.warn('Failed to fetch QR list:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQRList();
  }, []);

  // Update canvas in View / Download modal when selectedQR changes
  useEffect(() => {
    if ((showViewModal || showDownloadModal) && selectedQR && viewCanvasRef.current) {
      const targetUrl = selectedQR.content.startsWith('/')
        ? `${baseUrl}${selectedQR.content}`
        : selectedQR.content;

      QRCode.toCanvas(
        viewCanvasRef.current,
        targetUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: selectedQR.fgColor || '#0f172a',
            light: selectedQR.bgColor || '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        err => {
          if (err) console.error(err);
        }
      );
    }
  }, [showViewModal, showDownloadModal, selectedQR]);

  // Handle open create modal
  const openCreateModal = () => {
    setFormTitle('');
    setFormType('dynamic');
    setFormContent(`/u/${profile.username}`);
    setFormFgColor('#0f172a');
    setFormBgColor('#ffffff');
    setShowCreateModal(true);
  };

  // Handle open edit modal
  const openEditModal = (qr: QRCodeItem) => {
    setSelectedQR(qr);
    setFormTitle(qr.title);
    setFormType(qr.type);
    setFormContent(qr.content);
    setFormFgColor(qr.fgColor || '#0f172a');
    setFormBgColor(qr.bgColor || '#ffffff');
    setShowEditModal(true);
  };

  // Handle open view modal
  const openViewModal = (qr: QRCodeItem) => {
    setSelectedQR(qr);
    setShowViewModal(true);
  };

  // Handle open download modal
  const openDownloadModal = (qr: QRCodeItem) => {
    setSelectedQR(qr);
    setShowDownloadModal(true);
  };

  // Submit Create
  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.qr.create({
        title: formTitle.trim(),
        type: formType,
        content: formContent.trim() || `/u/${profile.username}`,
        fgColor: formFgColor,
        bgColor: formBgColor,
      });

      if (res && res.qrCode) {
        setQrList(prev => [res.qrCode, ...prev]);
        setShowCreateModal(false);
        setStatusMessage('تم إنشاء كود الـ QR بنجاح!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      alert('خطأ أثناء إنشاء كود QR: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQR) return;
    setIsSubmitting(true);
    try {
      const res = await api.qr.update(selectedQR.id, {
        title: formTitle.trim(),
        type: formType,
        content: formContent.trim(),
        fgColor: formFgColor,
        bgColor: formBgColor,
      });

      if (res && res.qrCode) {
        setQrList(prev => prev.map(q => (q.id === selectedQR.id ? res.qrCode : q)));
        setShowEditModal(false);
        setSelectedQR(null);
        setStatusMessage('تم تحديث كود الـ QR بنجاح!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      alert('خطأ أثناء التعديل: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete QR Code
  const handleDeleteQR = async (qr: QRCodeItem) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف "${qr.title}"؟`)) return;
    try {
      await api.qr.delete(qr.id);
      setQrList(prev => prev.filter(q => q.id !== qr.id));
      setStatusMessage('تم حذف كود الـ QR بنجاح.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  // Copy link
  const copyLink = (content: string, id: string) => {
    const full = content.startsWith('/') ? `${baseUrl}${content}` : content;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download high-res PNG
  const downloadPNG = () => {
    if (!viewCanvasRef.current || !selectedQR) return;
    const link = document.createElement('a');
    link.download = `taqeemk-${selectedQR.title.replace(/\s+/g, '_')}-${selectedQR.type}.png`;
    link.href = viewCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const downloadSVG = async () => {
    if (!selectedQR) return;
    try {
      const targetUrl = selectedQR.content.startsWith('/')
        ? `${baseUrl}${selectedQR.content}`
        : selectedQR.content;

      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        color: {
          dark: selectedQR.fgColor || '#0f172a',
          light: selectedQR.bgColor || '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `taqeemk-${selectedQR.title.replace(/\s+/g, '_')}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  // Print PDF Card
  const printQRCard = () => {
    if (!viewCanvasRef.current || !selectedQR) return;
    const printWindow = window.open('', '', 'width=650,height=700');
    if (!printWindow) return;

    const imgData = viewCanvasRef.current.toDataURL('image/png');
    const targetUrl = selectedQR.content.startsWith('/')
      ? `${baseUrl}${selectedQR.content}`
      : selectedQR.content;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة كود QR - ${selectedQR.title}</title>
          <style>
            body {
              font-family: 'Cairo', system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              background-color: #f8fafc;
              margin: 0;
              padding: 20px;
            }
            .card {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 24px;
              padding: 32px 40px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              max-width: 400px;
            }
            .qr-img {
              width: 260px;
              height: 260px;
              border-radius: 16px;
              border: 1px solid #cbd5e1;
              padding: 8px;
            }
            h2 { margin: 12px 0 4px 0; color: #0f172a; font-size: 20px; }
            p { margin: 4px 0 16px 0; color: #64748b; font-size: 13px; }
            .url {
              font-family: monospace;
              direction: ltr;
              font-weight: bold;
              color: #059669;
              font-size: 13px;
              margin-top: 14px;
              background: #ecfdf5;
              padding: 6px 12px;
              border-radius: 8px;
            }
            .brand {
              margin-top: 16px;
              font-size: 11px;
              color: #94a3b8;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${selectedQR.title}</h2>
            <p>${profile.displayName || profile.username} • تقييمك (Taqeemk)</p>
            <img class="qr-img" src="${imgData}" />
            <div class="url">${targetUrl}</div>
            <div class="brand">Powered by Taqeemk.app</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Format Arabic Date
  const formatDateAr = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter list
  const filteredQRs = qrList.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalScans = qrList.reduce((acc, curr) => acc + (curr.scans || 0), 0);

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Header Bar with "+ إنشاء كود QR" Primary Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md">
              <QrCode className="h-5 w-5" />
            </div>
            <span>قائمة أكواد QR (QR Codes Management)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            أنشئ وأدر أكواد الاستجابة السريعة (QR) الذكية لملفك الشخصي، تقييمات جوجل، أو روابط محددة مع إمكانية التعديل اللحظي وتتبع عدد المرات.
          </p>
        </div>

        {/* Primary Action Button: + إنشاء كود QR */}
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start sm:self-auto rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/25 active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>+ إنشاء كود QR</span>
        </button>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter, Search & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 rounded-2xl border border-white/10 bg-[#121218]/80 p-3.5 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان أو الرابط..."
            className="w-full rounded-xl border border-white/10 bg-[#0c0c12] pr-10 pl-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills (الكل / ديناميكي / ثابت) */}
        <div className="flex items-center gap-1.5 self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-[#0c0c12] border border-white/5'
            }`}
          >
            الكل ({qrList.length})
          </button>
          <button
            onClick={() => setFilterType('dynamic')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'dynamic'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-[#0c0c12] border border-white/5'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>ديناميكي ({qrList.filter(q => q.type === 'dynamic').length})</span>
          </button>
          <button
            onClick={() => setFilterType('static')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'static'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-[#0c0c12] border border-white/5'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>ثابت ({qrList.filter(q => q.type === 'static').length})</span>
          </button>
        </div>

        {/* Total Scans Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-300">
          <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
          <span>إجمالي المسح:</span>
          <span className="font-mono text-emerald-400 font-extrabold">{totalScans}</span>
        </div>
      </div>

      {/* STRUCTURED LIST TABLE (قائمة أكواد QR) */}
      <div className="rounded-3xl border border-white/10 bg-[#121218]/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            {/* Header Row: العنوان | النوع | المحتوى أو اللينك | عدد المرات | آخر تعديل | الإجراءات */}
            <thead>
              <tr className="border-b border-white/10 bg-[#181824]/90 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <th className="py-4 pr-5 pl-3">العنوان</th>
                <th className="py-4 px-3 text-center">النوع</th>
                <th className="py-4 px-3">المحتوى أو اللينك</th>
                <th className="py-4 px-3 text-center">عدد المرات</th>
                <th className="py-4 px-3 text-center">آخر تعديل</th>
                <th className="py-4 pl-5 pr-3 text-center">الإجراءات</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-white/5">
              {filteredQRs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <QrCode className="h-10 w-10 text-slate-600" />
                      <p className="text-xs font-semibold">لم يتم العثور على أكواد QR تطابق البحث.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                      >
                        + إنشاء كود QR جديد الآن
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQRs.map(qr => {
                  const targetUrl = qr.content.startsWith('/')
                    ? `${baseUrl}${qr.content}`
                    : qr.content;

                  return (
                    <tr
                      key={qr.id}
                      className="group transition-colors hover:bg-white/[0.03]"
                    >
                      {/* Column 1: Live Thumbnail QR Code on the right + Title */}
                      <td className="py-3.5 pr-5 pl-3">
                        <div className="flex items-center gap-3">
                          {/* Live Thumbnail QR image rendered via canvas on the right */}
                          <div
                            onClick={() => openViewModal(qr)}
                            className="cursor-pointer hover:scale-105 transition-transform"
                            title="اضغط للتكبير والمشاهدة"
                          >
                            <QRThumbnail
                              content={qr.content}
                              fgColor={qr.fgColor || '#0f172a'}
                              bgColor={qr.bgColor || '#ffffff'}
                              size={48}
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px] sm:max-w-[240px]">
                              {qr.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {qr.type === 'dynamic' ? 'مسار ديناميكي ذكي' : 'كود ثابت مباشر'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Status Badges ("ديناميكي" / "ثابت") */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {qr.type === 'dynamic' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-black text-emerald-400 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            <span>ديناميكي</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-[11px] font-black text-cyan-400 shadow-sm">
                            <LinkIcon className="h-3 w-3" />
                            <span>ثابت</span>
                          </span>
                        )}
                      </td>

                      {/* Column 3: المحتوى أو اللينك (Monospace with copy) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 max-w-[220px]" dir="ltr">
                          <span className="truncate font-mono text-[11px] text-slate-300 text-left">
                            {targetUrl}
                          </span>
                          <button
                            onClick={() => copyLink(qr.content, qr.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 transition shrink-0"
                            title="نسخ الرابط"
                          >
                            {copiedId === qr.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Column 4: عدد المرات (Scan count) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-black/40 border border-white/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400">
                          <span>{qr.scans || 0}</span>
                          <span className="text-[10px] text-slate-400 font-sans">مسحة</span>
                        </span>
                      </td>

                      {/* Column 5: آخر تعديل */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-[11px] text-slate-400">
                        {formatDateAr(qr.lastModified || new Date().toISOString())}
                      </td>

                      {/* Column 6: الإجراءات (Edit, View, Download, Delete) */}
                      <td className="py-3.5 pl-5 pr-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit (تعديل) */}
                          <button
                            onClick={() => openEditModal(qr)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition shadow-sm"
                            title="تعديل (Edit)"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* View (معاينة) */}
                          <button
                            onClick={() => openViewModal(qr)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-emerald-400 transition shadow-sm"
                            title="معاينة (View)"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Download (تحميل PDF/PNG) */}
                          <button
                            onClick={() => openDownloadModal(qr)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition shadow-sm"
                            title="تحميل (Download PDF/PNG)"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete (حذف) */}
                          <button
                            onClick={() => handleDeleteQR(qr)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition shadow-sm"
                            title="حذف (Delete)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden canvas for download and printing */}
      <div className="hidden">
        <canvas ref={viewCanvasRef} />
      </div>

      {/* MODAL 1: Create New QR Code (+ إنشاء كود QR) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121218] p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>إنشاء كود QR جديد</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQR} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">عنوان الكود (مثال: كود الكارت الشخصي، تقييمات جوجل...)</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: باركود الفرع الرئيسي"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>

              {/* Type Switcher: Dynamic vs Static */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">نوع الكود:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setFormType('dynamic')}
                    className={`cursor-pointer rounded-2xl border p-3 text-right transition ${
                      formType === 'dynamic'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                        : 'border-white/10 bg-[#0c0c12] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">ديناميكي (Dynamic)</span>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      يمكنك تغيير الرابط في أي وقت دون إعادة طباعة الكود.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormType('static')}
                    className={`cursor-pointer rounded-2xl border p-3 text-right transition ${
                      formType === 'static'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30'
                        : 'border-white/10 bg-[#0c0c12] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">ثابت (Static)</span>
                      <LinkIcon className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      يحتوي على الرابط المباشر داخل مصفوفة النقاط بشكل دائم.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content / Destination Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">المحتوى أو الرابط المستهدف (Destination URL):</label>
                <input
                  type="text"
                  required
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  dir="ltr"
                  placeholder={`https://... أو /u/${profile.username}`}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono text-left"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">لون النقاط (Foreground)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formFgColor}
                      onChange={e => setFormFgColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-400">{formFgColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">لون الخلفية (Background)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formBgColor}
                      onChange={e => setFormBgColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-400">{formBgColor}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  {isSubmitting ? 'جارِ الإنشاء...' : 'إنشاء وحفظ الكود'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit QR Code (تعديل) */}
      {showEditModal && selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121218] p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-400" />
                <span>تعديل كود الـ QR</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateQR} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">عنوان الكود</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">نوع الكود:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setFormType('dynamic')}
                    className={`cursor-pointer rounded-2xl border p-3 text-right transition ${
                      formType === 'dynamic'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                        : 'border-white/10 bg-[#0c0c12]'
                    }`}
                  >
                    <span className="text-xs font-black text-white">ديناميكي (Dynamic)</span>
                  </div>
                  <div
                    onClick={() => setFormType('static')}
                    className={`cursor-pointer rounded-2xl border p-3 text-right transition ${
                      formType === 'static'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30'
                        : 'border-white/10 bg-[#0c0c12]'
                    }`}
                  >
                    <span className="text-xs font-black text-white">ثابت (Static)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">المحتوى أو الرابط المستهدف (Destination):</label>
                <input
                  type="text"
                  required
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">لون النقاط</label>
                  <input
                    type="color"
                    value={formFgColor}
                    onChange={e => setFormFgColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">لون الخلفية</label>
                  <input
                    type="color"
                    value={formBgColor}
                    onChange={e => setFormBgColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition"
                >
                  {isSubmitting ? 'جارِ التحديث...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View High-Res QR Code (معاينة) */}
      {showViewModal && selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#121218] p-6 text-center text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 left-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-white">{selectedQR.title}</h3>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                selectedQR.type === 'dynamic'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {selectedQR.type === 'dynamic' ? 'ديناميكي' : 'ثابت'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedQR.scans || 0} مسحة
              </span>
            </div>

            {/* Centered QR Canvas Thumbnail */}
            <div className="my-5 flex justify-center">
              <div className="rounded-2xl bg-white p-4 shadow-2xl ring-4 ring-emerald-500/20">
                <QRThumbnail
                  content={selectedQR.content}
                  fgColor={selectedQR.fgColor || '#0f172a'}
                  bgColor={selectedQR.bgColor || '#ffffff'}
                  size={200}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#0c0c12] border border-white/10 p-2.5 text-xs text-slate-300" dir="ltr">
              <span className="truncate flex-1 font-mono text-[11px] text-left">
                {selectedQR.content.startsWith('/') ? `${baseUrl}${selectedQR.content}` : selectedQR.content}
              </span>
              <button
                onClick={() => copyLink(selectedQR.content, 'modal')}
                className="p-1 text-slate-400 hover:text-emerald-400"
              >
                {copiedId === 'modal' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick Actions inside View Modal */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openDownloadModal(selectedQR);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تحميل PNG / PDF</span>
              </button>
              <a
                href={selectedQR.content.startsWith('/') ? `${baseUrl}${selectedQR.content}` : selectedQR.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>تجربة الرابط</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Download QR Code (تحميل PDF / PNG / SVG) */}
      {showDownloadModal && selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#121218] p-6 text-center text-slate-100 shadow-2xl space-y-5">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 left-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">تحميل كود QR</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedQR.title}</p>
            </div>

            <div className="my-2 flex justify-center">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <QRThumbnail
                  content={selectedQR.content}
                  fgColor={selectedQR.fgColor || '#0f172a'}
                  bgColor={selectedQR.bgColor || '#ffffff'}
                  size={140}
                />
              </div>
            </div>

            <div className="space-y-2.5 text-right">
              {/* Option A: PNG */}
              <button
                onClick={downloadPNG}
                className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 hover:border-emerald-500/50 hover:bg-[#1a1a28] transition group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      تحميل بصيغة صورة عالية الدقة (PNG)
                    </h5>
                    <p className="text-[10px] text-slate-400">مثالي للاستخدام في السوشيال ميديا والتصاميم الرقمية</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400">PNG</span>
              </button>

              {/* Option B: SVG */}
              <button
                onClick={downloadSVG}
                className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 hover:border-cyan-500/50 hover:bg-[#1a1a28] transition group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      تحميل فيكتور للطباعة بدقة لانهائية (SVG)
                    </h5>
                    <p className="text-[10px] text-slate-400">ملائم لبرامج التصميم والفوتوشوب واليافطات الكبيرة</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-400">SVG</span>
              </button>

              {/* Option C: Print / PDF Card */}
              <button
                onClick={printQRCard}
                className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-[#161622] p-3.5 hover:border-amber-500/50 hover:bg-[#1a1a28] transition group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Printer className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      طباعة كارت مجهز فورياً (PDF / Print)
                    </h5>
                    <p className="text-[10px] text-slate-400">تجهيز كارت احترافي جاهز للطباعة وتوزيعه للعملاء</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400">PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
