/**
 * MAZAQ Splash Screen
 * Exact visual recreation of Screen 1 from IMG-20260912-WA0019.jpg
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MazaqLogo } from './MazaqLogo';

interface SplashScreenProps {
  onComplete: () => void;
  shopTagline?: string;
  shopSubTagline?: string;
  logoUrl?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  shopTagline = 'حلويات • معجنات • مخبوزات',
  shopSubTagline = 'بمذاق يليق بذوقك',
  logoUrl,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        id="splash-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={onComplete}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-[#000000] cursor-pointer select-none overflow-hidden"
      >
        {/* Cinematic Bakery Background with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop"
            alt="Bakery background"
            className="w-full h-full object-cover opacity-20 scale-105 filter blur-[1px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_75%)]" />
        </div>

        {/* Top spacer */}
        <div className="relative z-10 pt-8">
          <span className="text-[10px] uppercase tracking-widest text-[#a89887]/60 font-sans">
            M A Z A Q • L U X U R Y • B A K E R Y
          </span>
        </div>

        {/* Center Content: Brand Logo & Typography */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xs space-y-6">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <MazaqLogo size="xl" showSubtitle={false} logoUrl={logoUrl} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-2 pt-2"
          >
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-[#f5ebe1]">
              {shopTagline}
            </h2>
            <p className="text-sm md:text-base text-[#c69a59] font-medium tracking-wide">
              {shopSubTagline}
            </p>
          </motion.div>
        </div>

        {/* Bottom Loading Progress & Skip Hint */}
        <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-4 pb-4">
          <div className="w-48 h-1 bg-[#241a13] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#9e7432] via-[#c69a59] to-[#f5d496] rounded-full shadow-[0_0_10px_#c69a59]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <p className="text-[11px] text-[#948270] tracking-wider">
            انقر في أي مكان للدخول مباشرة
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
