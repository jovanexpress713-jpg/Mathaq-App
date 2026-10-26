/**
 * MAZAQ Cart View
 * Exact visual recreation of Screen 5 from IMG-20260912-WA0019.jpg
 */

import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  deliveryFee: number;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  deliveryFee,
}) => {
  const itemsTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const grandTotal = itemsTotal + (cart.length > 0 ? deliveryFee : 0);

  return (
    <div id="cart-view" className="w-full max-w-xl mx-auto pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#2d2118] px-2 mb-4">
        <button
          id="cart-back-btn"
          onClick={onContinueShopping}
          className="flex items-center gap-1.5 text-xs text-[#b8a594] hover:text-[#f5ebe1] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>متابعة التسوق</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#f5ebe1] flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#c69a59]" />
          <span>سلة المشتريات</span>
          <span className="text-xs text-[#857361]">({cart.length})</span>
        </h1>

        {cart.length > 0 ? (
          <button
            id="clear-cart-btn"
            onClick={onClearCart}
            title="إفراغ السلة"
            className="p-2 text-[#857361] hover:text-[#b91c1c] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#1c140f] border border-[#3d2c1d] flex items-center justify-center text-[#857361]">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-base font-bold text-[#f5ebe1]">سلتك فارغة حالياً</h2>
          <p className="text-xs text-[#857361] max-w-xs leading-relaxed">
            استمتع بتشكيلة مخبوزات وحلويات مذاق الطازجة وأضف أشهى الأصناف لسلتك!
          </p>
          <button
            id="empty-cart-browse-btn"
            onClick={onContinueShopping}
            className="px-6 py-2.5 rounded-xl bg-[#c69a59] text-[#0c0907] text-xs font-bold shadow-md hover:bg-[#d4af37] transition-all"
          >
            تصفح القائمة الآن
          </button>
        </div>
      ) : (
        /* Active Cart Items */
        <div className="space-y-6">
          <div className="space-y-3">
            {cart.map((item, index) => {
              const optionsSummary = Object.entries(item.selectedOptions || {})
                .map(([_, choice]: [string, any]) => choice?.name)
                .filter(Boolean)
                .join(' • ');

              return (
                <div
                  key={`${item.productId}-${index}`}
                  id={`cart-item-${index}`}
                  className="flex items-center justify-between p-3.5 bg-[#18110c] border border-[#2d2118] rounded-2xl gap-3 transition-all hover:border-[#3d2c1d]"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#0c0907] border border-[#2d2118]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#f5ebe1] truncate">
                      {item.name}
                    </h3>
                    {optionsSummary && (
                      <p className="text-[11px] text-[#c69a59] mt-0.5 font-medium truncate">
                        {optionsSummary}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 mt-1 text-[#c69a59] font-bold text-xs">
                      <span>{item.unitPrice}</span>
                      <span className="text-[10px]">ريال</span>
                    </div>
                  </div>

                  {/* Counter & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-[#736353] hover:text-[#b91c1c] transition-colors p-1"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 bg-[#201610] border border-[#2d2118] rounded-lg px-2 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="text-[#b8a594] hover:text-[#f5ebe1] transition-colors"
                        title="إنقاص"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#f5ebe1] min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="text-[#b8a594] hover:text-[#f5ebe1] transition-colors"
                        title="زيادة"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Summary Card */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#b8a594]">
              <span>مجموع المنتجات:</span>
              <span className="font-bold text-[#f5ebe1]">{itemsTotal} ريال</span>
            </div>
            <div className="flex items-center justify-between text-[#b8a594]">
              <span>رسوم التوصيل:</span>
              <span className="font-bold text-[#f5ebe1]">
                {deliveryFee === 0 ? (
                  <span className="text-[#c69a59]">مجاناً ✨</span>
                ) : (
                  `${deliveryFee} ريال`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-[#2d2118] flex items-center justify-between">
              <span className="text-sm font-bold text-[#f5ebe1]">الإجمالي الكلي:</span>
              <div className="flex items-baseline gap-1 text-[#c69a59]">
                <span className="text-lg font-black">{grandTotal}</span>
                <span className="text-xs font-bold">ريال</span>
              </div>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            id="proceed-checkout-btn"
            onClick={onCheckout}
            className="w-full flex items-center justify-between px-6 py-3.5 rounded-2xl bg-[#c69a59] hover:bg-[#d4af37] text-[#0c0907] font-bold shadow-[0_4px_20px_rgba(198,154,89,0.25)] active:scale-98 transition-all"
          >
            <span className="text-sm font-extrabold">متابعة إتمام الطلب</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black">{grandTotal} ريال</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
