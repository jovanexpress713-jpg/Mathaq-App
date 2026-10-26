/**
 * MAZAQ Bottom Navigation Bar
 * Recreates the authentic bottom navigation seen across all screens in IMG-20260912-WA0019.jpg
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#120d0a]/95 backdrop-blur-lg border-t border-[#2d2118] px-4 py-2"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              id={item.id}
              onClick={() => onTabChange(item.key)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 transition-all duration-200 ${
                isActive ? 'text-[#c69a59] font-bold' : 'text-[#857361] hover:text-[#b8a594]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(198,154,89,0.5)]' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#c69a59] rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 transition-colors ${isActive ? 'font-bold text-[#c69a59]' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* Active gold dot */}
              {isActive && (
                <span className="w-1 h-1 bg-[#c69a59] rounded-full mt-0.5 shadow-[0_0_6px_#c69a59]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
