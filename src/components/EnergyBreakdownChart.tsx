import React from 'react';
import { 
  AirVent, 
  Refrigerator, 
  Shirt, 
  Flame, 
  Tv, 
  Lightbulb, 
  Utensils, 
  Zap, 
  PieChart 
} from 'lucide-react';
import { BillCalculationResult, CountryProfile, ApplianceCategory } from '../types';

interface EnergyBreakdownChartProps {
  calculation: BillCalculationResult;
  country: CountryProfile;
}

const CATEGORY_NAMES: Record<ApplianceCategory, string> = {
  cooling: 'التكييف والتبريد',
  refrigeration: 'الثلاجات والمجمدات',
  laundry: 'الغسيل والتنظيف',
  kitchen: 'المطبخ والطهي',
  water_heating: 'سخانات المياه',
  electronics: 'الشاشات والإلكترونيات',
  lighting: 'الإنارة',
  other: 'أجهزة متفرقة',
};

const CATEGORY_COLORS: Record<ApplianceCategory, string> = {
  cooling: 'bg-sky-500 text-sky-400',
  refrigeration: 'bg-teal-500 text-teal-400',
  laundry: 'bg-purple-500 text-purple-400',
  kitchen: 'bg-orange-500 text-orange-400',
  water_heating: 'bg-red-500 text-red-400',
  electronics: 'bg-indigo-500 text-indigo-400',
  lighting: 'bg-amber-500 text-amber-400',
  other: 'bg-slate-500 text-slate-400',
};

export const EnergyBreakdownChart: React.FC<EnergyBreakdownChartProps> = ({
  calculation,
  country,
}) => {
  if (calculation.totalMonthlyKwh === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
        لا توجد أجهزة مفعّلة حالياً لعرض توزيع الاستهلاك.
      </div>
    );
  }

  // Aggregate by category
  const categoryMap = new Map<ApplianceCategory, { kwh: number; cost: number }>();
  calculation.applianceBreakdown.forEach((item) => {
    const prev = categoryMap.get(item.category) || { kwh: 0, cost: 0 };
    categoryMap.set(item.category, {
      kwh: prev.kwh + item.monthlyKwh,
      cost: prev.cost + item.monthlyCost,
    });
  });

  const categories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      name: CATEGORY_NAMES[category],
      kwh: data.kwh,
      cost: data.cost,
      percentage: (data.kwh / calculation.totalMonthlyKwh) * 100,
    }))
    .sort((a, b) => b.kwh - a.kwh);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            توزيع استهلاك الكهرباء والتكلفة بين الأجهزة
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono tabular-nums">
          المجموع: {Math.round(calculation.totalMonthlyKwh)} ك.و.س
        </span>
      </div>

      {/* Multi-segment distribution progress bar */}
      <div className="space-y-2">
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${CATEGORY_COLORS[cat.category].split(' ')[0]} transition-all duration-500`}
              style={{ width: `${cat.percentage}%` }}
              title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
            />
          ))}
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs pt-1">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat.category].split(' ')[0]}`} />
              <span className="text-slate-300 font-medium">{cat.name}</span>
              <span className="text-slate-400 font-mono tabular-nums">({cat.percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Consuming Appliances Table */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-slate-300">
          ترتيب الأجهزة حسب الأعلى استهلاكاً:
        </h4>
        <div className="space-y-1.5">
          {calculation.applianceBreakdown.slice(0, 5).map((app, idx) => (
            <div
              key={app.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 font-mono text-slate-500 text-center font-bold">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                    {app.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {CATEGORY_NAMES[app.category]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left font-mono shrink-0">
                <div className="text-right">
                  <div className="text-sky-400 font-bold tabular-nums">
                    {app.monthlyKwh.toFixed(1)} ك.و.س
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {app.percentageOfTotal.toFixed(1)}% من الفاتورة
                  </div>
                </div>

                <div className="text-right min-w-[70px]">
                  <div className="text-amber-400 font-bold tabular-nums">
                    {app.monthlyCost.toFixed(country.decimalPlaces)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {country.currencySymbol} / شهر
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
