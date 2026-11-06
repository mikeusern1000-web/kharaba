import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  AirVent, 
  Refrigerator, 
  Shirt, 
  Flame, 
  Tv, 
  Lightbulb, 
  Utensils, 
  Fan, 
  ChefHat, 
  Waves, 
  Coffee, 
  Monitor, 
  Laptop, 
  Wifi, 
  Sparkles, 
  Droplets, 
  Snowflake, 
  Wind,
  Zap
} from 'lucide-react';
import { Appliance, ApplianceCategory } from '../types';
import { PRESET_CATALOG } from '../data/appliances';

interface AddApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (appliance: Appliance) => void;
}

const CATEGORIES: { id: ApplianceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'cooling', label: 'تكييف ومراوح' },
  { id: 'refrigeration', label: 'ثلاجات ومجمدات' },
  { id: 'laundry', label: 'غسيل وتنظيف' },
  { id: 'kitchen', label: 'مطبخ وأفران' },
  { id: 'water_heating', label: 'سخانات ماء' },
  { id: 'electronics', label: 'إلكترونيات وشاشات' },
  { id: 'lighting', label: 'إنارة' },
  { id: 'other', label: 'أجهزة أخرى' },
];

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

export const AddApplianceModal: React.FC<AddApplianceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ApplianceCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');

  // Custom device form state
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState(500);
  const [customHours, setCustomHours] = useState(4);
  const [customDays, setCustomDays] = useState(7);
  const [customCategory, setCustomCategory] = useState<ApplianceCategory>('other');

  const filteredPresets = PRESET_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectPreset = (preset: (typeof PRESET_CATALOG)[0]) => {
    const newAppliance: Appliance = {
      ...preset,
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    onAdd(newAppliance);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newAppliance: Appliance = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      iconName: 'Zap',
      defaultWatts: customWatts,
      watts: customWatts,
      hoursPerDay: customHours,
      daysPerWeek: customDays,
      quantity: 1,
      enabled: true,
      customNote: 'جهاز مخصص',
    };
    onAdd(newAppliance);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-appliance-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 id="add-appliance-title" className="text-base font-bold text-white">
              إضافة جهاز إلى حاسبة الكهرباء
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              اختر من قائمة الأجهزة الجاهزة أو أضف جهازاً مخصصاً بقدرة محددة
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق نافذة إضافة جهاز"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Catalog vs Custom */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'catalog'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            كتالوج الأجهزة المنزلية الجاهزة
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            إضافة جهاز مخصص يدويًا
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'catalog' ? (
            <div className="space-y-4">
              
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث عن جهاز (مكيف، ثلاجة، غسالة، تلفاز، فرن...)"
                  aria-label="البحث عن جهاز في الكتالوج"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pt-1">
                {filteredPresets.map((preset, idx) => {
                  const Icon = ICON_MAP[preset.iconName] || Zap;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-right transition-all flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-900 group-hover:bg-amber-500/10 text-slate-400 group-hover:text-amber-400 border border-slate-800 group-hover:border-amber-500/30 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{preset.watts} واط</span>
                          <span aria-hidden="true">·</span>
                          <span>{preset.hoursPerDay} س/يوم</span>
                        </div>
                        {preset.customNote && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {preset.customNote}
                          </div>
                        )}
                      </div>

                      <div className="p-1 text-slate-600 group-hover:text-amber-400 self-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Custom Device Form */
            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">اسم الجهاز:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مضخة ماء، مكنسة، كواية بخار..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">قدرة الجهاز بالواط (Watts):</label>
                  <input
                    type="number"
                    min={1}
                    max={20000}
                    value={customWatts}
                    onChange={(e) => setCustomWatts(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">تجد هذه القيمة مكتوبة على ملصق مواصفات الجهاز</span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">التصنيف:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as ApplianceCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cooling">تكييف ومراوح</option>
                    <option value="refrigeration">ثلاجات ومجمدات</option>
                    <option value="laundry">غسيل وتنظيف</option>
                    <option value="kitchen">مطبخ وأفران</option>
                    <option value="water_heating">سخانات ماء</option>
                    <option value="electronics">إلكترونيات وشاشات</option>
                    <option value="lighting">إنارة</option>
                    <option value="other">أجهزة أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">ساعات التشغيل اليومية:</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.1}
                    max={24}
                    value={customHours}
                    onChange={(e) => setCustomHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">أيام الاستعمال في الأسبوع:</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-colors text-xs"
                >
                  إضافة الجهاز المخصص
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
