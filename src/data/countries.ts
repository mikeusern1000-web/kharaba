import { CountryProfile } from '../types';

export const COUNTRIES: CountryProfile[] = [
  {
    code: 'TN',
    name: 'تونس (الشركة التونسية للكهرباء والغاز - STEG 2026)',
    nameEn: 'Tunisia (STEG 2026)',
    flag: '🇹🇳',
    currency: 'TND',
    currencySymbol: 'د.ت',
    decimalPlaces: 3,
    billingCycleMonths: 2, // فاتورة شتغ ثنائية الأشهر (Bimestrielle)
    meterKva: 5, // عداد قياسي منزلي 5 kVA
    fixedChargeMonthly: 3.500, // معلوم القدرة = 0.700 د.ت × 5 kVA
    municipalTaxPerKwh: 0.005, // معلوم الجماعات المحلية CL (5 مليم، معفى <= 100)
    vatPercentage: 7, // 7% أو 13% حسب تجاوز 300 ك.و.س
    transitionFundPerKwh: 0.005, // صندوق الانتقال الطاقي FTE (5 مليم، معفى <= 100)
    rttFeeMonthly: 3.500, // معلوم مؤسسة الإذاعة والتلفزة التونسية RTT
    isTiered: true,
    specialRegime: 'TUNISIA_STEG_2026',
    officialUtility: 'الشركة التونسية للكهرباء والغاز (STEG)',
    regulatoryAuthority: 'وزارة الصناعة والمناجم والطاقة',
    legalReference: 'مقرر وزير الصناعة والمناجم والطاقة وجدول تعرفة STEG الرسمية للجهد المنخفض',
    effectiveDate: 'سارية المفعول (2022 - 2026)',
    verificationStatus: 'VERIFIED',
    uncertainties: 'معلوم الجماعات المحلية (CL) وصندوق الانتقال الطاقي (FTE) معفيان لاستهلاك ≤ 100 ك.و.س. معلوم RTT قار 3.500 د.ت شهرياً (7.000 د.ت بالفاتورة الثنائية).',
    notes: 'نظام STEG الرسمي 2026: السعر الموحد للشريحة على كامل كمية الاستهلاك، معلوم القدرة 700 مليم/kVA، إعفاء CL وFTE للاستهلاك ≤ 100 ك.و.س، وTVA متدرجة (7% أو 13% + 19% على الاشتراك).',
    tiers: [
      {
        id: 'tn_t1',
        name: 'الشريحة 1 (من 0 إلى 50 ك.و.س)',
        fromKwh: 0,
        toKwh: 50,
        ratePerKwh: 0.062,
        description: '62 مليماً / ك.و.س (تعرفة اجتماعية اقتصادية)',
        meterPower: '1 - 2 kVA',
      },
      {
        id: 'tn_t2',
        name: 'الشريحة 2 (من 51 إلى 100 ك.و.س)',
        fromKwh: 50,
        toKwh: 100,
        ratePerKwh: 0.096,
        description: '96 مليماً / ك.و.س (نطاق اقتصادي محمي، معفى من CL وFTE)',
        meterPower: '1 - 2 kVA',
      },
      {
        id: 'tn_t3',
        name: 'الشريحة 3 (من 101 إلى 200 ك.و.س)',
        fromKwh: 100,
        toKwh: 200,
        ratePerKwh: 0.176,
        description: '176 مليماً / ك.و.س (سقوط الحق في السعر الاقتصادي لكامل الفاتورة)',
        meterPower: '> 2 kVA',
      },
      {
        id: 'tn_t4',
        name: 'الشريحة 4 (من 201 إلى 300 ك.و.س)',
        fromKwh: 200,
        toKwh: 300,
        ratePerKwh: 0.218,
        description: '218 مليماً / ك.و.س (الشريحة الأكثر شيوعاً للعائلات المتوسطة)',
        meterPower: '> 2 kVA',
      },
      {
        id: 'tn_t5',
        name: 'الشريحة 5 (من 301 إلى 500 ك.و.س)',
        fromKwh: 300,
        toKwh: 500,
        ratePerKwh: 0.341,
        description: '341 مليماً / ك.و.س (استهلاك مرتفع - ترتفع TVA إلى 13%)',
        meterPower: '> 2 kVA',
      },
      {
        id: 'tn_t6',
        name: 'الشريحة 6 (ما فوق 500 ك.و.س)',
        fromKwh: 500,
        toKwh: Infinity,
        ratePerKwh: 0.414,
        description: '414 مليماً / ك.و.س (استهلاك كثيف جداً وتكييف متواصل)',
        meterPower: '> 2 kVA',
      },
    ],
  },
  {
    code: 'DZ',
    name: 'الجزائر (سونلغاز - Sonelgaz / CREG 2026)',
    nameEn: 'Algeria (Sonelgaz 2026)',
    flag: '🇩🇿',
    currency: 'DZD',
    currencySymbol: 'د.ج',
    decimalPlaces: 2,
    billingCycleMonths: 3, // فاتورة ثلاثية ربع سنوية (كل 3 أشهر / Trimestrielle)
    meterKva: 6,
    meterKwPower: 6, // استطاعة الاشتراك التعاقدية (الافتراضي 6 كيلوواط)
    fixedChargeMonthly: 26.22, // 4.37 دج لكل kW شهرياً (78.66 دج في الفاتورة الثلاثية)
    municipalTaxPerKwh: 0,
    vatPercentage: 9, // 9% للأشطر 1 و 2، و 19% للأشطر 3 و 4
    transitionFundPerKwh: 0,
    rttFeeMonthly: 0,
    housingTaxQuarterly: 400.0, // الرسم على السكن بموجب قانون المالية 2026 (400 دج أو 800 دج في الثلاثي)
    isTiered: true,
    specialRegime: 'ALGERIA_SONELGAZ_2026',
    officialUtility: 'الشركة الوطنية للكهرباء والغاز (سونلغاز - Sonelgaz)',
    regulatoryAuthority: 'لجنة ضبط الكهرباء والغاز (CREG)',
    legalReference: 'قرار CREG رقم D/01-16 (كود 54M) والمادة 94 من قانون المالية لسنة 2026',
    effectiveDate: 'سارية المفعول (تعريفة 54M المعتمدة والمحدثة بقانون المالية 2026)',
    verificationStatus: 'VERIFIED',
    uncertainties: 'الفاتورة ثلاثية (كل 3 أشهر). الرسم على السكن 400 دج للثلاثي للسكن الحضري/الفردي أو 800 دج للمناطق التجارية.',
    notes: 'نظام الأشطر التصاعدية لسونلغاز (كود 54M) المعتمد من CREG: فاتورة ثلاثية (كل 3 أشهر)، TVA مخفضة 9% للشطرين 1 و 2 و19% للشطرين 3 و 4، ورسم السكن المحدث بقانون المالية 2026 (400 دج).',
    tiers: [
      {
        id: 'dz_t1',
        name: 'الشطر الأول (من 0 إلى 125 ك.و.س / ثلاثي)',
        fromKwh: 0,
        toKwh: 125, // لكل ثلاثي (أي ~41.7 ك.و.س/شهر)
        ratePerKwh: 1.7787,
        vatRate: 9,
        description: '1.7787 دج / ك.و.س (مدعوم جداً - TVA 9%)',
      },
      {
        id: 'dz_t2',
        name: 'الشطر الثاني (من 126 إلى 250 ك.و.س / ثلاثي)',
        fromKwh: 125,
        toKwh: 250, // لكل ثلاثي (أي ~83.3 ك.و.س/شهر)
        ratePerKwh: 4.1789,
        vatRate: 9,
        description: '4.1789 دج / ك.و.س (TVA 9%)',
      },
      {
        id: 'dz_t3',
        name: 'الشطر الثالث (من 251 إلى 1000 ك.و.س / ثلاثي)',
        fromKwh: 250,
        toKwh: 1000, // لكل ثلاثي (أي ~333.3 ك.و.س/شهر)
        ratePerKwh: 4.8120,
        vatRate: 19,
        description: '4.8120 دج / ك.و.س (TVA 19%)',
      },
      {
        id: 'dz_t4',
        name: 'الشطر الرابع (ما يفوق 1000 ك.و.س / ثلاثي)',
        fromKwh: 1000,
        toKwh: Infinity,
        ratePerKwh: 5.4796,
        vatRate: 19,
        description: '5.4796 دج / ك.و.س (استهلاك مرتفع - TVA 19%)',
      },
    ],
  },

  {
    code: 'MA',
    name: 'المغرب (المكتب الوطني للكهرباء والماء الصالح للشرب - ONEE 2026)',
    nameEn: 'Morocco (ONEE 2026)',
    flag: '🇲🇦',
    currency: 'MAD',
    currencySymbol: 'د.م',
    decimalPlaces: 2,
    billingCycleMonths: 1, // فاتورة شهرية
    meterKva: 5,
    fixedChargeMonthly: 15.0, // الإتاوة الثابتة للعداد (Redevance fixe)
    municipalTaxPerKwh: 0,
    vatPercentage: 18, // ضريبة القيمة المضافة 18% (مدمجة في أسعار الأشطر TTC)
    transitionFundPerKwh: 0,
    rttFeeMonthly: 0,
    tppanFeeMonthly: 10.0, // رسم الترويج السمعي البصري TPPAN (معفى إذا ≤ 100 ك.و.س)
    isTiered: true,
    specialRegime: 'MOROCCO_ONEE_2026',
    officialUtility: 'المكتب الوطني للكهرباء والماء الصالح للشرب (ONEE - قطاع الكهرباء)',
    regulatoryAuthority: 'وزارة الانتقال الطاقي والتنمية المستدامة / الوكالة الوطنية لتقنين الكهرباء (ANRE)',
    legalReference: 'قرار وزير الطاقة والمعادن والماء والبيئة رقم 2451-14 والجريدة الرسمية رقم 6275 مكرر وقرارات صندوق المقاصة 2024-2026',
    effectiveDate: 'سارية المفعول (نظام الفوترة الهجين لـ ONEE وقنينات البوطا المحدثة)',
    verificationStatus: 'VERIFIED',
    uncertainties: 'الفوترة تدريجية ≤ 150 ك.و.س ثم انتقائية على كامل الكمية > 150 ك.و.س. إتاوة العداد قد تختلف طفيفاً باختلاف الوكالة المفوضة لتوزيع الكهرباء.',
    notes: 'التعريفة الرسمية لـ ONEE لعام 2026: نظام هجين يجمع بين الفوترة التدريجية (إذا كان الاستهلاك ≤ 150 ك.و.س) والفوترة الانتقائية بسعر الشطر الأعلى على كامل الاستهلاك (إذا تجاوز 150 ك.و.س). الأسعار شاملة لضريبة TVA بنسبة 18%.',
    tiers: [
      {
        id: 'ma_t1',
        name: 'الشطر الأول (من 0 إلى 100 ك.و.س)',
        fromKwh: 0,
        toKwh: 100,
        ratePerKwh: 0.9010,
        description: '0.9010 درهم / ك.و.س (فوترة تدريجية - استهلاك اجتماعي واقتصادي)',
      },
      {
        id: 'ma_t2',
        name: 'الشطر الثاني (من 101 إلى 150 ك.و.س)',
        fromKwh: 100,
        toKwh: 150,
        ratePerKwh: 1.0732,
        description: '1.0732 درهم / ك.و.س (فوترة تدريجية للأسر المتوسطة)',
      },
      {
        id: 'ma_t3',
        name: 'الشطر الثالث (من 151 إلى 200 ك.و.س)',
        fromKwh: 150,
        toKwh: 200,
        ratePerKwh: 1.0732,
        description: '1.0732 درهم / ك.و.س (فوترة انتقائية: سقوط التدرج وتطبيق السعر على كامل الكمية)',
      },
      {
        id: 'ma_t4',
        name: 'الشطر الرابع (من 201 إلى 300 ك.و.س)',
        fromKwh: 200,
        toKwh: 300,
        ratePerKwh: 1.1676,
        description: '1.1676 درهم / ك.و.س (فوترة انتقائية على كامل كمية الاستهلاك)',
      },
      {
        id: 'ma_t5',
        name: 'الشطر الخامس (من 301 إلى 500 ك.و.س)',
        fromKwh: 300,
        toKwh: 500,
        ratePerKwh: 1.3817,
        description: '1.3817 درهم / ك.و.س (استهلاك مرتفع - فوترة انتقائية على كامل الكمية)',
      },
      {
        id: 'ma_t6',
        name: 'الشطر السادس (ما فوق 500 ك.و.س)',
        fromKwh: 500,
        toKwh: Infinity,
        ratePerKwh: 1.5958,
        description: '1.5958 درهم / ك.و.س (استهلاك مكثف وتكييف - فوترة انتقائية)',
      },
    ],
  },
  {
    code: 'LY',
    name: 'ليبيا (الشركة العامة للكهرباء - GECOL)',
    nameEn: 'Libya (GECOL)',
    flag: '🇱🇾',
    currency: 'LYD',
    currencySymbol: 'د.ل',
    decimalPlaces: 3,
    billingCycleMonths: 1, // فاتورة شهرية
    meterKva: 5,
    fixedChargeMonthly: 3.0, // رسوم الخدمة والكشف الإداري الدوري
    municipalTaxPerKwh: 0,
    vatPercentage: 0, // لا توجد ضريبة قيمة مضافة على الكهرباء في ليبيا
    transitionFundPerKwh: 0,
    rttFeeMonthly: 0,
    stampTaxPercentage: 1.5, // رسم الدمغة المالية (1.5% وفق قانون ضرائب الدمغة الليبي)
    cleaningFeeMonthly: 1.5, // رسم النظافة والخدمات المحلية للبلديات
    libyaPaymentType: 'salary_deduction',
    isTiered: false, // تعرفة موحدة حسب الفئة طبقا لقرار مجلس الوزراء رقم 92 لسنة 2023
    specialRegime: 'LIBYA_GECOL_2026',
    officialUtility: 'الشركة العامة للكهرباء (GECOL)',
    regulatoryAuthority: 'مجلس الوزراء بحكومة الوحدة الوطنية / الشركة العامة للكهرباء',
    legalReference: 'قرار مجلس الوزراء رقم 92 لسنة 2023 بشأن تعرفة بيع الطاقة ولائحة تكاليف التوصيل',
    effectiveDate: 'سارية المفعول (قرار 92 لسنة 2023 - 2026)',
    verificationStatus: 'VERIFIED',
    uncertainties: 'التعريفة موحدة قطاعياً حسب النشاط ونوع السداد (أقساط 25 درهماً أو نقدي 40 درهماً). رسوم الدمغة المالية ورسوم النظافة مضافة وفق اللوائح المحلية.',
    notes: 'التعريفة الرسمية المقررة بقرار مجلس الوزراء رقم 92 لسنة 2023: المنزلي (خصم من المرتب) 25 درهماً (0.025 د.ل)، المنزلي (كاش) 40 درهماً (0.040 د.ل)، التجاري 80 درهماً (0.080 د.ل)، الصناعي الخفيف 60 درهماً (0.060 د.ل)، مع رسوم الدمغة المالية ورسوم النظافة.',
    tiers: [
      {
        id: 'ly_home_salary',
        name: 'منزلي (خصم من المرتب / نظام الأقساط)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.025,
        description: '25 درهماً / ك.و.س (0.025 د.ل - الخيار الأكثر توفيراً للأسر)',
      },
      {
        id: 'ly_home_cash',
        name: 'منزلي (السداد النقدي / كاش)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.040,
        description: '40 درهماً / ك.و.س (0.040 د.ل)',
      },
      {
        id: 'ly_commercial',
        name: 'تجاري (المحلات والأنشطة الصغيرة)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.080,
        description: '80 درهماً / ك.و.س (0.080 د.ل)',
      },
      {
        id: 'ly_industrial_light',
        name: 'صناعي خفيف (ورش ومصانع صغرى)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.060,
        description: '60 درهماً / ك.و.س (0.060 د.ل)',
      },
      {
        id: 'ly_industrial_heavy',
        name: 'صناعي ثقيل',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.045,
        description: '45 درهماً / ك.و.س (0.045 د.ل)',
      },
      {
        id: 'ly_agricultural_small',
        name: 'زراعي (صغار المربين والمزارعين)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.040,
        description: '40 درهماً / ك.و.س (0.040 د.ل)',
      },
      {
        id: 'ly_agricultural_large',
        name: 'زراعي (المشاريع الزراعية الكبرى)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.045,
        description: '45 درهماً / ك.و.س (0.045 د.ل)',
      },
      {
        id: 'ly_public_lighting',
        name: 'المرافق العامة وإنارة الشوارع',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 0.135,
        description: '135 درهماً / ك.و.س (0.135 د.ل)',
      },
      {
        id: 'ly_mega_consumers',
        name: 'كبار المستهلكين (أحمال فوق 0.5 ميجاوات في ساعات الذروة)',
        fromKwh: 0,
        toKwh: Infinity,
        ratePerKwh: 1.000,
        description: '1000 درهم / ك.و.س (1.000 د.ل)',
      },
    ],
  },
  {
    code: 'CUSTOM',
    name: 'دولة أخرى / تعرفة مخصصة',
    nameEn: 'Custom / Other Country',
    flag: '🌐',
    currency: 'USD',
    currencySymbol: '$',
    decimalPlaces: 2,
    billingCycleMonths: 1,
    meterKva: 5,
    fixedChargeMonthly: 5.0,
    municipalTaxPerKwh: 0,
    vatPercentage: 0,
    transitionFundPerKwh: 0,
    rttFeeMonthly: 0,
    isTiered: false,
    officialUtility: 'مزود طاقة أو تعرفة يدوية',
    regulatoryAuthority: 'إدخال المستخدم اليدوي',
    legalReference: 'تعرفة مخصصة غير مقيدة بدولة معينة',
    effectiveDate: 'غير محدد',
    verificationStatus: 'UNVERIFIED',
    uncertainties: 'هذه التعرفة افتراضية وقابلة للتعديل بحسب رغبة المستخدم.',
    notes: 'سعر موحد قابل للتعديل يدويًا يناسب أي دولة أو مزود طاقة خاص.',
    tiers: [
      { id: 'custom_flat', name: 'سعر الكيلوواط الساعي الموحد', fromKwh: 0, toKwh: Infinity, ratePerKwh: 0.15 },
    ],
  },
];

// Official 2026 STEG Natural Gas (Tunisia - Gaz Naturel Basse Pression BP1)
export const STEG_GAS_TIERS = [
  {
    id: 'gas_t1',
    name: 'الشريحة 1 (الاستهلاك المدعم: 0 - 30 م³)',
    fromM3: 0,
    toM3: 30,
    ratePerM3: 0.231, // 231 مليم / م³
    description: '231 مليماً / م³ (معفى من معلوم FTE Gaz)',
  },
  {
    id: 'gas_t2',
    name: 'الشريحة 2 (الاستهلاك المتوسط: 31 - 60 م³)',
    fromM3: 30,
    toM3: 60,
    ratePerM3: 0.368, // 368 مليم / م³
    description: '368 مليماً / م³',
  },
  {
    id: 'gas_t3',
    name: 'الشريحة 3 (الاستهلاك المرتفع: 61 - 150 م³)',
    fromM3: 60,
    toM3: 150,
    ratePerM3: 0.556, // 556 مليم / م³
    description: '556 مليماً / م³',
  },
  {
    id: 'gas_t4',
    name: 'الشريحة 4 (الاستهلاك المكثف: ما فوق 150 م³)',
    fromM3: 150,
    toM3: Infinity,
    ratePerM3: 0.824, // 824 مليم / م³
    description: '824 مليماً / م³',
  },
];

// Official Sonelgaz Natural Gas (Algeria - Gaz Naturel Basse Pression 23M)
// Measured in Thermies (ثرمية) per quarter (ثلاثي)
export const SONELGAZ_GAS_TIERS = [
  {
    id: 'dz_gas_t1',
    name: 'الشطر الأول (من 0 إلى 1125 ثرمية / ثلاثي)',
    fromThermie: 0,
    toThermie: 1125,
    ratePerThermie: 0.1682, // 16.82 سنتيم
    vatRate: 9,
    description: '0.1682 دج / ثرمية (TVA 9%)',
  },
  {
    id: 'dz_gas_t2',
    name: 'الشطر الثاني (من 1126 إلى 2500 ثرمية / ثلاثي)',
    fromThermie: 1125,
    toThermie: 2500,
    ratePerThermie: 0.3245, // 32.45 سنتيم
    vatRate: 9,
    description: '0.3245 دج / ثرمية (TVA 9%)',
  },
  {
    id: 'dz_gas_t3',
    name: 'الشطر الثالث (من 2501 إلى 7500 ثرمية / ثلاثي)',
    fromThermie: 2500,
    toThermie: 7500,
    ratePerThermie: 0.4025, // 40.25 سنتيم
    vatRate: 19,
    description: '0.4025 دج / ثرمية (TVA 19%)',
  },
  {
    id: 'dz_gas_t4',
    name: 'الشطر الرابع (ما يفوق 7500 ثرمية / ثلاثي)',
    fromThermie: 7500,
    toThermie: Infinity,
    ratePerThermie: 0.4599, // 45.99 سنتيم
    vatRate: 19,
    description: '0.4599 دج / ثرمية (TVA 19%)',
  },
];

// Official Subsidized Butane Gas Bottles (Morocco - قنينات غاز البوتان / البوطا)
export const MOROCCO_GAS_BOTTLES = [
  {
    id: 'bottle_12kg',
    name: 'قنينة غاز البوتان الكبيرة (12 كلغ)',
    shortName: 'بوطا كبيرة 12 كغ',
    weightKg: 12,
    priceMad: 50.0, // السعر الرسمي المدعوم لعام 2026
    description: 'الأكثر استعمالاً في المنازل المغربية للطهي وسخانات الماء (البالون).',
  },
  {
    id: 'bottle_3kg',
    name: 'قنينة غاز البوتان الصغيرة (3 كلغ)',
    shortName: 'بوطا صغيرة 3 كغ',
    weightKg: 3,
    priceMad: 12.5, // 12.50 درهم
    description: 'مخصصة للاستعمال الخفيف والمطابخ الصغيرة والرحلات.',
  },
];

// Official Administrative & Technical Fees (Libya GECOL - الرسوم الإدارية والفنية لتقديم الخدمة)
export const LIBYA_GECOL_SERVICES = [
  { name: 'رسم تركيب العداد', fee: 3.0, description: 'مطبق على كافة أنواع العدادات والتزويد' },
  { name: 'رسم الكشف الميداني (إنارة منزلية)', fee: 3.0, description: 'معاينة الموقع والتوصيل المنزلي' },
  { name: 'رسم فحص العداد', fee: 3.0, description: 'بناءً على طلب المشترك للتأكد من سلامته' },
  { name: 'رسم إعادة ربط التيار الكهربائي', fee: 5.0, description: 'يُدفع بعد انقطاع التيار بسبب الديون أو المخالفات' },
  { name: 'رسم نقل العداد داخل نفس المبنى', fee: 5.0, description: 'تعديل مكان العداد داخل العقار' },
  { name: 'رسم استبدال العداد لزيادة الأحمال', fee: 5.0, description: 'تغيير العداد لرفع القدرة الكهربائية' },
  { name: 'رسم كشف قوة محركة (صناعي/زراعي)', fee: 5.0, description: 'معاينة الأحمال العالية والمحركات' },
];

// Domestic Liquefied Gas Cylinders (Libya - أسطوانات غاز الطهي المنزلية / البريقة)
export const LIBYA_GAS_CYLINDERS = [
  {
    id: 'ly_gas_15kg',
    name: 'أسطوانة غاز الطهي المنزلية (15 كلغ)',
    shortName: 'أسطوانة 15 كغ (غاز البريقة)',
    weightKg: 15,
    officialPriceLyd: 3.0, // السعر الرسمي المدعوم بمستودعات البريقة (3 - 5 د.ل)
    description: 'أسطوانة الغاز المنزلية الأساسية للطهي والمخابز وتسخين الماء.',
  },
  {
    id: 'ly_gas_5kg',
    name: 'أسطوانة غاز الطهي الصغيرة (5 كلغ)',
    shortName: 'أسطوانة 5 كغ (رحلات واستعمال خفيف)',
    weightKg: 5,
    officialPriceLyd: 2.0, // 2 د.ل
    description: 'مخصصة للرحلات والمطابخ الصغيرة والتخييم.',
  },
];


