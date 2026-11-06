import { 
  Appliance, 
  BillCalculationResult, 
  CountryProfile, 
  TierCostCalculation,
  GasCalculationResult
} from '../types';
import { STEG_GAS_TIERS, SONELGAZ_GAS_TIERS } from '../data/countries';

/**
 * Calculates effective continuous watts taking into account inverter technology,
 * duty cycles (compressor run time), AC temperature settings, and wash water heat.
 */
export function calculateApplianceEffectiveWatts(appliance: Appliance): number {
  const baseWatts = Math.max(0, Number(appliance.watts) || 0);
  if (baseWatts === 0) return 0;
  let effectiveWatts = baseWatts;

  if (appliance.category === 'cooling') {
    let factor = 1.0;
    // Inverter saves ~35% on average over a continuous run cycle
    if (appliance.isInverter) {
      factor *= 0.65;
    }
    // Thermostat setting: 24°C is the reference standard.
    // Setting lower (e.g. 20°C) consumes ~7% more per degree.
    // Setting higher (e.g. 26°C) consumes ~7% less per degree.
    if (appliance.acTempSetting !== undefined) {
      const delta = 24 - appliance.acTempSetting; // +4 for 20°C, -2 for 26°C
      factor *= Math.max(0.6, 1.0 + delta * 0.07);
    }
    effectiveWatts *= factor;
  } else if (appliance.category === 'refrigeration') {
    // Refrigerator compressors run intermittently (duty cycle ~30-40%)
    const duty = Math.min(1.0, Math.max(0.05, appliance.dutyCycle ?? 0.35));
    effectiveWatts *= duty;

    // Energy rating class modifier
    if (appliance.energyClass) {
      const classFactors: Record<string, number> = {
        'A+++': 0.72,
        'A++': 0.82,
        'A+': 0.92,
        A: 1.0,
        B: 1.15,
        C: 1.30,
        D: 1.50,
      };
      effectiveWatts *= classFactors[appliance.energyClass] ?? 1.0;
    }
  } else if (appliance.category === 'laundry') {
    // Washing machine water temperature dictates ~70-80% of total electrical draw
    if (appliance.washTemp) {
      const washFactors: Record<string, number> = {
        cold: 0.35, // ~300-400W motor only (no heater)
        '40c': 1.0,  // Standard heating
        '60c': 1.45, // Heavy heating
        '90c': 1.95, // Max boil/sanitize
      };
      effectiveWatts *= washFactors[appliance.washTemp] ?? 1.0;
    }
  } else if (appliance.dutyCycle) {
    effectiveWatts *= Math.min(1.0, Math.max(0.01, appliance.dutyCycle));
  }

  return Math.max(0, effectiveWatts);
}

/**
 * Calculates consumption for a single appliance
 */
export function calculateApplianceKwh(appliance: Appliance) {
  const quantity = Math.max(0, Math.floor(Number(appliance.quantity) || 0));
  if (!appliance.enabled || quantity === 0) {
    return { dailyKwh: 0, monthlyKwh: 0, yearlyKwh: 0, effectiveWatts: 0 };
  }

  const effectiveWatts = calculateApplianceEffectiveWatts(appliance);
  if (effectiveWatts === 0) {
    return { dailyKwh: 0, monthlyKwh: 0, yearlyKwh: 0, effectiveWatts: 0 };
  }

  const hoursPerDay = Math.min(24, Math.max(0, Number(appliance.hoursPerDay) || 0));
  const daysPerWeek = Math.min(7, Math.max(0, Number(appliance.daysPerWeek) || 0));
  const dailyHoursWeighted = hoursPerDay * (daysPerWeek / 7);
  const dailyKwh = (effectiveWatts / 1000) * dailyHoursWeighted * quantity;
  const monthlyKwh = dailyKwh * 30.416; // Average days per month
  const yearlyKwh = dailyKwh * 365;

  return {
    dailyKwh,
    monthlyKwh,
    yearlyKwh,
    effectiveWatts,
  };
}

/**
 * Calculate Natural Gas for Tunisia (STEG BP1 in m3), Algeria (Sonelgaz 23M in Thermies),
 * or Morocco Subsidized Butane Gas Bottles (قنينات غاز البوتان / البوطا 12 كغ و 3 كغ)
 */
export function calculateGas(
  country: CountryProfile,
  monthlyM3: number,
  bottleCount12kg: number = 2,
  bottleCount3kg: number = 0
): GasCalculationResult {
  const safeM3 = Math.max(0, Number(monthlyM3) || 0);
  const safe12 = Math.max(0, Math.floor(Number(bottleCount12kg) || 0));
  const safe3 = Math.max(0, Math.floor(Number(bottleCount3kg) || 0));

  const isAlgeria = country.code === 'DZ' || country.specialRegime === 'ALGERIA_SONELGAZ_2026';
  const isMorocco = country.code === 'MA' || country.specialRegime === 'MOROCCO_ONEE_2026';
  const isLibya = country.code === 'LY' || country.specialRegime === 'LIBYA_GECOL_2026';

  if (isLibya) {
    // ========================================================
    // Libya Subsidized Cooking Gas Cylinders (أسطوانات غاز البريقة)
    // 15kg cylinder = 3.000 LYD, 5kg cylinder = 2.000 LYD
    // ========================================================
    const count15 = safe12; // Standard 15kg cylinder
    const count5 = safe3; // Small 5kg cylinder
    const cost15 = count15 * 3.000;
    const cost5 = count5 * 2.000;
    const totalCostMonthly = cost15 + cost5;

    const tierBreakdown = [
      {
        name: 'أسطوانة غاز الطهي المنزلية (15 كلغ - غاز البريقة)',
        unitsInTier: count15,
        rate: 3.000,
        cost: cost15,
        vatRate: 0,
        vatCost: 0,
      },
      {
        name: 'أسطوانة غاز الطهي الصغيرة (5 كلغ - رحلات)',
        unitsInTier: count5,
        rate: 2.000,
        cost: cost5,
        vatRate: 0,
        vatCost: 0,
      },
    ].filter((item) => item.unitsInTier > 0);

    return {
      monthlyM3: count15 * 8.0, // تقريبي بالمتر المكعب
      dailyM3: (count15 * 8.0) / 30.416,
      bimonthlyM3: count15 * 16,
      quarterlyM3: count15 * 24,
      bottleCount12kg: count15,
      bottleCount3kg: count5,
      unitType: 'bottle',
      tierName: `${count15} أسطوانة (15 كغ)${count5 > 0 ? ` + ${count5} (5 كغ)` : ''}`,
      ratePerUnit: 3.000,
      energyCostMonthly: totalCostMonthly,
      flowFeeMonthly: 0,
      fteGazMonthly: 0,
      vatMonthly: 0,
      totalCostMonthly,
      totalCostBimonthly: totalCostMonthly * 2,
      totalCostQuarterly: totalCostMonthly * 3,
      isExemptFte: true,
      tierBreakdown,
    };
  }

  if (isMorocco) {
    // ========================================================
    // Morocco Subsidized Butane Bottles (قنينات غاز البوتان)
    // Large 12kg bottle = 50.00 DH, Small 3kg bottle = 12.50 DH
    // ========================================================
    const count12 = safe12;
    const count3 = safe3;
    const cost12 = count12 * 50.0;
    const cost3 = count3 * 12.5;
    const totalCostMonthly = cost12 + cost3;

    const tierBreakdown = [
      {
        name: 'قنينة غاز البوتان 12 كلغ (البوطا الكبيرة)',
        unitsInTier: count12,
        rate: 50.0,
        cost: cost12,
        vatRate: 0,
        vatCost: 0,
      },
      {
        name: 'قنينة غاز البوتان 3 كلغ (البوطا الصغيرة)',
        unitsInTier: count3,
        rate: 12.5,
        cost: cost3,
        vatRate: 0,
        vatCost: 0,
      },
    ].filter((item) => item.unitsInTier > 0);

    return {
      monthlyM3: count12 * 6.5, // تقريبي للمقارنة بالمتر المكعب
      dailyM3: (count12 * 6.5) / 30.416,
      bimonthlyM3: count12 * 13,
      quarterlyM3: count12 * 19.5,
      bottleCount12kg: count12,
      bottleCount3kg: count3,
      unitType: 'bottle',
      tierName: `${count12} بوطا 12 كغ${count3 > 0 ? ` + ${count3} بوطا 3 كغ` : ''}`,
      ratePerUnit: 50.0,
      energyCostMonthly: totalCostMonthly,
      flowFeeMonthly: 0,
      fteGazMonthly: 0,
      vatMonthly: 0,
      totalCostMonthly,
      totalCostBimonthly: totalCostMonthly * 2,
      totalCostQuarterly: totalCostMonthly * 3,
      isExemptFte: true,
      tierBreakdown,
    };
  }

  if (safeM3 <= 0) {
    return {
      monthlyM3: 0,
      dailyM3: 0,
      bimonthlyM3: 0,
      quarterlyM3: 0,
      unitType: isAlgeria ? 'thermie' : 'm3',
      tierName: 'بدون استهلاك',
      ratePerUnit: isAlgeria ? 0.1682 : 0.231,
      energyCostMonthly: 0,
      flowFeeMonthly: 0,
      fteGazMonthly: 0,
      vatMonthly: 0,
      totalCostMonthly: 0,
      totalCostBimonthly: 0,
      totalCostQuarterly: 0,
      isExemptFte: true,
      tierBreakdown: [],
    };
  }

  if (isAlgeria) {
    // ========================================================
    // Algeria Sonelgaz 23M (Trimestrielle in Thermies)
    // 1 m3 ~ 9.8 Thermies
    // ========================================================
    const quarterlyM3 = safeM3 * 3;
    const quarterlyThermie = quarterlyM3 * 9.8;
    const monthlyThermie = quarterlyThermie / 3;

    let remainingThermie = quarterlyThermie;
    let quarterlyEnergyCost = 0;
    let quarterlyVat = 0;
    const tierBreakdown: { name: string; unitsInTier: number; rate: number; cost: number; vatRate: number; vatCost: number }[] = [];

    for (const tier of SONELGAZ_GAS_TIERS) {
      if (quarterlyThermie > tier.fromThermie) {
        const span = tier.toThermie - tier.fromThermie;
        const inTier = Math.min(Math.max(0, quarterlyThermie - tier.fromThermie), span);
        const cost = inTier * tier.ratePerThermie;
        const vat = cost * (tier.vatRate / 100);
        quarterlyEnergyCost += cost;
        quarterlyVat += vat;

        tierBreakdown.push({
          name: tier.name,
          unitsInTier: inTier,
          rate: tier.ratePerThermie,
          cost,
          vatRate: tier.vatRate,
          vatCost: vat,
        });
      }
    }

    // Fixed gas subscription: 28.50 DZD monthly (85.50 DZD quarterly)
    const flowFeeMonthly = 28.50;
    const flowFeeQuarterly = flowFeeMonthly * 3;
    const flowFeeVatQuarterly = flowFeeQuarterly * 0.09; // 9% TVA
    quarterlyVat += flowFeeVatQuarterly;

    const totalCostQuarterly = quarterlyEnergyCost + flowFeeQuarterly + quarterlyVat;
    const totalCostMonthly = totalCostQuarterly / 3;
    const totalCostBimonthly = totalCostMonthly * 2;

    const currentTier = tierBreakdown[tierBreakdown.length - 1]?.name || 'الشطر الأول';
    const currentRate = tierBreakdown[tierBreakdown.length - 1]?.rate || 0.1682;

    return {
      monthlyM3,
      dailyM3: monthlyM3 / 30.416,
      bimonthlyM3: monthlyM3 * 2,
      quarterlyM3,
      monthlyThermie,
      quarterlyThermie,
      unitType: 'thermie',
      tierName: currentTier,
      ratePerUnit: currentRate,
      energyCostMonthly: quarterlyEnergyCost / 3,
      flowFeeMonthly,
      fteGazMonthly: 0,
      vatMonthly: quarterlyVat / 3,
      totalCostMonthly,
      totalCostBimonthly,
      totalCostQuarterly,
      isExemptFte: true,
      tierBreakdown,
    };
  }

  // ========================================================
  // Tunisia STEG BP1 (Single price rule on full volume)
  // ========================================================
  let ratePerM3 = 0.231;
  let tierName = 'الشريحة 1 (0 - 30 م³)';
  let isExemptFte = false;

  if (safeM3 <= 30) {
    ratePerM3 = 0.231; // 231 مليم
    tierName = 'الشريحة 1 (الاستهلاك المدعم: 0 - 30 م³)';
    isExemptFte = true; // معفى من FTE Gaz
  } else if (safeM3 <= 60) {
    ratePerM3 = 0.368; // 368 مليم
    tierName = 'الشريحة 2 (الاستهلاك المتوسط: 31 - 60 م³)';
  } else if (safeM3 <= 150) {
    ratePerM3 = 0.556; // 556 مليم
    tierName = 'الشريحة 3 (الاستهلاك المرتفع: 61 - 150 م³)';
  } else {
    ratePerM3 = 0.824; // 824 مليم
    tierName = 'الشريحة 4 (الاستهلاك المكثف: ما فوق 150 م³)';
  }

  const energyCostMonthly = safeM3 * ratePerM3;
  const flowFeeMonthly = 0.350; // معلوم الانسياب
  const fteGazMonthly = isExemptFte ? 0 : safeM3 * 0.011875;
  const vatMonthly = (energyCostMonthly + flowFeeMonthly) * 0.19;

  const totalCostMonthly = energyCostMonthly + flowFeeMonthly + fteGazMonthly + vatMonthly;
  const totalCostBimonthly = totalCostMonthly * 2;
  const totalCostQuarterly = totalCostMonthly * 3;

  return {
    monthlyM3: safeM3,
    dailyM3: safeM3 / 30.416,
    bimonthlyM3: safeM3 * 2,
    quarterlyM3: safeM3 * 3,
    unitType: 'm3',
    tierName,
    ratePerUnit: ratePerM3,
    energyCostMonthly,
    flowFeeMonthly,
    fteGazMonthly,
    vatMonthly,
    totalCostMonthly,
    totalCostBimonthly,
    totalCostQuarterly,
    isExemptFte,
  };
}

/**
 * Backward compatibility alias for Tunisia STEG Gas
 */
export function calculateStegGas(monthlyM3: number): GasCalculationResult {
  const dummyTunisia: CountryProfile = {
    code: 'TN',
    name: 'تونس',
    nameEn: 'Tunisia',
    flag: '🇹🇳',
    currency: 'TND',
    currencySymbol: 'د.ت',
    decimalPlaces: 3,
    billingCycleMonths: 2,
    meterKva: 5,
    fixedChargeMonthly: 3.5,
    municipalTaxPerKwh: 0.005,
    vatPercentage: 7,
    transitionFundPerKwh: 0.005,
    rttFeeMonthly: 3.5,
    isTiered: true,
    verificationStatus: 'VERIFIED',
    tiers: [],
    notes: '',
  };
  return calculateGas(dummyTunisia, monthlyM3);
}

/**
 * Comprehensive bill calculation handling:
 * 1. Tunisia STEG 2026 non-cumulative single-price rules (bimestrielle)
 * 2. Algeria Sonelgaz 2026 progressive quarterly 54M rules with 9%/19% TVA and 2026 housing tax (trimestrielle)
 * 3. Egypt, Saudi Arabia, Morocco, UAE progressive slab countries
 */
export function calculateBill(
  appliances: Appliance[],
  country: CountryProfile,
  gasM3Monthly: number = 0,
  bottleCount12kg: number = 0,
  bottleCount3kg: number = 0
): BillCalculationResult {
  // 1. Calculate individual and total kWh
  let totalDailyKwh = 0;
  let totalMonthlyKwh = 0;
  let totalYearlyKwh = 0;

  const applianceUsageList = appliances.map((app) => {
    const kwh = calculateApplianceKwh(app);
    if (app.enabled) {
      totalDailyKwh += kwh.dailyKwh;
      totalMonthlyKwh += kwh.monthlyKwh;
      totalYearlyKwh += kwh.yearlyKwh;
    }
    return {
      app,
      monthlyKwh: kwh.monthlyKwh,
    };
  });

  // 2. Country Specific Energy & Tariff Logic
  let energyCostMonthly = 0;
  let appliedRatePerKwh = 0;
  const tierBreakdown: TierCostCalculation[] = [];
  let currentTierName = '';
  let currentTierIndex = 0;
  let nextTierThreshold: number | null = null;
  let kwhToNextTier: number | null = null;
  let isEconomicExempt = false;

  let capacityFeeMonthly = 0;
  let capacityVatMonthly = 0;
  let energyVatMonthly = 0;
  let vatMonthly = 0;
  let municipalTaxMonthly = 0;
  let transitionFundMonthly = 0;
  let rttTaxMonthly = 0;
  let housingTaxMonthly = 0;
  let tppanTaxMonthly = 0;
  let stampTaxMonthly = 0;
  let cleaningFeeMonthly = 0;
  let totalCostQuarterly = 0;
  let totalCostBimonthly = 0;

  const isTunisia = country.code === 'TN' || country.specialRegime === 'TUNISIA_STEG_2026';
  const isAlgeria = country.code === 'DZ' || country.specialRegime === 'ALGERIA_SONELGAZ_2026';

  if (isAlgeria) {
    // ========================================================
    // ALGERIA SONELGAZ 2026 (Code 54M - Trimestrielle / 3 Months)
    // ========================================================
    const quarterlyKwh = totalMonthlyKwh * 3;
    let quarterlyEnergyCost = 0;
    let vat9Quarterly = 0;
    let vat19Quarterly = 0;

    for (let i = 0; i < country.tiers.length; i++) {
      const tier = country.tiers[i];
      if (quarterlyKwh > tier.fromKwh) {
        const span = tier.toKwh === Infinity ? Infinity : tier.toKwh - tier.fromKwh;
        const kwhInTier = Math.min(Math.max(0, quarterlyKwh - tier.fromKwh), span);
        const cost = kwhInTier * tier.ratePerKwh;
        const vatRate = tier.vatRate ?? (i < 2 ? 9 : 19);
        const vatCost = cost * (vatRate / 100);

        quarterlyEnergyCost += cost;
        if (vatRate === 9) {
          vat9Quarterly += vatCost;
        } else {
          vat19Quarterly += vatCost;
        }

        tierBreakdown.push({
          tierName: tier.name,
          kwhInTier: kwhInTier / 3, // Monthly normalized
          ratePerKwh: tier.ratePerKwh,
          cost: cost / 3,
          vatRate,
          vatCost: vatCost / 3,
        });

        currentTierName = tier.name;
        currentTierIndex = i;

        if (quarterlyKwh <= tier.toKwh) {
          nextTierThreshold = tier.toKwh === Infinity ? null : tier.toKwh / 3;
          kwhToNextTier = tier.toKwh === Infinity ? null : Math.max(0, (tier.toKwh - quarterlyKwh) / 3);
        }
      }
    }

    energyCostMonthly = quarterlyEnergyCost / 3;
    appliedRatePerKwh = totalMonthlyKwh > 0 ? energyCostMonthly / totalMonthlyKwh : 1.7787;

    // Fixed capacity fee: 4.37 DZD per contracted kW monthly
    const meterKw = country.meterKwPower ?? 6;
    capacityFeeMonthly = totalMonthlyKwh > 0 ? 4.37 * meterKw : 0;
    capacityVatMonthly = capacityFeeMonthly * 0.09; // 9% TVA on domestic fixed power fee

    // Energy TVA
    const energyVatMonthlyCalc = (vat9Quarterly + vat19Quarterly) / 3;
    energyVatMonthly = energyVatMonthlyCalc;
    vatMonthly = energyVatMonthly + capacityVatMonthly;

    // Housing Tax (قانون المالية 2026 المادة 94: 400 دج أو 800 دج لكل ثلاثي)
    const housingQuarterly = country.housingTaxQuarterly ?? 400.0;
    housingTaxMonthly = totalMonthlyKwh > 0 ? housingQuarterly / 3 : 0;

    // Renewable Energy Fund (Fonds des Énergies Renouvelables): ~10 DZD per quarter
    transitionFundMonthly = totalMonthlyKwh > 0 ? 10.0 / 3 : 0;

    // Total monthly & quarterly
    const monthlyTotal = energyCostMonthly + capacityFeeMonthly + capacityVatMonthly + energyVatMonthly + housingTaxMonthly + transitionFundMonthly;
    totalCostQuarterly = monthlyTotal * 3;
    totalCostBimonthly = monthlyTotal * 2;

  } else if (isTunisia) {
    // ========================================================
    // TUNISIA STEG 2026: Non-Cumulative Single Price
    // ========================================================
    const M = totalMonthlyKwh;

    if (M <= 0) {
      appliedRatePerKwh = 0.062;
      currentTierName = 'بدون استهلاك';
      nextTierThreshold = 50;
      kwhToNextTier = 50;
      isEconomicExempt = true;
    } else if (M <= 50) {
      appliedRatePerKwh = 0.062; // 62 مليم
      currentTierName = 'الشريحة 1 (من 0 إلى 50 ك.و.س)';
      currentTierIndex = 0;
      nextTierThreshold = 50;
      kwhToNextTier = Math.max(0, 50 - M);
      isEconomicExempt = true;
    } else if (M <= 100) {
      appliedRatePerKwh = 0.096; // 96 مليم
      currentTierName = 'الشريحة 2 (من 51 إلى 100 ك.و.س)';
      currentTierIndex = 1;
      nextTierThreshold = 100;
      kwhToNextTier = Math.max(0, 100 - M);
      isEconomicExempt = true;
    } else if (M <= 200) {
      appliedRatePerKwh = 0.176; // 176 مليم
      currentTierName = 'الشريحة 3 (من 101 إلى 200 ك.و.س)';
      currentTierIndex = 2;
      nextTierThreshold = 200;
      kwhToNextTier = Math.max(0, 200 - M);
      isEconomicExempt = false;
    } else if (M <= 300) {
      appliedRatePerKwh = 0.218; // 218 مليم
      currentTierName = 'الشريحة 4 (من 201 إلى 300 ك.و.س)';
      currentTierIndex = 3;
      nextTierThreshold = 300;
      kwhToNextTier = Math.max(0, 300 - M);
      isEconomicExempt = false;
    } else if (M <= 500) {
      appliedRatePerKwh = 0.341; // 341 مليم
      currentTierName = 'الشريحة 5 (من 301 إلى 500 ك.و.س)';
      currentTierIndex = 4;
      nextTierThreshold = 500;
      kwhToNextTier = Math.max(0, 500 - M);
      isEconomicExempt = false;
    } else {
      appliedRatePerKwh = 0.414; // 414 مليم
      currentTierName = 'الشريحة 6 (ما فوق 500 ك.و.س)';
      currentTierIndex = 5;
      nextTierThreshold = null;
      kwhToNextTier = null;
      isEconomicExempt = false;
    }

    // Single Price Rule on FULL consumption
    energyCostMonthly = M * appliedRatePerKwh;

    tierBreakdown.push({
      tierName: `${currentTierName} [سعر موحد على كامل الاستهلاك]`,
      kwhInTier: M,
      ratePerKwh: appliedRatePerKwh,
      cost: energyCostMonthly,
      isAppliedRule: true,
    });

    const kva = country.meterKva || 5;
    capacityFeeMonthly = M > 0 ? 0.700 * kva : 0;
    capacityVatMonthly = capacityFeeMonthly * 0.19; // 19% TVA on subscription

    const energyVatRate = M <= 300 ? 0.07 : 0.13;
    energyVatMonthly = energyCostMonthly * energyVatRate;
    vatMonthly = energyVatMonthly + capacityVatMonthly;

    municipalTaxMonthly = (M > 0 && !isEconomicExempt) ? M * 0.005 : 0;
    transitionFundMonthly = (M > 0 && !isEconomicExempt) ? M * 0.005 : 0;
    rttTaxMonthly = M > 0 ? (country.rttFeeMonthly ?? 3.500) : 0;

    totalCostBimonthly = (energyCostMonthly + capacityFeeMonthly + capacityVatMonthly + energyVatMonthly + municipalTaxMonthly + transitionFundMonthly + rttTaxMonthly) * 2;
    totalCostQuarterly = totalCostBimonthly * 1.5;

  } else if (country.code === 'MA' || country.specialRegime === 'MOROCCO_ONEE_2026') {
    // ========================================================
    // MOROCCO ONEE 2026: Hybrid Progressive & Selective System
    // <= 150 kWh/month: Progressive Slab (تدريجي)
    // > 150 kWh/month: Selective on FULL consumption (انتقائي على كامل الاستهلاك)
    // ========================================================
    const M = totalMonthlyKwh;

    if (M <= 0) {
      appliedRatePerKwh = 0.9010;
      currentTierName = 'بدون استهلاك';
      nextTierThreshold = 100;
      kwhToNextTier = 100;
      isEconomicExempt = true;
    } else if (M <= 150) {
      // 1. Progressive billing (فوترة تدريجية)
      if (M <= 100) {
        const cost = M * 0.9010;
        energyCostMonthly = cost;
        appliedRatePerKwh = 0.9010;
        tierBreakdown.push({
          tierName: 'الشطر الأول (من 0 إلى 100 ك.و.س) [فوترة تدريجية]',
          kwhInTier: M,
          ratePerKwh: 0.9010,
          cost,
          vatRate: 18,
          vatCost: cost - cost / 1.18,
        });
        currentTierName = 'الشطر الأول (من 0 إلى 100 ك.و.س)';
        currentTierIndex = 0;
        nextTierThreshold = 100;
        kwhToNextTier = Math.max(0, 100 - M);
        isEconomicExempt = true;
      } else {
        const costT1 = 100 * 0.9010;
        const kwhT2 = M - 100;
        const costT2 = kwhT2 * 1.0732;
        energyCostMonthly = costT1 + costT2;
        appliedRatePerKwh = energyCostMonthly / M;

        tierBreakdown.push({
          tierName: 'الشطر الأول (أول 100 ك.و.س) [فوترة تدريجية]',
          kwhInTier: 100,
          ratePerKwh: 0.9010,
          cost: costT1,
          vatRate: 18,
          vatCost: costT1 - costT1 / 1.18,
        });
        tierBreakdown.push({
          tierName: 'الشطر الثاني (من 101 إلى 150 ك.و.س) [فوترة تدريجية]',
          kwhInTier: kwhT2,
          ratePerKwh: 1.0732,
          cost: costT2,
          vatRate: 18,
          vatCost: costT2 - costT2 / 1.18,
        });

        currentTierName = 'الشطر الثاني (من 101 إلى 150 ك.و.س)';
        currentTierIndex = 1;
        nextTierThreshold = 150;
        kwhToNextTier = Math.max(0, 150 - M);
        isEconomicExempt = false;
      }
    } else {
      // 2. Selective billing (فوترة انتقائية على كامل الكمية)
      let rate = 1.0732;
      if (M <= 200) {
        rate = 1.0732;
        currentTierName = 'الشطر الثالث (من 151 إلى 200 ك.و.س)';
        currentTierIndex = 2;
        nextTierThreshold = 200;
        kwhToNextTier = Math.max(0, 200 - M);
      } else if (M <= 300) {
        rate = 1.1676;
        currentTierName = 'الشطر الرابع (من 201 إلى 300 ك.و.س)';
        currentTierIndex = 3;
        nextTierThreshold = 300;
        kwhToNextTier = Math.max(0, 300 - M);
      } else if (M <= 500) {
        rate = 1.3817;
        currentTierName = 'الشطر الخامس (من 301 إلى 500 ك.و.س)';
        currentTierIndex = 4;
        nextTierThreshold = 500;
        kwhToNextTier = Math.max(0, 500 - M);
      } else {
        rate = 1.5958;
        currentTierName = 'الشطر السادس (ما فوق 500 ك.و.س)';
        currentTierIndex = 5;
        nextTierThreshold = null;
        kwhToNextTier = null;
      }

      appliedRatePerKwh = rate;
      energyCostMonthly = M * rate;

      tierBreakdown.push({
        tierName: `${currentTierName} [سعر انتقائي موحد على كامل الاستهلاك]`,
        kwhInTier: M,
        ratePerKwh: rate,
        cost: energyCostMonthly,
        isAppliedRule: true,
        vatRate: 18,
        vatCost: energyCostMonthly - energyCostMonthly / 1.18,
      });
      isEconomicExempt = false;
    }

    // Fixed capacity fee (الإتاوة الثابتة للعداد)
    capacityFeeMonthly = M > 0 ? (country.fixedChargeMonthly || 15.0) : 0;
    capacityVatMonthly = capacityFeeMonthly * 0.18; // 18% TVA على الاشتراك

    // TVA on energy (rates already TTC 18%)
    energyVatMonthly = energyCostMonthly - (energyCostMonthly / 1.18);
    vatMonthly = energyVatMonthly + capacityVatMonthly;

    // TPPAN Audiovisual fee (رسم الترويج السمعي البصري)
    // معفى إذا ≤ 100 ك.و.س، 10 دراهم بين 101 و 200، 20 درهم ما فوق 200
    if (M > 200) {
      tppanTaxMonthly = 20.0;
    } else if (M > 100) {
      tppanTaxMonthly = 10.0;
    } else {
      tppanTaxMonthly = 0;
    }

    const monthlyTotal = energyCostMonthly + capacityFeeMonthly + capacityVatMonthly + tppanTaxMonthly;
    totalCostBimonthly = monthlyTotal * 2;
    totalCostQuarterly = monthlyTotal * 3;

  } else if (country.code === 'LY' || country.specialRegime === 'LIBYA_GECOL_2026') {
    // ========================================================
    // LIBYA GECOL (قرار مجلس الوزراء رقم 92 لسنة 2023)
    // ========================================================
    const M = totalMonthlyKwh;
    const selectedTier = (
      (country.libyaPaymentType && country.tiers.find(t => t.id === country.libyaPaymentType))
      || (country.libyaPaymentType === 'cash' ? country.tiers.find(t => t.id === 'ly_home_cash') : null)
      || (country.libyaPaymentType === 'salary_deduction' ? country.tiers.find(t => t.id === 'ly_home_salary') : null)
      || country.tiers[0]
    ) ?? {
      id: 'ly_home_salary',
      name: 'منزلي (خصم من المرتب / نظام الأقساط)',
      ratePerKwh: 0.025,
    };
    appliedRatePerKwh = selectedTier.ratePerKwh;
    currentTierName = selectedTier.name;
    currentTierIndex = 0;
    nextTierThreshold = null;
    kwhToNextTier = null;
    isEconomicExempt = false;

    energyCostMonthly = M * appliedRatePerKwh;

    tierBreakdown.push({
      tierName: `${currentTierName} [تعرفة محددة: ${(appliedRatePerKwh * 1000).toFixed(0)} درهم / ك.و.س]`,
      kwhInTier: M,
      ratePerKwh: appliedRatePerKwh,
      cost: energyCostMonthly,
      vatRate: 0,
      vatCost: 0,
    });

    // Fixed administration & meter service fee (رسوم الكشف والفحص وخدمات العداد)
    capacityFeeMonthly = M > 0 ? (country.fixedChargeMonthly || 3.0) : 0;
    capacityVatMonthly = 0;
    energyVatMonthly = 0;
    vatMonthly = 0;

    // Stamp Duty Tax (رسوم الدمغة المالية 1.5% - 2% من قيمة الاستهلاك الفعلي)
    const stampPercent = country.stampTaxPercentage ?? 1.5;
    stampTaxMonthly = M > 0 ? energyCostMonthly * (stampPercent / 100) : 0;

    // Cleaning & Local Municipal Services (رسوم النظافة والخدمات المحلية)
    cleaningFeeMonthly = M > 0 ? (country.cleaningFeeMonthly ?? 1.5) : 0;

    const monthlyTotal = energyCostMonthly + capacityFeeMonthly + stampTaxMonthly + cleaningFeeMonthly;
    totalCostBimonthly = monthlyTotal * 2;
    totalCostQuarterly = monthlyTotal * 3;

  } else if (country.isTiered && country.tiers.length > 0) {
    // Standard Progressive Tier Calculation
    for (let i = 0; i < country.tiers.length; i++) {
      const tier = country.tiers[i];
      if (totalMonthlyKwh > tier.fromKwh) {
        const kwhInTier = Math.min(totalMonthlyKwh, tier.toKwh) - tier.fromKwh;
        const cost = kwhInTier * tier.ratePerKwh;
        energyCostMonthly += cost;
        tierBreakdown.push({
          tierName: tier.name,
          kwhInTier,
          ratePerKwh: tier.ratePerKwh,
          cost,
        });
        currentTierName = tier.name;
        currentTierIndex = i;

        if (totalMonthlyKwh <= tier.toKwh) {
          nextTierThreshold = tier.toKwh === Infinity ? null : tier.toKwh;
          kwhToNextTier = tier.toKwh === Infinity ? null : Math.max(0, tier.toKwh - totalMonthlyKwh);
        }
      }
    }
    appliedRatePerKwh = totalMonthlyKwh > 0 ? energyCostMonthly / totalMonthlyKwh : 0;
    capacityFeeMonthly = totalMonthlyKwh > 0 ? country.fixedChargeMonthly : 0;
    vatMonthly = (energyCostMonthly + capacityFeeMonthly) * ((country.vatPercentage || 0) / 100);
    municipalTaxMonthly = totalMonthlyKwh * (country.municipalTaxPerKwh || 0);
    transitionFundMonthly = totalMonthlyKwh * (country.transitionFundPerKwh || 0);
    totalCostBimonthly = (energyCostMonthly + capacityFeeMonthly + vatMonthly + municipalTaxMonthly + transitionFundMonthly) * 2;
    totalCostQuarterly = (energyCostMonthly + capacityFeeMonthly + vatMonthly + municipalTaxMonthly + transitionFundMonthly) * 3;
  } else {
    // Flat Rate
    const flatRate = country.tiers[0]?.ratePerKwh || 0.15;
    energyCostMonthly = totalMonthlyKwh * flatRate;
    appliedRatePerKwh = flatRate;
    tierBreakdown.push({
      tierName: 'سعر استهلاك موحد',
      kwhInTier: totalMonthlyKwh,
      ratePerKwh: flatRate,
      cost: energyCostMonthly,
    });
    currentTierName = 'تعرفة موحدة';
    currentTierIndex = 0;
    capacityFeeMonthly = totalMonthlyKwh > 0 ? country.fixedChargeMonthly : 0;
    vatMonthly = energyCostMonthly * ((country.vatPercentage || 0) / 100);
    totalCostBimonthly = (energyCostMonthly + capacityFeeMonthly + vatMonthly) * 2;
    totalCostQuarterly = (energyCostMonthly + capacityFeeMonthly + vatMonthly) * 3;
  }

  const fixedChargeMonthly = capacityFeeMonthly + rttTaxMonthly + housingTaxMonthly + tppanTaxMonthly + cleaningFeeMonthly;
  const totalCostMonthly =
    (country.code === 'MA' || country.specialRegime === 'MOROCCO_ONEE_2026')
      ? (energyCostMonthly + capacityFeeMonthly + capacityVatMonthly + tppanTaxMonthly)
      : (country.code === 'LY' || country.specialRegime === 'LIBYA_GECOL_2026')
      ? (energyCostMonthly + capacityFeeMonthly + stampTaxMonthly + cleaningFeeMonthly)
      : (energyCostMonthly + capacityFeeMonthly + capacityVatMonthly + energyVatMonthly +
         municipalTaxMonthly + transitionFundMonthly + rttTaxMonthly + housingTaxMonthly);

  const totalCostDaily = totalCostMonthly / 30.416;
  const totalCostYearly = totalCostMonthly * 12;
  const averageCostPerKwh = totalMonthlyKwh > 0 ? totalCostMonthly / totalMonthlyKwh : appliedRatePerKwh;

  // Breakdown per Appliance
  const applianceBreakdown = applianceUsageList.map(({ app, monthlyKwh }) => {
    const percentageOfTotal = totalMonthlyKwh > 0 ? (monthlyKwh / totalMonthlyKwh) * 100 : 0;
    const monthlyCost = totalCostMonthly * (percentageOfTotal / 100);

    return {
      id: app.id,
      name: app.name,
      category: app.category,
      iconName: app.iconName,
      monthlyKwh,
      monthlyCost,
      percentageOfTotal,
    };
  });

  applianceBreakdown.sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  // Natural Gas Calculation
  let gasCalculation: GasCalculationResult | undefined = undefined;
  let combinedTotalMonthly = totalCostMonthly;
  let combinedTotalBimonthly = totalCostBimonthly;
  let combinedTotalQuarterly = totalCostQuarterly;

  if (gasM3Monthly > 0 || ((country.code === 'MA' || country.code === 'LY') && (bottleCount12kg > 0 || bottleCount3kg > 0))) {
    gasCalculation = calculateGas(country, gasM3Monthly, bottleCount12kg, bottleCount3kg);
    combinedTotalMonthly += gasCalculation.totalCostMonthly;
    combinedTotalBimonthly += gasCalculation.totalCostBimonthly;
    combinedTotalQuarterly += (gasCalculation.totalCostQuarterly || gasCalculation.totalCostMonthly * 3);
  }

  return {
    totalMonthlyKwh,
    totalDailyKwh,
    totalYearlyKwh,
    totalPeriodicKwh: totalMonthlyKwh * (country.billingCycleMonths || (isAlgeria ? 3 : isTunisia ? 2 : 1)),
    appliedRatePerKwh,
    energyCostMonthly,
    capacityFeeMonthly,
    capacityVatMonthly,
    energyVatMonthly,
    vatMonthly,
    municipalTaxMonthly,
    transitionFundMonthly,
    rttTaxMonthly,
    tppanTaxMonthly,
    housingTaxMonthly,
    stampTaxMonthly,
    cleaningFeeMonthly,
    housingTaxQuarterly: country.housingTaxQuarterly,
    fixedChargeMonthly,
    totalCostMonthly,
    totalCostDaily,
    totalCostYearly,
    totalCostBimonthly,
    totalCostQuarterly,
    averageCostPerKwh,
    currentTierName: currentTierName || 'بدون استهلاك',
    currentTierIndex,
    nextTierThreshold,
    kwhToNextTier,
    isEconomicExempt,
    tierBreakdown,
    applianceBreakdown,
    gasCalculation,
    combinedTotalMonthly,
    combinedTotalBimonthly,
    combinedTotalQuarterly,
  };
}

/**
 * Format currency with appropriate decimals and symbol
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string,
  decimalPlaces: number = 2
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = safeAmount.toFixed(decimalPlaces);
  return `${formatted} ${currencySymbol}`;
}
