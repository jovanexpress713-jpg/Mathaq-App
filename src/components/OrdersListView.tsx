/**
 * MAZAQ Orders List View (شاشة طلباتي)
 * Displays current and past orders with search, status filtering, and quick tracking.
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Bike,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersListViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onContinueShopping: () => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  onSelectOrder,
  onContinueShopping,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: OrderStatus | string) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'NEW':
        return { label: 'قيد الانتظار', color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800' };
      case 'CONFIRMED':
        return { label: 'تم التأكيد', color: 'bg-blue-900/40 text-blue-400 border-blue-800' };
      case 'PREPARING':
        return { label: 'قيد التحضير', color: 'bg-amber-900/40 text-amber-400 border-amber-800' };
      case 'READY':
        return { label: 'جاهز للتوصيل', color: 'bg-indigo-900/40 text-indigo-400 border-indigo-800' };
      case 'OUT_FOR_DELIVERY':
      case 'OUTFORDELIVERY':
        return { label: 'في الطريق', color: 'bg-purple-900/40 text-purple-400 border-purple-800' };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'تم التوصيل', color: 'bg-emerald-900/40 text-emerald-400 border-emerald-800' };
      case 'CANCELLED':
        return { label: 'ملغي', color: 'bg-red-900/40 text-red-400 border-red-800' };
      default:
        return { label: String(status), color: 'bg-gray-800 text-gray-300' };
    }
  };

  const filteredOrders = orders.filter((o) => {
    const s = String(o.status).toUpperCase();
    const isCompleted = s === 'DELIVERED' || s === 'COMPLETED';
    const isCancelled = s === 'CANCELLED';

    if (filter === 'ACTIVE') {
      if (isCompleted || isCancelled) return false;
    } else if (filter === 'DELIVERED') {
      if (!isCompleted) return false;
    } else if (filter === 'CANCELLED') {
      if (!isCancelled) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const customerPhone = typeof o.customer === 'object' ? o.customer?.phone : '';
      const customerName = typeof o.customer === 'object' ? o.customer?.name : String(o.customer);
      const matchPhone = customerPhone ? customerPhone.includes(q) : false;
      const matchName = customerName ? customerName.toLowerCase().includes(q) : false;
      return matchNum || matchPhone || matchName;
    }

    return true;
  });

  return (
    <div id="orders-list-view" className="w-full max-w-2xl mx-auto pb-24 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#2d2118] px-2 mb-4">
        <h1 className="text-base sm:text-lg font-bold text-[#f5ebe1] flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#c69a59]" />
          <span>سجل طلباتي</span>
          <span className="text-xs text-[#857361]">({orders.length})</span>
        </h1>

        <button
          id="orders-back-to-home-btn"
          onClick={onContinueShopping}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1510] text-[#f5ebe1] hover:bg-[#c69a59] hover:text-[#0c0907] border border-[#2d2118] active:scale-95 transition-all text-xs font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'جميع الطلبات' },
          { key: 'ACTIVE', label: 'الطلبات الحالية' },
          { key: 'DELIVERED', label: 'المكتملة' },
          { key: 'CANCELLED', label: 'الملغاة' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-[#c69a59] text-[#0c0907]'
                : 'bg-[#18110c] text-[#857361] hover:text-[#f5ebe1] border border-[#2d2118]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#857361]" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الطلب (مثال: MZQ-2026-0001) أو رقم الجوال..."
          className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-[#16100c] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] placeholder-[#736353] outline-none"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#1c140f] border border-[#2d2118] mx-auto flex items-center justify-center text-[#857361]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-[#f5ebe1]">لا توجد طلبات</h2>
          <p className="text-xs text-[#857361] max-w-xs mx-auto">
            لم تقم بإنشاء أي طلبات مطابقة بعد. تصفح المخبوزات والحلويات اللذيذة وابدأ طلبك الآن!
          </p>
          <button
            onClick={onContinueShopping}
            className="mt-2 px-5 py-2 rounded-xl bg-[#c69a59] text-[#0c0907] text-xs font-bold"
          >
            بدء التسوق
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const createdDate = new Date(order.createdAt).toLocaleDateString('ar-SA');

            return (
              <div
                key={order.id}
                id={`order-row-${order.id}`}
                onClick={() => onSelectOrder(order)}
                className="p-4 bg-[#18110c] hover:bg-[#1f1610] border border-[#2d2118] hover:border-[#c69a59] rounded-2xl transition-all cursor-pointer shadow-md group"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#251b14]">
                  <div>
                    <span className="text-xs font-black text-[#c69a59] tracking-wider block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#857361] mt-0.5 block">{createdDate}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Items Summary preview */}
                <div className="py-2.5 text-xs text-[#d1c2b4] line-clamp-1">
                  {order.items.map((i) => `${i.quantity}x ${i.name || i.productName || 'صنف'}`).join(' ، ')}
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-[#251b14]">
                  <div className="flex items-baseline gap-1 text-[#c69a59] font-black text-sm">
                    <span>{order.grandTotal}</span>
                    <span className="text-[10px] font-bold">ريال</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[#c69a59] font-bold group-hover:translate-x-[-4px] transition-transform">
                    <span>تتبع الطلب</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
