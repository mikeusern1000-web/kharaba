/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Zap, 
  AirVent, 
  Refrigerator, 
  Shirt, 
  Lightbulb, 
  Check, 
  Info,
  TrendingDown,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { Appliance, CountryProfile, CountryCode } from './types';
import { COUNTRIES } from './data/countries';
import { DEFAULT_APPLIANCES } from './data/appliances';
import { calculateBill, calculateGas } from './utils/calculator';
import { Header } from './components/Header';
import { BillSummaryCard } from './components/BillSummaryCard';
import { ApplianceCard } from './components/ApplianceCard';
import { ACCalculator } from './components/ACCalculator';
import { FridgeCalculator } from './components/FridgeCalculator';
import { WasherCalculator } from './components/WasherCalculator';
import { GasCalculator } from './components/GasCalculator';
import { EnergyBreakdownChart } from './components/EnergyBreakdownChart';
import { TipsAndSavingsView } from './components/TipsAndSavingsView';
import { CountryModal } from './components/CountryModal';
import { AddApplianceModal } from './components/AddApplianceModal';

const PrintReportModal = React.lazy(() =>
  import('./components/PrintReportModal').then((m) => ({ default: m.PrintReportModal }))
);

const STORAGE_KEY_APPLIANCES = 'kahraba_calc_appliances_v2';
const STORAGE_KEY_COUNTRY = 'kahraba_calc_country_v2';
const STORAGE_KEY_GAS_M3 = 'kahraba_calc_gas_m3_v2';
const STORAGE_KEY_GAS_ENABLED = 'kahraba_calc_gas_enabled_v2';
const STORAGE_KEY_BOTTLES_12KG = 'kahraba_calc_bottles_12kg_v2';
const STORAGE_KEY_BOTTLES_3KG = 'kahraba_calc_bottles_3kg_v2';
const STORAGE_KEY_THEME = 'kahraba_calc_theme_v2';

export default function App() {
  // 1. Country Selection State
  const [country, setCountry] = useState<CountryProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch {
      // ignore
    }
    return COUNTRIES[0]; // Tunisia STEG 2026 by default
  });

  // 2. Appliances List State
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPLIANCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_APPLIANCES;
  });

  // 3. Natural Gas & Butane Gas Bottles State (Explicitly initialize to 0 if no localStorage value exists)
  const [gasM3Monthly, setGasM3Monthly] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GAS_M3);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        const parsed = parseInt(saved, 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [bottleCount12kg, setBottleCount12kg] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOTTLES_12KG);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        const parsed = parseInt(saved, 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [bottleCount3kg, setBottleCount3kg] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOTTLES_3KG);
      if (saved !== null && saved !== undefined && saved.trim() !== '') {
        const parsed = parseInt(saved, 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isGasEnabled, setIsGasEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GAS_ENABLED);
      if (saved !== null && saved !== undefined) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return false; // Disabled by default so no unexpected gas charges appear
  });

  // 4. UI Navigation State
  const [activeTab, setActiveTab] = useState<'all' | 'ac' | 'fridge' | 'washer' | 'gas' | 'tips'>('all');
  const [ecoModeActive, setEcoModeActive] = useState<boolean>(false);

  // 5. Modals State
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 6. Theme State (Default: Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'light'; // Light mode is default
  });

  // Apply theme to document root and sync with localStorage
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#020617');
      }
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPLIANCES, JSON.stringify(appliances));
    } catch {
      // ignore
    }
  }, [appliances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, JSON.stringify(country));
    } catch {
      // ignore
    }
  }, [country]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GAS_M3, gasM3Monthly.toString());
      localStorage.setItem(STORAGE_KEY_GAS_ENABLED, isGasEnabled.toString());
      localStorage.setItem(STORAGE_KEY_BOTTLES_12KG, bottleCount12kg.toString());
      localStorage.setItem(STORAGE_KEY_BOTTLES_3KG, bottleCount3kg.toString());
    } catch {
      // ignore
    }
  }, [gasM3Monthly, isGasEnabled, bottleCount12kg, bottleCount3kg]);

  // Handle Eco Mode Simulation: adjusts AC temperature to 24°C and laundry to cold
  const effectiveAppliances = useMemo(() => {
    if (!ecoModeActive) return appliances;

    return appliances.map((app) => {
      if (app.category === 'cooling') {
        return {
          ...app,
          acTempSetting: 24, // Optimized standard
          isInverter: true,
        };
      }
      if (app.category === 'laundry') {
        return {
          ...app,
          washTemp: 'cold' as const, // Cold wash
        };
      }
      if (app.category === 'refrigeration') {
        return {
          ...app,
          energyClass: 'A++' as const,
        };
      }
      return app;
    });
  }, [appliances, ecoModeActive]);

  // Main Calculation Result (Electricity + Gas)
  const billCalculation = useMemo(() => {
    const activeGas = isGasEnabled ? gasM3Monthly : 0;
    const active12kg = isGasEnabled ? bottleCount12kg : 0;
    const active3kg = isGasEnabled ? bottleCount3kg : 0;
    return calculateBill(effectiveAppliances, country, activeGas, active12kg, active3kg);
  }, [effectiveAppliances, country, isGasEnabled, gasM3Monthly, bottleCount12kg, bottleCount3kg]);

  // Standalone Gas Calculation for the dedicated gas tab
  const gasResult = useMemo(() => {
    return calculateGas(country, gasM3Monthly, bottleCount12kg, bottleCount3kg);
  }, [country, gasM3Monthly, bottleCount12kg, bottleCount3kg]);

  // Average rate per kWh for local appliances
  const averageRatePerKwh = useMemo(() => {
    if (billCalculation.appliedRatePerKwh > 0) {
      return billCalculation.appliedRatePerKwh;
    }
    if (billCalculation.averageCostPerKwh > 0) {
      return billCalculation.averageCostPerKwh;
    }
    return 0.218;
  }, [billCalculation]);

  // Handlers for appliances
  const handleUpdateAppliance = (updated: Appliance) => {
    setAppliances((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAppliance = (newApp: Appliance) => {
    setAppliances((prev) => [newApp, ...prev]);
  };

  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetDefaults = () => {
    if (confirmReset) {
      setAppliances(DEFAULT_APPLIANCES);
      setGasM3Monthly(0);
      setBottleCount12kg(0);
      setBottleCount3kg(0);
      setIsGasEnabled(false);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header Navbar */}
      <Header
        country={country}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCountryModal={() => setIsCountryModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        ecoModeActive={ecoModeActive}
        onToggleEcoMode={() => setEcoModeActive(!ecoModeActive)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Bill Summary Dashboard Card */}
        <BillSummaryCard
          calculation={billCalculation}
          country={country}
          ecoModeActive={ecoModeActive}
          onOpenCountryModal={() => setIsCountryModalOpen(true)}
          isGasEnabled={isGasEnabled}
          onGoToGasTab={() => setActiveTab('gas')}
        />

        {/* Dynamic Views based on active tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            
            {/* Toolbar row: Actions and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">الأجهزة المنزلية الفعالة:</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {appliances.filter((a) => a.enabled).length} من أصل {appliances.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                    confirmReset
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
                  }`}
                  title="استعادة الأجهزة القياسية"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${confirmReset ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{confirmReset ? 'اضغط للتأكيد' : 'استعادة الافتراضي'}</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة جهاز جديد</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Links for Specific Appliances */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('ac')}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 rounded-xl text-right transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg group-hover:scale-105 transition-transform">
                    <AirVent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300">
                      المكيف
                    </div>
                    <div className="text-[10px] text-slate-400">
                      BTU و 24°C
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              </button>

              <button
                onClick={() => setActiveTab('fridge')}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/50 rounded-xl text-right transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Refrigerator className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-teal-300">
                      الثلاجة
                    </div>
                    <div className="text-[10px] text-slate-400">
                      فئات A+++ وحرارة الصيف
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
              </button>

              <button
                onClick={() => setActiveTab('washer')}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-xl text-right transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300">
                      الغسالة
                    </div>
                    <div className="text-[10px] text-slate-400">
                      الغسيل البارد 30°C
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
              </button>

              <button
                onClick={() => setActiveTab('gas')}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/50 rounded-xl text-right transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-orange-300">
                      {country.code === 'DZ' ? 'غاز سونلغاز' : country.code === 'MA' ? 'غاز البوتان (البوطا)' : country.code === 'LY' ? 'غاز الطهي (البريقة)' : 'غاز المدينة STEG'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {country.code === 'DZ' ? 'كود 23M بالثرمية' : country.code === 'MA' ? 'قنينات 12 كغ و 3 كغ' : country.code === 'LY' ? 'أسطوانات 15 كغ و 5 كغ' : 'شرائح الغاز BP1'}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
              </button>
            </div>

            {/* Appliances Grid */}
            <div className="space-y-3">
              {appliances.map((appliance) => (
                <ApplianceCard
                  key={appliance.id}
                  appliance={appliance}
                  country={country}
                  averageRatePerKwh={averageRatePerKwh}
                  onUpdate={handleUpdateAppliance}
                  onDelete={handleDeleteAppliance}
                />
              ))}
            </div>

            {/* Bottom Section: Visual Energy Distribution */}
            <EnergyBreakdownChart
              calculation={billCalculation}
              country={country}
            />

          </div>
        )}

        {/* Tab 2: Dedicated Air Conditioner Deep-Dive */}
        {activeTab === 'ac' && (
          <ACCalculator
            country={country}
            averageRatePerKwh={averageRatePerKwh}
            onAddAppliance={(app) => {
              handleAddAppliance(app);
              setActiveTab('all');
            }}
          />
        )}

        {/* Tab 3: Dedicated Refrigerator & Freezer Deep-Dive */}
        {activeTab === 'fridge' && (
          <FridgeCalculator
            country={country}
            averageRatePerKwh={averageRatePerKwh}
            onAddAppliance={(app) => {
              handleAddAppliance(app);
              setActiveTab('all');
            }}
          />
        )}

        {/* Tab 4: Dedicated Washing Machine & Laundry Deep-Dive */}
        {activeTab === 'washer' && (
          <WasherCalculator
            country={country}
            averageRatePerKwh={averageRatePerKwh}
            onAddAppliance={(app) => {
              handleAddAppliance(app);
              setActiveTab('all');
            }}
          />
        )}

        {/* Tab 5: Dedicated Natural Gas & Butane Bottles Deep-Dive */}
        {activeTab === 'gas' && (
          <GasCalculator
            country={country}
            gasM3={gasM3Monthly}
            onChangeGasM3={setGasM3Monthly}
            bottleCount12kg={bottleCount12kg}
            onChangeBottleCount12kg={setBottleCount12kg}
            bottleCount3kg={bottleCount3kg}
            onChangeBottleCount3kg={setBottleCount3kg}
            gasResult={gasResult}
            isGasEnabled={isGasEnabled}
            onToggleGas={() => setIsGasEnabled(!isGasEnabled)}
          />
        )}

        {/* Tab 6: Tips & Energy Savings View */}
        {activeTab === 'tips' && (
          <TipsAndSavingsView
            country={country}
            calculation={billCalculation}
            ecoModeActive={ecoModeActive}
            onToggleEcoMode={() => setEcoModeActive(!ecoModeActive)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">KahrabaCalc</span>
            <span aria-hidden="true">·</span>
            <span>
              {country.code === 'TN'
                ? 'الشركة التونسية للكهرباء والغاز (STEG) — تعرفة 2026'
                : country.code === 'DZ'
                ? 'سونلغاز (Sonelgaz) ولجنة ضبط الكهرباء والغاز (CREG) — تعرفة 2026'
                : country.code === 'MA'
                ? 'المكتب الوطني للكهرباء والماء الصالح للشرب (ONEE) — تعرفة 2026'
                : country.code === 'LY'
                ? 'الشركة العامة للكهرباء (GECOL) — قرار مجلس الوزراء رقم 92 لسنة 2023'
                : 'حاسبة الكهرباء والطاقة المخصصة'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-500/80">{country.name.split('(')[0].trim()}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>
              {country.code === 'TN'
                ? 'نظام الفوترة التصاعدي بقاعدة السعر الموحد غير التراكمي (STEG)'
                : country.code === 'DZ'
                ? 'نظام الفوترة الثلاثية بالأشطر التصاعدية والرسم على السكن (سونلغاز)'
                : country.code === 'MA'
                ? 'نظام الفوترة الهجين (تدريجي ≤ 150 ك.و.س ثم انتقائي) لـ ONEE'
                : country.code === 'LY'
                ? 'التعريفة القطاعية الثابتة حسب نوع النشاط والاشتراك (GECOL)'
                : 'حساب دقيق لشرائح واستهلاك الطاقة'}
            </span>
          </div>
        </div>

        {/* Legal Disclaimer & Independent Engineering Tool Disclosure */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 mt-3 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            ⚠️ <strong>إخلاء مسؤولية:</strong> KahrabaCalc أداة هندسية تقريبية مستقلة مخصصة لترشيد الاستهلاك المنزلي ومساعدة المواطنين على تقدير تكلفة الطاقة وفق القرارات الوزارية وجداول الأسعار الرسمية المعلنة. النتائج تقديرية ولا تشكل فاتورة ملزمة قانونياً أو سند مطالبة صادر عن شركات التوزيع (STEG أو Sonelgaz أو ONEE أو GECOL).
          </div>
          <div className="text-slate-600 font-mono text-[10px]">
            Vercel Production Ready · 2026
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={country}
        onSelectCountry={setCountry}
      />

      <AddApplianceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAppliance}
      />

      {isPrintModalOpen && (
        <React.Suspense fallback={null}>
          <PrintReportModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            calculation={billCalculation}
            country={country}
            appliances={appliances}
          />
        </React.Suspense>
      )}

    </div>
  );
}
