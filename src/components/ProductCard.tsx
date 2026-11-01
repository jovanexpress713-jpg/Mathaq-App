/**
 * MAZAQ Product Card
 * Accessible product preview with graceful image fallback and clear purchase actions.
 */

import React, { useState } from 'react';
import { ImageOff, Plus, Star } from 'lucide-react';
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
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article
      id={`product-card-${product.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[#38291d] bg-[linear-gradient(155deg,#21170f_0%,#17100c_72%)] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-[#987344] hover:shadow-[0_16px_34px_rgba(0,0,0,0.3)]"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`عرض تفاصيل ${product.name}`}
        className="w-full text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e5c378]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#120d0a]">
          {product.image && !imageFailed ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_center,#302216_0%,#120d0a_72%)] text-[#9a7950]">
              <ImageOff className="h-7 w-7 opacity-80" />
              <span className="text-[10px] font-semibold">الصورة غير متاحة</span>
            </div>
          )}

          {Number.isFinite(product.rating) && product.rating > 0 && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-white/10 bg-[#120d0a]/85 px-2 py-1 text-[10px] font-extrabold text-[#fff5e8] backdrop-blur-md">
              <Star className="h-3 w-3 fill-[#e5c378] text-[#e5c378]" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}

          {product.oldPrice && product.oldPrice > product.price && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[#8f2922] px-2 py-1 text-[9px] font-extrabold text-white shadow-lg">
              وفر {product.oldPrice - product.price} ريال
            </span>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#17100c]/70 to-transparent" />
        </div>

        <div className="space-y-1 px-3 pt-3 text-right">
          <h3 className="line-clamp-1 text-[13px] font-extrabold leading-6 text-[#f8eee3] transition-colors group-hover:text-[#e5c378]">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 min-h-9 text-[10px] leading-[1.8] text-[#a89580]">
              {product.description}
            </p>
          )}
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-3 pt-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black tabular-nums text-[#e5c378]">{product.price}</span>
            <span className="text-[10px] font-bold text-[#b99a6c]">ريال</span>
          </div>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-[9px] text-[#8c7967] line-through">{product.oldPrice} ريال</span>
          )}
        </div>

        <button
          type="button"
          id={`quick-add-${product.id}`}
          onClick={onQuickAdd}
          aria-label={`إضافة ${product.name} إلى السلة`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#b58b50]/50 bg-[#c69a59] text-[#17100c] shadow-[0_5px_14px_rgba(198,154,89,0.2)] transition-all hover:scale-105 hover:bg-[#e5c378] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d496] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17100c]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.8} />
        </button>
      </div>
    </article>
  );
};
