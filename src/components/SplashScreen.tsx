/**
 * MAZAQ | مذاق — cinematic brand intro + welcome
 * Uses the approved official logo asset for every branded surface.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MazaqLogo } from './MazaqLogo';

interface SplashScreenProps {
  onComplete: () => void;
  shopTagline?: string;
  shopSubTagline?: string;
  logoUrl?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  shopTagline = 'طعم الأصالة في كل لقمة',
  shopSubTagline = 'بمذاق يليق بذوقك',
  logoUrl,
}) => {
  const [stage, setStage] = useState<'brand' | 'welcome'>('brand');

  useEffect(() => {
    const timer = window.setTimeout(() => setStage('welcome'), 3600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {stage === 'brand' ? (
        <motion.section
          key="brand-intro"
          id="splash-screen"
          aria-label="مقدمة شعار مذاق"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          transition={{ duration: 0.65 }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#050302] px-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(183,91,22,0.2),transparent_48%)]" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-[min(78vw,520px)] w-[min(78vw,520px)] rounded-full border border-[#e9a83b]/20"
            initial={{ scale: 0.45, rotate: -90, opacity: 0 }}
            animate={{ scale: [0.45, 1.12, 1], rotate: 0, opacity: [0, 0.8, 0.45] }}
            transition={{ duration: 2.1, ease: 'easeOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-[min(64vw,420px)] w-[min(64vw,420px)] rounded-full border border-dashed border-[#e9a83b]/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 34, scale: 0.72, filter: 'blur(18px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[8%] rounded-full bg-[#e99a2c]/20 blur-3xl"
                animate={{ opacity: [0.25, 0.8, 0.35], scale: [0.86, 1.12, 0.92] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <MazaqLogo size="xl" showSubtitle={false} logoUrl={logoUrl} className="relative drop-shadow-[0_0_35px_rgba(222,133,35,0.22)]" />
            </motion.div>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.25, duration: 1.1, ease: 'easeOut' }}
              className="mt-1 h-px w-44 origin-center bg-gradient-to-r from-transparent via-[#efb64c] to-transparent"
            />
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.48em' }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-5 text-[11px] font-semibold uppercase text-[#e8b34c]"
              dir="ltr"
            >
              M A D H A Q
            </motion.p>
            <motion.div
              className="mt-12 h-[2px] w-36 overflow-hidden rounded-full bg-[#3a2110]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <motion.div
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#a64b0b] via-[#f4c35b] to-[#fff0ad]"
                animate={{ x: ['-100%', '210%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setStage('welcome')}
              className="mt-7 rounded-full px-4 py-2 text-xs text-[#9d846a] transition hover:text-[#f4c35b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4c35b]"
            >
              تخطي المقدمة
            </button>
          </div>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-0 right-0 text-center text-[9px] tracking-[0.35em] text-[#73502d]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 2 }}
            dir="ltr"
          >
            CRAFTED WITH TASTE
          </motion.div>
        </motion.section>
      ) : (
        <motion.section
          key="welcome"
          id="welcome-screen"
          aria-label="مرحباً بك في مذاق"
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex min-h-[100svh] flex-col items-center justify-between overflow-hidden bg-[#080503] px-6 py-10 text-center"
          dir="rtl"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(190,105,34,0.28),transparent_48%),linear-gradient(145deg,#1b1009_0%,#080503_58%,#030201_100%)]" />
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(rgba(236,180,82,0.32) 0.7px, transparent 0.7px)', backgroundSize: '22px 22px' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080503] to-transparent" />
          </div>
          <div className="relative z-10 flex w-full items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.28em] text-[#d4a04b]" dir="ltr">MADHAQ / BAKERY</span>
            <Sparkles className="h-4 w-4 text-[#eab44e]" />
          </div>
          <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.88 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <MazaqLogo size="lg" showSubtitle={false} logoUrl={logoUrl} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-8 space-y-3"
            >
              <p className="text-xs font-bold tracking-[0.32em] text-[#eab44e]">أهلاً بك في عالم مذاق</p>
              <h1 className="text-3xl font-black leading-relaxed text-[#fff4df] sm:text-4xl">{shopTagline}</h1>
              <p className="text-sm text-[#d5bda0]">{shopSubTagline}</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="relative z-10 w-full max-w-sm space-y-3"
          >
            <button
              type="button"
              onClick={onComplete}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-[#f5cb6b] via-[#e7a83d] to-[#bd6a1d] px-6 py-4 text-sm font-black text-[#211006] shadow-[0_12px_40px_rgba(199,111,31,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
            >
              ابدأ استكشاف مذاق
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
            <p className="text-[10px] text-[#9c8063]">حلويات • معجنات • مخبوزات طازجة</p>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
