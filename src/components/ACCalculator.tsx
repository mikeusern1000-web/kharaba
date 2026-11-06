import React, { useState } from 'react';
import { AirVent, Sparkles, AlertCircle, CheckCircle2, TrendingDown, Plus, ThermometerSun, ShieldCheck } from 'lucide-react';
import { CountryProfile, Appliance } from '../types';
import { formatCurrency } from '../utils/calculator';

interface ACCalculatorProps {
  country: CountryProfile;
  averageRatePerKwh: number;
  onAddAppliance: (appliance: Appliance) => void;
}

export const ACCalculator: React.FC<ACCalculatorProps> = ({
  country,
  averageRatePerKwh,
  onAddAppliance,
}) => {
  const [btu, setBtu] = useState<number>(12000);
  const [isInverter, setIsInverter] = useState<boolean>(true);
  const [tempSetting, setTempSetting] = useState<number>(24);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(7);
  const [summerMonths, setSummerMonths] = useState<number>(3);
  const [acCount, setAcCount] = useState<number>(1);
  const [customName, setCustomName] = useState<string>('مكيف الصالة');

  // Wattage base estimations
  const btuSpecs: Record<number, { name: string; standardWatts: number; roomArea: string }> = {
    9000: { name: '9,000 BTU (0.75 طن)', standardWatts: 900, roomArea: 'حتى 14 م² (غرفة نوم صغيرة)' },
    12000: { name: '12,000 BTU (1 طن)', standardWatts: 1200, roomArea: '15 - 22 م² (غرفة نوم رئيسية أو مكتب)' },
    18000: { name: '18,000 BTU (1.5 طن)', standardWatts: 1800, roomArea: '23 - 35 م² (صالون أو صالة معيشة)' },
    24000: { name: '24,000 BTU (2 طن)', standardWatts: 2400, roomArea: '36 - 50 م² (مساحة مفتوحة واسعة)' },
  };

  const selectedSpec = btuSpecs[btu] || btuSpecs[12000];

  // Conventional AC vs Inverter AC physics calculation
  // Temperature factor: reference 24°C
  const deltaDegrees = 24 - tempSetting;
  const tempMultiplier = Math.max(0.6, 1.0 + deltaDegrees * 0.07); // 7% per degree

  // Non-Inverter calculation (runs compressor full blast then off)
  const conventionalEffectiveWatts = selectedSpec.standardWatts * tempMultiplier;
  const conventionalDailyKwh = (conventionalEffectiveWatts / 1000) * hoursPerDay * (daysPerWeek / 7) * acCount;
  const conventionalMonthlyKwh = conventionalDailyKwh * 30.416;
  const conventionalMonthlyCost = conventionalMonthlyKwh * averageRatePerKwh;
  const conventionalSeasonCost = conventionalMonthlyCost * summerMonths;

  // Inverter calculation (variable speed compressor saves ~35%)
  const inverterEffectiveWatts = selectedSpec.standardWatts * 0.65 * tempMultiplier;
  const inverterDailyKwh = (inverterEffectiveWatts / 1000) * hoursPerDay * (daysPerWeek / 7) * acCount;
  const inverterMonthlyKwh = inverterDailyKwh * 30.416;
  const inverterMonthlyCost = inverterMonthlyKwh * averageRatePerKwh;
  const inverterSeasonCost = inverterMonthlyCost * summerMonths;

  // Current selected mode values
  const activeMonthlyKwh = isInverter ? inverterMonthlyKwh : conventionalMonthlyKwh;
  const activeMonthlyCost = isInverter ? inverterMonthlyCost : conventionalMonthlyCost;
  const activeSeasonCost = isInverter ? inverterSeasonCost : conventionalSeasonCost;

  // Savings between Inverter and Conventional
  const monthlySavings = Math.max(0, conventionalMonthlyCost - inverterMonthlyCost);
  const seasonSavings = Math.max(0, conventionalSeasonCost - inverterSeasonCost);

  // Thermostat optimization savings (comparing current setting with 20°C)
  const coldSettingWatts = selectedSpec.standardWatts * (isInverter ? 0.65 : 1.0) * (1.0 + (24 - 20) * 0.07);
  const coldMonthlyCost = (coldSettingWatts / 1000) * hoursPerDay * (daysPerWeek / 7) * acCount * 30.416 * averageRatePerKwh;
  const tempOptimizationMonthlySaving = Math.max(0, coldMonthlyCost - activeMonthlyCost);

  const handleAddToList = () => {
    const newAppliance: Appliance = {
      id: `ac_${Date.now()}`,
      name: `${customName} (${btu.toLocaleString()} BTU)`,
      category: 'cooling',
      iconName: 'AirVent',
      defaultWatts: selectedSpec.standardWatts,
      watts: selectedSpec.standardWatts,
      hoursPerDay,
      daysPerWeek,
      quantity: acCount,
      enabled: true,
      isInverter,
      acBtu: btu,
      acTempSetting: tempSetting,
      customNote: `${isInverter ? 'انفرتر موفر' : 'عادي'} - مضبوط على ${tempSetting}°C`,
    };
    onAddAppliance(newAppliance);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40 rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <AirVent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <span>حاسبة المكيف الذكية والمتطورة</span>
              <span aria-hidden="true">·</span>
              <span>معدل تعرفة {country.nameEn} ({averageRatePerKwh.toFixed(country.decimalPlaces)} {country.currencySymbol}/ك.و.س)</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              حساب استهلاك وتكلفة تشغيل المكيف في الصيف
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              المكيف يمثل عادة أكثر من 50% من فاتورة الكهرباء في أشهر الصيف الحارة في {country.name.split('(')[0].trim()}. تتيح لك هذه الحاسبة مقارنة تكلفة تقنية الإنفرتر وتأثير ضبط درجة الحرارة على الفاتورة بدقة.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              إعدادات جهاز التكييف
            </h4>

            {/* Parameter: BTU Capacity */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                1. سعة التبريد (قوة المكيف):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[9000, 12000, 18000, 24000].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBtu(b)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      btu === b
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono">{b.toLocaleString()} BTU</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {b === 9000 ? '0.75 طن' : b === 12000 ? '1 طن' : b === 18000 ? '1.5 طن' : '2 طن'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                <span className="text-amber-400">المساحة المقترحة:</span>
                <span>{selectedSpec.roomArea}</span>
              </div>
            </div>

            {/* Parameter: Inverter Technology */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                2. نوع المحرك (الكمبريسور):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsInverter(true)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    isInverter
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>انفرتر موفر للطاقة (Inverter)</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    سرعة متغيرة للكمبريسور، يوفر ~35% من الفاتورة
                  </div>
                </button>

                <button
                  onClick={() => setIsInverter(false)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    !isInverter
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs mb-1">مكيف عادي تقليدي (On/Off)</div>
                  <div className="text-[10px] text-slate-400">
                    يفصل ويعمل بكامل الطاقة، يستهلك أكثر
                  </div>
                </button>
              </div>
            </div>

            {/* Parameter: Temperature setting */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. درجة الحرارة المضبوطة على الريموت:</span>
                </span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  {tempSetting}°C
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={28}
                step={1}
                value={tempSetting}
                onChange={(e) => setTempSetting(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>18°C (تبريد ثلجي مكلف)</span>
                <span className="text-emerald-400 font-bold">24°C (المثالية للتوفير والصحة)</span>
                <span>28°C (تهوية معتدلة)</span>
              </div>
            </div>

            {/* Parameter: Hours & Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>ساعات التشغيل باليوم:</span>
                  <span className="font-mono font-bold text-white">{hoursPerDay} ساعة</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>عدد المكيفات المطابقة:</span>
                  <span className="font-mono font-bold text-white">×{acCount}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-500">مكيفات بنفس المواصفات</span>
                  <div className="flex items-center border border-slate-700 rounded bg-slate-900">
                    <button
                      onClick={() => setAcCount(Math.max(1, acCount - 1))}
                      className="px-2 py-0.5 text-slate-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-white text-xs">{acCount}</span>
                    <button
                      onClick={() => setAcCount(acCount + 1)}
                      className="px-2 py-0.5 text-slate-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Add to Main List */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="اسم المكيف (مثال: مكيف الصالة)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 flex-1"
              />
              <button
                onClick={handleAddToList}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة هذا المكيف لحساب الفاتورة</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Visual Cost Analytics & Comparison */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Calculation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              نتائج استهلاك هذا المكيف
            </h4>

            {/* Monthly Cost Display */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-medium">التكلفة الشهرية التقديرية</div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {activeMonthlyCost.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-sm font-bold text-slate-300 mr-2">
                  {country.currencySymbol} / شهر
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                الاستهلاك: {Math.round(activeMonthlyKwh)} ك.و.س شهرياً ({conventionalDailyKwh.toFixed(1)} ك.و.س/يوم)
              </div>
            </div>

            {/* Summer Season Cost */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>تكلفة موسم الصيف ({summerMonths} أشهر كاملة)</span>
                <span className="text-sky-400">جوان - سبتمبر</span>
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {activeSeasonCost.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                  {country.currencySymbol}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                إجمالي استهلاك الصيف: {Math.round(activeMonthlyKwh * summerMonths)} ك.و.س
              </div>
            </div>

            {/* Inverter vs Conventional Comparison Table */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>مقارنة: انفرتر vs عادي</span>
                {isInverter ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    أنت اخترت الانفرتر
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    أنت اخترت مكيف عادي
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">الانفرتر شهرياً</div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {inverterMonthlyCost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">العادي شهرياً</div>
                  <div className="font-bold text-rose-400 mt-0.5">
                    {conventionalMonthlyCost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                  </div>
                </div>
              </div>

              {monthlySavings > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    الانفرتر يوفر لك <strong>{monthlySavings.toFixed(country.decimalPlaces)} {country.currencySymbol}</strong> كل شهر ({seasonSavings.toFixed(country.decimalPlaces)} {country.currencySymbol} في الصيف)!
                  </span>
                </div>
              )}
            </div>

            {/* Temperature Golden Rule Tip */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>قاعدة الـ 24 درجة الذهبية:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                كل درجة تنزلها تحت 24°C (مثلاً من 24 إلى 20) ترفع فاتورة المكيف بنسبة <strong>28%</strong> دون زيادة تذكر في الراحة. ضبطه على 24°C هو الخيار الأذكى والأكثر توفيراً.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
