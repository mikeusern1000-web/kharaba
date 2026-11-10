import React, { useState } from 'react';
import { Refrigerator, Snowflake, Sparkles, CheckCircle2, AlertTriangle, Plus, ShieldCheck, Thermometer } from 'lucide-react';
import { CountryProfile, Appliance } from '../types';

interface FridgeCalculatorProps {
  country: CountryProfile;
  averageRatePerKwh: number;
  onAddAppliance: (appliance: Appliance) => void;
}

export const FridgeCalculator: React.FC<FridgeCalculatorProps> = ({
  country,
  averageRatePerKwh,
  onAddAppliance,
}) => {
  const [fridgeType, setFridgeType] = useState<'standard' | 'large' | 'mini' | 'freezer'>('standard');
  const [energyClass, setEnergyClass] = useState<'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C'>('A+');
  const [season, setSeason] = useState<'summer' | 'average' | 'winter'>('average');
  const [gasketCondition, setGasketCondition] = useState<'good' | 'worn'>('good');
  const [customName, setCustomName] = useState<string>('ثلاجة المطبخ الرئيسية');

  const typePresets = {
    mini: {
      title: 'ثلاجة صغيرة / مكتب (100 لتر)',
      baseWatts: 90,
      annualKwhBase: 140,
      icon: 'Refrigerator',
    },
    standard: {
      title: 'ثلاجة عائلية متوسطة No-Frost (350 لتر)',
      baseWatts: 220,
      annualKwhBase: 380,
      icon: 'Refrigerator',
    },
    large: {
      title: 'ثلاجة دولاب كبيرة Side-by-Side (550 لتر)',
      baseWatts: 350,
      annualKwhBase: 580,
      icon: 'Refrigerator',
    },
    freezer: {
      title: 'مجمد / ديب فريزر أفقي (Coffre 250 لتر)',
      baseWatts: 180,
      annualKwhBase: 320,
      icon: 'Snowflake',
    },
  };

  const selectedPreset = typePresets[fridgeType];

  // Energy Class Multipliers
  const classMultipliers: Record<string, number> = {
    'A+++': 0.70,
    'A++': 0.82,
    'A+': 0.95,
    A: 1.05,
    B: 1.25,
    C: 1.45,
  };

  // Seasonal ambient temperature multiplier (Summer in Tunisia/North Africa pushes compressor harder)
  const seasonMultipliers = {
    winter: 0.85,  // Compressor runs ~25-30%
    average: 1.0,  // Compressor runs ~35%
    summer: 1.30,  // Compressor runs ~45-50% due to ambient heat
  };

  // Worn door seal multiplier
  const sealMultiplier = gasketCondition === 'worn' ? 1.25 : 1.0;

  const totalMultiplier = classMultipliers[energyClass] * seasonMultipliers[season] * sealMultiplier;
  const annualKwh = selectedPreset.annualKwhBase * totalMultiplier;
  const monthlyKwh = annualKwh / 12;
  const dailyKwh = annualKwh / 365;

  const monthlyCost = monthlyKwh * averageRatePerKwh;
  const annualCost = annualKwh * averageRatePerKwh;

  // Comparison: What if user had A+++ vs class C
  const costClassBest = (selectedPreset.annualKwhBase * classMultipliers['A+++'] / 12) * averageRatePerKwh;
  const costClassWorst = (selectedPreset.annualKwhBase * classMultipliers['C'] / 12) * averageRatePerKwh;
  const efficiencySavingMonthly = costClassWorst - costClassBest;

  const handleAddToList = () => {
    const newApp: Appliance = {
      id: `fridge_${Date.now()}`,
      name: `${customName} (${energyClass})`,
      category: 'refrigeration',
      iconName: selectedPreset.icon,
      defaultWatts: selectedPreset.baseWatts,
      watts: selectedPreset.baseWatts,
      hoursPerDay: 24,
      daysPerWeek: 7,
      quantity: 1,
      enabled: true,
      dutyCycle: 0.35 * totalMultiplier,
      energyClass,
      customNote: `${selectedPreset.title.split('(')[0].trim()} - فئة ${energyClass}`,
    };
    onAddAppliance(newApp);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-800/40 rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
            <Refrigerator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <span>حاسبة الثلاجة والمجمد الذكية</span>
              <span aria-hidden="true">·</span>
              <span>معدل تعرفة {country.nameEn} ({averageRatePerKwh.toFixed(country.decimalPlaces)} {country.currencySymbol}/ك.و.س)</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              حساب استهلاك الثلاجة والفريزر طوال 24 ساعة
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              الثلاجة تعمل دون توقف على مدار السنة. استهلاكها يتأثر مباشرة بفئة كفاءة الطاقة (Classe Énergétique)، وحرارة الجو المحيط (صيفاً مقابل شتاءً)، وجودة جوان الباب (Joint).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              خصائص الثلاجة ومواصفات الاستعمال
            </h4>

            {/* Type selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                1. نوع وحجم الثلاجة / الفريزر:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(typePresets) as Array<keyof typeof typePresets>).map((typeKey) => {
                  const item = typePresets[typeKey];
                  return (
                    <button
                      key={typeKey}
                      onClick={() => setFridgeType(typeKey)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        fridgeType === typeKey
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs">{item.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        استهلاك مرجعي: ~{item.annualKwhBase} ك.و.س/سنة
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Class */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                2. فئة كفاءة الطاقة (بطاقة الطاقة على ظهر الثلاجة):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['A+++', 'A++', 'A+', 'A', 'B', 'C'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setEnergyClass(cls)}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      energyClass === cls
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-mono">{cls}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {cls.startsWith('A++') ? 'فائقة' : cls.startsWith('A') ? 'ممتازة' : 'عادية'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Season Factor */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                3. فصل السنة وحرارة المطبخ:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'winter', label: 'شتاء معتدل', desc: 'ضاغط يعمل أقل (-15%)' },
                  { id: 'average', label: 'المعدل السنوي', desc: 'معدل درجات حرارة معتدلة' },
                  { id: 'summer', label: 'صيف حار', desc: 'ضاغط يعمل أكثر (+30%)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeason(s.id as any)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      season === s.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs">{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Door Gasket Seal Health */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                4. حالة إحكام جوان الباب المطاطي (Joint de porte):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGasketCondition('good')}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    gasketCondition === 'good'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs">جوان سليم ومحكم الإغلاق</div>
                  <div className="text-[10px] text-slate-400">لا يوجد تسريب برودة</div>
                </button>

                <button
                  onClick={() => setGasketCondition('worn')}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    gasketCondition === 'worn'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs">جوان مهترئ أو يسرّب هواء</div>
                  <div className="text-[10px] text-slate-400">يزيد استهلاك الطاقة بنسبة +25%!</div>
                </button>
              </div>
            </div>

            {/* Add to list */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="اسم الثلاجة (مثال: ثلاجة المطبخ)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 flex-1"
              />
              <button
                onClick={handleAddToList}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة هذه الثلاجة للفاتورة</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Cost and Energy breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              نتائج استهلاك الثلاجة
            </h4>

            {/* Monthly Cost */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-medium">التكلفة الشهرية للثلاجة</div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {monthlyCost.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-sm font-bold text-slate-300 mr-2">
                  {country.currencySymbol} / شهر
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                الاستهلاك: {monthlyKwh.toFixed(1)} ك.و.س شهرياً ({dailyKwh.toFixed(2)} ك.و.س/يومياً)
              </div>
            </div>

            {/* Annual Cost */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-medium">التكلفة السنوية التراكمية</div>
              <div className="my-1.5">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {annualCost.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                  {country.currencySymbol} / سنة
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                إجمالي الاستهلاك السنوي: {Math.round(annualKwh)} ك.و.س
              </div>
            </div>

            {/* Golden Tips for Fridge in Tunisia & Arab Region */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>نصائح ذهبية لتقليل فاتورة الثلاجة:</span>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                <li>
                  <strong>درجة الحرارة المثالية:</strong> اضبط الثلاجة على <span className="text-teal-300 font-semibold">+4°C</span> والفريزر على <span className="text-teal-300 font-semibold">-18°C</span>. لا تخفض أكثر لتجنب استهلاك غير ضروري.
                </li>
                <li>
                  <strong>إبعادها عن الفرن والشمس:</strong> وضع الثلاجة بجانب موقد الغاز أو تحت أشعة الشمس المباشرة يجبر الضاغط على العمل ضعف الوقت.
                </li>
                <li>
                  <strong>تنظيف المكثف الخلفي (Serpentin):</strong> تنظيف الغبار المتراكم خلف الثلاجة مرة سنوياً يحسن كفاءة التبريد ويوفر ما يصل إلى 10%.
                </li>
                <li>
                  <strong>اختبار ورقة الباب:</strong> ضع ورقة عادية بين جوان الباب وأغلقه؛ إذا سُحبت الورقة بسهولة فهذا يعني أن الجوان بحاجة لتغيير لمنع تسرب البرودة.
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
