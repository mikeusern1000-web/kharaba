import React from 'react';
import { 
  Sparkles, 
  AirVent, 
  Shirt, 
  Refrigerator, 
  Flame, 
  Lightbulb, 
  Zap, 
  CheckCircle2, 
  TrendingDown, 
  ShieldCheck 
} from 'lucide-react';
import { CountryProfile, BillCalculationResult } from '../types';

interface TipsAndSavingsViewProps {
  country: CountryProfile;
  calculation: BillCalculationResult;
  ecoModeActive: boolean;
  onToggleEcoMode: () => void;
}

export const TipsAndSavingsView: React.FC<TipsAndSavingsViewProps> = ({
  country,
  calculation,
  ecoModeActive,
  onToggleEcoMode,
}) => {
  const avgRate = calculation.averageCostPerKwh > 0 ? calculation.averageCostPerKwh : 0.25;

  // Real estimated monetary impacts based on active tariff
  const acSaving = (180 * 0.28 * avgRate); // Saving 28% on 180 kWh AC run
  const washerSaving = (16 * 1.5 * avgRate); // Saving on hot water cycles
  const fridgeSaving = (35 * 0.15 * avgRate); // Cleaning seal & coils
  const standbySaving = (calculation.totalMonthlyKwh * 0.07 * avgRate); // 7% vampire load

  const totalPotentialMonthlySaving = acSaving + washerSaving + fridgeSaving + standbySaving;
  const totalPotentialYearlySaving = totalPotentialMonthlySaving * 12;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Eco Mode Switch */}
      <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-800/40 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-medium">
                دليل ترشيد استهلاك الكهرباء الذكي
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                وفر حتى 30% من فاتورة الكهرباء في {country.name.split('(')[0].trim()}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                بتطبيق هذه الإجراءات البسيطة يمكنك توفير ما يقارب{' '}
                <strong className="text-emerald-400 font-mono font-bold">
                  {totalPotentialMonthlySaving.toFixed(country.decimalPlaces)} {country.currencySymbol} شهرياً
                </strong>{' '}
                ({totalPotentialYearlySaving.toFixed(country.decimalPlaces)} {country.currencySymbol} سنوياً).
              </p>
            </div>
          </div>

          <button
            onClick={onToggleEcoMode}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              ecoModeActive
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{ecoModeActive ? 'وضع التوفير مفعل حالياً' : 'تفعيل محاكاة وضع التوفير'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Practical Savings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tip 1: AC 24C Rule */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <AirVent className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">المكيف: قاعدة 24 درجة مئوية</h4>
            </div>
            <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
              توفير ~{acSaving.toFixed(country.decimalPlaces)} {country.currencySymbol}/شهر
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ضبط المكيف على 24°C بدلاً من 20°C يقلل ساعات تشغيل الضاغط بنسبة تصل إلى 28%. كما يُنصح بتنظيف الفلاتر كل أسبوعين في الصيف لأن الفلتر المسدود يقلل كفاءة التبريد بنسبة 15%.
          </p>

          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {country.code === 'TN'
                ? 'في تونس، تجنب تشغيل المكيف أثناء ساعات الذروة المسائية (19:00 - 22:00) لتقليل الضغط على شبكة STEG.'
                : country.code === 'DZ'
                ? 'في الجزائر، تجنب تشغيل المكيفات الكثيفة أثناء فترات الذروة الصيفية المسائية (18:00 - 21:00) لشبكة سونلغاز.'
                : country.code === 'MA'
                ? 'في المغرب، يُنصح بترشيد تشغيل المكيف خلال ساعات الذروة المسائية لتفادي تجاوز عتبة 150 ك.و.س لـ ONEE.'
                : country.code === 'LY'
                ? 'في ليبيا، يُستحسن ترشيد المكيفات خلال ساعات الذروة الحارة لدعم استقرار الشبكة العامة للكهرباء (GECOL).'
                : 'يُنصح بتجنب تشغيل الأجهزة عالية الاستهلاك خلال ساعات الذروة المسائية.'}
            </span>
          </div>
        </div>

        {/* Tip 2: Washing Cold Water */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Shirt className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">الغسالة: الغسيل على البارد 30°C</h4>
            </div>
            <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
              توفير ~{washerSaving.toFixed(country.decimalPlaces)} {country.currencySymbol}/شهر
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            تسخين المياه يمثل 80% من طاقة دورة الغسيل. غسيل الملابس اليومية على 30°C أو الماء البارد يعطي نفس النظافة مع المنظفات الحديثة، ويوفر أكثر من نصف فاتورة الغسالة ويحافظ على جودة الأقمشة.
          </p>

          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>شغّل الغسالة فقط بحمولة كاملة لتفادي إهدار الماء والكهرباء.</span>
          </div>
        </div>

        {/* Tip 3: Fridge Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                <Refrigerator className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">الثلاجة: ضبط الحرارة وتنظيف المكثف</h4>
            </div>
            <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
              توفير ~{fridgeSaving.toFixed(country.decimalPlaces)} {country.currencySymbol}/شهر
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            اضبط الثلاجة على 4°C والفريزر على -18°C. تجنب وضع الأطعمة الساخنة مباشرة في الثلاجة لأنها ترفع الحرارة الداخلية وتجبر الكمبريسور على العمل ساعات إضافية.
          </p>

          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تأكد من عدم وجود تسريب هواء من جوان الباب ونظف شبك المكثف الخلفي سنوياً.</span>
          </div>
        </div>

        {/* Tip 4: Water Heater (Chauffe-eau) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">سخان الماء: مؤقت تشغيل ذكي</h4>
            </div>
            <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
              توفير حتى 40%
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ترك السخان الكهربائي مشتغلاً 24 ساعة يتسبب في تشغيل الهيتر دورياً لتعويض فقدان الحرارة. تركيب مؤقت (Minuterie) لتشغيله قبل الاستحمام بساعتين فقط يخفض استهلاكه بمقدار النصف!
          </p>

          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>اضبط ترموستات السخان على 55°C إلى 60°C لمنع تراكم الكلس وتقليل استهلاك الطاقة.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
