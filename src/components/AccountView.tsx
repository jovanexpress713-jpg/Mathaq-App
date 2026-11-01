/**
 * MAZAQ More & Account Screen
 * Exact visual match to Screen 8 in IMG-20260912-WA0019.jpg
 */

import React, { useState } from 'react';
import {
  Home,
  ClipboardList,
  MapPin,
  MessageCircle,
  Phone,
  Info,
  Clock,
  ChevronLeft,
  Share2,
  Heart,
  Check,
  Download,
} from 'lucide-react';
import { MazaqLogo } from './MazaqLogo';
import { ShopSettings } from '../types';

interface AccountViewProps {
  settings: ShopSettings | null;
  ordersCount: number;
  onGoHome: () => void;
  onGoOrders: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  settings,
  ordersCount,
  onGoHome,
  onGoOrders,
}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const phone = settings?.phone || '+966551234567';
  const whatsapp = settings?.whatsapp || '+966551234567';

  const copyToClipboardFallback = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore clipboard restrictions silently
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مذاق | MAZAQ',
          text: 'اطلب ألذ المخبوزات والحلويات والمعجنات الطازجة من تطبيق مذاق!',
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        // Specifically handle user cancellation or abort without throwing errors
        if (
          err?.name === 'AbortError' ||
          err?.name === 'NotAllowedError' ||
          err?.message?.toLowerCase().includes('cancel') ||
          err?.message?.toLowerCase().includes('abort')
        ) {
          return;
        }
        // Fallback to clipboard if sharing failed
        await copyToClipboardFallback();
      }
    } else {
      await copyToClipboardFallback();
    }
  };

  return (
    <div id="account-view" className="w-full max-w-xl mx-auto pb-24 text-right" dir="rtl">
      {/* Top Brand Banner (Screen 8 Mockup) */}
      <div className="flex flex-col items-center justify-center pt-6 pb-6 border-b border-[#2d2118]">
        <MazaqLogo size="lg" showSubtitle={false} logoUrl={settings?.logoUrl} />

        <h2 className="text-base font-bold text-[#f5ebe1] mt-4">أهلاً وسهلاً عميلنا العزيز</h2>
        <p className="text-xs text-[#857361] mt-1 text-center max-w-xs">
          طعم الأصالة في كل لقمة • حلويات ومخبوزات طازجة يومياً
        </p>
      </div>

      {/* Menu List Options (Screen 8) */}
      <div className="py-4 space-y-2">
        {/* 1. Home */}
        <button
          onClick={onGoHome}
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#251b14] flex items-center justify-center text-[#c69a59]">
              <Home className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#f5ebe1]">الرئيسية</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </button>

        {/* 2. My Orders */}
        <button
          onClick={onGoOrders}
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#251b14] flex items-center justify-center text-[#c69a59]">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f5ebe1]">طلباتي</span>
              {ordersCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#c69a59] text-[#0c0907] rounded-full">
                  {ordersCount}
                </span>
              )}
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </button>

        {/* 3. Customer Service / WhatsApp */}
        <a
          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14301d] flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#f5ebe1]">خدمة العملاء عبر واتساب</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </a>

        {/* 4. Contact & Working Hours */}
        <button
          onClick={() => setShowContactModal(true)}
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#251b14] flex items-center justify-center text-[#c69a59]">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#f5ebe1]">ساعات العمل ومعلومات التواصل</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </button>

        {/* 5. About Mazaq */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#251b14] flex items-center justify-center text-[#c69a59]">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#f5ebe1]">عن مذاق وقصة الأصالة</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </button>

        {/* 6. Download Source Code ZIP */}
        <a
          href="/api/download-zip"
          download="mazaq-project.zip"
          className="w-full flex items-center justify-between p-3.5 bg-[#18110c] hover:bg-[#201610] border border-[#2d2118] hover:border-[#3d2c1d] rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#251b14] flex items-center justify-center text-[#c69a59]">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#f5ebe1] block">تحميل ملفات المشروع (ZIP)</span>
              <span className="text-[10px] text-[#857361]">تنزيل الكود المصدري الكامل للتطبيق كملف مضغوط</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#857361]" />
        </a>

      </div>
            <div>
              <span className="text-xs font-bold text-[#c69a59] block">
                لوحة تحكم الإدارة (Owner Portal)
              </span>
              <span className="text-[10px] text-[#857361]">
                إدارة المنتجات، العروض، الطلبات والإعدادات
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#c69a59]" />
        </button>
      </div>

      {/* Bottom Sign-out or Share Card */}
      <div className="pt-4">
        <button
          onClick={handleShareApp}
          className={`w-full py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 ${
            copiedLink
              ? 'border-green-500/60 bg-green-500/10 text-green-400'
              : 'border-[#c69a59] text-[#c69a59] hover:bg-[#c69a59] hover:text-[#0c0907]'
          }`}
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span>تم نسخ رابط التطبيق بنجاح!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>مشاركة تطبيق مذاق مع الأصدقاء</span>
            </>
          )}
        </button>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d2118] pb-3">
              <h3 className="text-base font-bold text-[#f5ebe1] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#c69a59]" />
                <span>عن مخبوزات وحلويات مذاق</span>
              </h3>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-xs text-[#857361] hover:text-[#f5ebe1]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#d1c2b4] leading-relaxed">
              انطلقت علامة <strong>مذاق (MAZAQ)</strong> لتقدم المفهوم الأسمى للحلويات والمخبوزات الراقية، حيث تلتقي الحرفية العريقة بأجود المكونات الطبيعية والزبدة الفاخرة لتقديم تجربة تليق بذوقك الرفيع.
            </p>
            <div className="p-3 bg-[#120d0a] rounded-xl border border-[#2d2118] text-[11px] text-[#857361] space-y-1">
              <div>• نخبز طازجاً كل صباح بحرارة الفرن</div>
              <div>• منتجاتنا خالية من المواد الحافظة المصنعة</div>
              <div>• معايير نظافة وجودة عالمية معتمدة</div>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d2118] pb-3">
              <h3 className="text-base font-bold text-[#f5ebe1] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c69a59]" />
                <span>ساعات العمل والتواصل</span>
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-xs text-[#857361] hover:text-[#f5ebe1]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#120d0a] rounded-xl">
                <span className="text-[#857361]">ساعات استقبال الطلبات:</span>
                <span className="font-bold text-[#f5ebe1]">
                  {settings?.workingHours || 'يومياً ٧:٠٠ ص - ١١:٠٠ م'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#120d0a] rounded-xl">
                <span className="text-[#857361]">رقم الهاتف:</span>
                <span className="font-bold text-[#c69a59]" dir="ltr">{phone}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#120d0a] rounded-xl">
                <span className="text-[#857361]">واتساب الدعم:</span>
                <span className="font-bold text-[#25D366]" dir="ltr">{whatsapp}</span>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
