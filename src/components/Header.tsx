/**
 * MAZAQ Header Component
 * Dark luxury navigation bar with brand logo, cart badge, view mode toggle, and admin quick link.
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
  phone = '+966551234567',
  logoUrl,
}) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-[#120d0a]/95 backdrop-blur-md border-b border-[#2d2118] px-4 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Home Trigger */}
        <button
          id="header-logo-btn"
          onClick={onGoHome}
          className="flex items-center gap-2 group transition-transform active:scale-95 text-right"
          title="الرئيسية"
        >
          <MazaqLogo size="sm" showSubtitle={false} logoUrl={logoUrl} />
          <div className="hidden sm:flex flex-col text-right pr-1">
            <span className="text-xs font-bold text-[#f5ebe1] group-hover:text-[#c69a59] transition-colors">
              مذاق | MAZAQ
            </span>
            <span className="text-[10px] text-[#948270] tracking-wider">
              طعم الأصالة في كل لقمة
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Responsive Frame Switcher (Only visible on larger screens) */}
          <button
            id="view-mode-toggle"
            onClick={onToggleViewMode}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1e1510] hover:bg-[#2a1c15] text-[#b8a594] hover:text-[#f5ebe1] border border-[#3d2c1d] transition-all"
            title={isMobileFrame ? 'التبديل إلى العرض الواسع' : 'التبديل إلى محاكي تطبيق الهاتف'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#c69a59]" />
                <span>عرض شاشة واسعة</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#c69a59]" />
                <span>محاكي شاشة الجوال</span>
              </>
            )}
          </button>

          {/* Quick Call */}
          {phone && (
            <a
              id="header-phone-btn"
              href={`tel:${phone}`}
              className="p-2 rounded-xl text-[#b8a594] hover:text-[#c69a59] hover:bg-[#1e1510] transition-colors"
              title="اتصال مباشر"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          {/* Admin Portal Gateway */}
          <button
            id="header-admin-btn"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1e1510] hover:bg-[#2e1d13] text-[#c69a59] border border-[#523a23] hover:border-[#c69a59] transition-all"
            title="لوحة الإدارة والتحكم"
          >
            <ShieldCheck className="w-4 h-4 text-[#c69a59]" />
            <span className="hidden sm:inline">لوحة الإدارة</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-[#c69a59] hover:bg-[#d4af37] text-[#0c0907] font-bold shadow-[0_2px_12px_rgba(198,154,89,0.3)] active:scale-95 transition-transform"
            title="السلة"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-extrabold text-white bg-[#b91c1c] border-2 border-[#120d0a] rounded-full"
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
