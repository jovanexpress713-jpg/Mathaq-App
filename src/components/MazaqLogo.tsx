/**
 * MAZAQ Official Brand Identity Component
 * Renders the official brand logo image (as requested by user)
 * Featuring the signature croissant, French baguette, wheat sprout, and MADHAQ typography.
 */

import React from 'react';
import mazaqLogoImg from '../assets/images/mazaq_logo.jpg';

interface MazaqLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  logoUrl?: string;
}

export const MazaqLogo: React.FC<MazaqLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  logoUrl,
}) => {
  const sizeConfig = {
    sm: {
      imgClass: 'w-10 h-10',
      glow: 'blur-md',
      subText: 'text-[9px]',
    },
    md: {
      imgClass: 'w-24 h-24 sm:w-28 sm:h-28',
      glow: 'blur-xl',
      subText: 'text-[11px]',
    },
    lg: {
      imgClass: 'w-36 h-36 sm:w-40 sm:h-40',
      glow: 'blur-2xl',
      subText: 'text-[13px]',
    },
    xl: {
      imgClass: 'w-64 h-64 sm:w-72 sm:h-72',
      glow: 'blur-3xl',
      subText: 'text-[15px]',
    },
  };

  const { imgClass, glow, subText } = sizeConfig[size];
  const activeLogoSrc = logoUrl && logoUrl.trim() !== '' ? logoUrl : mazaqLogoImg;

  return (
    <div className={`flex flex-col items-center select-none ${className}`} dir="rtl">
      <div className="relative group flex items-center justify-center">
        {/* Subtle Luxury Golden Ambient Glow */}
        <div
          className={`absolute inset-0 bg-[#c69a59]/15 rounded-full ${glow} transform scale-90 pointer-events-none`}
        />

        {/* Official Brand Logo Image - Seamless Luxury Emblem */}
        <img
          src={activeLogoSrc}
          alt="شعار مذاق الرسمي | MAZAQ Official Logo"
          className={`relative z-10 object-contain mix-blend-screen drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] ${imgClass} transition-all duration-300 group-hover:scale-105`}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showSubtitle && (
        <span
          className={`font-semibold text-[#c69a59] font-sans uppercase tracking-[0.4em] mt-2.5 ${subText} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
          style={{ letterSpacing: '0.4em' }}
        >
          M A D H A Q
        </span>
      )}
    </div>
  );
};
