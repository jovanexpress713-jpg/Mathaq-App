/**
 * MAZAQ Order Tracking View
 * Exact visual recreation of Screen 7 from IMG-20260912-WA0019.jpg
 * Features the delivery status banner, 4-step vertical timeline, and order snapshot.
 */

import React from 'react';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  MessageCircle,
  Phone,
  Package,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus, ShopSettings } from '../types';

interface OrderTrackingViewProps {
  order: Order;
  settings: ShopSettings | null;
  onBackToHome: () => void;
  onRefresh?: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  settings,
  onBackToHome,
}) => {
  // Map internal status to step index:
  // 0: تم استلام الطلب
  // 1: قيد التحضير
  // 2: في الطريق
  // 3: تم التوصيل
  const getStepIndex = (status: OrderStatus | string): number => {
    const s = String(status).toUpperCase();
    if (s === 'PENDING' || s === 'CONFIRMED' || s === 'NEW') return 0;
    if (s === 'PREPARING' || s === 'READY') return 1;
    if (s === 'OUT_FOR_DELIVERY' || s === 'OUTFORDELIVERY') return 2;
    if (s === 'DELIVERED' || s === 'COMPLETED') return 3;
    if (s === 'CANCELLED') return -1;
    return 0;
  };

  const activeStep = getStepIndex(order.status);

  const steps = [
    { label: 'تم استلام الطلب', time: 'تم التوثيق بالنظام' },
    { label: 'قيد التحضير والخبز', time: 'الفرن والتحضير الطازج' },
    { label: 'في الطريق إليك', time: 'مع مندوب التوصيل' },
    { label: 'تم التوصيل بنجاح', time: 'بالعافية والهناء' },
  ];

  const rawWhatsapp = settings?.whatsapp || settings?.phone || '+966551234567';
  let cleanPhone = rawWhatsapp.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
    cleanPhone = '966' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
    cleanPhone = '966' + cleanPhone;
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
    cleanPhone = '967' + cleanPhone;
  }

  // Formatting date/time
  const createdDate = new Date(order.createdAt);
  const formattedDate = createdDate.toISOString().split('T')[0].replace(/-/g, '/');
  const formattedTime = createdDate.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div id="order-tracking-view" className="w-full max-w-xl mx-auto pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#2d2118] px-2 mb-4">
        <button
          id="tracking-back-btn"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs text-[#b8a594] hover:text-[#f5ebe1] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#f5ebe1]">تتبع الطلب</h1>
        <div className="w-8" />
      </div>

      {/* Top Delivery Status Card (Screen 7 Mockup) */}
      <div
        id="delivery-status-banner"
        className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-l from-[#221710] to-[#16100c] border border-[#c69a59]/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#c69a59] uppercase tracking-wider block mb-1">
              حالة التوصيل الحالية
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#f5ebe1]">
              {order.status === 'DELIVERED'
                ? 'تم توصيل طلبك بنجاح'
                : order.status === 'OUT_FOR_DELIVERY'
                ? 'جاري توصيل طلبك - سيصل قريباً'
                : order.status === 'PREPARING'
                ? 'جاري تحضير وخبز طلبك طازجاً'
                : order.status === 'CANCELLED'
                ? 'تم إلغاء هذا الطلب'
                : 'تم تأكيد طلبك وجاري البدء'}
            </h2>
            <p className="text-xs text-[#b8a594] mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#c69a59]" />
              <span>الوقت المتوقع: 20-30 دقيقة</span>
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#c69a59] text-[#0c0907] flex items-center justify-center shadow-[0_0_16px_rgba(198,154,89,0.4)]">
            <Bike className="w-8 h-8 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* 4-Step Vertical Timeline (Screen 7) */}
      <div className="p-5 bg-[#18110c] border border-[#2d2118] rounded-2xl mb-6 space-y-6">
        <h3 className="text-xs font-bold text-[#c69a59] uppercase tracking-wider">
          مراحل الطلب
        </h3>

        <div className="space-y-6 pr-2">
          {steps.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isCurrent = activeStep === idx;

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Connecting vertical line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute right-4.5 top-8 bottom-0 w-0.5 -mb-6 ${
                      isCompleted ? 'bg-[#c69a59]' : 'bg-[#2d2118]'
                    }`}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-[#c69a59] text-[#0c0907]'
                      : isCurrent
                      ? 'bg-[#261a12] border-2 border-[#c69a59] text-[#c69a59] shadow-[0_0_12px_#c69a59]'
                      : 'bg-[#120d0a] border border-[#2d2118] text-[#857361]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Text Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isCurrent || isCompleted ? 'text-[#f5ebe1]' : 'text-[#857361]'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-[#857361] mt-0.5">{step.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info & Items Breakdown Card (Screen 7) */}
      <div className="p-5 bg-[#18110c] border border-[#2d2118] rounded-2xl mb-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#251b14]">
          <div>
            <span className="text-[10px] text-[#857361] block">رقم الطلب</span>
            <span className="text-xs sm:text-sm font-black text-[#c69a59]">
              {order.orderNumber}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-[#857361] block">تاريخ وتوقيت الطلب</span>
            <span className="text-xs text-[#f5ebe1]">
              {formattedDate} • {formattedTime}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#b8a594]">الأصناف المطلوبة</span>
          <div className="divide-y divide-[#251b14]">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#251b14] flex items-center justify-center text-[10px] font-bold text-[#c69a59]">
                    {item.quantity}
                  </span>
                  <span className="font-bold text-[#f5ebe1]">{item.name || item.productName || 'صنف'}</span>
                </div>
                <span className="font-bold text-[#b8a594]">{item.totalPrice ?? item.totalItemPrice ?? 0} ريال</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Details */}
        <div className="pt-3 border-t border-[#251b14] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#857361]">
            <span>مجموع المنتجات:</span>
            <span className="text-[#f5ebe1]">{order.itemsTotal} ريال</span>
          </div>
          <div className="flex justify-between text-[#857361]">
            <span>رسوم التوصيل:</span>
            <span className="text-[#f5ebe1]">{order.deliveryFee} ريال</span>
          </div>
          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-[#857361]">طريقة الدفع:</span>
            <span className="text-[#25D366] font-bold flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>عبر الواتساب</span>
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[#251b14]">
            <span className="text-xs font-bold text-[#f5ebe1]">المجموع الكلي:</span>
            <div className="flex items-baseline gap-1 text-[#c69a59]">
              <span className="text-base font-black">{order.grandTotal}</span>
              <span className="text-[10px] font-bold">ريال</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Payment & Support CTA */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `مرحباً مذاق، أود إتمام دفع طلبي رقم #${order.orderNumber} بمبلغ ${order.grandTotal} ريال وإرسال إشعار التحويل لتجهيزه.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20b858] transition-all shadow-[0_4px_16px_rgba(37,211,102,0.25)] active:scale-98"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>إرسال إيصال الدفع عبر الواتساب</span>
        </a>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 rounded-xl border border-[#3d2c1d] hover:border-[#c69a59] text-xs font-bold text-[#f5ebe1] transition-colors"
        >
          متابعة التسوق
        </button>
      </div>
    </div>
  );
};
