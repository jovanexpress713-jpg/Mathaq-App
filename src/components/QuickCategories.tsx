/**
 * MAZAQ Quick Categories Bar
 * 3-Card layout as shown in Screen 2 of IMG-20260912-WA0019.jpg
 * حلويات • معجنات • مخبوزات
 */

import React from 'react';
import { Cake, Croissant, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface QuickCategoriesProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onViewAll: () => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onViewAll,
}) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'cake':
        return Cake;
      case 'croissant':
        return Croissant;
      case 'bread':
      default:
        return UtensilsCrossed;
    }
  };

  // Top 3 featured categories
  const displayCategories = categories.filter((c) => c.isActive).slice(0, 3);

  return (
    <div className="w-full my-4" aria-label="أقسام مذاق السريعة">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="text-sm sm:text-base font-bold text-[#f5ebe1] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#c69a59]" />
          <span>تصفح الأقسام</span>
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs text-[#c69a59] hover:text-[#d4af37] font-semibold transition-colors"
        >
          عرض جميع الأقسام &gt;
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {displayCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const Icon = getIcon(cat.icon);

          return (
            <button
              key={cat.id}
              id={`quick-cat-${cat.id}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 group active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2a1c15] to-[#1c140f] border-[#c69a59] shadow-[0_0_15px_rgba(198,154,89,0.2)]'
                  : 'bg-[#18110c] hover:bg-[#201711] border-[#2d2118] hover:border-[#523a23]'
              }`}
            >
              {/* Icon / Image container */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                  isSelected
                    ? 'bg-[#c69a59] text-[#0c0907]'
                    : 'bg-[#251b14] text-[#c69a59] group-hover:text-[#f5ebe1]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-xs font-bold transition-colors ${
                  isSelected ? 'text-[#c69a59]' : 'text-[#f5ebe1] group-hover:text-[#c69a59]'
                }`}
              >
                {cat.name}
              </span>
              <span className="text-[10px] text-[#857361] mt-0.5 truncate max-w-[80px]">
                {cat.subtitle || 'طازج يومياً'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
