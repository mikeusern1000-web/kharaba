import React from 'react';
import { Zap, Globe, Printer, Sparkles, SlidersHorizontal, Calculator, Sun, Moon } from 'lucide-react';
import { CountryProfile } from '../types';

interface HeaderProps {
  country: CountryProfile;
  activeTab: 'all' | 'ac' | 'fridge' | 'washer' | 'gas' | 'tips';
  onTabChange: (tab: 'all' | 'ac' | 'fridge' | 'washer' | 'gas' | 'tips') => void;
  onOpenCountryModal: () => void;
  onOpenPrintModal: () => void;
  ecoModeActive: boolean;
  onToggleEcoMode: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  country,
  activeTab,
  onTabChange,
  onOpenCountryModal,
  onOpenPrintModal,
  ecoModeActive,
  onToggleEcoMode,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                KahrabaCalc
              </span>
              <span className="hidden sm:inline-block mr-2 text-xs text-amber-400 font-medium">
                حاسبة الكهرباء
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation views */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              جميع الأجهزة
            </button>
            <button
              onClick={() => onTabChange('ac')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ac'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              ❄️ حاسبة المكيف
            </button>
            <button
              onClick={() => onTabChange('fridge')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'fridge'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              🧊 حاسبة الثلاجة
            </button>
            <button
              onClick={() => onTabChange('washer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'washer'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              🧺 حاسبة الغسالة
            </button>
            <button
              onClick={() => onTabChange('gas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'gas'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {country.code === 'TN'
                ? '🔥 غاز المدينة (STEG)'
                : country.code === 'DZ'
                ? '🔥 غاز سونلغاز'
                : country.code === 'MA'
                ? '🔥 قنينات البوطا'
                : country.code === 'LY'
                ? '🔥 أسطوانات البريقة'
                : '🔥 الغاز'}
            </button>
            <button
              onClick={() => onTabChange('tips')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'tips'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              💡 نصائح التوفير
            </button>
          </nav>

          {/* Zone 3: Country selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Eco Mode Toggle */}
            <button
              onClick={onToggleEcoMode}
              aria-label="تفعيل أو تعطيل محاكي وضع التوفير الذكي"
              aria-pressed={ecoModeActive}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                ecoModeActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="تفعيل محاكاة وضع التوفير الذكي (مكيف على 24°C وغسيل اقتصادي)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${ecoModeActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">محاكي التوفير</span>
              <span className={`text-[10px] px-1 rounded ${ecoModeActive ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-500'}`}>
                {ecoModeActive ? 'مفعّل' : 'معطّل'}
              </span>
            </button>

            {/* Country Selector */}
            <button
              onClick={onOpenCountryModal}
              aria-label={`تغيير البلد الحالي (${country.nameEn}) وضبط إعدادات العداد`}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:bg-slate-800/80 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-base leading-none">{country.flag}</span>
              <span className="font-semibold">{country.currencySymbol}</span>
              <span className="hidden md:inline text-slate-400">· {country.nameEn.split(' ')[0]}</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 mr-0.5" />
            </button>

            {/* Print / Export Report */}
            <button
              onClick={onOpenPrintModal}
              aria-label="طباعة أو تصدير تقرير الاستهلاك كـ PDF"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              title="طباعة أو تصدير تقرير الاستهلاك"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح (Light Mode)' : 'التبديل إلى الوضع الداكن (Dark Mode)'}
              aria-pressed={theme === 'light'}
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all flex items-center justify-center group"
              title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح (Light Mode)' : 'التبديل إلى الوضع الداكن (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-sky-600 transition-transform group-hover:-rotate-12" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            جميع الأجهزة
          </button>
          <button
            onClick={() => onTabChange('ac')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'ac' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            ❄️ المكيف
          </button>
          <button
            onClick={() => onTabChange('fridge')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'fridge' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            🧊 الثلاجة
          </button>
          <button
            onClick={() => onTabChange('washer')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'washer' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            🧺 الغسالة
          </button>
          <button
            onClick={() => onTabChange('gas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'gas' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            🔥 الغاز
          </button>
          <button
            onClick={() => onTabChange('tips')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'tips' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            💡 نصائح التوفير
          </button>
        </div>

      </div>
    </header>
  );
};
