import React from 'react';
import { 
  AirVent, 
  Refrigerator, 
  Shirt, 
  Flame, 
  Tv, 
  Lightbulb, 
  Fan, 
  Utensils, 
  Wind, 
  ChefHat, 
  Waves, 
  Coffee, 
  Monitor, 
  Laptop, 
  Wifi, 
  Sparkles, 
  Droplets, 
  Snowflake,
  Trash2,
  Clock,
  Calendar,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { Appliance, CountryProfile } from '../types';
import { calculateApplianceKwh, calculateApplianceEffectiveWatts } from '../utils/calculator';

interface ApplianceCardProps {
  appliance: Appliance;
  country: CountryProfile;
  averageRatePerKwh: number;
  onUpdate: (updated: Appliance) => void;
  onDelete: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  AirVent,
  Refrigerator,
  Shirt,
  Flame,
  Tv,
  Lightbulb,
  Fan,
  Utensils,
  Wind,
  ChefHat,
  Waves,
  Coffee,
  Monitor,
  Laptop,
  Wifi,
  Sparkles,
  Droplets,
  Snowflake,
};

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
  appliance,
  country,
  averageRatePerKwh,
  onUpdate,
  onDelete,
}) => {
  const IconComponent = ICON_MAP[appliance.iconName] || Zap;
  const kwh = calculateApplianceKwh(appliance);
  const effectiveWatts = Math.round(calculateApplianceEffectiveWatts(appliance));
  const estimatedMonthlyCost = kwh.monthlyKwh * averageRatePerKwh;

  const handleChange = (fields: Partial<Appliance>) => {
    onUpdate({ ...appliance, ...fields });
  };

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 p-4 ${
        appliance.enabled
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80'
          : 'bg-slate-950/40 border-slate-900 opacity-60'
      }`}
    >
      {/* Top row: Icon, Name, Power, On/Off */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              appliance.enabled
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={appliance.name}
                aria-label="اسم الجهاز"
                onChange={(e) => handleChange({ name: e.target.value })}
                className="font-bold text-white text-sm bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none transition-colors max-w-[200px] sm:max-w-xs"
              />
              {appliance.quantity > 1 && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  ×{appliance.quantity}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{appliance.watts} واط أساسي</span>
              {effectiveWatts !== appliance.watts && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400/90 font-mono">
                    الفعلي: {effectiveWatts} واط
                  </span>
                </>
              )}
              {appliance.customNote && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[180px] text-slate-500">{appliance.customNote}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action controls: Toggle on/off & Delete */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleChange({ enabled: !appliance.enabled })}
            role="switch"
            aria-checked={appliance.enabled}
            aria-label={`${appliance.name}: ${appliance.enabled ? 'مفعّل، انقر للتعطيل' : 'معطّل، انقر للتفعيل'}`}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              appliance.enabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
            title={appliance.enabled ? 'تعطيل الجهاز' : 'تفعيل الجهاز'}
          >
            <div
              className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                appliance.enabled ? 'translate-x-0' : '-translate-x-5'
              }`}
            />
          </button>

          <button
            onClick={() => onDelete(appliance.id)}
            aria-label={`حذف جهاز ${appliance.name}`}
            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="حذف الجهاز"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slider & Usage Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        
        {/* Control 1: Hours per day */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>ساعات التشغيل اليومي</span>
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {appliance.hoursPerDay} ساعة
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={appliance.hoursPerDay < 2 ? 0.25 : 0.5}
            value={appliance.hoursPerDay}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              handleChange({ 
                hoursPerDay: val,
                ...(val > 0 && !appliance.enabled ? { enabled: true } : {})
              });
            }}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Control 2: Days per week */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>أيام الاستعمال في الأسبوع</span>
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {appliance.daysPerWeek} أيام
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => handleChange({ daysPerWeek: day })}
                className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                  appliance.daysPerWeek === day
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Control 3: Power (Watts) & Quantity */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-slate-500 block mb-1">القدرة (واط)</label>
            <input
              type="number"
              min={1}
              max={10000}
              step={10}
              value={appliance.watts}
              onChange={(e) => handleChange({ watts: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">العدد</label>
            <div className="flex items-center border border-slate-700 rounded bg-slate-900">
              <button
                onClick={() => handleChange({ quantity: Math.max(1, appliance.quantity - 1) })}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                -
              </button>
              <span className="px-2 font-mono font-bold text-white text-xs">
                {appliance.quantity}
              </span>
              <button
                onClick={() => handleChange({ quantity: appliance.quantity + 1 })}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Category-specific Smart Modifiers (AC Inverter, Fridge Class, Wash Temp) */}
      {appliance.category === 'cooling' && (
        <div className="mt-3 pt-2 border-t border-slate-800/40 flex flex-wrap items-center gap-4 text-xs">
          {/* Inverter toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={appliance.isInverter || false}
              onChange={(e) => handleChange({ isInverter: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span className={appliance.isInverter ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              تقنية الانفرتر الموفرة (توفير ~35%)
            </span>
          </label>

          {/* Temperature Setting */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">حرارة الضبط:</span>
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {[20, 22, 24, 26].map((temp) => (
                <button
                  key={temp}
                  onClick={() => handleChange({ acTempSetting: temp })}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    (appliance.acTempSetting ?? 24) === temp
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {temp}°C
                </button>
              ))}
            </div>
            {(appliance.acTempSetting ?? 24) >= 24 ? (
              <span className="text-[10px] text-emerald-400">✓ درجة مثالية للتوفير</span>
            ) : (
              <span className="text-[10px] text-amber-400">تزيد الاستهلاك بنسبة +{((24 - (appliance.acTempSetting ?? 24)) * 7)}%</span>
            )}
          </div>
        </div>
      )}

      {appliance.category === 'refrigeration' && (
        <div className="mt-3 pt-2 border-t border-slate-800/40 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">فئة كفاءة الطاقة:</span>
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {(['A+++', 'A++', 'A+', 'A', 'B', 'C'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleChange({ energyClass: cls })}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    (appliance.energyClass ?? 'A+') === cls
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-500">
            *الضاغط يعمل دورياً بنسبة ~{(appliance.dutyCycle ?? 0.35) * 100}% لحفظ البرودة
          </span>
        </div>
      )}

      {appliance.category === 'laundry' && (
        <div className="mt-3 pt-2 border-t border-slate-800/40 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">درجة حرارة مياه الغسيل:</span>
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {[
                { id: 'cold', label: 'بارد 30°C (اقتصادي)' },
                { id: '40c', label: 'عادي 40°C' },
                { id: '60c', label: 'ساخن 60°C' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleChange({ washTemp: t.id as any })}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    (appliance.washTemp ?? '40c') === t.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {appliance.washTemp === 'cold' ? (
            <span className="text-[10px] text-emerald-400">✓ توفير حتى 65% من كهرباء الغسالة</span>
          ) : (
            <span className="text-[10px] text-slate-500">سخان الغسالة يستهلك معظم الطاقة</span>
          )}
        </div>
      )}

      {/* Consumption Result Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span>الاستهلاك التقديري:</span>
          <span className="font-mono font-bold text-sky-400 tabular-nums">
            {kwh.monthlyKwh.toFixed(1)} ك.و.س
          </span>
          <span className="text-slate-500">/ شهرياً</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-slate-400">التكلفة التقديرية:</span>
          <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
            {estimatedMonthlyCost.toFixed(country.decimalPlaces)}
          </span>
          <span className="text-slate-300 font-sans text-xs">
            {country.currencySymbol} / شهر
          </span>
        </div>
      </div>

    </div>
  );
};
