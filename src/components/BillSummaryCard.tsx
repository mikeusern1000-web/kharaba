import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Info,
  Building
} from 'lucide-react';
import { BillCalculationResult, CountryProfile } from '../types';

interface BillSummaryCardProps {
  calculation: BillCalculationResult;
  country: CountryProfile;
  ecoModeActive: boolean;
  onOpenCountryModal: () => void;
  isGasEnabled: boolean;
  onGoToGasTab: () => void;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({
  calculation,
  country,
  ecoModeActive,
  onOpenCountryModal,
  isGasEnabled,
  onGoToGasTab,
}) => {
  const [showDetailedBill, setShowDetailedBill] = useState(false);

  const isTunisia = country.code === 'TN' || country.specialRegime === 'TUNISIA_STEG_2026';
  const isAlgeria = country.code === 'DZ' || country.specialRegime === 'ALGERIA_SONELGAZ_2026';
  const isMorocco = country.code === 'MA' || country.specialRegime === 'MOROCCO_ONEE_2026';
  const isLibya = country.code === 'LY' || country.specialRegime === 'LIBYA_GECOL_2026';
  const isCloseToNextTier = calculation.kwhToNextTier !== null && calculation.kwhToNextTier <= 25 && calculation.kwhToNextTier > 0;

  // Periodic bill calculations (Bimonthly for STEG, Trimestrielle for Sonelgaz, Monthly for ONEE/GECOL)
  const periodicBillAmount = isAlgeria 
    ? (isGasEnabled && calculation.combinedTotalQuarterly ? calculation.combinedTotalQuarterly : calculation.totalCostQuarterly)
    : isTunisia
    ? (isGasEnabled && calculation.combinedTotalBimonthly ? calculation.combinedTotalBimonthly : calculation.totalCostBimonthly)
    : (isGasEnabled && calculation.combinedTotalMonthly ? calculation.combinedTotalMonthly : calculation.totalCostMonthly);

  const periodicLabel = isAlgeria 
    ? 'فاتورة الثلاثي (سونلغاز - كل 3 أشهر)'
    : isTunisia 
    ? 'فاتورة شهرين (STEG الدورية)'
    : isMorocco
    ? (isGasEnabled ? 'المجموع الشهري (كهرباء + بوطا)' : 'فاتورة الكهرباء الشهرية (ONEE)')
    : isLibya
    ? (isGasEnabled ? 'المجموع الشهري (كهرباء + أسطوانات البريقة)' : 'فاتورة الكهرباء الشهرية (GECOL)')
    : 'التكلفة السنوية التقديرية';

  const periodicBadge = isAlgeria 
    ? 'Trimestrielle (3 أشهر)' 
    : isTunisia 
    ? 'Bimestrielle (شهرين)' 
    : isMorocco
    ? 'فاتورة شهرية ONEE'
    : isLibya
    ? 'فاتورة شهرية GECOL'
    : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ملخص الفاتورة التقديرية الرسمية</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-medium">{country.name}</span>
            {ecoModeActive && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">وضع التوفير مفعّل</span>
              </>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            حساب فاتورة الكهرباء {isGasEnabled && calculation.gasCalculation ? (isAlgeria ? '+ الغاز الطبيعي (سونلغاز)' : isMorocco ? '+ غاز البوتان (البوطا)' : isLibya ? '+ أسطوانات غاز البريقة' : isTunisia ? '+ الغاز الطبيعي (كهرغاز STEG)' : '+ الغاز الطبيعي') : ''}
          </h2>
        </div>

        {/* Action badge to tune country / rates */}
        <div className="flex items-center gap-2">
          {(isTunisia || isAlgeria || isMorocco || isLibya) && !isGasEnabled && (
            <button
              onClick={onGoToGasTab}
              className="text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isMorocco ? 'إدراج قنينات البوطا' : isLibya ? 'إدراج أسطوانات البريقة' : 'إدراج الغاز الطبيعي'}</span>
            </button>
          )}

          <button
            onClick={onOpenCountryModal}
            className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>ضبط العداد والتعرفة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        
        {/* KPI 1: Monthly Cost */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {isGasEnabled && calculation.gasCalculation ? 'المجموع الشهري (كهرباء + غاز)' : 'فاتورة الكهرباء الشهرية'}
          </div>
          <div className="my-2">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {(isGasEnabled && calculation.combinedTotalMonthly ? calculation.combinedTotalMonthly : calculation.totalCostMonthly).toFixed(country.decimalPlaces)}
            </span>
            <span className="text-sm font-semibold text-slate-300 mr-1.5">
              {country.currencySymbol}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            {isGasEnabled && calculation.gasCalculation ? (
              <span>كهرباء: {calculation.totalCostMonthly.toFixed(2)} + غاز: {calculation.gasCalculation.totalCostMonthly.toFixed(2)} {country.currencySymbol}</span>
            ) : (
              <span>معدل {calculation.totalCostDaily.toFixed(country.decimalPlaces)} {country.currencySymbol} / يوم</span>
            )}
          </div>
        </div>

        {/* KPI 2: Periodic Bill (Quarterly for Sonelgaz, Bimonthly for STEG) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {periodicLabel}
            </span>
            {periodicBadge && (
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                {periodicBadge}
              </span>
            )}
          </div>
          <div className="my-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
              {(isAlgeria || isTunisia ? periodicBillAmount : calculation.totalCostYearly).toFixed(country.decimalPlaces)}
            </span>
            <span className="text-sm font-semibold text-slate-300 mr-1.5">
              {country.currencySymbol}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {isAlgeria ? (
              <span>فاتورة سونلغاز الدورية (كل 3 أشهر)</span>
            ) : isTunisia ? (
              <span>فاتورة الستاغ التي تصلك كل شهرين</span>
            ) : isLibya ? (
              <span>فاتورة الشركة العامة للكهرباء الشهرية</span>
            ) : (
              <span>سنوياً: {calculation.totalCostYearly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
            )}
          </div>
        </div>

        {/* KPI 3: Total Energy (kWh) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {isAlgeria ? 'الاستهلاك الثلاثي (3 أشهر)' : 'الاستهلاك الشهري للطاقة'}
          </div>
          <div className="my-2">
            <span className="text-2xl md:text-3xl font-extrabold text-sky-400 font-mono tabular-nums">
              {Math.round(isAlgeria ? calculation.totalMonthlyKwh * 3 : calculation.totalMonthlyKwh)}
            </span>
            <span className="text-sm font-semibold text-slate-300 mr-1.5">
              ك.و.س (kWh)
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {isAlgeria ? (
              <span>الشهري: {Math.round(calculation.totalMonthlyKwh)} ك.و.س · اليومي: {calculation.totalDailyKwh.toFixed(1)} ك.و.س</span>
            ) : (
              <span>اليومي: {calculation.totalDailyKwh.toFixed(1)} ك.و.س · السنوي: {Math.round(calculation.totalYearlyKwh)}</span>
            )}
          </div>
        </div>

        {/* KPI 4: Active Tier & Marginal Rate */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {isAlgeria ? 'شريحة سونلغاز والضرائب' : isLibya ? 'التعرفة وفئة المشترك' : 'سعر الشريحة المطبق'}
          </div>
          <div className="my-2">
            <div className="text-sm font-bold text-emerald-400 truncate" title={calculation.currentTierName}>
              {calculation.currentTierName}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-mono">
              {isAlgeria ? (
                <span>TVA: {calculation.currentTierIndex < 2 ? '9% (مخفضة)' : '19% (عادية)'}</span>
              ) : isTunisia ? (
                <span>السعر: <strong className="text-white tabular-nums">{(calculation.appliedRatePerKwh * 1000).toFixed(0)} مليم</strong></span>
              ) : isLibya ? (
                <span>السعر: <strong className="text-white tabular-nums">{(calculation.appliedRatePerKwh * 1000).toFixed(0)} درهماً</strong></span>
              ) : (
                <span>{calculation.averageCostPerKwh.toFixed(country.decimalPlaces)} {country.currencySymbol}/ك.و.س</span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            {calculation.kwhToNextTier !== null ? (
              <span>يتبقى {Math.round(calculation.kwhToNextTier)} ك.و.س للشريحة التالية</span>
            ) : (
              <span>أعلى شريحة استهلاك</span>
            )}
          </div>
        </div>

      </div>

      {/* Algeria Sonelgaz 2026 Specific Explanation Notice */}
      {isAlgeria && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 mb-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>نظام الفوترة الثلاثية والأشطر لسونلغاز (كود 54M المعتمد من CREG):</span>
            </span>
            <span className="font-mono text-white text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
              استطاعة {country.meterKwPower || 6} kW · فاتورة ربع سنوية
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            تعتمد الجزائر الفوترة <strong>كل 3 أشهر (ثلاثي)</strong> بنظام الأشطر التصاعدية المدعومة: الشطر 1 (1.7787 دج) والشطر 2 (4.1789 دج) بضريبة TVA مخفضة <strong>9%</strong>، ثم ترتفع إلى <strong>19%</strong> للشطرين 3 و 4.
          </p>
          <div className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-0.5">
            <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>تحديث قانون المالية 2026 (المادة 94):</strong> تم تضمين الرسم على السكن الثابت بقيمة <strong>400 دج في الفاتورة الثلاثية</strong> (~133.33 دج شهرياً).
            </span>
          </div>
        </div>
      )}

      {/* Tunisia STEG 2026 Non-Cumulative Single-Price Rule Notice */}
      {isTunisia && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 mb-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>نظام الفوترة التصاعدي بسعر الشريحة الموحد (غير تراكمي) لـ STEG:</span>
            </span>
            <span className="font-mono text-white text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
              عداد {country.meterKva || 5} kVA
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            استهلاكك الحالي ({Math.round(calculation.totalMonthlyKwh)} ك.و.س) يقع في{' '}
            <strong className="text-amber-300">{calculation.currentTierName}</strong>، ويتم احتساب{' '}
            <strong>كامل كمية الاستهلاك من الكيلوواط الأول حتى الأخير</strong> بسعر واحد موحد هو{' '}
            <strong className="text-emerald-400 font-mono">{(calculation.appliedRatePerKwh * 1000).toFixed(0)} مليماً</strong> (وليس على الفارق فقط).
          </p>
          {calculation.totalMonthlyKwh <= 100 ? (
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>أنت ضمن الشريحة الاقتصادية المحمية: معفى كلياً من معلوم الجماعات المحلية (CL) وصندوق الانتقال الطاقي (FTE).</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              *بسبب تجاوز 100 ك.و.س، يسقط الحق في الأسعار الاقتصادية وتُضاف معاليم CL وFTE (5 مليم لكل ك.و.س).
            </div>
          )}
        </div>
      )}

      {/* Morocco ONEE 2026 Hybrid Notice */}
      {isMorocco && (
        <div className={`rounded-xl p-3.5 mb-4 space-y-1.5 text-xs border ${
          calculation.totalMonthlyKwh > 150
            ? 'bg-rose-500/10 border-rose-500/25'
            : 'bg-emerald-500/10 border-emerald-500/25'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className={`flex items-center gap-1.5 ${calculation.totalMonthlyKwh > 150 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {calculation.totalMonthlyKwh > 150 ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>
                {calculation.totalMonthlyKwh > 150
                  ? 'تحذير الفوترة الانتقائية لـ ONEE (تجاوز حاجز 150 ك.و.س):'
                  : 'نظام الفوترة التدريجية لـ ONEE (استهلاك محمي ≤ 150 ك.و.س):'}
              </span>
            </span>
            <span className="font-mono text-white text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              {calculation.totalMonthlyKwh > 150 ? 'فوترة انتقائية' : 'فوترة تدريجية'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {calculation.totalMonthlyKwh > 150 ? (
              <>
                تجاوز استهلاكك الشهري حاجز 150 ك.و.س، وبالتالي <strong className="text-rose-300">سقط نظام التدرج</strong> ويُطبق سعر الشطر الحالي (<strong className="text-amber-300 font-mono">{calculation.appliedRatePerKwh.toFixed(4)} درهم</strong>) على <strong className="text-white">كامل كمية الاستهلاك من الكيلوواط الأول حتى الأخير</strong>.
              </>
            ) : (
              <>
                أنت تستفيد من <strong className="text-emerald-300">الفوترة التدريجية</strong>: يتم تفتيت الاستهلاك بين الشطر الأول (0.9010 درهم) والشطر الثاني (1.0732 درهم) دون معاقبة بأثر رجعي.
                {calculation.totalMonthlyKwh > 100 && (
                  <span className="text-amber-300 block mt-1">
                    ⚠️ تنبيه: يتبقى لك <strong>{Math.max(0, 150 - Math.round(calculation.totalMonthlyKwh))} ك.و.س</strong> قبل الوصول لحاجز 150 ك.و.س الذي يسقط بعده التدرج.
                  </span>
                )}
              </>
            )}
          </p>
          <div className="text-[10px] text-slate-400 pt-0.5">
            *الأسعار شاملة للضريبة على القيمة المضافة 18% (TTC) + الإتاوة الثابتة للعداد 15 درهماً + رسم الترويج السمعي البصري TPPAN ({calculation.tppanTaxMonthly || 0} درهم).
          </div>
        </div>
      )}

      {/* Libya GECOL Notice */}
      {isLibya && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 mb-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>التعريفة الرسمية المقررة بقرار مجلس الوزراء رقم 92 لسنة 2023 (الشركة العامة للكهرباء - GECOL):</span>
            </span>
            <span className="font-mono text-white text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
              تعرفة قطاعية ثابتة
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            تُطبق تعرفة نوعية ثابتة بحسب صفة ونشاط المشترك: الاستهلاك المنزلي بنظام الخصم من المرتب/الأقساط (<strong className="text-emerald-300 font-mono">25 درهماً = 0.025 د.ل</strong> لكل ك.و.س) أو بالسداد النقدي/كاش (<strong className="text-amber-300 font-mono">40 درهماً = 0.040 د.ل</strong>)، والتجاري (80 درهماً)، والصناعي الخفيف (60 درهماً).
          </p>
          <div className="text-[11px] text-slate-400 pt-0.5">
            *تتضمن الفاتورة رسم الدمغة المالية (1.5%) ورسوم النظافة والخدمات المحلية للبلديات (1.500 د.ل شهرياً) وتكاليف تقديم الخدمة والكشف الإداري (3.000 د.ل).
          </div>
        </div>
      )}

      {/* Tier Meter Bar */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">
              {isAlgeria ? 'موقع استهلاكك من أشطر سونلغاز الثلاثية:' : isMorocco ? 'موقع استهلاكك من أشطر ONEE المغربية:' : isLibya ? 'الفئات والتعريفات المعتمدة لـ GECOL:' : 'موقعك بين شرائح التعرفة:'}
            </span>
            <span className="font-bold text-white font-mono tabular-nums">
              {Math.round(isAlgeria ? calculation.totalMonthlyKwh * 3 : calculation.totalMonthlyKwh)} ك.و.س/{isAlgeria ? 'ثلاثي' : 'شهر'}
            </span>
          </div>
          {isCloseToNextTier && (
            <div className="flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>تحذير: اقتراب من الشطر/الشريحة الأعلى (+{Math.round(calculation.kwhToNextTier!)} ك.و.س)</span>
            </div>
          )}
        </div>

        {/* Progress bar across tiers */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
            <div
              className={`transition-all duration-500 ${
                calculation.currentTierIndex < 2 ? 'bg-emerald-500' : calculation.currentTierIndex === 2 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{
                width: isAlgeria
                  ? `${Math.min(100, ((calculation.totalMonthlyKwh * 3) / 1200) * 100)}%`
                  : isLibya
                  ? `${Math.min(100, (calculation.totalMonthlyKwh / 800) * 100)}%`
                  : `${Math.min(100, (calculation.totalMonthlyKwh / 550) * 100)}%`,
              }}
            />
          </div>
          {isAlgeria ? (
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span className={calculation.currentTierIndex === 0 ? 'text-emerald-400 font-bold' : ''}>شطر 1 (125 ك.و.س) - 9%</span>
              <span className={calculation.currentTierIndex === 1 ? 'text-emerald-400 font-bold' : ''}>شطر 2 (250 ك.و.س) - 9%</span>
              <span className={calculation.currentTierIndex === 2 ? 'text-amber-400 font-bold' : ''}>شطر 3 (1000 ك.و.س) - 19%</span>
              <span className={calculation.currentTierIndex === 3 ? 'text-rose-400 font-bold' : ''}>شطر 4 (+1000)</span>
            </div>
          ) : isTunisia ? (
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span className={calculation.totalMonthlyKwh <= 50 ? 'text-emerald-400 font-bold' : ''}>50 (62 م)</span>
              <span className={calculation.totalMonthlyKwh > 50 && calculation.totalMonthlyKwh <= 100 ? 'text-emerald-400 font-bold' : ''}>100 (96 م)</span>
              <span className={calculation.totalMonthlyKwh > 100 && calculation.totalMonthlyKwh <= 200 ? 'text-amber-400 font-bold' : ''}>200 (176 م)</span>
              <span className={calculation.totalMonthlyKwh > 200 && calculation.totalMonthlyKwh <= 300 ? 'text-amber-400 font-bold' : ''}>300 (218 م)</span>
              <span className={calculation.totalMonthlyKwh > 300 && calculation.totalMonthlyKwh <= 500 ? 'text-rose-400 font-bold' : ''}>500 (341 م)</span>
              <span>+500 (414 م)</span>
            </div>
          ) : isMorocco ? (
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span className={calculation.totalMonthlyKwh <= 100 ? 'text-emerald-400 font-bold' : ''}>100 (0.90 د.م)</span>
              <span className={calculation.totalMonthlyKwh > 100 && calculation.totalMonthlyKwh <= 150 ? 'text-emerald-400 font-bold' : ''}>150 [حاجز التدرج]</span>
              <span className={calculation.totalMonthlyKwh > 150 && calculation.totalMonthlyKwh <= 200 ? 'text-amber-400 font-bold' : ''}>200 (1.07 د.م)</span>
              <span className={calculation.totalMonthlyKwh > 200 && calculation.totalMonthlyKwh <= 300 ? 'text-rose-400 font-bold' : ''}>300 (1.16 د.م)</span>
              <span className={calculation.totalMonthlyKwh > 300 && calculation.totalMonthlyKwh <= 500 ? 'text-rose-400 font-bold' : ''}>500 (1.38 د.م)</span>
              <span>+500 (1.59 د.م)</span>
            </div>
          ) : isLibya ? (
            <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
              <span className={country.libyaPaymentType === 'salary_deduction' || !country.libyaPaymentType ? 'text-emerald-400 font-bold' : ''}>منزلي - أقساط/مرتب (25 د)</span>
              <span className={country.libyaPaymentType === 'cash' ? 'text-amber-400 font-bold' : ''}>منزلي - كاش (40 د)</span>
              <span>صناعي خفيف (60 د)</span>
              <span>تجاري (80 د)</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Expandable Detailed Breakdown */}
      <div className="pt-2">
        <button
          onClick={() => setShowDetailedBill(!showDetailedBill)}
          className="w-full py-2 px-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>
              {isTunisia
                ? 'عرض بنود فاتورة STEG الرسمية (معلوم القدرة + TVA + الأداء البلدي CL + FTE + RTT)'
                : isAlgeria
                ? 'عرض بنود فاتورة سونلغاز الرسمية (الأشطر + TVA 9%/19% + رسم السكن قانون المالية 2026 + قوة الاشتراك)'
                : isMorocco
                ? 'عرض بنود فاتورة ONEE الرسمية (الأشطر + الإتاوة الثابتة + رسم الترويج TPPAN + TVA)'
                : isLibya
                ? 'عرض بنود فاتورة GECOL الرسمية (التعرفة القطاعية + رسم الدمغة + رسوم النظافة والخدمات)'
                : 'عرض بنود الفاتورة الرسمية التفصيلية'}
            </span>
          </div>
          {showDetailedBill ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showDetailedBill && (
          <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>
                {isTunisia
                  ? 'جدول الفوترة التفصيلي لـ STEG (الشركة التونسية للكهرباء والغاز)'
                  : isAlgeria
                  ? 'جدول الفوترة التفصيلي لسونلغاز - كود 54M'
                  : isMorocco
                  ? 'جدول الفوترة التفصيلي للمكتب الوطني للكهرباء (ONEE)'
                  : isLibya
                  ? 'جدول الفوترة التفصيلي للشركة العامة للكهرباء (GECOL)'
                  : `جدول الفوترة التفصيلي لـ ${country.name}`}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isAlgeria ? `استطاعة: ${country.meterKwPower || 6} kW` : `قدرة العداد: ${country.meterKva || 5} kVA`}
              </span>
            </h4>

            {/* Detailed Bill Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-500">
                    <th className="py-1.5 font-medium">الشطر / البند</th>
                    <th className="py-1.5 font-medium text-center">{isAlgeria ? 'الكمية (ثلاثياً / شهرياً)' : 'الكمية'}</th>
                    <th className="py-1.5 font-medium text-center">التعرفة</th>
                    <th className="py-1.5 font-medium text-left">المبلغ الشهري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                  
                  {/* Energy Rows */}
                  {calculation.tierBreakdown.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 font-sans font-medium text-slate-200">
                        {t.tierName}
                        {t.vatRate && <span className="text-[10px] text-slate-500 mr-1.5">(TVA {t.vatRate}%)</span>}
                      </td>
                      <td className="py-2 text-center text-sky-400">
                        {isAlgeria ? `${(t.kwhInTier * 3).toFixed(1)} / ${(t.kwhInTier).toFixed(1)}` : `${t.kwhInTier.toFixed(1)} ك.و.س`}
                      </td>
                      <td className="py-2 text-center text-slate-400">
                        {t.ratePerKwh.toFixed(4)} {country.currencySymbol}
                      </td>
                      <td className="py-2 text-left font-bold text-white">
                        {t.cost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-900/60 font-sans font-semibold">
                    <td className="py-2 text-amber-400">إجمالي ثمن الطاقة المستهلكة</td>
                    <td className="py-2 text-center font-mono">
                      {isAlgeria ? `${(calculation.totalMonthlyKwh * 3).toFixed(1)} ك.و.س ثلاثياً` : `${calculation.totalMonthlyKwh.toFixed(1)} ك.و.س`}
                    </td>
                    <td className="py-2 text-center text-slate-400">—</td>
                    <td className="py-2 text-left font-mono font-bold text-amber-400">
                      {calculation.energyCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                    </td>
                  </tr>

                  {/* Fixed Capacity / Power Subscription */}
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      {isAlgeria
                        ? `قوة الاشتراك الثابتة (${country.meterKwPower || 6} kW @ 4.37 دج)`
                        : isMorocco
                        ? 'الإتاوة الثابتة للعداد (Redevance fixe ONEE)'
                        : isLibya
                        ? 'تكاليف تقديم الخدمة والكشف الإداري الدوري (GECOL)'
                        : `معلوم القدرة (الاشتراك الثابت للعداد)`}
                    </td>
                    <td className="py-2 text-center font-sans text-slate-400">
                      {isAlgeria
                        ? `${country.meterKwPower || 6} kW`
                        : isMorocco
                        ? 'عداد منزلي قياسي'
                        : isLibya
                        ? 'اشتراك شهري قار'
                        : `${country.meterKva || 5} kVA`}
                    </td>
                    <td className="py-2 text-center text-slate-400">
                      {isAlgeria ? '4.37 دج/kW شهرياً' : isMorocco ? '15.00 درهم/شهر' : isLibya ? '3.000 د.ل / شهر' : '0.700 د.ت/kVA'}
                    </td>
                    <td className="py-2 text-left text-slate-200">
                      {calculation.capacityFeeMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                    </td>
                  </tr>

                  {/* Stamp Tax for Libya */}
                  {isLibya && (calculation.stampTaxMonthly || 0) > 0 && (
                    <tr className="bg-emerald-500/5">
                      <td className="py-2 font-sans text-emerald-300 font-semibold">
                        رسم الدمغة المالية (قانون الضرائب الليبي 1.5%)
                      </td>
                      <td className="py-2 text-center font-sans text-slate-400">
                        نسبة مئوية
                      </td>
                      <td className="py-2 text-center text-slate-400">1.5% من الاستهلاك</td>
                      <td className="py-2 text-left font-bold text-emerald-300 font-mono">
                        {(calculation.stampTaxMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* Cleaning Fee for Libya */}
                  {isLibya && (calculation.cleaningFeeMonthly || 0) > 0 && (
                    <tr className="bg-sky-500/5">
                      <td className="py-2 font-sans text-sky-300 font-semibold">
                        رسوم النظافة والخدمات المحلية (البلديات)
                      </td>
                      <td className="py-2 text-center font-sans text-slate-400">
                        رسم شهري قار
                      </td>
                      <td className="py-2 text-center text-slate-400">1.500 د.ل / شهر</td>
                      <td className="py-2 text-left font-bold text-sky-300 font-mono">
                        {(calculation.cleaningFeeMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* TPPAN for Morocco */}
                  {isMorocco && (calculation.tppanTaxMonthly || 0) > 0 && (
                    <tr className="bg-sky-500/5">
                      <td className="py-2 font-sans text-sky-300 font-semibold">
                        رسم الترويج السمعي البصري (TPPAN)
                      </td>
                      <td className="py-2 text-center font-sans text-slate-400">
                        {calculation.totalMonthlyKwh > 200 ? 'استهلاك > 200 ك.و.س' : 'استهلاك 101 - 200 ك.و.س'}
                      </td>
                      <td className="py-2 text-center text-slate-400">مبلغ قانوني قار</td>
                      <td className="py-2 text-left font-bold text-sky-300">
                        {(calculation.tppanTaxMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* Housing Tax in Algeria (قانون المالية 2026) */}
                  {isAlgeria && calculation.housingTaxMonthly > 0 && (
                    <tr className="bg-amber-500/5">
                      <td className="py-2 font-sans text-amber-300 font-semibold">
                        الرسم على السكن (قانون المالية 2026 - المادة 94)
                      </td>
                      <td className="py-2 text-center font-sans text-slate-400">
                        {country.housingTaxQuarterly || 400} دج / ثلاثي
                      </td>
                      <td className="py-2 text-center text-slate-400">مبلغ قار</td>
                      <td className="py-2 text-left font-bold text-amber-300">
                        {calculation.housingTaxMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* TVA */}
                  <tr>
                    <td className="py-2 font-sans text-slate-300">
                      {isAlgeria
                        ? 'مجموع ضريبة القيمة المضافة (TVA 9% و 19%)'
                        : isMorocco
                        ? 'الضريبة على القيمة المضافة (TVA 18% متضمنة)'
                        : isLibya
                        ? 'ضريبة القيمة المضافة (TVA معفاة)'
                        : `الأداء على القيمة المضافة (TVA)`}
                    </td>
                    <td className="py-2 text-center font-sans text-slate-500">
                      {isAlgeria ? 'حسب الأشطر' : isLibya ? 'معفى 0%' : `${country.vatPercentage}%`}
                    </td>
                    <td className="py-2 text-center text-slate-400">—</td>
                    <td className="py-2 text-left text-slate-200">
                      {calculation.vatMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                    </td>
                  </tr>

                  {/* Municipal / CL / FTE */}
                  {calculation.municipalTaxMonthly > 0 && (
                    <tr>
                      <td className="py-2 font-sans text-slate-300">معلوم الجماعات المحلية (CL)</td>
                      <td className="py-2 text-center">{calculation.totalMonthlyKwh.toFixed(1)} ك.و.س</td>
                      <td className="py-2 text-center text-slate-400">5 مليم/ك.و.س</td>
                      <td className="py-2 text-left text-slate-200">
                        {calculation.municipalTaxMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {calculation.transitionFundMonthly > 0 && (
                    <tr>
                      <td className="py-2 font-sans text-slate-300">
                        {isAlgeria ? 'دعم صندوق الطاقة المتجددة' : 'صندوق الانتقال الطاقي (FTE)'}
                      </td>
                      <td className="py-2 text-center font-sans text-slate-500">اقتطاع قانوني</td>
                      <td className="py-2 text-center text-slate-400">—</td>
                      <td className="py-2 text-left text-slate-200">
                        {calculation.transitionFundMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* RTT for Tunisia */}
                  {calculation.rttTaxMonthly > 0 && (
                    <tr>
                      <td className="py-2 font-sans text-slate-300">معلوم الإذاعة والتلفزة التونسية (RTT)</td>
                      <td className="py-2 text-center font-sans text-slate-500">معلوم قار</td>
                      <td className="py-2 text-center text-slate-400">—</td>
                      <td className="py-2 text-left text-slate-200">
                        {calculation.rttTaxMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                      </td>
                    </tr>
                  )}

                  {/* Electricity Total */}
                  <tr className="border-t-2 border-slate-700 font-bold text-sm bg-slate-900/90">
                    <td className="py-2.5 font-sans text-white">إجمالي فاتورة الكهرباء الشهرية</td>
                    <td className="py-2.5 text-center text-sky-400">
                      {Math.round(calculation.totalMonthlyKwh)} ك.و.س
                    </td>
                    <td className="py-2.5 text-center text-slate-400">—</td>
                    <td className="py-2.5 text-left text-amber-400 text-base">
                      {calculation.totalCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                    </td>
                  </tr>

                  {/* Natural Gas Section if active */}
                  {isGasEnabled && calculation.gasCalculation && (
                    <>
                      <tr className="bg-orange-950/40 font-bold text-orange-300 border-t-2 border-orange-800">
                        <td className="py-2 font-sans">
                          {isAlgeria
                            ? `فاتورة الغاز الطبيعي (سونلغاز 23M - ${calculation.gasCalculation.quarterlyThermie ? Math.round(calculation.gasCalculation.quarterlyThermie) : 0} ثرمية)`
                            : isMorocco
                            ? `شراء قنينات غاز البوتان (البوطا - ${calculation.gasCalculation.bottleCount12kg || 0} كبيرة)`
                            : isLibya
                            ? `شراء أسطوانات غاز الطهي (البريقة - ${calculation.gasCalculation.bottleCount12kg || 0} أسطوانة)`
                            : isTunisia
                            ? 'فاتورة الغاز الطبيعي المدمجة (STEG Gaz BP1)'
                            : 'تكلفة الغاز التقديرية'}
                        </td>
                        <td className="py-2 text-center font-mono">
                          {isMorocco
                            ? `${calculation.gasCalculation.bottleCount12kg || 0} بوطا 12 كغ`
                            : isLibya
                            ? `${calculation.gasCalculation.bottleCount12kg || 0} أسطوانة`
                            : `${calculation.gasCalculation.monthlyM3} م³/شهر`}
                        </td>
                        <td className="py-2 text-center font-mono">
                          {isAlgeria
                            ? 'حسب أشطر الثرمية'
                            : isMorocco
                            ? '50.00 درهم / قنينة'
                            : isLibya
                            ? '3.000 د.ل / أسطوانة'
                            : isTunisia
                            ? `${(calculation.gasCalculation.ratePerUnit * 1000).toFixed(0)} مليم/م³`
                            : `${calculation.gasCalculation.ratePerUnit.toFixed(3)} ${country.currencySymbol}/م³`}
                        </td>
                        <td className="py-2 text-left font-mono">
                          {calculation.gasCalculation.totalCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}
                        </td>
                      </tr>

                      <tr className="bg-amber-500/20 font-bold text-base text-white border-t-2 border-amber-500">
                        <td className="py-3 font-sans text-amber-300">
                          {isAlgeria
                            ? 'المبلغ الإجمالي الشهري الموحد (كهرباء + غاز سونلغاز)'
                            : isMorocco
                            ? 'المجموع الشهري التقديري (كهرباء ONEE + غاز البوتان)'
                            : isLibya
                            ? 'المجموع الشهري التقديري (كهرباء GECOL + أسطوانات البريقة)'
                            : isTunisia
                            ? 'المبلغ الإجمالي الموحد لفاتورة كهرغاز STEG'
                            : 'المبلغ الإجمالي الشهري (كهرباء + غاز)'}
                        </td>
                        <td className="py-3 text-center text-slate-300 font-sans text-xs">
                          {isMorocco ? 'كهرباء + بوطا' : isLibya ? 'كهرباء + أسطوانات' : 'كهرباء + غاز'}
                        </td>
                        <td className="py-3 text-center text-slate-400">—</td>
                        <td className="py-3 text-left font-mono text-amber-300 text-lg">
                          {(calculation.combinedTotalMonthly || 0).toFixed(country.decimalPlaces)} {country.currencySymbol}
                        </td>
                      </tr>
                    </>
                  )}

                </tbody>
              </table>
            </div>

            {/* Periodic summary note */}
            <div className="mt-2 p-2.5 bg-slate-900 rounded-lg text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">
                {isAlgeria
                  ? 'ملخص الفاتورة ربع السنوية (Trimestrielle كل 3 أشهر):'
                  : isTunisia
                  ? 'ملخص فاتورة الـ 2 أشهر (Bimestrielle - STEG):'
                  : isMorocco
                  ? 'ملخص الفاتورة الشهرية (ONEE):'
                  : isLibya
                  ? 'ملخص الفاتورة الشهرية (الشركة العامة للكهرباء GECOL):'
                  : 'ملخص الفاتورة الشهرية:'}
              </div>
              <div>
                • فاتورة الكهرباء الدورية: <strong className="text-amber-400">{(isAlgeria ? calculation.totalCostQuarterly : isTunisia ? calculation.totalCostBimonthly : calculation.totalCostMonthly).toFixed(country.decimalPlaces)} {country.currencySymbol}</strong>.
              </div>
              {isGasEnabled && calculation.gasCalculation && (
                <div>
                  • {isMorocco ? 'تكلفة غاز البوتان الشهري:' : isLibya ? 'تكلفة أسطوانات البريقة الشهرية:' : 'فاتورة الغاز الدورية:'} <strong className="text-orange-400">{(isAlgeria ? (calculation.gasCalculation.totalCostQuarterly || calculation.gasCalculation.totalCostMonthly * 3) : isTunisia ? calculation.gasCalculation.totalCostBimonthly : calculation.gasCalculation.totalCostMonthly).toFixed(country.decimalPlaces)} {country.currencySymbol}</strong>.
                </div>
              )}
              {isGasEnabled && (
                <div>
                  • إجمالي الفاتورة الدورية المستحقة للدفع: <strong className="text-emerald-400 text-sm font-mono">{(isAlgeria ? (calculation.combinedTotalQuarterly || calculation.totalCostQuarterly) : isTunisia ? (calculation.combinedTotalBimonthly || calculation.totalCostBimonthly) : (calculation.combinedTotalMonthly || calculation.totalCostMonthly)).toFixed(country.decimalPlaces)} {country.currencySymbol}</strong>.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
