import React, { useState } from 'react';
import { X, Check, Globe, Sliders, ShieldCheck, Info, Gauge, Building, Wrench } from 'lucide-react';
import { CountryProfile, CountryCode } from '../types';
import { COUNTRIES, LIBYA_GECOL_SERVICES } from '../data/countries';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: CountryProfile;
  onSelectCountry: (country: CountryProfile) => void;
}

export const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
}) => {
  if (!isOpen) return null;

  const [activeCode, setActiveCode] = useState<CountryCode>(selectedCountry.code);
  const [customProfile, setCustomProfile] = useState<CountryProfile>({ ...selectedCountry });

  const handleCountryPick = (code: CountryCode) => {
    setActiveCode(code);
    const found = COUNTRIES.find((c) => c.code === code);
    if (found) {
      setCustomProfile({ ...found });
    }
  };

  const handleApply = () => {
    onSelectCountry(customProfile);
    onClose();
  };

  const isTunisia = customProfile.code === 'TN' || customProfile.specialRegime === 'TUNISIA_STEG_2026';
  const isLibya = customProfile.code === 'LY' || customProfile.specialRegime === 'LIBYA_GECOL_2026';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400" />
            <div>
              <h3 id="country-modal-title" className="text-base font-bold text-white">
                إعدادات البلد والتعرفة والعداد
              </h3>
              <p className="text-xs text-slate-400">
                {isTunisia
                  ? 'تعرفة STEG تونس الرسمية 2026 وقدرة العداد التعاقدية'
                  : customProfile.code === 'DZ'
                  ? 'تعرفة سونلغاز الجزائر 2026 ونظام الأشطر الثلاثية والاستطاعة'
                  : customProfile.code === 'MA'
                  ? 'تعرفة ONEE المغربية 2026 ونظام الفوترة الهجين والإتاوة'
                  : isLibya
                  ? 'تعرفة الشركة العامة للكهرباء (GECOL) والرسوم المقررة بقرار 92'
                  : 'تخصيص أسعار التعرفة والاشتراك الشهري'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق نافذة إعدادات البلد والتعرفة"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Countries Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2.5">
              اختر البلد / نظام الشركة المزودة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountryPick(c.code)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                    activeCode === c.code
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{c.flag}</span>
                    <div>
                      <div className="text-xs">{c.name.split('(')[0].trim()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.currencySymbol} · {c.currency}</div>
                    </div>
                  </div>
                  {activeCode === c.code && (
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Country Details & Fine-tuning */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200">
                مواصفات تعرفة {customProfile.name}
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                العملة: {customProfile.currencySymbol} ({customProfile.currency})
              </span>
            </div>

            {/* Official Source & Verification Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{customProfile.officialUtility || customProfile.name}</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  customProfile.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {customProfile.verificationStatus === 'VERIFIED' ? '✓ تعرفة رسمية موثقة 2026' : 'تعرفة مخصصة يدوية'}
                </span>
              </div>
              {customProfile.legalReference && (
                <div className="text-[11px] text-slate-300">
                  <strong className="text-slate-400">المرجع القانوني:</strong> {customProfile.legalReference}
                </div>
              )}
              {customProfile.effectiveDate && (
                <div className="text-[10px] text-slate-400">
                  <strong className="text-slate-500">سريان التعرفة:</strong> {customProfile.effectiveDate} · الدورة:{' '}
                  {customProfile.billingCycleMonths === 3 ? 'ثلاثية (كل 3 أشهر)' : customProfile.billingCycleMonths === 2 ? 'ثنائية (كل شهرين)' : 'شهرية (كل شهر)'}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              {customProfile.notes}
            </p>

            {/* Meter kVA Capacity for Tunisia STEG */}
            {isTunisia && (
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-400" />
                    <span>القدرة التعاقدية لعداد الكهرباء (Puissance souscrite):</span>
                  </span>
                  <span className="text-amber-400 font-mono">{customProfile.meterKva || 5} kVA</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { kva: 2, label: '2 kVA (شريحة اقتصادية)', fee: '1.400 د.ت/شهر' },
                    { kva: 3, label: '3 kVA (استهلاك خفيف)', fee: '2.100 د.ت/شهر' },
                    { kva: 5, label: '5 kVA (عداد قياسي منزلي)', fee: '3.500 د.ت/شهر' },
                    { kva: 10, label: '10 kVA (3 أطوار Triphasé)', fee: '7.000 د.ت/شهر' },
                  ].map((item) => (
                    <button
                      key={item.kva}
                      type="button"
                      onClick={() =>
                        setCustomProfile({
                          ...customProfile,
                          meterKva: item.kva,
                          fixedChargeMonthly: item.kva * 0.700,
                        })
                      }
                      className={`p-2 rounded-lg border text-right transition-colors ${
                        (customProfile.meterKva || 5) === item.kva
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                          : 'bg-slate-950/60 border-slate-855 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-mono">{item.kva} kVA</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.fee}</div>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  *معلوم القدرة = 700 مليم شهرياً لكل كالف (kVA)، وتُطبق عليه ضريبة TVA بنسبة 19%.
                </div>
              </div>
            )}

            {/* Contracted Power & Housing Tax for Algeria Sonelgaz */}
            {(customProfile.code === 'DZ' || customProfile.specialRegime === 'ALGERIA_SONELGAZ_2026') && (
              <div className="space-y-3">
                {/* Meter Power kW */}
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-400" />
                      <span>استطاعة الاشتراك التعاقدية (سونلغاز):</span>
                    </span>
                    <span className="text-emerald-400 font-mono">{customProfile.meterKwPower || 6} kW</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { kw: 3, label: '3 kW (عداد صغير)', fee: '13.11 دج/شهر' },
                      { kw: 6, label: '6 kW (عداد قياسي منزلي)', fee: '26.22 دج/شهر' },
                      { kw: 9, label: '9 kW (مكيفات وأجهزة)', fee: '39.33 دج/شهر' },
                      { kw: 12, label: '12 kW (استهلاك مكثف)', fee: '52.44 دج/شهر' },
                    ].map((item) => (
                      <button
                        key={item.kw}
                        type="button"
                        onClick={() =>
                          setCustomProfile({
                            ...customProfile,
                            meterKwPower: item.kw,
                            fixedChargeMonthly: item.kw * 4.37,
                          })
                        }
                        className={`p-2 rounded-lg border text-right transition-colors ${
                          (customProfile.meterKwPower || 6) === item.kw
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-855 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-mono">{item.kw} kW</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.fee}</div>
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    *مبلغ ثابت 4.37 دج شهرياً لكل كيلوواط مُتعاقد عليه (يُضرب في 3 أشهر بالفاتورة الثلاثية).
                  </div>
                </div>

                {/* Housing Tax قانون المالية 2026 */}
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-amber-400" />
                      <span>الرسم على السكن (قانون المالية 2026 - المادة 94):</span>
                    </span>
                    <span className="text-amber-400 font-mono">{customProfile.housingTaxQuarterly || 400} دج / ثلاثي</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomProfile({
                          ...customProfile,
                          housingTaxQuarterly: 400.0,
                        })
                      }
                      className={`p-2.5 rounded-lg border text-right transition-colors ${
                        (customProfile.housingTaxQuarterly || 400) === 400
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950/60 border-slate-855 text-slate-400'
                      }`}
                    >
                      <div className="text-xs">سكن فردي / حضري قياسي</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">400 دج / ثلاثي (133.3 دج شهرياً)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCustomProfile({
                          ...customProfile,
                          housingTaxQuarterly: 800.0,
                        })
                      }
                      className={`p-2.5 rounded-lg border text-right transition-colors ${
                        customProfile.housingTaxQuarterly === 800
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950/60 border-slate-855 text-slate-400'
                      }`}
                    >
                      <div className="text-xs">سكن تجاري / منطقة خاصة</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">800 دج / ثلاثي (266.6 دج شهرياً)</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Morocco ONEE 2026 Specific Settings */}
            {(customProfile.code === 'MA' || customProfile.specialRegime === 'MOROCCO_ONEE_2026') && (
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>رسوم واشتراكات المكتب الوطني للكهرباء (ONEE):</span>
                  </span>
                  <span className="text-emerald-400 font-mono">TVA 18% متضمنة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-300 font-semibold">الإتاوة الثابتة للعداد (Redevance Fixe)</div>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                      {customProfile.fixedChargeMonthly.toFixed(2)} درهم / شهرياً
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      مبلغ قار للعداد المنزلي أحادي الطور (Monophasé)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-300 font-semibold">رسم الترويج السمعي البصري (TPPAN)</div>
                    <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">
                      معفى ≤ 100 ك.و.س · 10 د.م (101-200) · 20 د.م (+200)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      يُحدد آلياً حسب حجم الاستهلاك الشهري في الفاتورة
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-850">
                  💡 <strong>حاجز 150 ك.و.س الانتقائي:</strong> إذا كان استهلاكك ≤ 150 ك.و.س، تطبق الفوترة التدريجية دون أثر رجعي. إذا تجاوزت 150 ك.و.س، يتم تطبيق سعر الشطر الأعلى على كامل الفاتورة من الكيلوواط الأول.
                </div>
              </div>
            )}

            {/* Libya GECOL 2026 Specific Settings */}
            {isLibya && (
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>فئة ونشاط المشترك (قرار مجلس الوزراء رقم 92 لسنة 2023):</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    GECOL 2026
                  </span>
                </div>

                {/* Sector / Tariff Buttons - Decision 92 of 2023 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-64 overflow-y-auto pr-1">
                  {[
                    {
                      id: 'ly_home_salary',
                      label: 'منزلي (خصم من المرتب / أقساط)',
                      rate: 0.025,
                      rateLabel: '25 درهماً (0.025 د.ل)',
                      desc: 'الخيار الأكثر توفيراً للأسر والموظفين',
                    },
                    {
                      id: 'ly_home_cash',
                      label: 'منزلي (السداد النقدي / كاش)',
                      rate: 0.040,
                      rateLabel: '40 درهماً (0.040 د.ل)',
                      desc: 'للمشتركين بالسداد المباشر دون خصم مرتب',
                    },
                    {
                      id: 'ly_commercial',
                      label: 'تجاري (المحلات والأنشطة الصغيرة)',
                      rate: 0.080,
                      rateLabel: '80 درهماً (0.080 د.ل)',
                      desc: 'المحلات والمكاتب والخدمات التجارية',
                    },
                    {
                      id: 'ly_industrial_light',
                      label: 'صناعي خفيف (ورش ومصانع صغرى)',
                      rate: 0.060,
                      rateLabel: '60 درهماً (0.060 د.ل)',
                      desc: 'الورش الحرفية والمعامل والأنشطة الخفيفة',
                    },
                    {
                      id: 'ly_industrial_heavy',
                      label: 'صناعي ثقيل (مصانع كبرى)',
                      rate: 0.045,
                      rateLabel: '45 درهماً (0.045 د.ل)',
                      desc: 'المصانع الكبرى والمجمعات الإنتاجية',
                    },
                    {
                      id: 'ly_agricultural_small',
                      label: 'زراعي (صغار المربين والمزارعين)',
                      rate: 0.040,
                      rateLabel: '40 درهماً (0.040 د.ل)',
                      desc: 'المزارع العائلية وتربية المواشي',
                    },
                    {
                      id: 'ly_agricultural_large',
                      label: 'زراعي (المشاريع الزراعية الكبرى)',
                      rate: 0.045,
                      rateLabel: '45 درهماً (0.045 د.ل)',
                      desc: 'المشاريع الاستثمارية والدوائر الزراعية',
                    },
                    {
                      id: 'ly_public_lighting',
                      label: 'المرافق العامة وإنارة الشوارع',
                      rate: 0.135,
                      rateLabel: '135 درهماً (0.135 د.ل)',
                      desc: 'إنارة الطرقات والبلديات والمرافق',
                    },
                    {
                      id: 'ly_mega_consumers',
                      label: 'كبار المستهلكين (> 0.5 MW بالذروة)',
                      rate: 1.000,
                      rateLabel: '1000 درهم (1.000 د.ل)',
                      desc: 'أحمال ضخمة تفوق نصف ميغاوات في الذروة',
                    },
                  ].map((opt) => {
                    const isSelected =
                      customProfile.libyaPaymentType === opt.id ||
                      (!customProfile.libyaPaymentType && opt.id === 'ly_home_salary') ||
                      customProfile.tiers[0]?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const matchedTier = customProfile.tiers.find((t) => t.id === opt.id) || {
                            id: opt.id,
                            name: opt.label,
                            fromKwh: 0,
                            toKwh: Infinity,
                            ratePerKwh: opt.rate,
                            description: opt.rateLabel,
                          };
                          const otherTiers = customProfile.tiers.filter((t) => t.id !== opt.id);
                          setCustomProfile({
                            ...customProfile,
                            libyaPaymentType: opt.id as any,
                            tiers: [matchedTier, ...otherTiers],
                          });
                        }}
                        className={`p-2.5 rounded-lg border text-right transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-1">{opt.rateLabel}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Editable Libya fees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      رسم الدمغة المالية (% من الاستهلاك):
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={customProfile.stampTaxPercentage ?? 1.5}
                      onChange={(e) =>
                        setCustomProfile({
                          ...customProfile,
                          stampTaxPercentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      رسوم النظافة والخدمات المحلية (د.ل / شهر):
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={customProfile.cleaningFeeMonthly ?? 1.5}
                      onChange={(e) =>
                        setCustomProfile({
                          ...customProfile,
                          cleaningFeeMonthly: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Official Technical & Administrative Service Fees */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    <span>لائحة تكاليف الخدمات والرسوم الإدارية والفنية (الشركة العامة للكهرباء):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                    {LIBYA_GECOL_SERVICES.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-950/80 border border-slate-850 flex items-center justify-between"
                      >
                        <span className="font-sans text-slate-300">{s.name}</span>
                        <span className="font-bold text-amber-400 shrink-0">{s.fee.toFixed(3)} د.ل</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Editable Fees & Taxes for other regimes */}
            {isTunisia && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    معلوم الإذاعة والتلفزة RTT ({customProfile.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={customProfile.rttFeeMonthly ?? 3.500}
                    onChange={(e) =>
                      setCustomProfile({
                        ...customProfile,
                        rttFeeMonthly: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    معلوم الجماعات CL ({customProfile.currencySymbol}/ك.و.س):
                  </label>
                  <input
                    type="number"
                    step={0.001}
                    value={customProfile.municipalTaxPerKwh}
                    onChange={(e) =>
                      setCustomProfile({
                        ...customProfile,
                        municipalTaxPerKwh: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    صندوق الانتقال FTE ({customProfile.currencySymbol}/ك.و.س):
                  </label>
                  <input
                    type="number"
                    step={0.001}
                    value={customProfile.transitionFundPerKwh}
                    onChange={(e) =>
                      setCustomProfile({
                        ...customProfile,
                        transitionFundPerKwh: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Custom Flat Rate input if custom */}
            {customProfile.code === 'CUSTOM' && (
              <div className="pt-2 border-t border-slate-800">
                <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                  سعر الكيلوواط الساعي الموحد (kWh Rate):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={0.01}
                    value={customProfile.tiers[0]?.ratePerKwh || 0.15}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value) || 0.15;
                      setCustomProfile({
                        ...customProfile,
                        tiers: [{ ...customProfile.tiers[0], ratePerKwh: newRate }],
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={customProfile.currencySymbol}
                    onChange={(e) =>
                      setCustomProfile({ ...customProfile, currencySymbol: e.target.value })
                    }
                    placeholder="رمز العملة"
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono text-xs text-center"
                  />
                </div>
              </div>
            )}

            {/* Active Tiers Display */}
            {customProfile.tiers.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>جدول الشرائح والتعريفات (2026):</span>
                  {isTunisia && <span className="text-[10px] text-amber-400 font-sans">قاعدة السعر الموحد على كامل الكمية</span>}
                  {customProfile.code === 'MA' && <span className="text-[10px] text-emerald-400 font-sans">هجين: تدريجي ≤ 150 ك.و.س ثم انتقائي</span>}
                  {isLibya && <span className="text-[10px] text-emerald-400 font-sans">تعريفة قطاعية ثابتة (قرار 92 لسنة 2023)</span>}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {customProfile.tiers.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-900 text-[11px] font-mono"
                    >
                      <div>
                        <span className="font-sans text-slate-200">{t.name}</span>
                        {t.meterPower && <span className="text-[10px] text-slate-500 mr-2">({t.meterPower})</span>}
                      </div>
                      <span className="text-amber-400 font-bold">
                        {isTunisia
                          ? `${(t.ratePerKwh * 1000).toFixed(0)} مليم (${t.ratePerKwh.toFixed(3)} د.ت)`
                          : isLibya
                          ? `${(t.ratePerKwh * 1000).toFixed(0)} درهماً (${t.ratePerKwh.toFixed(3)} د.ل)`
                          : `${t.ratePerKwh.toFixed(4)} ${customProfile.currencySymbol}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
          >
            تطبيق وحفظ الإعدادات
          </button>
        </div>

      </div>
    </div>
  );
};
