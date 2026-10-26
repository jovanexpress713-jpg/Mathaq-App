/**
 * MAZAQ Categories View
 * Exact visual match to Screen 3 in IMG-20260912-WA0019.jpg
 * Large photo cards with dark overlay, Arabic typography, and gold arrows.
 */

import React, { useState } from 'react';
import { Search, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onBackToHome: () => void;
  initialCategoryId?: string | null;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectProduct,
  onQuickAdd,
  onBackToHome,
  initialCategoryId,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(initialCategoryId || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Active categories
  const activeCategories = categories.filter((c) => c.isActive);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCatId ? p.categoryId === selectedCatId : true;
    const matchesSearch = searchQuery
      ? p.name.includes(searchQuery) || p.description.includes(searchQuery)
      : true;
    return matchesCat && matchesSearch;
  });

  const selectedCategory = activeCategories.find((c) => c.id === selectedCatId);

  return (
    <div id="categories-view" className="w-full max-w-4xl mx-auto pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#2d2118] px-2 mb-4">
        <button
          id="categories-back-btn"
          onClick={selectedCatId ? () => setSelectedCatId(null) : onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1510] text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] border border-[#2d2118] active:scale-95 transition-all text-xs font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{selectedCatId ? 'رجوع للأقسام' : 'الرئيسية'}</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#f5ebe1]">
          {selectedCategory ? selectedCategory.name : 'قائمة الأقسام'}
        </h1>
        <div className="w-8" />
      </div>

      {/* Live Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#857361]" />
        <input
          id="categories-search-input"
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن صنف أو منتج معين (كيك، كرواسون، روتي...)"
          className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-[#16100c] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#857361] hover:text-[#f5ebe1]"
          >
            مسح
          </button>
        )}
      </div>

      {/* If no category is selected: Show Large Category Cards (Screen 3) */}
      {!selectedCatId && !searchQuery ? (
        <div className="space-y-3.5">
          {activeCategories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              onClick={() => setSelectedCatId(cat.id)}
              className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-[#2d2118] hover:border-[#c69a59] bg-[#16100c] cursor-pointer group transition-all duration-300 shadow-md flex items-center justify-between p-5"
            >
              {/* High-res Category Image with Dark Cinematic Overlay */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0907]/95 via-[#0c0907]/75 to-transparent" />

              {/* Text Info */}
              <div className="relative z-10 flex flex-col justify-center max-w-sm">
                <span className="text-[10px] text-[#c69a59] font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>طازج يومياً</span>
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-[#f5ebe1] group-hover:text-[#c69a59] transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-[#b8a594] mt-1 line-clamp-1">
                  {cat.subtitle || 'تشكيلة مختارة بعناية لأجود الأنواع'}
                </p>
              </div>

              {/* Gold Arrow */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-[#16100c]/80 border border-[#3d2c1d] flex items-center justify-center text-[#c69a59] group-hover:bg-[#c69a59] group-hover:text-[#0c0907] transition-all shadow-md">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Show Products Grid for selected category or search */
        <div>
          {/* Category Chips Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCatId === null
                  ? 'bg-[#c69a59] text-[#0c0907]'
                  : 'bg-[#18110c] text-[#857361] hover:text-[#f5ebe1] border border-[#2d2118]'
              }`}
            >
              الكل
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCatId === cat.id
                    ? 'bg-[#c69a59] text-[#0c0907]'
                    : 'bg-[#18110c] text-[#857361] hover:text-[#f5ebe1] border border-[#2d2118]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[#857361] text-xs">
              لا توجد منتجات مطابقة لهذا البحث حالياً
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onClick={() => onSelectProduct(prod)}
                  onQuickAdd={() => onQuickAdd(prod)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
