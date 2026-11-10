import React from 'react';
import { Flame, Info, CheckCircle2, ShieldCheck, Plus, Minus } from 'lucide-react';
import { GasCalculationResult, CountryProfile } from '../types';
import { MOROCCO_GAS_BOTTLES, LIBYA_GAS_CYLINDERS } from '../data/countries';

interface GasCalculatorProps {
  country: CountryProfile;
  gasM3: number;
  onChangeGasM3: (m3: number) => void;
  bottleCount12kg?: number;
  onChangeBottleCount12kg?: (count: number) => void;
  bottleCount3kg?: number;
  onChangeBottleCount3kg?: (count: number) => void;
  gasResult: GasCalculationResult;
  isGasEnabled: boolean;
  onToggleGas: () => void;
}

export const GasCalculator: React.FC<GasCalculatorProps> = ({
  country,
  gasM3,
  onChangeGasM3,
  bottleCount12kg = 0,
  onChangeBottleCount12kg,
  bottleCount3kg = 0,
  onChangeBottleCount3kg,
  gasResult,
  isGasEnabled,
  onToggleGas,
}) => {
  const isTunisia = country.code === 'TN' || country.specialRegime === 'TUNISIA_STEG_2026';
  const isAlgeria = country.code === 'DZ' || country.specialRegime === 'ALGERIA_SONELGAZ_2026';
  const isMorocco = country.code === 'MA' || country.specialRegime === 'MOROCCO_ONEE_2026';
  const isLibya = country.code === 'LY' || country.specialRegime === 'LIBYA_GECOL_2026';

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-orange-950/70 to-slate-900 border border-orange-800/40 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-orange-400 font-medium">
                <span>
                  {isLibya
                    ? 'أسطوانات غاز الطهي المنزلية (البريقة) — ليبيا 2026'
                    : isMorocco
                    ? 'قنينات غاز البوتان المنزلي المدعوم (البوطا) — المغرب 2026'
                    : isAlgeria
                    ? 'تعرفة الغاز الطبيعي المنزلي (كود 23M) — سونلغاز الجزائر 2026'
                    : isTunisia
                    ? 'تعرفة الغاز الطبيعي المنزلي منخفض الضغط (BP1) — STEG 2026'
                    : 'تعرفة واستهلاك الغاز المنزلي'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{country.name.split('(')[0].trim()}</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {isLibya
                  ? 'حاسبة استهلاك وتكلفة أسطوانات غاز الطهي (15 كلغ و 5 كلغ)'
                  : isMorocco
                  ? 'حاسبة استهلاك وتكلفة قنينات البوطا (12 كلغ و 3 كلغ)'
                  : isAlgeria
                  ? 'حساب استهلاك وفاتورة غاز سونلغاز (بالثرمية والمتر المكعب)'
                  : isTunisia
                  ? 'حساب استهلاك وفاتورة غاز المدينة (STEG Gaz)'
                  : 'حساب استهلاك وتكلفة الغاز المنزلي'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isLibya
                  ? 'يعتمد الاستهلاك المنزلي في ليبيا على أسطوانات الغاز المسال من مستودعات شركة البريقة لتسويق النفط بسعر رسمي مدعوم (3.000 د.ل لأسطوانة 15 كغ و2.000 د.ل للأسطوانة الصغيرة 5 كغ).'
                  : isMorocco
                  ? 'يعتمد الاستهلاك المنزلي بالمغرب على قنينات غاز البوتان المسال المدعوم رسمياً من الدولة (50 درهماً لقنينة 12 كغ الكبيرة و 12.50 درهماً لقنينة 3 كغ الصغيرة).'
                  : isAlgeria
                  ? 'يُقاس الغاز في الجزائر بالوحدة الحرارية (الثرمية Thermie) ربع سنوياً (لكل 3 أشهر) بنظام الأشطر الأربعة المدعومة وضريبة TVA متدرجة (9% و 19%).'
                  : isTunisia
                  ? 'يعتمد الغاز الطبيعي في تونس نظام الشرائح التصاعدية بقاعدة السعر الموحد للشريحة على كامل الكمية بالمتر المكعب (m³).'
                  : 'حساب التكلفة التقديرية للغاز المنزلي بناءً على معدل الاستهلاك والأسعار المعتمدة.'}
              </p>
            </div>
          </div>

          {/* Toggle enable gas in bill */}
          <button
            onClick={onToggleGas}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isGasEnabled
                ? 'bg-orange-500 text-slate-950 hover:bg-orange-400 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>
              {isGasEnabled
                ? (isMorocco ? 'البوطا مدمجة في التكلفة الشهرية' : isLibya ? 'أسطوانات البريقة مدمجة' : 'الغاز مدمج بالفاتورة الكلية')
                : (isMorocco ? 'دمج تكلفة البوطا مع الكهرباء' : isLibya ? 'دمج أسطوانات الغاز مع الكهرباء' : 'دمج الغاز في الفاتورة الكلية')}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            
            {isMorocco || isLibya ? (
              /* ==================== MOROCCO & LIBYA BOTTLES/CYLINDERS CONTROLS ==================== */
              <>
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>
                    {isLibya
                      ? 'تحديد عدد أسطوانات غاز الطهي المستهلكة شهرياً'
                      : 'تحديد عدد قنينات غاز البوتان المستهلكة شهرياً'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {bottleCount12kg} {isLibya ? 'أسطوانة (15كغ)' : 'كبيرة (12كغ)'} + {bottleCount3kg} {isLibya ? 'أسطوانة (5كغ)' : 'صغيرة (3كغ)'}
                  </span>
                </h4>

                {/* 12kg/15kg Large Bottle/Cylinder Selector */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>
                        {isLibya
                          ? 'أسطوانة غاز الطهي المنزلية (15 كلغ - غاز البريقة)'
                          : 'قنينة غاز البوتان الكبيرة (12 كلغ)'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      السعر الرسمي المدعوم:{' '}
                      <strong className="text-orange-400 font-mono">
                        {isLibya ? '3.000 د.ل' : '50.00 درهم'}
                      </strong>{' '}
                      / {isLibya ? 'أسطوانة' : 'قنينة'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {isLibya
                        ? 'الاستعمال الأساسي: الطهي (الموقد والفرن) + تسخين الماء والمخابز'
                        : 'الاستعمال الأساسي: الطهي (الموقد والفرن) + تسخين الماء (الشوفو)'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                    <button
                      type="button"
                      onClick={() => onChangeBottleCount12kg?.(Math.max(0, bottleCount12kg - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors disabled:opacity-30"
                      disabled={bottleCount12kg <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-lg text-white">
                      {bottleCount12kg}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeBottleCount12kg?.(bottleCount12kg + 1)}
                      className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3kg/5kg Small Bottle/Cylinder Selector */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {isLibya
                          ? 'أسطوانة غاز الطهي الصغيرة (5 كلغ)'
                          : 'قنينة غاز البوتان الصغيرة (3 كلغ)'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      السعر الرسمي:{' '}
                      <strong className="text-amber-400 font-mono">
                        {isLibya ? '2.000 د.ل' : '12.50 درهم'}
                      </strong>{' '}
                      / {isLibya ? 'أسطوانة' : 'قنينة'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      مخصصة للمطابخ الصغيرة، الرحلات والاستعمال الخفيف
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                    <button
                      type="button"
                      onClick={() => onChangeBottleCount3kg?.(Math.max(0, bottleCount3kg - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors disabled:opacity-30"
                      disabled={bottleCount3kg <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-lg text-white">
                      {bottleCount3kg}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeBottleCount3kg?.(bottleCount3kg + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Typical Household Presets */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    {isLibya
                      ? 'أنماط استهلاك أسطوانات الغاز الشائعة في ليبيا:'
                      : 'أنماط الاستهلاك العائلي الشائعة بالمغرب:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(isLibya
                      ? [
                          {
                            title: 'طهي فقط (المطبخ)',
                            b12: 1,
                            b3: 0,
                            cost: '3.000 د.ل / شهر',
                            desc: 'أسطوانة واحدة 15 كغ تكفي شهرياً لأغراض الطبخ والفرن',
                          },
                          {
                            title: 'طهي + سخان الماء',
                            b12: 2,
                            b3: 0,
                            cost: '6.000 د.ل / شهر',
                            desc: 'النمط العائلي الأكثر شيوعاً (أسطوانة للفرن وأخرى لسخان الحمام)',
                          },
                          {
                            title: 'طهي + ماء + شتاء',
                            b12: 3,
                            b3: 1,
                            cost: '11.000 د.ل / شهر',
                            desc: '3 أسطوانات 15 كغ + أسطوانة صغيرة في فترات البرد واستهلاك مكثف',
                          },
                        ]
                      : [
                          {
                            title: 'طهي فقط (المطبخ)',
                            b12: 1,
                            b3: 0,
                            cost: '50 درهم / شهر',
                            desc: 'قنينة واحدة كبيرة تكفي عادة شهر إلى 40 يوماً للطبخ فقط',
                          },
                          {
                            title: 'طهي + سخان الماء (شوفو)',
                            b12: 2,
                            b3: 0,
                            cost: '100 درهم / شهر',
                            desc: 'النمط الأكثر انتشاراً (قنينة للفرن وقنينة للحمام)',
                          },
                          {
                            title: 'طهي + ماء + تدفئة شتوية',
                            b12: 3,
                            b3: 1,
                            cost: '162.5 درهم / شهر',
                            desc: '3 قنينات كبيرة + قنينة صغيرة في فترات البرد القارس',
                          },
                        ]
                    ).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onChangeBottleCount12kg?.(p.b12);
                          onChangeBottleCount3kg?.(p.b3);
                        }}
                        className={`p-3 rounded-xl border text-right transition-all ${
                          bottleCount12kg === p.b12 && bottleCount3kg === p.b3
                            ? 'bg-orange-500/15 border-orange-500 text-orange-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs">{p.title}</div>
                        <div className="text-[11px] font-mono text-orange-400 mt-0.5">{p.cost}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subsidies and Price Table */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {isLibya
                        ? 'أسعار أسطوانات غاز الطهي الرسمية (مستودعات شركة البريقة لتسويق النفط):'
                        : 'أسعار قنينات غاز البوتان الرسمية (صندوق المقاصة 2026):'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    {isLibya
                      ? LIBYA_GAS_CYLINDERS.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="font-sans text-xs font-bold text-white">{c.name}</div>
                            <div className="text-sm font-bold text-orange-400 mt-1">
                              {c.officialPriceLyd.toFixed(3)} د.ل
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">{c.description}</div>
                          </div>
                        ))
                      : MOROCCO_GAS_BOTTLES.map((b) => (
                          <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="font-sans text-xs font-bold text-white">{b.name}</div>
                            <div className="text-sm font-bold text-orange-400 mt-1">
                              {b.priceMad.toFixed(2)} درهم
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">{b.description}</div>
                          </div>
                        ))}
                  </div>
                </div>
              </>
            ) : (
              /* ==================== TUNISIA & ALGERIA PIPED GAS CONTROLS ==================== */
              <>
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>تحديد حجم استهلاك الغاز الطبيعي</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {gasM3} م³ / شهرياً
                    {isAlgeria && (
                      <span className="text-xs font-normal text-slate-400 mr-2">
                        (≈ {Math.round(gasM3 * 3 * 9.8)} ثرمية / ثلاثي)
                      </span>
                    )}
                  </span>
                </h4>

                {/* Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span>معدل الاستهلاك الشهري بالمتر المكعب (m³):</span>
                    <span className="font-mono text-base font-bold text-orange-400 tabular-nums">
                      {gasM3} m³
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={250}
                    step={1}
                    value={gasM3}
                    onChange={(e) => onChangeGasM3(parseInt(e.target.value) || 0)}
                    className="w-full accent-orange-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0 م³</span>
                    <span>{isAlgeria ? '40 م³ (شطر 1)' : '30 م³ (شريحة مدعمة)'}</span>
                    <span>{isAlgeria ? '85 م³ (شطر 2)' : '60 م³ (متوسط)'}</span>
                    <span>150 م³ (تدفئة)</span>
                    <span>250+ م³</span>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    أو اختر نمط الاستهلاك السكني الشائع:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        title: 'طهي فقط (المطبخ)',
                        m3: 15,
                        desc: isAlgeria ? 'موقد وفرن (~440 ثرمية/ثلاثي - شطر 1)' : 'موقد وفرن غاز (شريحة مدعمة)',
                      },
                      {
                        title: 'طهي + تسخين ماء',
                        m3: 40,
                        desc: isAlgeria ? 'موقد + سخان ماء (~1170 ثرمية/ثلاثي)' : 'موقد + سخان ماء غاز (شريحة متوسطة)',
                      },
                      {
                        title: 'طهي + تدفئة مركزية',
                        m3: 120,
                        desc: isAlgeria ? 'تدفئة شتوية (~3500 ثرمية/ثلاثي)' : 'شوفاج سونترال في الشتاء (شريحة مرتفعة)',
                      },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => onChangeGasM3(p.m3)}
                        className={`p-3 rounded-xl border text-right transition-all ${
                          gasM3 === p.m3
                            ? 'bg-orange-500/15 border-orange-500 text-orange-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs">{p.title}</div>
                        <div className="text-[11px] font-mono text-orange-400 mt-0.5">{p.m3} م³ / شهرياً</div>
                        <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Official Tiers Display */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>
                      {isAlgeria
                        ? 'أشطر الغاز الطبيعي لسونلغاز (كود 23M):'
                        : isTunisia
                        ? 'جدول تعرفة الغاز الطبيعي لـ STEG (عام 2026):'
                        : 'جدول تعرفة الغاز الطبيعي:'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAlgeria
                        ? 'حساب ربع سنوي بالثرمية (Thermie)'
                        : isTunisia
                        ? 'BP1 الجهد المنخفض'
                        : 'الاستهلاك المنزلي'}
                    </span>
                  </div>

                  {isAlgeria ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {[
                        { name: 'الشطر 1 (0 إلى 1125 ثرمية)', rate: '0.1682 دج / ثرمية', sub: 'TVA 9% مخفضة (16.82 سنتيم)' },
                        { name: 'الشطر 2 (1126 إلى 2500 ثرمية)', rate: '0.3245 دج / ثرمية', sub: 'TVA 9% مخفضة (32.45 سنتيم)' },
                        { name: 'الشطر 3 (2501 إلى 7500 ثرمية)', rate: '0.4025 دج / ثرمية', sub: 'TVA 19% عادية (40.25 سنتيم)' },
                        { name: 'الشطر 4 (ما يفوق 7500 ثرمية)', rate: '0.4599 دج / ثرمية', sub: 'TVA 19% عادية (45.99 سنتيم)' },
                      ].map((tier, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-300"
                        >
                          <div className="font-sans text-xs font-bold">{tier.name}</div>
                          <div className="text-sm font-bold text-orange-400 mt-1">{tier.rate}</div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">{tier.sub}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {[
                        { name: 'الشريحة 1 (0 - 30 م³)', rate: '231 مليم / م³', sub: 'معفى من FTE Gaz', active: gasM3 > 0 && gasM3 <= 30 },
                        { name: 'الشريحة 2 (31 - 60 م³)', rate: '368 مليم / م³', sub: 'استهلاك متوسط', active: gasM3 > 30 && gasM3 <= 60 },
                        { name: 'الشريحة 3 (61 - 150 م³)', rate: '556 مليم / م³', sub: 'استهلاك مرتفع (تدفئة)', active: gasM3 > 60 && gasM3 <= 150 },
                        { name: 'الشريحة 4 (> 150 م³)', rate: '824 مليم / م³', sub: 'استهلاك عالي جداً', active: gasM3 > 150 },
                      ].map((tier, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border transition-all ${
                            tier.active
                              ? 'bg-orange-500/20 border-orange-500 text-orange-200 font-bold shadow-sm'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-xs">{tier.name}</span>
                            {tier.active && <span className="text-[10px] bg-orange-400 text-slate-950 px-1 rounded font-bold">شريحتك</span>}
                          </div>
                          <div className="text-sm font-bold text-white mt-1">{tier.rate}</div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">{tier.sub}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isAlgeria
                        ? 'معادلة حساب الغاز في الجزائر:'
                        : isTunisia
                        ? 'تنويه جغرافي حول شبكة الغاز الطبيعي (STEG):'
                        : 'تنويه حول استهلاك الغاز:'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {isAlgeria
                      ? 'عداد الغاز في المنزل يسجل بالمتر المكعب (m³)، وتقوم سونلغاز بضربه في معامل التحويل الحراري (حوالي 9.8 ثرمية لكل م³) لتحويله إلى ثرمية في الفاتورة الثلاثية. الاشتراك الثابت للغاز: 28.50 دج شهرياً (85.50 دج ثلاثياً).'
                      : isTunisia
                      ? 'شبكة غاز المدينة للـ STEG تتركز في الشريط الساحلي (تونس الكبرى، بنزرت، الوطن القبلي، الساحل، صفاقس) وبعض مدن الجنوب الشرقي. المناطق الداخلية تعتمد على قوارير الغاز المسال.'
                      : 'يتم احتساب استهلاك الغاز المنزلي وتكاليفه بحسب معدل الاستهلاك الدوري والأسعار المعتمدة.'}
                  </p>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Right Column: Detailed Gas Bill Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              {isLibya
                ? 'ملخص تكلفة أسطوانات غاز البريقة'
                : isMorocco
                ? 'ملخص تكلفة غاز البوتان (البوطا)'
                : 'فاتورة الغاز الطبيعي التقديرية'}
            </h4>

            {/* Monthly Cost */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 font-medium">
                {isLibya
                  ? 'المبلغ التقديري لأسطوانات الغاز شهرياً'
                  : isMorocco
                  ? 'المبلغ التقديري للبوطا (شهرياً)'
                  : 'المبلغ التقديري للغاز (شهرياً)'}
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-orange-400 font-mono tabular-nums">
                  {gasResult.totalCostMonthly.toFixed(country.decimalPlaces)}
                </span>
                <span className="text-sm font-bold text-slate-300 mr-2">
                  {country.currencySymbol} / شهر
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                {isLibya
                  ? `الكمية: ${bottleCount12kg} أسطوانة (15 كغ)${bottleCount3kg ? ` + ${bottleCount3kg} أسطوانة (5 كغ)` : ''}`
                  : isMorocco
                  ? `الكمية: ${bottleCount12kg} بوطا (12 كغ) + ${bottleCount3kg} بوطا (3 كغ)`
                  : isAlgeria
                  ? `الاستهلاك: ${gasResult.monthlyM3} م³ (≈ ${Math.round(gasResult.monthlyThermie || 0)} ثرمية/شهر)`
                  : `الاستهلاك: ${gasResult.monthlyM3} متر مكعب (m³)`}
              </div>
            </div>

            {/* Periodic Cost */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>
                  {isLibya || isMorocco
                    ? 'التكلفة السنوية التقديرية للغاز'
                    : isAlgeria
                    ? 'فاتورة الغاز الثلاثية (سونلغاز - 3 أشهر)'
                    : isTunisia
                    ? 'فاتورة الغاز الثنائية (شهرين STEG)'
                    : 'فاتورة الغاز التقديرية'}
                </span>
                <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded">
                  {isLibya || isMorocco ? 'سنوياً (12 شهراً)' : isAlgeria ? 'Trimestrielle' : isTunisia ? 'Bimestrielle' : 'شهرياً'}
                </span>
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {(isLibya || isMorocco
                    ? gasResult.totalCostMonthly * 12
                    : isAlgeria
                    ? (gasResult.totalCostQuarterly || gasResult.totalCostMonthly * 3)
                    : gasResult.totalCostBimonthly
                  ).toFixed(country.decimalPlaces)}
                </span>
                <span className="text-xs font-semibold text-slate-400 mr-1.5">{country.currencySymbol}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {isLibya
                  ? `مجموع السنة: ${bottleCount12kg * 12} أسطوانة (15 كغ)`
                  : isMorocco
                  ? `مجموع السنة: ${bottleCount12kg * 12} قنينة كبيرة`
                  : isAlgeria
                  ? `استهلاك الثلاثي: ${gasResult.quarterlyM3} م³ (≈ ${Math.round(gasResult.quarterlyThermie || 0)} ثرمية)`
                  : isTunisia
                  ? `استهلاك شهرين: ${gasResult.bimonthlyM3} م³`
                  : `استهلاك شهري: ${gasResult.monthlyM3} م³`}
              </div>
            </div>

            {/* Breakdown table */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5">
                {isLibya
                  ? 'تفاصيل شراء أسطوانات غاز البريقة:'
                  : isMorocco
                  ? 'تفاصيل شراء قنينات البوطا:'
                  : 'تفاصيل معاليم وأداءات الغاز:'}
              </div>

              {isLibya ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">
                      أسطوانات 15 كغ ({bottleCount12kg} × 3.000 د.ل):
                    </span>
                    <span className="text-white font-bold">{(bottleCount12kg * 3).toFixed(3)} د.ل</span>
                  </div>

                  {bottleCount3kg > 0 && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">
                        أسطوانات 5 كغ ({bottleCount3kg} × 2.000 د.ل):
                      </span>
                      <span className="text-white font-bold">{(bottleCount3kg * 2).toFixed(3)} د.ل</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">الدعم الحكومي (مستودعات البريقة):</span>
                    <span className="text-emerald-400 font-sans font-medium">سعر مدعوم رسمياً</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-orange-400">
                    <span className="font-sans">مجموع تكلفة أسطوانات الغاز شهرياً:</span>
                    <span>{gasResult.totalCostMonthly.toFixed(3)} د.ل</span>
                  </div>
                </div>
              ) : isMorocco ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">
                      قنينات 12 كغ ({bottleCount12kg} × 50.00 درهم):
                    </span>
                    <span className="text-white font-bold">{(bottleCount12kg * 50).toFixed(2)} د.م</span>
                  </div>

                  {bottleCount3kg > 0 && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">
                        قنينات 3 كغ ({bottleCount3kg} × 12.50 درهم):
                      </span>
                      <span className="text-white font-bold">{(bottleCount3kg * 12.5).toFixed(2)} د.م</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">الدعم الحكومي (صندوق المقاصة):</span>
                    <span className="text-emerald-400 font-sans font-medium">مدعوم عند الشراء</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-orange-400">
                    <span className="font-sans">مجموع تكلفة البوطا شهرياً:</span>
                    <span>{gasResult.totalCostMonthly.toFixed(2)} د.م</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">
                      {isAlgeria
                        ? 'ثمن الغاز الصافي (حسب الأشطر):'
                        : isTunisia
                        ? `ثمن الغاز الصافي (${gasResult.ratePerUnit.toFixed(3)} د.ت/م³):`
                        : `ثمن الغاز الصافي (${gasResult.ratePerUnit.toFixed(3)} ${country.currencySymbol}/م³):`}
                    </span>
                    <span className="text-white font-bold">{gasResult.energyCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">
                      {isAlgeria
                        ? 'الاشتراك الثابت للغاز شهرياً:'
                        : isTunisia
                        ? 'معلوم الانسياب (الاشتراك الثابت):'
                        : 'الاشتراك الثابت للغاز شهرياً:'}
                    </span>
                    <span className="text-slate-300">{gasResult.flowFeeMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
                  </div>

                  {isTunisia && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">صندوق الانتقال الطاقي (FTE Gaz):</span>
                      <span className={gasResult.isExemptFte ? 'text-emerald-400 font-sans' : 'text-slate-300'}>
                        {gasResult.isExemptFte ? 'معفى (استهلاك ≤ 30 م³)' : `${gasResult.fteGazMonthly.toFixed(3)} د.ت`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">
                      {isAlgeria
                        ? 'الضريبة على القيمة المضافة (TVA 9% و 19%):'
                        : isTunisia
                        ? 'الأداء على القيمة المضافة (TVA 19%):'
                        : `الضريبة على القيمة المضافة (TVA ${country.vatPercentage}%):`}
                    </span>
                    <span className="text-slate-300">{gasResult.vatMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-orange-400">
                    <span className="font-sans">المجموع الجملي للغاز (شهرياً):</span>
                    <span>{gasResult.totalCostMonthly.toFixed(country.decimalPlaces)} {country.currencySymbol}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
