/**
 * MAZAQ Header Component
 * Refined responsive header for the dark luxury storefront.
 */

import React from 'react';
import { ShoppingBag, ShieldCheck, Phone, Smartphone, Monitor } from 'lucide-react';
import { MazaqLogo } from './MazaqLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  isMobileFrame: boolean;
  onToggleViewMode: () => void;
  phone?: string;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onGoHome,
  isMobileFrame,
  onToggleViewMode,
  phone,
  logoUrl,
}) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full border-b border-[#3a2a1d]/90 bg-[#120d0a]/90 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:px-5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <button
          type="button"
          id="header-logo-btn"
          onClick={onGoHome}
          className="group flex min-w-0 items-center gap-2 text-right transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c378] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120d0a]"
          title="الرئيسية"
          aria-label="العودة إلى الرئيسية"
        >
          <MazaqLogo size="sm" showSubtitle={false} logoUrl={logoUrl} />
          <div className="hidden min-w-0 flex-col pr-1 text-right sm:flex">
            <span className="text-xs font-extrabold text-[#f5ebe1] transition-colors group-hover:text-[#e5c378]">مذاق | MADHAQ</span>
            <span className="text-[10px] tracking-wide text-[#9b8977]">طعم الأصالة في كل لقمة</span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            id="view-mode-toggle"
            onClick={onToggleViewMode}
            className="hidden items-center gap-1.5 rounded-xl border border-[#3d2c1d] bg-[#1e1510] px-3 py-2 text-xs font-semibold text-[#b8a594] transition-all hover:border-[#987344] hover:text-[#f5ebe1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c378] md:flex"
            title={isMobileFrame ? 'التبديل إلى العرض الواسع' : 'التبديل إلى محاكي تطبيق الهاتف'}
          >
            {isMobileFrame ? <Monitor className="h-3.5 w-3.5 text-[#c69a59]" /> : <Smartphone className="h-3.5 w-3.5 text-[#c69a59]" />}
            <span>{isMobileFrame ? 'عرض شاشة واسعة' : 'محاكي شاشة الجوال'}</span>
          </button>

          {phone && (
            <a
              id="header-phone-btn"
              href={`tel:${phone}`}
              aria-label="اتصال مباشر"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#b8a594] transition-colors hover:bg-[#1e1510] hover:text-[#e5c378] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c378]"
              title="اتصال مباشر"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}

          <button
            type="button"
            id="header-admin-btn"
            onClick={onOpenAdmin}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[#523a23] bg-[#1e1510] px-2.5 text-xs font-bold text-[#d8b477] transition-all hover:border-[#c69a59] hover:bg-[#2a1c14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c378] sm:px-3"
            title="لوحة الإدارة والتحكم"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">لوحة الإدارة</span>
          </button>

          <button
            type="button"
            id="header-cart-btn"
            onClick={onOpenCart}
            aria-label={cartCount > 0 ? `السلة، ${cartCount} قطعة` : 'السلة'}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#c69a59] text-[#0c0907] shadow-[0_4px_14px_rgba(198,154,89,0.22)] transition-all hover:bg-[#e5c378] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d496] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120d0a]"
            title="السلة"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#120d0a] bg-[#a92e25] px-1 text-[10px] font-black text-white"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
