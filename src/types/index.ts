export type CountryCode = 'TN' | 'DZ' | 'MA' | 'LY' | 'CUSTOM';

export interface TariffTier {
  id: string;
  name: string;
  fromKwh: number;
  toKwh: number; // Infinity for open-ended top tier
  ratePerKwh: number; // in local currency units
  description?: string;
  meterPower?: string;
  vatRate?: number; // 9% or 19%
}

export interface CountryProfile {
  code: CountryCode;
  name: string;
  nameEn: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  decimalPlaces: number; // 3 for Tunisia (millimes) & Libya (dirhams), 2 for others, 4 for rates
  billingCycleMonths: number; // 1 for monthly, 2 for bimestrielle (STEG), 3 for trimestrielle (Sonelgaz)
  fixedChargeMonthly: number; // Redevance fixe / معلوم القدرة الأساسي
  meterKva: number; // قدرة العداد التعاقدية (default 5 kVA or 6 kW)
  meterKwPower?: number; // استطاعة الاشتراك في الجزائر (4.37 دج / kW)
  municipalTaxPerKwh: number; // Redevance municipale / معلوم الجماعات المحلية
  vatPercentage: number; // TVA % (standard)
  transitionFundPerKwh: number; // e.g. FTE in Tunisia
  rttFeeMonthly: number; // معلوم الإذاعة والتلفزة التونسية RTT (3.500 DT)
  tppanFeeMonthly?: number; // رسم الترويج السمعي البصري بالمغرب TPPAN
  housingTaxQuarterly?: number; // الرسم على السكن (قانون المالية 2026 في الجزائر: 400 دج أو 800 دج)
  stampTaxPercentage?: number; // رسوم الدمغة المالية في ليبيا (1% إلى 2%)
  cleaningFeeMonthly?: number; // رسوم النظافة والخدمات المحلية في ليبيا
  libyaPaymentType?: 'salary_deduction' | 'cash'; // نظام الأقساط/خصم مرتب (25 درهم) أو سداد نقدي (40 درهم)
  isTiered: boolean;
  tiers: TariffTier[];
  specialRegime?: 'TUNISIA_STEG_2026' | 'ALGERIA_SONELGAZ_2026' | 'MOROCCO_ONEE_2026' | 'LIBYA_GECOL_2026';
  officialUtility?: string;
  regulatoryAuthority?: string;
  legalReference?: string;
  effectiveDate?: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  uncertainties?: string;
  notes: string;
}

export type ApplianceCategory = 
  | 'cooling'      // تكييف وتبريد
  | 'refrigeration'// ثلاجات ومجمدات
  | 'laundry'      // غسيل وتنظيف
  | 'kitchen'      // مطبخ وأفران
  | 'water_heating'// سخانات ماء
  | 'electronics'  // أجهزة إلكترونية وشاشات
  | 'lighting'     // إنارة
  | 'other';       // أجهزة أخرى

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  iconName: string;
  defaultWatts: number;
  watts: number;
  hoursPerDay: number;
  daysPerWeek: number;
  quantity: number;
  enabled: boolean;
  
  // Specific modifiers for accurate physics estimation
  dutyCycle?: number; // 0.35 for fridge compressor (runs ~35% of the time)
  isInverter?: boolean; // 35% savings on AC
  acBtu?: number; // 9000, 12000, 18000, 24000
  acTempSetting?: number; // 24 vs 20 (each degree saves ~7%)
  washTemp?: 'cold' | '40c' | '60c' | '90c'; // Water heating factor
  energyClass?: 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D';
  customNote?: string;
}

export interface TierCostCalculation {
  tierName: string;
  kwhInTier: number;
  ratePerKwh: number;
  cost: number;
  vatRate?: number;
  vatCost?: number;
  isAppliedRule?: boolean;
}

export interface GasCalculationResult {
  monthlyM3: number;
  dailyM3: number;
  bimonthlyM3: number;
  quarterlyM3?: number;
  monthlyThermie?: number;
  quarterlyThermie?: number;
  bottleCount12kg?: number;
  bottleCount3kg?: number;
  unitType: 'm3' | 'thermie' | 'bottle';
  tierName: string;
  ratePerUnit: number;
  energyCostMonthly: number;
  flowFeeMonthly: number; // معلوم الانسياب أو الاشتراك الثابت للغاز
  fteGazMonthly: number; // 11.875 millimes/m3 (exempt if <= 30m3)
  vatMonthly: number; // TVA
  totalCostMonthly: number;
  totalCostBimonthly: number;
  totalCostQuarterly?: number; // سونلغاز ثلاثياً
  isExemptFte: boolean;
  tierBreakdown?: {
    name: string;
    unitsInTier: number;
    rate: number;
    cost: number;
    vatRate: number;
    vatCost: number;
  }[];
}

export interface BillCalculationResult {
  totalMonthlyKwh: number;
  totalDailyKwh: number;
  totalYearlyKwh: number;
  totalPeriodicKwh?: number; // شهرين لـ STEG، 3 أشهر لـ Sonelgaz
  
  appliedRatePerKwh: number; // For Tunisia STEG 2026 & Morocco selective: Single price applied to full consumption
  energyCostMonthly: number;
  energyCostPeriodic?: number;
  
  // Detailed Surcharges
  capacityFeeMonthly: number; // معلوم القدرة (700 مليم × kVA بـ STEG أو 4.37 دج × kW بسونلغاز أو إيجار العداد بالمغرب)
  capacityFeePeriodic?: number;
  capacityVatMonthly: number;
  energyVatMonthly: number;
  vatMonthly: number; // مجموع الأداء على القيمة المضافة
  vatBreakdown?: {
    vat9Monthly: number;
    vat19Monthly: number;
    vat7Monthly?: number;
    vat13Monthly?: number;
    vat18Monthly?: number;
  };
  
  municipalTaxMonthly: number; // معلوم الجماعات المحلية CL
  transitionFundMonthly: number; // صندوق الانتقال الطاقي FTE أو صندوق الطاقات المتجددة
  rttTaxMonthly: number; // معلوم الإذاعة والتلفزة RTT (تونس)
  tppanTaxMonthly: number; // رسم الترويج السمعي البصري TPPAN (المغرب)
  housingTaxMonthly: number; // الرسم على السكن (الجزائر - قانون المالية 2026)
  housingTaxQuarterly?: number;
  stampTaxMonthly?: number; // رسم الدمغة المالية (ليبيا 1.5% - 2%)
  cleaningFeeMonthly?: number; // رسم النظافة والخدمات المحلية (ليبيا)
  fixedChargeMonthly: number;
  
  totalCostMonthly: number;
  totalCostDaily: number;
  totalCostYearly: number;
  totalCostBimonthly: number; // الفاتورة الثنائية الدورية (تونس)
  totalCostQuarterly: number; // الفاتورة الثلاثية الدورية (الجزائر سونلغاز)
  
  averageCostPerKwh: number;
  currentTierName: string;
  currentTierIndex: number;
  nextTierThreshold: number | null;
  kwhToNextTier: number | null;
  isEconomicExempt: boolean;
  tierBreakdown: TierCostCalculation[];
  
  applianceBreakdown: {
    id: string;
    name: string;
    category: ApplianceCategory;
    iconName: string;
    monthlyKwh: number;
    monthlyCost: number;
    percentageOfTotal: number;
  }[];

  // Optional Natural Gas simulation
  gasCalculation?: GasCalculationResult;
  combinedTotalMonthly?: number;
  combinedTotalBimonthly?: number;
  combinedTotalQuarterly?: number;
}
