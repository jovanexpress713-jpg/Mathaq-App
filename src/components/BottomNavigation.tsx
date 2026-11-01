/**
 * MAZAQ Bottom Navigation Bar
 * Responsive, safe-area-aware navigation that stays inside the app frame.
 */

import React from 'react';
import { Home, LayoutGrid, ClipboardList, MoreHorizontal } from 'lucide-react';

export type TabKey = 'home' | 'categories' | 'orders' | 'more';

interface BottomNavigationProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  ordersCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  ordersCount = 0,
}) => {
  const navItems = [
    { key: 'home' as TabKey, label: 'الرئيسية', icon: Home, id: 'nav-home' },
    { key: 'categories' as TabKey, label: 'الأقسام', icon: LayoutGrid, id: 'nav-categories' },
    {
      key: 'orders' as TabKey,
      label: 'الطلبات',
      icon: ClipboardList,
      id: 'nav-orders',
      badge: ordersCount > 0 ? ordersCount : undefined,
    },
    { key: 'more' as TabKey, label: 'المزيد', icon: MoreHorizontal, id: 'nav-more' },
  ];

  return (
    <nav
      id="bottom-navigation"
      aria-label="التنقل الرئيسي"
      className="sticky bottom-0 z-40 mt-auto w-full border-t border-[#3a2a1d]/90 bg-[#120d0a]/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.22)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              id={item.id}
              onClick={() => onTabChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c378] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120d0a] ${
                isActive
                  ? 'bg-[#c69a59]/10 text-[#e5c378]'
                  : 'text-[#9b8977] hover:bg-white/[0.035] hover:text-[#f5ebe1]'
              }`}
            >
              <span className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:-translate-y-0.5'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#120d0a] bg-[#c69a59] px-1 text-[9px] font-black text-[#120d0a]">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] leading-none ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                {item.label}
              </span>
              {isActive && <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-[#c69a59] shadow-[0_0_10px_rgba(198,154,89,0.65)]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
