import { describe, it, expect } from 'vitest';
import { 
  calculateApplianceEffectiveWatts, 
  calculateApplianceKwh, 
  calculateBill, 
  calculateGas, 
  formatCurrency 
} from '../calculator';
import { COUNTRIES } from '../../data/countries';
import { Appliance, CountryProfile } from '../../types';

describe('KahrabaCalc Comprehensive Calculation Engine', () => {
  const tunisia = COUNTRIES.find((c) => c.code === 'TN')!;
  const algeria = COUNTRIES.find((c) => c.code === 'DZ')!;
  const morocco = COUNTRIES.find((c) => c.code === 'MA')!;
  const libya = COUNTRIES.find((c) => c.code === 'LY')!;
  const custom = COUNTRIES.find((c) => c.code === 'CUSTOM')!;

  describe('1. Appliance Physics and Effective Wattage', () => {
    it('applies 35% savings for Inverter air conditioners at standard 24°C', () => {
      const conventionalAC: Appliance = {
        id: 'ac_test_1',
        name: 'AC Conventional',
        category: 'cooling',
        iconName: 'AirVent',
        defaultWatts: 1200,
        watts: 1200,
        hoursPerDay: 8,
        daysPerWeek: 7,
        quantity: 1,
        enabled: true,
        isInverter: false,
        acTempSetting: 24,
      };

      const inverterAC: Appliance = {
        ...conventionalAC,
        id: 'ac_test_2',
        isInverter: true,
      };

      const convWatts = calculateApplianceEffectiveWatts(conventionalAC);
      const invWatts = calculateApplianceEffectiveWatts(inverterAC);

      expect(convWatts).toBe(1200);
      expect(invWatts).toBeCloseTo(1200 * 0.65, 1);
    });

    it('adjusts AC wattage by ~7% per degree delta from 24°C', () => {
      const acCold: Appliance = {
        id: 'ac_cold',
        name: 'AC Cold 20C',
        category: 'cooling',
        iconName: 'AirVent',
        defaultWatts: 1000,
        watts: 1000,
        hoursPerDay: 8,
        daysPerWeek: 7,
        quantity: 1,
        enabled: true,
        isInverter: false,
        acTempSetting: 20, // 4 degrees colder -> 1 + 4 * 0.07 = 1.28
      };

      const coldWatts = calculateApplianceEffectiveWatts(acCold);
      expect(coldWatts).toBeCloseTo(1280, 1);
    });

    it('handles refrigerator compressor duty cycle and energy classes correctly', () => {
      const fridgeA: Appliance = {
        id: 'fridge_test',
        name: 'Fridge A',
        category: 'refrigeration',
        iconName: 'Refrigerator',
        defaultWatts: 200,
        watts: 200,
        hoursPerDay: 24,
        daysPerWeek: 7,
        quantity: 1,
        enabled: true,
        dutyCycle: 0.35,
        energyClass: 'A',
      };

      const fridgeA3Plus: Appliance = {
        ...fridgeA,
        energyClass: 'A+++', // factor 0.72
      };

      const wattsA = calculateApplianceEffectiveWatts(fridgeA);
      const wattsA3Plus = calculateApplianceEffectiveWatts(fridgeA3Plus);

      expect(wattsA).toBeCloseTo(200 * 0.35, 1);
      expect(wattsA3Plus).toBeCloseTo(200 * 0.35 * 0.72, 1);
    });

    it('handles edge cases gracefully: 0 watts, negative watts, disabled appliance', () => {
      const zeroAppliance: Appliance = {
        id: 'zero',
        name: 'Zero',
        category: 'other',
        iconName: 'Zap',
        defaultWatts: 0,
        watts: 0,
        hoursPerDay: 5,
        daysPerWeek: 7,
        quantity: 1,
        enabled: true,
      };

      const negAppliance: Appliance = {
        ...zeroAppliance,
        watts: -500,
      };

      const disabledAppliance: Appliance = {
        ...zeroAppliance,
        watts: 1000,
        enabled: false,
      };

      expect(calculateApplianceEffectiveWatts(zeroAppliance)).toBe(0);
      expect(calculateApplianceEffectiveWatts(negAppliance)).toBe(0);
      expect(calculateApplianceKwh(disabledAppliance).monthlyKwh).toBe(0);
      expect(calculateApplianceKwh(zeroAppliance).monthlyKwh).toBe(0);
    });
  });

  describe('2. Tunisia STEG 2026 Tariff Verification', () => {
    const makeSingleAppliance = (monthlyKwhTarget: number): Appliance[] => {
      // dailyKwh = monthlyKwhTarget / 30.416
      // effectiveWatts = (dailyKwh * 1000) / 24
      const dailyKwh = monthlyKwhTarget / 30.416;
      const watts = (dailyKwh * 1000) / 24;
      return [
        {
          id: 'test_load',
          name: 'Calibrated Load',
          category: 'other',
          iconName: 'Zap',
          defaultWatts: watts,
          watts: watts,
          hoursPerDay: 24,
          daysPerWeek: 7,
          quantity: 1,
          enabled: true,
        },
      ];
    };

    it('Tier 1 (≤ 50 kWh): 62 millimes, exempt CL and FTE, 7% TVA', () => {
      const apps = makeSingleAppliance(45);
      const res = calculateBill(apps, tunisia);

      expect(res.appliedRatePerKwh).toBe(0.062);
      expect(res.isEconomicExempt).toBe(true);
      expect(res.municipalTaxMonthly).toBe(0);
      expect(res.transitionFundMonthly).toBe(0);
      expect(res.rttTaxMonthly).toBe(3.5);
      // Capacity fee: 5 kVA * 0.700 = 3.500 DT
      expect(res.capacityFeeMonthly).toBeCloseTo(3.5, 2);
    });

    it('Tier 2 (51 - 100 kWh): 96 millimes on entire volume, exempt CL and FTE', () => {
      const apps = makeSingleAppliance(90);
      const res = calculateBill(apps, tunisia);

      expect(res.appliedRatePerKwh).toBe(0.096);
      expect(res.isEconomicExempt).toBe(true);
      expect(res.municipalTaxMonthly).toBe(0);
      expect(res.transitionFundMonthly).toBe(0);
      expect(res.energyCostMonthly).toBeCloseTo(90 * 0.096, 1);
    });

    it('Tier 3 (101 - 200 kWh): 176 millimes on entire volume, CL and FTE apply (5 millimes each)', () => {
      const apps = makeSingleAppliance(150);
      const res = calculateBill(apps, tunisia);

      expect(res.appliedRatePerKwh).toBe(0.176);
      expect(res.isEconomicExempt).toBe(false);
      expect(res.municipalTaxMonthly).toBeCloseTo(150 * 0.005, 2);
      expect(res.transitionFundMonthly).toBeCloseTo(150 * 0.005, 2);
      expect(res.energyCostMonthly).toBeCloseTo(150 * 0.176, 1);
    });

    it('Tier 5 (301 - 500 kWh): 341 millimes on entire volume, TVA increases to 13%', () => {
      const apps = makeSingleAppliance(400);
      const res = calculateBill(apps, tunisia);

      expect(res.appliedRatePerKwh).toBe(0.341);
      expect(res.energyVatMonthly).toBeCloseTo(400 * 0.341 * 0.13, 1);
    });
  });

  describe('3. Algeria Sonelgaz 2026 Tariff Verification (Code 54M)', () => {
    const makeSingleAppliance = (monthlyKwhTarget: number): Appliance[] => {
      const dailyKwh = monthlyKwhTarget / 30.416;
      const watts = (dailyKwh * 1000) / 24;
      return [
        {
          id: 'dz_load',
          name: 'Calibrated Load DZ',
          category: 'other',
          iconName: 'Zap',
          defaultWatts: watts,
          watts: watts,
          hoursPerDay: 24,
          daysPerWeek: 7,
          quantity: 1,
          enabled: true,
        },
      ];
    };

    it('calculates quarterly progressive tranches with 9% and 19% TVA', () => {
      // 100 kWh monthly = 300 kWh quarterly
      // Tranche 1: 125 kWh @ 1.7787 (9% TVA)
      // Tranche 2: 125 kWh @ 4.1789 (9% TVA)
      // Tranche 3: 50 kWh @ 4.8120 (19% TVA)
      const apps = makeSingleAppliance(100);
      const res = calculateBill(apps, algeria);

      const expectedQCost = (125 * 1.7787) + (125 * 4.1789) + (50 * 4.8120);
      expect(res.energyCostMonthly * 3).toBeCloseTo(expectedQCost, 1);

      // Housing tax from 2026 Finance Law: 400 DZD per quarter
      expect(res.housingTaxMonthly * 3).toBeCloseTo(400, 1);

      // Contracted power: 6 kW * 4.37 = 26.22 DZD monthly
      expect(res.capacityFeeMonthly).toBeCloseTo(26.22, 2);
    });
  });

  describe('4. Morocco ONEE 2026 Tariff Verification', () => {
    const makeSingleAppliance = (monthlyKwhTarget: number): Appliance[] => {
      const dailyKwh = monthlyKwhTarget / 30.416;
      const watts = (dailyKwh * 1000) / 24;
      return [
        {
          id: 'ma_load',
          name: 'Calibrated Load MA',
          category: 'other',
          iconName: 'Zap',
          defaultWatts: watts,
          watts: watts,
          hoursPerDay: 24,
          daysPerWeek: 7,
          quantity: 1,
          enabled: true,
        },
      ];
    };

    it('applies progressive slab for monthly consumption <= 150 kWh', () => {
      // 120 kWh: Tranche 1 (100 kWh @ 0.9010) + Tranche 2 (20 kWh @ 1.0732)
      const apps = makeSingleAppliance(120);
      const res = calculateBill(apps, morocco);

      const expectedEnergyCost = (100 * 0.9010) + (20 * 1.0732);
      expect(res.energyCostMonthly).toBeCloseTo(expectedEnergyCost, 1);
      // TPPAN fee between 101 and 200 kWh = 10 MAD
      expect(res.tppanTaxMonthly).toBe(10.0);
    });

    it('switches to selective billing on entire consumption when exceeding 150 kWh', () => {
      // 180 kWh: in Tranche 3 (151 - 200) -> 1.0732 applied on ALL 180 kWh
      const apps = makeSingleAppliance(180);
      const res = calculateBill(apps, morocco);

      expect(res.appliedRatePerKwh).toBe(1.0732);
      expect(res.energyCostMonthly).toBeCloseTo(180 * 1.0732, 1);
    });
  });

  describe('5. Libya GECOL 2026 Tariff Verification (Decision 92 of 2023)', () => {
    const makeSingleAppliance = (monthlyKwhTarget: number): Appliance[] => {
      const dailyKwh = monthlyKwhTarget / 30.416;
      const watts = (dailyKwh * 1000) / 24;
      return [
        {
          id: 'ly_load',
          name: 'Calibrated Load LY',
          category: 'other',
          iconName: 'Zap',
          defaultWatts: watts,
          watts: watts,
          hoursPerDay: 24,
          daysPerWeek: 7,
          quantity: 1,
          enabled: true,
        },
      ];
    };

    it('applies 25 dirhams (0.025 LYD) for domestic salary deduction', () => {
      const apps = makeSingleAppliance(500);
      const res = calculateBill(apps, libya);

      expect(res.appliedRatePerKwh).toBe(0.025);
      expect(res.energyCostMonthly).toBeCloseTo(500 * 0.025, 2);
      expect(res.capacityFeeMonthly).toBe(3.0); // 3.000 LYD service fee
      expect(res.stampTaxMonthly).toBeCloseTo(res.energyCostMonthly * 0.015, 3);
      expect(res.cleaningFeeMonthly).toBe(1.5);
      expect(res.vatMonthly).toBe(0); // 0% VAT in Libya
    });

    it('switches to 40 dirhams (0.040 LYD) when cash payment is selected', () => {
      const cashLibya: CountryProfile = {
        ...libya,
        libyaPaymentType: 'cash',
      };
      const apps = makeSingleAppliance(500);
      const res = calculateBill(apps, cashLibya);

      expect(res.appliedRatePerKwh).toBe(0.040);
      expect(res.energyCostMonthly).toBeCloseTo(500 * 0.040, 2);
    });
  });

  describe('6. Natural Gas and Bottled Gas Calculations', () => {
    it('calculates Tunisia STEG low pressure natural gas (BP1)', () => {
      // 25 m3: in tier 1 (0-30 m3) @ 0.231 TND, exempt from FTE Gaz
      const res = calculateGas(tunisia, 25);
      expect(res.ratePerUnit).toBe(0.231);
      expect(res.isExemptFte).toBe(true);
      expect(res.flowFeeMonthly).toBe(0.350);
      expect(res.totalCostMonthly).toBeGreaterThan(25 * 0.231);
    });

    it('calculates Algeria Sonelgaz gas (Code 23M) in Thermies', () => {
      // 100 m3 = 300 m3 quarterly = 2940 Thermies quarterly
      const res = calculateGas(algeria, 100);
      expect(res.unitType).toBe('thermie');
      expect(res.quarterlyThermie).toBeCloseTo(100 * 3 * 9.8, 1);
      expect(res.totalCostQuarterly).toBeGreaterThan(0);
    });

    it('calculates Morocco subsidized butane gas bottles (50 MAD per 12kg bottle)', () => {
      const res = calculateGas(morocco, 0, 3, 1); // 3 large (12kg) + 1 small (3kg)
      expect(res.unitType).toBe('bottle');
      expect(res.energyCostMonthly).toBe(3 * 50.0 + 1 * 12.5);
      expect(res.totalCostMonthly).toBe(162.5);
    });

    it('calculates Libya Brega domestic gas cylinders (3.000 LYD per 15kg cylinder)', () => {
      const res = calculateGas(libya, 0, 2, 1); // 2 large (15kg) + 1 small (5kg)
      expect(res.unitType).toBe('bottle');
      expect(res.energyCostMonthly).toBe(2 * 3.0 + 1 * 2.0);
      expect(res.totalCostMonthly).toBe(8.0);
    });
  });

  describe('7. Currency Formatting and Defensive Math', () => {
    it('formats currencies cleanly with correct decimals and symbols', () => {
      expect(formatCurrency(12.3456, 'د.ت', 3)).toBe('12.346 د.ت');
      expect(formatCurrency(12.3456, 'د.ج', 2)).toBe('12.35 د.ج');
      expect(formatCurrency(12.3456, 'د.م', 2)).toBe('12.35 د.م');
      expect(formatCurrency(12.3456, 'د.ل', 3)).toBe('12.346 د.ل');
      expect(formatCurrency(NaN, 'د.ت', 3)).toBe('0.000 د.ت');
    });

    it('handles all appliances disabled without NaN or crash', () => {
      const emptyApps: Appliance[] = [];
      const res = calculateBill(emptyApps, tunisia);

      expect(res.totalMonthlyKwh).toBe(0);
      expect(res.totalCostMonthly).toBe(0);
      expect(Number.isFinite(res.averageCostPerKwh)).toBe(true);
    });
  });
});
