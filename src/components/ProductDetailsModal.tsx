/**
 * MAZAQ Product Details Modal
 * Exact visual match to Screen 4 in IMG-20260912-WA0019.jpg
 */

import React, { useState, useEffect } from 'react';
import { Star, Heart, Share2, ArrowRight, Minus, Plus, ShoppingBag, Check, X } from 'lucide-react';
import { Product, ProductOptionChoice } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, ProductOptionChoice>
  ) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  // Selected option choices: { [groupName]: selectedChoice }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOptionChoice>>(() => {
    const initial: Record<string, ProductOptionChoice> = {};
    product.options?.forEach((group) => {
      const defaultChoice = group.choices.find((c) => c.isDefault) || group.choices[0];
      if (defaultChoice) {
        initial[group.name] = defaultChoice;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute total unit price based on selected options
  const extraPrice = Object.values(selectedOptions).reduce(
    (sum, choice: any) => sum + (choice?.extraPrice ?? choice?.priceModifier ?? 0),
    0
  );
  const unitPrice = product.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleOptionSelect = (groupName: string, choice: ProductOptionChoice) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: choice,
    }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `مذاق | ${product.name}`,
          text: `شاهد ${product.name} من مذاق: ${product.description || ''}`,
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        if (
          err?.name === 'AbortError' ||
          err?.name === 'NotAllowedError' ||
          err?.message?.toLowerCase().includes('cancel') ||
          err?.message?.toLowerCase().includes('abort')
        ) {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const temp = document.createElement('input');
        temp.value = window.location.href;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard restrictions
    }
  };

  return (
    <div
      id="product-details-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg min-h-screen sm:min-h-0 sm:max-h-[92vh] my-0 sm:my-auto bg-[#140e0a] sm:border sm:border-[#3d2c1d] sm:rounded-3xl flex flex-col justify-between shadow-2xl">
        {/* Modal Header Actions - Always Sticky at Top */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#140e0a]/98 backdrop-blur-md border-b border-[#2d2118] shadow-md">
          {/* Back Button to Previous Screen */}
          <button
            id="product-details-back-btn"
            onClick={onClose}
            aria-label="الرجوع للشاشة السابقة"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201610] text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] border border-[#2d2118] active:scale-95 transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs font-bold">رجوع</span>
          </button>

          <span className="text-xs font-bold text-[#b8a594]">تفاصيل المنتج</span>

          <div className="flex items-center gap-1.5">
            <button
              id="product-share-btn"
              onClick={handleShare}
              aria-label="مشاركة المنتج"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#201610] text-[#f5ebe1] hover:text-[#c69a59] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              id="product-favorite-btn"
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label="إضافة للمفضلة"
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#201610] transition-colors ${
                isFavorite ? 'text-[#b91c1c]' : 'text-[#f5ebe1] hover:text-[#b91c1c]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#b91c1c]' : ''}`} />
            </button>
            <button
              id="product-details-close-x-btn"
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#201610] text-[#857361] hover:text-[#f5ebe1] hover:bg-[#2d2118] transition-colors mr-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* Large Hero Image with Floating Back Button */}
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#0c0907] border border-[#2d2118] shadow-lg">
            {/* Floating Back Button directly on the image */}
            <button
              id="product-image-floating-back-btn"
              onClick={onClose}
              aria-label="الرجوع للشاشة السابقة"
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-[#c69a59] hover:text-[#0c0907] text-[#f5ebe1] backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-xs font-bold">رجوع</span>
            </button>

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title & Rating */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#f5ebe1] leading-tight">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-1 text-[#c69a59]">
                <span className="text-2xl font-black">{unitPrice}</span>
                <span className="text-xs font-bold">ريال</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#857361]">
              <div className="flex items-center gap-1 text-[#c69a59] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#c69a59]" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>({product.reviewsCount || 85} تقييم من العملاء)</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-[#b8a594] uppercase tracking-wider">
              الوصف والمكونات
            </h3>
            <p className="text-sm text-[#d1c2b4] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Dynamic Options Groups (e.g. الحجم) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#251b14]">
              {product.options.map((group) => (
                <div key={group.name} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f5ebe1]">{group.name}</span>
                    <span className="text-[11px] text-[#857361]">اختر المناسب لك</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {group.choices.map((choice) => {
                      const isSelected = selectedOptions[group.name]?.name === choice.name;
                      return (
                        <button
                          key={choice.name}
                          type="button"
                          onClick={() => handleOptionSelect(group.name, choice)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-[#251b14] border-[#c69a59] text-[#c69a59] shadow-[0_0_10px_rgba(198,154,89,0.2)]'
                              : 'bg-[#1a120c] border-[#2d2118] text-[#b8a594] hover:border-[#523a23]'
                          }`}
                        >
                          <span className="text-xs font-bold">{choice.name}</span>
                          {choice.extraPrice ? (
                            <span className="text-[10px] text-[#857361] mt-0.5">
                              +{choice.extraPrice} ريال
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#857361] mt-0.5">الأساسي</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Counter */}
          <div className="flex items-center justify-between pt-4 border-t border-[#251b14]">
            <span className="text-xs font-bold text-[#f5ebe1]">الكمية المطلوبة</span>
            <div className="flex items-center gap-3 bg-[#1e1510] border border-[#2d2118] rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="تقليل الكمية"
                className="w-7 h-7 rounded-lg bg-[#2b1e17] flex items-center justify-center text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-[#f5ebe1] min-w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="زيادة الكمية"
                className="w-7 h-7 rounded-lg bg-[#2b1e17] flex items-center justify-center text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action with Return Button */}
        <div className="sticky bottom-0 p-4 bg-[#140e0a]/98 backdrop-blur-md border-t border-[#2d2118] shadow-xl flex items-center gap-3">
          {/* Bottom Back Button */}
          <button
            id="product-details-bottom-back-btn"
            onClick={onClose}
            aria-label="الرجوع للشاشة السابقة"
            className="px-4 py-3.5 rounded-2xl bg-[#201610] hover:bg-[#2b1e17] text-[#b8a594] hover:text-[#f5ebe1] border border-[#2d2118] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>

          {/* Add to Cart Button */}
          <button
            id="product-details-add-btn"
            onClick={() => {
              onAddToCart(product, quantity, selectedOptions);
              onClose();
            }}
            className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#c69a59] hover:bg-[#d4af37] text-[#0c0907] font-bold shadow-[0_4px_20px_rgba(198,154,89,0.3)] active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm sm:text-base font-extrabold">أضف إلى السلة</span>
            </div>
            <span className="text-sm sm:text-base font-black">
              {totalPrice} ريال
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
