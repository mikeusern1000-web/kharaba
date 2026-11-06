import React, { useState, useRef } from 'react';
import { X, Printer, Zap, CheckCircle, Download, Copy, Check, FileDown, Loader2 } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BillCalculationResult, CountryProfile, Appliance } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: BillCalculationResult;
  country: CountryProfile;
  appliances: Appliance[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  calculation,
  country,
  appliances,
}) => {
  if (!isOpen) return null;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const activeAppliances = appliances.filter((a) => a.enabled);

  const generatePrintableHtml = () => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير استهلاك الكهرباء - ${country.name.split('(')[0].trim()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body { font-family: 'Tajawal', sans-serif, system-ui; margin: 2rem; color: #1e293b; background: #fff; line-height: 1.6; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 800; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stat-label { font-size: 0.8rem; color: #64748b; }
    .stat-val { font-size: 1.35rem; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th { text-align: right; background: #f1f5f9; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-size: 0.85rem; font-weight: 700; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .font-sans { font-family: 'Tajawal', sans-serif; }
    .total-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 1.25rem; border-radius: 12px; font-size: 0.9rem; margin-top: 1.5rem; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .grand-total { border-top: 2px solid #cbd5e1; padding-top: 0.75rem; margin-top: 0.5rem; font-size: 1.2rem; font-weight: 800; color: #d97706; display: flex; justify-content: space-between; }
    .print-btn { display: inline-block; background: #f59e0b; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-bottom: 1.5rem; border: none; cursor: pointer; font-size: 1rem; }
    @media print {
      body { margin: 0; padding: 1rem; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 1.5rem; text-align: center;">
    <button class="print-btn" onclick="window.print()">🖨️ طباعة التقرير أو حفظ كـ PDF</button>
  </div>
  <div class="header">
    <div>
      <h1>KahrabaCalc — تقرير استهلاك الكهرباء</h1>
      <p style="color:#64748b;font-size:0.85rem;margin:4px 0 0;">تقدير استهلاك وتكلفة الأجهزة الكهربائية المنزلية</p>
    </div>
    <div style="text-align:left;font-size:0.85rem;color:#64748b;">
      <div>البلد: <strong>${country.name.split('(')[0].trim()}</strong></div>
      <div>التاريخ: ${new Date().toLocaleDateString('ar-TN')}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div>
      <div class="stat-label">الاستهلاك الشهري</div>
      <div class="stat-val" style="color: #0284c7;">${Math.round(calculation.totalMonthlyKwh)} ك.و.س</div>
    </div>
    <div>
      <div class="stat-label">الفاتورة الشهرية</div>
      <div class="stat-val" style="color: #d97706;">${calculation.totalCostMonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}</div>
    </div>
    <div>
      <div class="stat-label">${country.code === 'TN' ? 'فاتورة شهرين STEG' : country.code === 'DZ' ? 'فاتورة 3 أشهر سونلغاز' : 'الفاتورة السنوية'}</div>
      <div class="stat-val">${(country.code === 'TN' ? calculation.totalCostBimonthly : country.code === 'DZ' ? calculation.totalCostQuarterly : calculation.totalCostYearly).toFixed(country.decimalPlaces)} ${country.currencySymbol}</div>
    </div>
  </div>

  <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">الأجهزة المنزلية الفعالة (${activeAppliances.length} أجهزة):</h3>
  <table>
    <thead>
      <tr>
        <th class="font-sans">الجهاز</th>
        <th class="text-center font-sans">الاستهلاك الشهري</th>
        <th class="text-left font-sans">التكلفة التقديرية</th>
      </tr>
    </thead>
    <tbody>
      ${calculation.applianceBreakdown.map((item) => `
        <tr>
          <td class="font-sans">${item.name}</td>
          <td class="text-center">${item.monthlyKwh.toFixed(1)} ك.و.س</td>
          <td class="text-left">${item.monthlyCost.toFixed(country.decimalPlaces)} ${country.currencySymbol}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>إجمالي ثمن الطاقة المستهلكة:</span>
      <strong>${calculation.energyCostMonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}</strong>
    </div>
    <div class="total-row">
      <span>الاشتراك الثابت / معلوم القدرة:</span>
      <span>${calculation.capacityFeeMonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}</span>
    </div>
    <div class="grand-total">
      <span>المجموع النهائي المقدر شهرياً:</span>
      <span>${(calculation.combinedTotalMonthly || calculation.totalCostMonthly).toFixed(country.decimalPlaces)} ${country.currencySymbol}</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 350);
    };
  </script>
</body>
</html>`;
  };

  const downloadReportHtml = () => {
    try {
      const htmlDoc = generatePrintableHtml();
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-استهلاك-الكهرباء-${country.code.toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintAndSavePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    // 1. Attempt native browser window.print() (works in standard tabs)
    try {
      if (typeof window !== 'undefined' && window.print) {
        window.print();
      }
    } catch (err) {
      console.warn('Native window.print() ignored or restricted by sandbox:', err);
    }

    // 2. Render actual PDF using html-to-image (supports Tailwind v4 oklch colors natively) & jsPDF
    try {
      if (reportRef.current) {
        const element = reportRef.current;
        const canvas = await toCanvas(element, {
          pixelRatio: 2,
          backgroundColor: '#020617',
          skipFonts: true,
          height: element.scrollHeight,
          width: element.scrollWidth,
          style: {
            overflow: 'visible',
            maxHeight: 'none',
            height: 'auto',
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
        heightLeft -= (pageHeight - margin * 2);

        while (heightLeft > 0) {
          pdf.addPage();
          position = margin - (imgHeight - heightLeft);
          pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - margin * 2);
        }

        const fileName = `تقرير-استهلاك-الكهرباء-${country.code.toLowerCase()}.pdf`;
        pdf.save(fileName);

        setPdfSuccess(true);
        setNoticeMessage(`تم حفظ التقرير كملف PDF بنجاح (${fileName}) على جهازك.`);
        setTimeout(() => setPdfSuccess(false), 4500);
      } else {
        downloadReportHtml();
      }
    } catch (pdfErr) {
      console.error('PDF generation error, falling back to HTML report:', pdfErr);
      downloadReportHtml();
      setNoticeMessage('تم تجهيز وتنزيل التقرير القابل للطباعة بنجاح.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyText = async () => {
    try {
      const summaryText = `تقرير استهلاك الكهرباء - KahrabaCalc
البلد: ${country.name.split('(')[0].trim()}
الاستهلاك الشهري: ${Math.round(calculation.totalMonthlyKwh)} ك.و.س
الفاتورة الشهرية: ${calculation.totalCostMonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}
${country.code === 'TN' ? `فاتورة شهرين STEG: ${calculation.totalCostBimonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}\n` : ''}الأجهزة:
${calculation.applianceBreakdown.map((item) => `- ${item.name}: ${item.monthlyKwh.toFixed(1)} ك.و.س (${item.monthlyCost.toFixed(country.decimalPlaces)} ${country.currencySymbol})`).join('\n')}
المجموع النهائي الشهري: ${(calculation.combinedTotalMonthly || calculation.totalCostMonthly).toFixed(country.decimalPlaces)} ${country.currencySymbol}`;

      await navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      setNoticeMessage('تم نسخ ملخص التقرير إلى الحافظة بنجاح.');
      setTimeout(() => setIsCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-report-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 id="print-report-title" className="text-sm font-bold text-white">
              تقرير وتفاصيل استهلاك الكهرباء التقديري
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAndSavePdf}
              disabled={isGeneratingPdf}
              className={`px-4 py-2 font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                pdfSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : isGeneratingPdf
                  ? 'bg-amber-600 text-slate-950 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
              title="طباعة التقرير وحفظ كـ PDF"
            >
              {pdfSuccess ? (
                <Check className="w-4 h-4 text-slate-950 shrink-0" />
              ) : isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
              ) : (
                <FileDown className="w-4 h-4 text-slate-950 shrink-0" />
              )}
              <span>
                {pdfSuccess
                  ? 'تم الحفظ كـ PDF بنجاح ✓'
                  : isGeneratingPdf
                  ? 'جاري حفظ الـ PDF...'
                  : 'طباعة التقرير وحفظ كـ PDF'}
              </span>
            </button>
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="نسخ ملخص التقرير إلى الحافظة"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ ✓' : 'نسخ النص'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="إغلاق التقرير"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner if triggered */}
        {noticeMessage && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Printable Sheet */}
        <div
          ref={reportRef}
          className="p-6 overflow-y-auto text-xs text-slate-200 bg-slate-950 font-sans print:bg-white print:text-slate-950 print:p-0"
        >
          
          {/* Invoice Header */}
          <div className="border-b border-slate-800 pb-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white print:text-black">
                  KahrabaCalc — تقرير استهلاك الكهرباء
                </h1>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  تقدير استهلاك وتكلفة الأجهزة الكهربائية المنزلية
                </p>
              </div>
            </div>

            <div className="text-left font-mono text-[11px] text-slate-400 print:text-slate-600">
              <div>البلد: <strong className="text-white print:text-black">{country.name.split('(')[0].trim()}</strong></div>
              <div>التاريخ: {new Date().toLocaleDateString('ar-TN')}</div>
            </div>
          </div>

          {/* Highlights summary */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-5 print:border-slate-300 print:bg-slate-50">
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-500">الاستهلاك الشهري</div>
              <div className="text-lg font-bold font-mono text-sky-400 print:text-sky-700 tabular-nums">
                {Math.round(calculation.totalMonthlyKwh)} ك.و.س
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-500">الفاتورة الشهرية</div>
              <div className="text-lg font-bold font-mono text-amber-400 print:text-amber-700 tabular-nums">
                {calculation.totalCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-500">
                {country.code === 'TN'
                  ? 'فاتورة شهرين STEG'
                  : country.code === 'DZ'
                  ? 'فاتورة 3 أشهر (سونلغاز)'
                  : 'الفاتورة السنوية التقديرية'}
              </div>
              <div className="text-lg font-bold font-mono text-white print:text-black tabular-nums">
                {country.code === 'TN'
                  ? `${calculation.totalCostBimonthly.toFixed(country.decimalPlaces)} ${country.currencySymbol}`
                  : country.code === 'DZ'
                  ? `${calculation.totalCostQuarterly.toFixed(country.decimalPlaces)} ${country.currencySymbol}`
                  : `${calculation.totalCostYearly.toFixed(country.decimalPlaces)} ${country.currencySymbol}`}
              </div>
            </div>
          </div>

          {/* Appliances Table */}
          <div className="mb-5">
            <h4 className="font-bold text-white print:text-black mb-2 text-xs">
              قائمة الأجهزة الفعالة ({activeAppliances.length} أجهزة):
            </h4>
            <table className="w-full text-right border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600">
                  <th className="py-2">الجهاز</th>
                  <th className="py-2 text-center">القدرة</th>
                  <th className="py-2 text-center">التشغيل</th>
                  <th className="py-2 text-center">الاستهلاك الشهري</th>
                  <th className="py-2 text-left">التكلفة التقديرية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 font-mono tabular-nums">
                {calculation.applianceBreakdown.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-sans font-medium text-slate-200 print:text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-2 text-center text-slate-400 print:text-slate-600">
                      —
                    </td>
                    <td className="py-2 text-center text-slate-400 print:text-slate-600 font-sans">
                      شهري
                    </td>
                    <td className="py-2 text-center text-sky-400 print:text-sky-800 font-bold">
                      {item.monthlyKwh.toFixed(1)} ك.و.س
                    </td>
                    <td className="py-2 text-left text-amber-400 print:text-amber-800 font-bold">
                      {item.monthlyCost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Surcharges and Tiers breakdown */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-3 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">
                {country.code === 'DZ' ? 'ثمن الطاقة المستهلكة (سونلغاز):' : country.code === 'MA' ? 'ثمن الطاقة المستهلكة (ONEE):' : country.code === 'LY' ? 'ثمن الطاقة المستهلكة (GECOL):' : `ثمن الكهرباء (قاعدة السعر الموحد ${(calculation.appliedRatePerKwh * 1000).toFixed(0)} مليم):`}
              </span>
              <span className="font-mono">{calculation.energyCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
            </div>
            {calculation.capacityFeeMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">
                  {country.code === 'MA' ? 'الإتاوة الثابتة للعداد (ONEE):' : country.code === 'DZ' ? 'قوة الاشتراك الثابتة:' : country.code === 'LY' ? 'تكاليف تقديم الخدمة والكشف:' : `معلوم القدرة للعداد (${country.meterKva || 5} kVA @ 0.700 د.ت):`}
                </span>
                <span className="font-mono">{calculation.capacityFeeMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {calculation.energyVatMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">الأداء على القيمة المضافة للطاقة ({calculation.totalMonthlyKwh <= 300 ? '7%' : '13%'} TVA):</span>
                <span className="font-mono">{calculation.energyVatMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {calculation.capacityVatMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">الأداء على معلوم القدرة (19% TVA):</span>
                <span className="font-mono">{calculation.capacityVatMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {calculation.municipalTaxMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">معلوم الجماعات المحلية (CL):</span>
                <span className="font-mono">{calculation.municipalTaxMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {calculation.transitionFundMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">صندوق الانتقال الطاقي (FTE):</span>
                <span className="font-mono">{calculation.transitionFundMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {calculation.rttTaxMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">معلوم التلفزة التونسية (RTT):</span>
                <span className="font-mono">{calculation.rttTaxMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {country.code === 'MA' && (calculation.tppanTaxMonthly || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">رسم الترويج السمعي البصري (TPPAN):</span>
                <span className="font-mono">{(calculation.tppanTaxMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {country.code === 'LY' && (calculation.stampTaxMonthly || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">رسم الدمغة المالية (1.5%):</span>
                <span className="font-mono">{(calculation.stampTaxMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}
            {country.code === 'LY' && (calculation.cleaningFeeMonthly || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">رسوم النظافة والخدمات المحلية:</span>
                <span className="font-mono">{(calculation.cleaningFeeMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}

            {/* Optional Gas Print row */}
            {calculation.gasCalculation && calculation.gasCalculation.totalCostMonthly > 0 && (
              <div className="border-t border-slate-800 print:border-slate-300 pt-2 text-orange-400 print:text-orange-700 font-bold flex justify-between">
                <span>
                  {country.code === 'TN'
                    ? `فاتورة الغاز الطبيعي STEG (${calculation.gasCalculation.monthlyM3} م³):`
                    : country.code === 'DZ'
                    ? `فاتورة غاز سونلغاز (${calculation.gasCalculation.monthlyM3} م³):`
                    : country.code === 'MA'
                    ? `غاز البوتان (البوطا - ${calculation.gasCalculation.bottleCount12kg || 0} كبيرة):`
                    : country.code === 'LY'
                    ? `غاز الطهي (البريقة - ${calculation.gasCalculation.bottleCount12kg || 0} أسطوانة):`
                    : `تكلفة الغاز (${calculation.gasCalculation.monthlyM3} م³):`}
                </span>
                <span className="font-mono">{calculation.gasCalculation.totalCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-white print:text-black pt-2 border-t border-slate-800 print:border-slate-300">
              <span>المجموع النهائي المقدر (شهرياً):</span>
              <span className="font-mono text-amber-400 print:text-amber-800">
                {(calculation.combinedTotalMonthly || calculation.totalCostMonthly).toFixed(country.decimalPlaces)} {country.currencySymbol}
              </span>
            </div>

            {country.code === 'TN' && (
              <div className="flex justify-between font-bold text-sm text-sky-400 print:text-sky-800 pt-1">
                <span>المبلغ الإجمالي لفاتورة شهرين STEG الدورية (Bimestrielle):</span>
                <span className="font-mono">
                  {(calculation.combinedTotalBimonthly || calculation.totalCostBimonthly).toFixed(country.decimalPlaces)} {country.currencySymbol}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
