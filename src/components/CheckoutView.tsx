/**
 * MAZAQ Checkout View
 * Exact visual match to Screen 6 from IMG-20260912-WA0019.jpg
 * 3-Step Stepper: Address -> Payment -> Review with server validation
 */

import React, { useState } from 'react';
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Navigation,
  AlertCircle,
  Clock,
  ShieldCheck,
  MessageCircle,
  Check,
} from 'lucide-react';
import { CartItem, CustomerInfo, DeliveryZone, Order, PaymentMethod, ShopSettings } from '../types';
import { api } from '../services/api';

interface CheckoutViewProps {
  cart: CartItem[];
  settings: ShopSettings | null;
  onBackToCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  settings,
  onBackToCart,
  onOrderSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery zones from settings or default
  const zones: DeliveryZone[] = settings?.deliveryZones || [
    { id: '1', name: 'المنطقة المركزية', fee: 5, estimatedMinutes: 25 },
    { id: '2', name: 'شمال وشرق المدينة', fee: 10, estimatedMinutes: 35 },
    { id: '3', name: 'جنوب وغرب المدينة', fee: 15, estimatedMinutes: 45 },
  ];

  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(zones[0]);

  // Customer state
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
    coordinates: { lat: 24.7136, lng: 46.6753 }, // Riyadh default
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WHATSAPP');
  const [orderNotes, setOrderNotes] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'grocery'>('individual');
  const [groceryMode, setGroceryMode] = useState<'register' | 'login'>('register');
  const [groceryForm, setGroceryForm] = useState({ storeName: '', contactName: '', phone: '', address: '', password: '' });
  const [groceryAccount, setGroceryAccount] = useState<any>(null);
  const [groceryToken, setGroceryToken] = useState('');
  const [groceryMessage, setGroceryMessage] = useState('');

  const handleGroceryAuth = async () => {
    setGroceryMessage('');
    try {
      const result = groceryMode === 'register'
        ? await api.registerGrocery(groceryForm)
        : await api.loginGrocery(groceryForm.phone, groceryForm.password);
      setGroceryAccount(result.account);
      setGroceryToken(result.token);
      setCustomer({ ...customer, phone: groceryForm.phone, ...(result.account.contactName ? { name: result.account.contactName } : {}) });
      setGroceryMessage(result.account.status === 'APPROVED' ? 'تم تسجيل الدخول. أسعار الجملة مفعّلة لحسابك.' : 'تم استلام بيانات البقالة. حسابك بانتظار موافقة الإدارة، ويمكنك الطلب بسعر الأفراد الآن.');
    } catch (err: any) {
      setGroceryMessage(err.message || 'تعذر إكمال العملية');
    }
  };

  // Calculations
  const itemsTotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const isFreeDelivery =
    settings?.freeDeliveryThreshold && itemsTotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : selectedZone.fee;
  const grandTotal = itemsTotal + deliveryFee;

  // Validation
  const validateStep1 = () => {
    if (!customer.name.trim()) {
      setErrorMessage('يرجى إدخال اسم المستلم');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح للتواصل');
      return false;
    }
    if (!customer.address.trim()) {
      setErrorMessage('يرجى كتابة تفاصيل العنوان والشارع');
      return false;
    }
    if (accountType === 'grocery' && (!groceryToken || groceryAccount?.status !== 'APPROVED')) {
      setErrorMessage('للطلب بسعر الجملة يجب تسجيل الدخول بحساب بقالة معتمد. يمكنك اختيار طلب أفراد بدلاً من ذلك.');
      return false;
    }
    if (accountType === 'grocery' && groceryForm.phone.replace(/\\D/g, '') !== customer.phone.replace(/\\D/g, '')) {
      setErrorMessage('رقم هاتف المستلم يجب أن يطابق رقم حساب البقالة');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await api.createOrder({
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: {
            area: selectedZone.name,
            details: `${selectedZone.name} - ${customer.address.trim()}`,
          },
          notes: orderNotes,
        },
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        paymentMethod: 'WHATSAPP',
        accountType,
        groceryAccountToken: accountType === 'grocery' ? groceryToken : undefined,
        notes: orderNotes,
      });

      // Prepare formatted WhatsApp message
      let cleanPhone = (settings?.whatsapp || settings?.phone || '+966551234567').replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
        cleanPhone = '966' + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
        cleanPhone = '966' + cleanPhone;
      } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
        cleanPhone = '967' + cleanPhone;
      }

      const itemsList = order.items
        .map((i) => {
          const optStr =
            i.selectedOptions && i.selectedOptions.length > 0
              ? ` (${i.selectedOptions.map((o) => o.choiceName || o.name).join('، ')})`
              : '';
          return `▫️ *${i.quantity}x ${i.productName || i.name}*${optStr} = ${i.totalItemPrice ?? i.totalPrice ?? 0} ريال`;
        })
        .join('\n');

      const waMessage =
        `*طلب جديد من متجر مذاق | MAZAQ* 🥐✨\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `*رقم الطلب:* #${order.orderNumber}\n` +
        `*اسم العميل:* ${customer.name}\n` +
        `*رقم الجوال:* ${customer.phone}\n` +
        `*منطقة التوصيل:* ${selectedZone.name}\n` +
        `*العنوان التفصيلي:* ${customer.address}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `*الأصناف المطلوبة:*\n${itemsList}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `*مجموع الأصناف:* ${order.itemsTotal} ريال\n` +
        `*رسوم التوصيل:* ${order.deliveryFee === 0 ? 'مجاناً ✨' : `${order.deliveryFee} ريال`}\n` +
        `*الإجمالي النهائي المطلوب:* ${order.grandTotal} ريال\n` +
        `*طريقة الدفع:* الدفع والتحويل عبر الواتساب 💬\n` +
        (orderNotes ? `*ملاحظات إضافية:* ${orderNotes}\n` : '') +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `مرحباً خدمة عملاء مذاق، أود إتمام دفع طلبي وإرسال إيصال التحويل لاعتماده وتجهيزه. شكراً لكم!`;

      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

      // Open WhatsApp chat in a new tab
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Could not auto-open WhatsApp:', err);
      }

      onOrderSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر إتمام الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="checkout-view" className="w-full max-w-xl mx-auto pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#2d2118] px-2 mb-4">
        <button
          id="checkout-back-btn"
          onClick={currentStep === 1 ? onBackToCart : () => setCurrentStep((currentStep - 1) as any)}
          className="flex items-center gap-1.5 text-xs text-[#b8a594] hover:text-[#f5ebe1] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{currentStep === 1 ? 'الرجوع للسلة' : 'السابق'}</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#f5ebe1]">إتمام الطلب</h1>
        <div className="w-8" />
      </div>

      {/* Stepper Progress Bar (Screen 6 Mockup) */}
      <div className="flex items-center justify-between mb-6 px-4">
        {[
          { step: 1, label: 'العنوان' },
          { step: 2, label: 'الدفع' },
          { step: 3, label: 'مراجعة الطلب' },
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.step
                    ? 'bg-[#c69a59] text-[#0c0907] shadow-[0_0_12px_#c69a59]'
                    : currentStep > s.step
                    ? 'bg-[#251a13] text-[#c69a59] border border-[#c69a59]'
                    : 'bg-[#18110c] text-[#857361] border border-[#2d2118]'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span
                className={`text-[11px] ${
                  currentStep === s.step ? 'font-bold text-[#c69a59]' : 'text-[#857361]'
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${
                  currentStep > idx + 1 ? 'bg-[#c69a59]' : 'bg-[#2d2118]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Delivery Address & Map */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Customer Details */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-[#c69a59] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>بيانات المستلم</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setAccountType('individual')} className={`rounded-xl border p-2.5 text-xs font-bold ${accountType === 'individual' ? 'border-[#c69a59] bg-[#251b14] text-[#f5ebe1]' : 'border-[#2d2118] text-[#857361]'}`}>طلب أفراد</button>
              <button type="button" onClick={() => setAccountType('grocery')} className={`rounded-xl border p-2.5 text-xs font-bold ${accountType === 'grocery' ? 'border-[#c69a59] bg-[#251b14] text-[#f5ebe1]' : 'border-[#2d2118] text-[#857361]'}`}>حساب بقالة / جملة</button>
            </div>
            {accountType === 'grocery' && (
              <div className="rounded-xl border border-[#3d2c1d] bg-[#120d0a] p-3 space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setGroceryMode('register')} className={`text-[11px] px-3 py-1.5 rounded-lg ${groceryMode === 'register' ? 'bg-[#c69a59] text-black' : 'bg-[#251b14] text-[#b8a594]'}`}>تسجيل بقالة جديدة</button>
                  <button type="button" onClick={() => setGroceryMode('login')} className={`text-[11px] px-3 py-1.5 rounded-lg ${groceryMode === 'login' ? 'bg-[#c69a59] text-black' : 'bg-[#251b14] text-[#b8a594]'}`}>لدي حساب</button>
                </div>
                {groceryMode === 'register' && <>
                  <input value={groceryForm.storeName} onChange={e => setGroceryForm({...groceryForm, storeName:e.target.value})} placeholder="اسم البقالة" className="w-full px-3 py-2 rounded-lg bg-[#18110c] border border-[#2d2118] text-xs" />
                  <input value={groceryForm.contactName} onChange={e => setGroceryForm({...groceryForm, contactName:e.target.value})} placeholder="اسم المسؤول" className="w-full px-3 py-2 rounded-lg bg-[#18110c] border border-[#2d2118] text-xs" />
                  <input value={groceryForm.address} onChange={e => setGroceryForm({...groceryForm, address:e.target.value})} placeholder="عنوان البقالة" className="w-full px-3 py-2 rounded-lg bg-[#18110c] border border-[#2d2118] text-xs" />
                </>}
                <input value={groceryForm.phone} onChange={e => setGroceryForm({...groceryForm, phone:e.target.value})} placeholder="رقم هاتف حساب البقالة" dir="ltr" className="w-full px-3 py-2 rounded-lg bg-[#18110c] border border-[#2d2118] text-xs text-right" />
                <input type="password" value={groceryForm.password} onChange={e => setGroceryForm({...groceryForm, password:e.target.value})} placeholder="كلمة المرور (8 أحرف على الأقل)" className="w-full px-3 py-2 rounded-lg bg-[#18110c] border border-[#2d2118] text-xs" />
                <button type="button" onClick={handleGroceryAuth} className="w-full rounded-lg bg-[#c69a59] text-[#120d0a] py-2.5 text-xs font-bold">{groceryMode === 'register' ? 'إرسال طلب تسجيل البقالة' : 'تسجيل الدخول'}</button>
                {groceryMessage && <p className="text-[11px] text-[#c69a59] leading-5">{groceryMessage}</p>}
                {groceryAccount && <p className="text-[10px] text-[#b8a594]">الحساب: {groceryAccount.storeName} — {groceryAccount.status === 'APPROVED' ? 'معتمد' : groceryAccount.status === 'PENDING' ? 'بانتظار الموافقة' : 'مرفوض'}</p>}
              </div>
            )}

            <div>
              <label className="block text-[11px] text-[#b8a594] mb-1">الاسم الكامل *</label>
              <input
                id="checkout-name-input"
                type="text"
                value={customer.name || ''}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="مثال: عبدالله محمد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#b8a594] mb-1">رقم الجوال *</label>
              <input
                id="checkout-phone-input"
                type="tel"
                value={customer.phone || ''}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none text-right"
              />
            </div>
          </div>

          {/* Delivery Zone Selector */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-[#c69a59] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>منطقة التوصيل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {zones.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone)}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'bg-[#251b14] border-[#c69a59] text-[#f5ebe1] shadow-[0_0_10px_rgba(198,154,89,0.15)]'
                        : 'bg-[#120d0a] border-[#2d2118] text-[#857361] hover:border-[#3d2c1d]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#f5ebe1]">{zone.name}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-[#857361]">{zone.estimatedMinutes} دقيقة</span>
                      <span className="font-bold text-[#c69a59]">
                        {isFreeDelivery ? 'مجاناً' : `${zone.fee} ريال`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] text-[#b8a594] mb-1">تفاصيل الشارع والمنزل *</label>
              <input
                id="checkout-address-input"
                type="text"
                value={typeof customer.address === 'string' ? customer.address : (customer.address?.details || '')}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="اسم الحي، الشارع، رقم المبنى أو معلم بارز"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none"
              />
            </div>
          </div>

          {/* Interactive Map Mockup Card (Screen 6) */}
          <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#2d2118] bg-[#120d0a]">
            {/* Map styling layer */}
            <div className="absolute inset-0 bg-[radial-gradient(#3d2c1d_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#c69a59] text-[#0c0907] flex items-center justify-center shadow-[0_0_16px_#c69a59] mb-1 animate-bounce">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-bold text-[#f5ebe1]">موقع التوصيل المحدد</span>
              <span className="text-[10px] text-[#c69a59] mt-0.5">
                {selectedZone.name} • وصول تقريبي {selectedZone.estimatedMinutes} دقيقة
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Payment Method */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-[#c69a59] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>طريقة الدفع المعتمدة</span>
            </h2>

            {/* WhatsApp Payment - Exclusive Option */}
            <div className="p-4 rounded-xl border bg-[#1e1510] border-[#25D366]/60 text-[#f5ebe1] shadow-[0_0_20px_rgba(37,211,102,0.12)] space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#f5ebe1] flex items-center gap-2">
                      <span>الدفع عبر الواتساب فقط</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] text-[10px] font-bold">
                        طريقة معتمدة
                      </span>
                    </div>
                    <p className="text-xs text-[#d1c2b4] mt-1 leading-relaxed">
                      يتم إرسال تفاصيل الفاتورة وتنسيق التحويل البنكي مباشرة عبر محادثة الواتساب مع إدارة المتجر فور إتمام الطلب.
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-3 h-3 text-black stroke-[3]" />
                </div>
              </div>

              {/* Steps Info Box */}
              <div className="pt-2 border-t border-[#3d2c1d]/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#b8a594]">
                <div className="p-2.5 rounded-lg bg-[#120d0a] border border-[#2d2118] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c69a59]/20 text-[#c69a59] flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <span>تأكيد الطلب وحجز الأصناف</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#120d0a] border border-[#2d2118] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c69a59]/20 text-[#c69a59] flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <span>إرسال الفاتورة للواتساب تلقائياً</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#120d0a] border border-[#2d2118] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-[10px] font-bold shrink-0">
                    3
                  </span>
                  <span>تحويل المبلغ وإرسال الإيصال</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#857361] pt-1">
                <span>رقم واتساب المتجر:</span>
                <span className="font-mono text-[#25D366] font-bold" dir="ltr">
                  {settings?.whatsapp || settings?.phone || '+966551234567'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl">
            <label className="block text-[11px] text-[#b8a594] mb-1">
              ملاحظات إضافية للمخبز أو المندوب (اختياري)
            </label>
            <textarea
              id="checkout-notes-input"
              value={orderNotes || ''}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="مثال: يرجى كتابة عبارة مبروك على الكيك، أو وضع الصوص جانباً..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Order Review */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Items Summary */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-[#c69a59]">محتويات الطلب ({cart.length} أصناف)</h2>
            <div className="divide-y divide-[#251b14] max-h-48 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#c69a59]">{item.quantity}x</span>
                    <span className="text-[#f5ebe1]">{item.name}</span>
                  </div>
                  <span className="text-[#b8a594]">{item.totalPrice} ريال</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Summary */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-[#857361]">
              <span>المستلم:</span>
              <span className="text-[#f5ebe1] font-medium">{customer.name}</span>
            </div>
            <div className="flex justify-between text-[#857361]">
              <span>الجوال:</span>
              <span className="text-[#f5ebe1] font-medium" dir="ltr">{customer.phone}</span>
            </div>
            <div className="flex justify-between text-[#857361]">
              <span>العنوان:</span>
              <span className="text-[#f5ebe1] font-medium truncate max-w-[200px]">
                {selectedZone.name} - {customer.address}
              </span>
            </div>
            <div className="flex justify-between text-[#857361]">
              <span>طريقة الدفع:</span>
              <span className="text-[#25D366] font-bold flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>الدفع عبر الواتساب فقط</span>
              </span>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-[#b8a594]">
              <span>مجموع المنتجات:</span>
              <span className="text-[#f5ebe1] font-bold">{itemsTotal} ريال</span>
            </div>
            <div className="flex justify-between text-[#b8a594]">
              <span>رسوم التوصيل:</span>
              <span className="text-[#f5ebe1] font-bold">
                {deliveryFee === 0 ? 'مجاناً ✨' : `${deliveryFee} ريال`}
              </span>
            </div>
            <div className="pt-2 border-t border-[#2d2118] flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#f5ebe1]">المجموع النهائي:</span>
              <div className="flex items-baseline gap-1 text-[#c69a59]">
                <span className="text-xl font-black">{grandTotal}</span>
                <span className="text-xs font-bold">ريال</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="mt-6">
        {currentStep < 3 ? (
          <button
            id="checkout-next-btn"
            onClick={handleNextStep}
            className="w-full flex items-center justify-between px-6 py-3.5 rounded-2xl bg-[#c69a59] hover:bg-[#d4af37] text-[#0c0907] font-bold shadow-[0_4px_20px_rgba(198,154,89,0.25)] active:scale-98 transition-all"
          >
            <span className="text-sm font-bold">المتابعة للخطوة التالية</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="checkout-submit-btn"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20b858] disabled:opacity-50 text-white font-bold shadow-[0_4px_20px_rgba(37,211,102,0.3)] active:scale-98 transition-all"
          >
            {isSubmitting ? (
              <span className="text-sm font-bold">جارٍ معالجة الطلب وتجهيز الواتساب...</span>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="text-sm font-black">تأكيد الطلب والدفع عبر الواتساب ({grandTotal} ريال)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
