/**
 * MAZAQ Product Card Component
 * Dark luxury styling with gold pricing and intuitive add-to-cart actions.
 */

import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onQuickAdd,
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      onClick={onClick}
      className="group flex flex-col justify-between bg-[#19120e] hover:bg-[#201712] border border-[#2d2118] hover:border-[#c69a59] rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#120d0a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#120d0a]/85 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold text-[#f5ebe1] border border-[#3d2c1d]">
          <Star className="w-3 h-3 text-[#c69a59] fill-[#c69a59]" />
          <span>{product.rating.toFixed(1)}</span>
        </div>

        {/* Old Price / Discount ribbon if applicable */}
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="absolute top-2.5 left-2.5 bg-[#b91c1c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            وفر {product.oldPrice - product.price} ريال
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between text-right">
        <div>
          <h3 className="text-sm font-bold text-[#f5ebe1] group-hover:text-[#c69a59] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#857361] mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#251b14]">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#c69a59]">
                {product.price}
              </span>
              <span className="text-[11px] font-bold text-[#c69a59]">ريال</span>
            </div>
            {product.oldPrice && (
              <span className="text-[10px] text-[#736353] line-through -mt-0.5">
                {product.oldPrice} ريال
              </span>
            )}
          </div>

          <button
            id={`quick-add-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(e);
            }}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#251b14] hover:bg-[#c69a59] text-[#c69a59] hover:text-[#0c0907] border border-[#3d2c1d] hover:border-[#c69a59] transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
