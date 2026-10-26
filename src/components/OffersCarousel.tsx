/**
 * MAZAQ Offers Carousel Component
 * Dynamic slider strictly driven by database offers, with auto-play, touch swipe, and discount badges.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft } from 'lucide-react';
import { Offer } from '../types';

interface OffersCarouselProps {
  offers: Offer[];
  onOfferClick: (offer: Offer) => void;
}

export const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers, onOfferClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeOffers = offers.filter((o) => o.isActive);

  useEffect(() => {
    if (activeOffers.length <= 1 || isPaused) return;

    const currentOffer = activeOffers[currentIndex];
    const duration = (currentOffer?.displayDuration || 4) * 1000;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, duration);

    return () => clearInterval(timer);
  }, [activeOffers, currentIndex, isPaused]);

  if (activeOffers.length === 0) return null;

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    // In RTL: diff > 40 means dragged right-to-left -> Next
    if (diff > 40) handleNext();
    if (diff < -40) handlePrev();
    touchStartX.current = null;
  };

  return (
    <section
      id="offers-section"
      className="w-full my-4"
      aria-label="عروض مذاق الحصرية"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c69a59]" />
          <h2 className="text-base sm:text-lg font-bold text-[#f5ebe1]">عروض مذاق</h2>
        </div>
        <span className="text-xs text-[#c69a59] font-medium">عروض خاصة ومحدودة</span>
      </div>

      {/* Carousel Banner Container */}
      <div
        id="offer-active-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => onOfferClick(currentOffer)}
        className="relative w-full h-44 sm:h-52 md:h-60 rounded-2xl overflow-hidden cursor-pointer border border-[#3d2c1d] hover:border-[#c69a59] transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] group"
      >
        {/* Background Image with Dark Vignette */}
        <img
          src={currentOffer.image}
          alt={currentOffer.title}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907] via-[#0c0907]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0907]/90 via-[#0c0907]/40 to-transparent" />

        {/* Discount Badge */}
        {currentOffer.discountPercentage > 0 && (
          <div
            id="offer-discount-badge"
            className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#b91c1c] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg"
          >
            <span>خصم</span>
            <span>{currentOffer.discountPercentage}%</span>
          </div>
        )}

        {/* Content Details */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-right z-10">
          <h3 className="text-lg sm:text-2xl font-black text-[#f5ebe1] drop-shadow-md mb-1 line-clamp-1">
            {currentOffer.title}
          </h3>
          {currentOffer.description && (
            <p className="text-xs sm:text-sm text-[#d1c2b4] line-clamp-2 max-w-sm mb-3">
              {currentOffer.description}
            </p>
          )}

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#c69a59]">
                {currentOffer.newPrice} ريال
              </span>
              {currentOffer.oldPrice > currentOffer.newPrice && (
                <span className="text-xs sm:text-sm line-through text-[#857361]">
                  {currentOffer.oldPrice} ريال
                </span>
              )}
            </div>

            <button
              id="offer-cta-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c69a59] group-hover:bg-[#d4af37] text-[#0c0907] text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              <span>{currentOffer.buttonText || 'اطلب الآن'}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Arrows (Visible on hover on desktop) */}
        {activeOffers.length > 1 && (
          <>
            <button
              id="offers-prev-btn"
              onClick={handlePrev}
              aria-label="العرض السابق"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#120d0a]/80 text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="offers-next-btn"
              onClick={handleNext}
              aria-label="العرض التالي"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#120d0a]/80 text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {activeOffers.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {activeOffers.map((_, index) => (
            <button
              key={index}
              id={`offer-dot-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`الانتقال للعرض ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-[#c69a59] shadow-[0_0_6px_#c69a59]'
                  : 'w-2 bg-[#3d2c1d] hover:bg-[#5a422d]'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
