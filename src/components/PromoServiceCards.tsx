/**
 * MAZAQ Service Promo Cards
 * Recreates the Party Catering and Delivery service cards from Screen 2 in IMG-20260912-WA0019.jpg
 */

import React, { useState } from 'react';
import { PartyPopper, Bike, MapPin, ChevronLeft, Check, Clock, Phone } from 'lucide-react';
import { ShopSettings } from '../types';

interface PromoServiceCardsProps {
  settings?: ShopSettings | null;
}

export const PromoServiceCards: React.FC<PromoServiceCardsProps> = ({ settings }) => {
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const whatsappNumber = settings?.whatsapp || '+966551234567';

  return (
    <div className="w-full space-y-3 my-4" aria-label="خدمات مذاق المميزة">
      {/* 1. Party & Event Catering Card */}
      <div
        id="party-service-card"
        onClick={() => setShowPartyModal(true)}
        className="relative w-full rounded-2xl overflow-hidden border border-[#3d2c1d] hover:border-[#c69a59] bg-[#18110c] p-4 cursor-pointer group transition-all duration-300 shadow-md flex items-center justify-between"
      >
        {/* Decorative background image */}
        <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity">
          <img
            src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop"
            alt="Catering"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#18110c] via-[#18110c]/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#251a13] border border-[#523a23] flex items-center justify-center text-[#c69a59] group-hover:scale-105 transition-transform">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#f5ebe1] group-hover:text-[#c69a59] transition-colors">
              خدمة تجهيز الحفلات والمناسبات
            </h3>
            <p className="text-xs text-[#b8a594] mt-0.5">
              بمذاق فاخر .. ولمسة مميزة
            </p>
          </div>
        </div>

        {/* Gold Arrow */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-[#251b14] flex items-center justify-center text-[#c69a59] group-hover:bg-[#c69a59] group-hover:text-[#0c0907] transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Fast Delivery Service Card */}
      <div
        id="delivery-service-card"
        onClick={() => setShowDeliveryModal(true)}
        className="relative w-full rounded-2xl overflow-hidden border border-[#3d2c1d] hover:border-[#c69a59] bg-[#18110c] p-4 cursor-pointer group transition-all duration-300 shadow-md flex items-center justify-between"
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#251a13] border border-[#523a23] flex items-center justify-center text-[#c69a59] group-hover:scale-105 transition-transform">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-[#f5ebe1] group-hover:text-[#c69a59] transition-colors">
                خدمة التوصيل السريع
              </h3>
              <span className="text-[10px] bg-[#c69a59]/20 text-[#c69a59] font-bold px-1.5 py-0.5 rounded-full">
                طازج وحار
              </span>
            </div>
            <p className="text-xs text-[#b8a594] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#c69a59]" />
              <span>لجميع مناطق وأحياء المدينة</span>
            </p>
          </div>
        </div>

        {/* Gold Arrow */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-[#251b14] flex items-center justify-center text-[#c69a59] group-hover:bg-[#c69a59] group-hover:text-[#0c0907] transition-all">
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>

      {/* Party Service Modal */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d2118] pb-3">
              <h3 className="text-lg font-bold text-[#f5ebe1] flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-[#c69a59]" />
                <span>تجهيز الحفلات والمناسبات</span>
              </h3>
              <button
                onClick={() => setShowPartyModal(false)}
                className="text-xs text-[#857361] hover:text-[#f5ebe1]"
              >
                إغلاق ✕
              </button>
            </div>

            <p className="text-sm text-[#b8a594] leading-relaxed">
              يسعدنا في <strong className="text-[#c69a59]">مذاق</strong> مشاركتكم أجمل اللحظات وتجهيز بوكسات الحفلات، قوالب الكيك المخصصة، وتوزيعات المعجنات والمخبوزات الفاخرة بحرفية وجودة استثنائية.
            </p>

            <div className="space-y-2 text-xs text-[#f5ebe1]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c69a59]" />
                <span>قوالب كيك مصممة حسب الطلب والمناسبة</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c69a59]" />
                <span>بوكسات موالح وحلويات فاخرة للضيافة</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c69a59]" />
                <span>توصيل معتمد ومحافظ على درجة الحرارة للموقع</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن خدمة تجهيز الحفلات والمناسبات لدى مذاق')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-center text-xs flex items-center justify-center gap-1.5"
              >
                <span>طلب عبر واتساب</span>
              </a>
              <button
                onClick={() => setShowPartyModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#3d2c1d] text-xs text-[#b8a594] hover:text-[#f5ebe1]"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Zones Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d2118] pb-3">
              <h3 className="text-lg font-bold text-[#f5ebe1] flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#c69a59]" />
                <span>مناطق ورسوم التوصيل</span>
              </h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="text-xs text-[#857361] hover:text-[#f5ebe1]"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#b8a594]">
                <Clock className="w-4 h-4 text-[#c69a59]" />
                <span>مواعيد التوصيل: {settings?.workingHours || 'يومياً ٧:٠٠ ص - ١١:٠٠ م'}</span>
              </div>

              <div className="mt-2 divide-y divide-[#2d2118] border border-[#2d2118] rounded-xl overflow-hidden">
                {(settings?.deliveryZones || [
                  { id: '1', name: 'المنطقة المركزية', fee: 5, estimatedMinutes: 25 },
                  { id: '2', name: 'شمال وشرق المدينة', fee: 10, estimatedMinutes: 35 },
                  { id: '3', name: 'جنوب وغرب المدينة', fee: 15, estimatedMinutes: 45 },
                ]).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2.5 bg-[#1a130e] text-xs">
                    <span className="font-bold text-[#f5ebe1]">{zone.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#857361]">{zone.estimatedMinutes} دقيقة</span>
                      <span className="font-bold text-[#c69a59]">{zone.fee} ريال</span>
                    </div>
                  </div>
                ))}
              </div>

              {settings?.freeDeliveryThreshold && (
                <p className="text-xs text-center text-[#c69a59] font-medium pt-1">
                  ✨ توصيل مجاني للطلبات فوق {settings.freeDeliveryThreshold} ريال!
                </p>
              )}
            </div>

            <button
              onClick={() => setShowDeliveryModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
