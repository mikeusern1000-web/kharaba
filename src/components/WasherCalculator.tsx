import React, { useState } from 'react';
import { Shirt, Utensils, Wind, Sparkles, CheckCircle2, TrendingDown, Plus, Thermometer, ShieldCheck } from 'lucide-react';
import { CountryProfile, Appliance } from '../types';

interface WasherCalculatorProps {
  country: CountryProfile;
  averageRatePerKwh: number;
  onAddAppliance: (appliance: Appliance) => void;
}

export const WasherCalculator: React.FC<WasherCalculatorProps> = ({
  country,
  averageRatePerKwh,
  onAddAppliance,
}) => {
  const [deviceType, setDeviceType] = useState<'washer' | 'dishwasher' | 'dryer'>('washer');
  const [washTemp, setWashTemp] = useState<'cold' | '40c' | '60c' | '90c'>('40c');
  const [cyclesPerWeek, setCyclesPerWeek] = useState<number>(2);
  const [ecoProgram, setEcoProgram] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('غسالة الملابس');

  // Electrical energy per cycle in kWh
  const cycleEnergyProfiles = {
    washer: {
      cold: 0.35,  // Motor only (no water heater resistance)
      '40c': 1.05, // Standard warm wash
      '60c': 1.85, // Hot wash
      '90c': 2.65, // Boil wash
    },
    dishwasher: {
      cold: 0.70,  // Eco short cycle
      '40c': 1.15, // Standard eco 50°C
      '60c': 1.65, // Intensive 65°C
      '90c': 2.10, // Max hygiene
    },
    dryer: {
      cold: 1.80,  // Low heat / delicate
      '40c': 2.40, // Standard dry
      '60c': 3.20, // Extra dry cotton
      '90c': 3.80, // Heavy duty
    },
  };

  const baseKwhPerCycle = cycleEnergyProfiles[deviceType][washTemp];
  const ecoMultiplier = ecoProgram ? 0.8 : 1.0;
  const kwhPerCycle = baseKwhPerCycle * ecoMultiplier;

  // Monthly and annual calculations
  const cyclesPerMonth = cyclesPerWeek * 4.345;
  const monthlyKwh = cyclesPerMonth * kwhPerCycle;
  const annualKwh = monthlyKwh * 12;

  const costPerCycle = kwhPerCycle * averageRatePerKwh;
  const monthlyCost = monthlyKwh * averageRatePerKwh;
  const annualCost = annualKwh * averageRatePerKwh;

  // Cold wash savings vs 60°C wash
  const hotCycleCost = cycleEnergyProfiles[deviceType]['60c'] * averageRatePerKwh;
  const coldCycleCost = cycleEnergyProfiles[deviceType]['cold'] * averageRatePerKwh;
  const savingsPerCycle = Math.max(0, hotCycleCost - coldCycleCost);
  const annualColdSavings = savingsPerCycle * cyclesPerMonth * 12;

  const handleAddToList = () => {
    const isDryer = deviceType === 'dryer';
    const isDishwasher = deviceType === 'dishwasher';

    const newApp: Appliance = {
      id: `washer_${Date.now()}`,
      name: `${customName} (${washTemp === 'cold' ? 'غسيل بارد' : washTemp})`,
      category: 'laundry',
      iconName: isDryer ? 'Wind' : isDishwasher ? 'Utensils' : 'Shirt',
      defaultWatts: isDryer ? 2500 : 1800,
      watts: isDryer ? 2500 : 1800,
      hoursPerDay: 1.5,
      daysPerWeek: Math.min(7, Math.max(1, Math.round(cyclesPerWeek))),
      quantity: 1,
      enabled: true,
      washTemp,
      customNote: `${cyclesPerWeek} دورات أسبوعياً - حرارة ${washTemp === 'cold' ? 'بارد 30°C' : washTemp}`,
    };
    onAddAppliance(newApp);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/40 rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
              <span>حاسبة الغسالة ودورات الغسيل</span>
              <span aria-hidden="true">·</span>
              <span>معدل تعرفة {country.nameEn} ({averageRatePerKwh.toFixed(country.decimalPlaces)} {country.currencySymbol}/ك.و.س)</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              حساب استهلاك الغسالة وتكلفة كل دورة غسيل
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              الحقيقة العلمية: أكثر من <strong>80% من كهرباء الغسالة</strong> يذهب في تسخين الماء (المقاومة الكهربائية Résistance) وليس دوران الحوض. الغسيل على البارد (30°C) يوفر مبالغ طائلة سنوياً!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              إعدادات جهاز الغسيل والدورات
            </h4>

            {/* Device Type */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                1. نوع الجهاز:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'washer', label: 'غسالة ملابس', icon: Shirt },
                  { id: 'dishwasher', label: 'غسالة صحون', icon: Utensils },
                  { id: 'dryer', label: 'مجفف ملابس', icon: Wind },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDeviceType(d.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        deviceType === d.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Water Temperature Setting */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                2. درجة حرارة ماء الغسيل (العامل الأكبر في الفاتورة):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cold', label: 'بارد 30°C', desc: 'أقصى توفير للطاقة' },
                  { id: '40c', label: 'عادي 40°C', desc: 'المعيار القياسي' },
                  { id: '60c', label: 'ساخن 60°C', desc: 'استهلاك مضاعف' },
                  { id: '90c', label: 'غليان 90°C', desc: 'تعقيم واستهلاك عالٍ' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setWashTemp(t.id as any)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      washTemp === t.id
                        ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{t.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cycles per week */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>3. عدد دورات الغسيل في الأسبوع:</span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  {cyclesPerWeek} دورات / أسبوعياً
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                step={1}
                value={cyclesPerWeek}
                onChange={(e) => setCyclesPerWeek(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>دورة واحدة أسبوعياً</span>
                <span>4 دورات (عائلة متوسطة)</span>
                <span>14 دورة (مرتين يومياً)</span>
              </div>
            </div>

            {/* Eco Program Mode toggle */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>برنامج الغسيل الاقتصادي (Eco Program)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  يستغرق وقتاً أطول ولكن يسخن الماء بتدرج ويوفر 20% كهرباء
                </div>
              </div>
              <button
                onClick={() => setEcoProgram(!ecoProgram)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  ecoProgram ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    ecoProgram ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {/* Add to list */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="اسم الغسالة (مثال: غسالة الملابس)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 flex-1"
              />
              <button
                onClick={handleAddToList}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة هذه الغسالة للفاتورة</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Cost per Cycle and Savings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              نتائج استهلاك وتكلفة الغسيل
            </h4>

            {/* Cost Per Cycle */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-medium">تكلفة الدورة الواحدة (تشغيلة واحدة)</div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {costPerCycle.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-sm font-bold text-slate-300 mr-2">
                  {country.currencySymbol} / دورة
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                استهلاك الطاقة: {kwhPerCycle.toFixed(2)} ك.و.س لكل غسلة
              </div>
            </div>

            {/* Monthly and Yearly Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">التكلفة الشهرية</div>
                <div className="font-bold text-white text-base font-mono mt-1 tabular-nums">
                  {monthlyCost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {Math.round(cyclesPerMonth)} دورة / شهرياً
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">التكلفة السنوية</div>
                <div className="font-bold text-white text-base font-mono mt-1 tabular-nums">
                  {annualCost.toFixed(country.decimalPlaces)} {country.currencySymbol}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {Math.round(annualKwh)} ك.و.س / سنة
                </div>
              </div>
            </div>

            {/* Cold Wash Savings Comparison */}
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs space-y-2">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                <span>مقارنة الغسيل البارد vs الساخن 60°C:</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                التحول من الغسيل على 60°C إلى الغسيل على البارد (30°C) يوفر لك حوالي:
              </p>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-300 text-[11px] font-sans">الوفر السنوي التقديري:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  +{annualColdSavings.toFixed(country.decimalPlaces)} {country.currencySymbol}
                </span>
              </div>
            </div>

            {/* Golden laundry tips */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-400">
              <div className="font-semibold text-slate-200">نصائح لتقليل استهلاك الغسالة:</div>
              <ul className="text-[11px] space-y-1 list-disc list-inside">
                <li>املأ حوض الغسالة بالحمولة الكاملة، لأن دورتين بنصف حمولة تستهلكان ضعف الكهرباء والماء.</li>
                <li>استخدم منظفات مصممة للغسيل البارد للحصول على نظافة ممتازة دون تسخين الماء.</li>
                <li>نظف فلتر الغسالة بانتظام لتقليل الجهد الميكانيكي على المحرك ومضخة التفريغ.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
