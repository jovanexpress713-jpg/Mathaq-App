/**
 * MAZAQ Owner & Admin Dashboard
 * Comprehensive management portal for products, categories, offers, orders, settings, and logs.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  LayoutGrid,
  Sparkles,
  ClipboardList,
  Settings as SettingsIcon,
  FileText,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Upload,
  RefreshCw,
  Key,
  X,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Store,
  TicketPercent,
} from 'lucide-react';
import {
  Category,
  Product,
  Offer,
  Order,
  OrderStatus,
  ShopSettings,
  AdminUser,
  AuditLog,
} from '../types';
import { api, removeAuthToken } from '../services/api';
import { MazaqLogo } from './MazaqLogo';
import { GroceryAccountsPanel } from './GroceryAccountsPanel';
import { CouponsPanel } from './CouponsPanel';

interface AdminDashboardProps {
  onClose: () => void;
  onDataChanged: () => void;
}

type AdminTab =
  | 'stats'
  | 'products'
  | 'groceries'
  | 'categories'
  | 'offers'
  | 'coupons'
  | 'orders'
  | 'settings'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onDataChanged,
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('owner');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data collections
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals for Create/Edit
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setCurrentUser(res.user);
        loadAllData();
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.login(loginUsername, loginPassword);
      setCurrentUser(res.user);
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [s, p, c, o, ord, sett, logs] = await Promise.all([
        api.getStats().catch(() => null),
        api.getProducts(undefined, undefined, true).catch(() => []),
        api.getCategories(true).catch(() => []),
        api.getOffers(true).catch(() => []),
        api.getOrders().catch(() => []),
        api.getSettings().catch(() => null),
        api.getAuditLogs().catch(() => []),
      ]);
      setStats(s);
      setProducts(p);
      setCategories(c);
      setOffers(o);
      setOrders(ord);
      setSettings(sett);
      setAuditLogs(logs);
      onDataChanged();
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const formatAddress = (addr: any): string => {
    if (!addr) return 'غير محدد';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const parts: string[] = [];
      if (addr.area) parts.push(addr.area);
      if (addr.details) parts.push(addr.details);
      if (addr.landmark) parts.push(`(معلم: ${addr.landmark})`);
      return parts.length > 0 ? parts.join(' - ') : JSON.stringify(addr);
    }
    return String(addr);
  };

  // Image Upload helper
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, file.name);
        onSuccess(res.url);
        notify('تم رفع الصورة بنجاح');
      } catch (err: any) {
        alert(err.message || 'فشل رفع الصورة');
      }
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // IF NOT AUTHENTICATED: SHOW LOGIN DIALOG
  // ==========================================
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
        <div className="relative w-full max-w-sm bg-[#16100c] border border-[#3d2c1d] rounded-3xl p-6 shadow-2xl text-right">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-xs text-[#857361] hover:text-[#f5ebe1]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <MazaqLogo size="md" className="mb-3" logoUrl={settings?.logoUrl} />
            <h2 className="text-lg font-bold text-[#f5ebe1]">لوحة تحكم الإدارة</h2>
            <p className="text-xs text-[#857361] mt-1">
              منطقة آمنة ومخصصة لمالك وإدارة مذاق
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#b8a594] mb-1">اسم المستخدم</label>
              <input
                id="admin-username-input"
                type="text"
                value={loginUsername || ''}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="owner"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#b8a594] mb-1">كلمة المرور</label>
              <input
                id="admin-password-input"
                type="password"
                value={loginPassword || ''}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120d0a] border border-[#2d2118] focus:border-[#c69a59] text-xs text-[#f5ebe1] outline-none"
              />
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#c69a59] hover:bg-[#d4af37] disabled:opacity-50 text-[#0c0907] font-bold text-xs shadow-md transition-all mt-2"
            >
              {isLoggingIn ? 'جارٍ التحقق...' : 'تسجيل الدخول إلى النظام'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED OWNER PORTAL
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0907] text-[#f5ebe1] overflow-hidden" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#140e0a] border-l border-[#2d2118] flex flex-col justify-between p-4 shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Brand & User Info */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2d2118]">
            <div>
              <h2 className="text-sm font-bold text-[#c69a59]">مذاق | لوحة الإدارة</h2>
              <span className="text-[11px] text-[#857361] block mt-0.5">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#201610] text-[#857361] hover:text-[#f5ebe1]"
              title="إغلاق والعودة للتطبيق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'stats', label: 'نظرة عامة وإحصائيات', icon: TrendingUp },
              { id: 'orders', label: 'إدارة الطلبات المباشرة', icon: ClipboardList, badge: orders.length },
              { id: 'products', label: 'المنتجات وقائمة الأصناف', icon: Package, badge: products.length },
              { id: 'groceries', label: 'حسابات البقالات', icon: Store },
              { id: 'categories', label: 'أقسام المتجر', icon: LayoutGrid, badge: categories.length },
              { id: 'offers', label: 'سلايدر العروض الترويجية', icon: Sparkles, badge: offers.length },
              { id: 'coupons', label: 'الكوبونات والتسويق', icon: TicketPercent },
              { id: 'settings', label: 'إعدادات المتجر والتوصيل', icon: SettingsIcon },
              { id: 'audit', label: 'سجل العمليات والرقابة', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#c69a59] text-[#0c0907] font-bold shadow-[0_0_12px_rgba(198,154,89,0.3)]'
                      : 'text-[#b8a594] hover:bg-[#1e1510] hover:text-[#f5ebe1]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive ? 'bg-[#0c0907] text-[#c69a59]' : 'bg-[#251b14] text-[#857361]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#2d2118] space-y-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#857361] hover:text-[#c69a59] hover:bg-[#1e1510] transition-colors"
          >
            <Key className="w-4 h-4" />
            <span>تغيير كلمة المرور</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#b91c1c] hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0907] overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-[#140e0a]/95 backdrop-blur-md border-b border-[#2d2118]">
          <div className="flex items-center gap-3">
            {/* Mobile Tab Switcher Toggle */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#201610] text-[#857361]"
              >
                <X className="w-4 h-4" />
              </button>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="bg-[#1e1510] border border-[#2d2118] text-xs text-[#f5ebe1] px-2 py-1.5 rounded-lg outline-none"
              >
                <option value="stats">نظرة عامة</option>
                <option value="orders">الطلبات</option>
                <option value="products">المنتجات</option>
                <option value="groceries">حسابات البقالات</option>
                <option value="categories">الأقسام</option>
                <option value="offers">العروض</option>
                <option value="coupons">الكوبونات والتسويق</option>
                <option value="settings">الإعدادات</option>
                <option value="audit">السجل</option>
              </select>
            </div>

            <h1 className="text-sm sm:text-base font-bold text-[#f5ebe1] hidden md:block">
              {activeTab === 'stats' && 'لوحة التحكم والتحليلات'}
              {activeTab === 'orders' && 'سجل ومتابعة الطلبات المباشرة'}
              {activeTab === 'products' && 'إدارة قائمة المنتجات والأصناف'}
              {activeTab === 'groceries' && 'مراجعة واعتماد حسابات البقالات'}
              {activeTab === 'categories' && 'إدارة أقسام وتصنيفات المتجر'}
              {activeTab === 'offers' && 'إدارة بنرات وعروض السلايدر الترويجي'}
              {activeTab === 'coupons' && 'مركز التسويق والكوبونات'}
              {activeTab === 'settings' && 'إعدادات المتجر ومناطق التوصيل'}
              {activeTab === 'audit' && 'سجل الرقابة والعمليات الإدارية'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1510] hover:bg-[#2a1c14] border border-[#3d2c1d] text-xs text-[#c69a59] transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs hover:bg-[#d4af37]"
            >
              عرض المتجر
            </button>
          </div>
        </header>

        {/* Notifications & Status Banner */}
        {statusMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content by Tab */}
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* 1. STATS OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#18110c] border border-[#2d2118] space-y-1">
                  <span className="text-xs text-[#857361]">إجمالي الإيرادات</span>
                  <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-black text-[#c69a59]">
                    <span>{stats?.totalRevenue || 0}</span>
                    <span className="text-xs">ريال</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#18110c] border border-[#2d2118] space-y-1">
                  <span className="text-xs text-[#857361]">إجمالي الطلبات</span>
                  <div className="text-xl sm:text-2xl font-black text-[#f5ebe1]">
                    {stats?.totalOrders || 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#18110c] border border-[#2d2118] space-y-1">
                  <span className="text-xs text-[#857361]">طلبات قيد التجهيز</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    {stats?.pendingOrders || 0}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#18110c] border border-[#2d2118] space-y-1">
                  <span className="text-xs text-[#857361]">منتجات نشطة</span>
                  <div className="text-xl sm:text-2xl font-black text-[#f5ebe1]">
                    {stats?.activeProducts || 0}
                  </div>
                </div>
              </div>

              {/* Latest 5 Orders */}
              <div className="p-5 rounded-2xl bg-[#18110c] border border-[#2d2118] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#f5ebe1]">آخر الطلبات الواردة</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#c69a59] hover:underline"
                  >
                    عرض كل الطلبات &gt;
                  </button>
                </div>

                <div className="divide-y divide-[#251b14]">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <span className="font-bold text-[#c69a59]">{ord.orderNumber}</span>
                        <span className="text-[#857361] mr-2">{ord.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#f5ebe1] font-bold">{ord.grandTotal} ريال</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#251b14] text-[#c69a59]">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#b8a594]">
                  الطلبات المسجلة ({orders.length})
                </h2>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#251b14]">
                      <div>
                        <span className="text-sm font-black text-[#c69a59]">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-[#857361] mr-2">
                          {new Date(order.createdAt).toLocaleString('ar-SA')}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#857361]">الحالة:</span>
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as OrderStatus;
                            try {
                              await api.updateOrderStatus(order.id, newStatus);
                              notify('تم تحديث حالة الطلب بنجاح');
                              loadAllData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#251b14] border border-[#3d2c1d] text-xs font-bold text-[#c69a59] outline-none"
                        >
                          <option value="PENDING">قيد الانتظار (PENDING)</option>
                          <option value="CONFIRMED">تم التأكيد (CONFIRMED)</option>
                          <option value="PREPARING">قيد التحضير (PREPARING)</option>
                          <option value="READY">جاهز للتوصيل (READY)</option>
                          <option value="OUT_FOR_DELIVERY">في الطريق (OUT_FOR_DELIVERY)</option>
                          <option value="DELIVERED">تم التوصيل (DELIVERED)</option>
                          <option value="CANCELLED">ملغي (CANCELLED)</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#b8a594]">
                      <div>
                        <strong className="text-[#f5ebe1]">العميل:</strong> {order.customer?.name || 'عميل'}
                      </div>
                      <div>
                        <strong className="text-[#f5ebe1]">الجوال:</strong> {order.customer?.phone || '-'}
                      </div>
                      <div>
                        <strong className="text-[#f5ebe1]">العنوان:</strong> {formatAddress(order.customer?.address)}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-3 bg-[#120d0a] rounded-xl text-xs space-y-1">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {i.quantity}x {i.name || i.productName || 'صنف'}
                          </span>
                          <span className="text-[#c69a59] font-bold">
                            {i.totalPrice ?? i.totalItemPrice ?? ((i.unitPrice || i.unitBasePrice || 0) * i.quantity)} ريال
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[#251b14] flex justify-between font-bold text-[#f5ebe1]">
                        <span>المجموع الكلي:</span>
                        <span className="text-[#c69a59]">{order.grandTotal} ريال</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#b8a594]">
                  قائمة المنتجات ({products.length})
                </h2>
                <button
                  id="admin-add-product-btn"
                  onClick={() =>
                    setEditingProduct({
                      name: '',
                      description: '',
                      price: 25,
                      categoryId: categories[0]?.id || '',
                      image:
                        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
                      isFeatured: false,
                      isAvailable: true,
                      options: [
                        {
                          name: 'الحجم',
                          choices: [
                            { name: 'صغيرة', extraPrice: 0, isDefault: true },
                            { name: 'متوسطة', extraPrice: 10 },
                            { name: 'كبيرة', extraPrice: 20 },
                          ],
                        },
                      ],
                    })
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>

              {/* Products Table / Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-[#18110c] border border-[#2d2118] rounded-2xl flex gap-3 items-center justify-between"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover bg-[#0c0907]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#f5ebe1] truncate">{prod.name}</h4>
                      <div className="flex items-baseline gap-1 text-xs text-[#c69a59] font-bold mt-0.5">
                        <span>{prod.price} ريال للأفراد</span>
                        {prod.wholesalePrice !== undefined && prod.wholesalePrice !== null && (
                          <span className="text-[10px] text-emerald-400 mr-1">• {prod.wholesalePrice} ريال جملة</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#857361]">
                        {categories.find((c) => c.id === prod.categoryId)?.name || 'عام'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="p-1.5 rounded-lg bg-[#251b14] text-[#c69a59] hover:bg-[#3d2c1d]"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`هل أنت متأكد من أرشفة المنتج "${prod.name}"؟`)) {
                            try {
                              await api.deleteProduct(prod.id);
                              notify('تمت أرشفة المنتج بنجاح');
                              loadAllData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#251b14] text-red-400 hover:bg-red-950"
                        title="أرشفة / حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groceries' && <GroceryAccountsPanel />}

          {/* 4. CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#b8a594]">
                  أقسام المتجر ({categories.length})
                </h2>
                <button
                  onClick={() =>
                    setEditingCategory({
                      name: '',
                      subtitle: '',
                      icon: 'cake',
                      image:
                        'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
                      sortOrder: categories.length + 1,
                      isActive: true,
                    })
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-[#18110c] border border-[#2d2118] rounded-2xl flex items-center justify-between gap-3"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-14 h-14 rounded-xl object-cover bg-[#0c0907]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#f5ebe1]">{cat.name}</h4>
                      <p className="text-[10px] text-[#857361] truncate">{cat.subtitle}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 rounded-lg bg-[#251b14] text-[#c69a59]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`حذف قسم "${cat.name}"؟`)) {
                            try {
                              await api.deleteCategory(cat.id);
                              notify('تم حذف القسم');
                              loadAllData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#251b14] text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. OFFERS MANAGEMENT */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#b8a594]">
                  بنرات العروض الترويجية ({offers.length})
                </h2>
                <button
                  onClick={() =>
                    setEditingOffer({
                      title: '',
                      description: '',
                      newPrice: 30,
                      oldPrice: 40,
                      discountPercentage: 25,
                      buttonText: 'اطلب الآن',
                      displayDuration: 4,
                      image:
                        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
                      isActive: true,
                      isFeatured: true,
                    })
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عرض جديد</span>
                </button>
              </div>

              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 bg-[#18110c] border border-[#2d2118] rounded-2xl flex items-center justify-between gap-4"
                  >
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-20 h-14 rounded-xl object-cover bg-[#0c0907]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#f5ebe1]">{offer.title}</h4>
                        {offer.discountPercentage > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-950 text-red-400 font-bold">
                            خصم {offer.discountPercentage}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#857361] mt-0.5">{offer.description}</p>
                      <span className="text-xs font-bold text-[#c69a59]">
                        {offer.newPrice} ريال (بدلاً من {offer.oldPrice} ريال)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingOffer(offer)}
                        className="p-2 rounded-xl bg-[#251b14] text-[#c69a59]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`حذف العرض "${offer.title}"؟`)) {
                            try {
                              await api.deleteOffer(offer.id);
                              notify('تم حذف العرض بنجاح');
                              loadAllData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="p-2 rounded-xl bg-[#251b14] text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && <CouponsPanel />}

          {/* 6. SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-4 max-w-xl">
              {/* Logo Management Card */}
              <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#c69a59] flex items-center gap-1.5">
                    <span>شعار وهوية المتجر (Logo)</span>
                  </h3>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, logoUrl: '' })}
                      className="text-[11px] text-[#857361] hover:text-[#c69a59] transition-colors"
                    >
                      استعادة الشعار الافتراضي
                    </button>
                  )}
                </div>

                {/* Logo Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[#120d0a] border border-[#251b14] rounded-xl">
                  <div className="p-2 bg-[#0c0907] rounded-xl border border-[#2d2118] flex items-center justify-center">
                    <MazaqLogo size="md" logoUrl={settings.logoUrl} />
                  </div>
                  <div className="space-y-2 flex-1 w-full text-right">
                    <p className="text-xs font-bold text-[#f5ebe1]">
                      {settings.logoUrl ? 'شعار مخصص قيد الاستخدام' : 'الشعار الرسمي المعتمد (الكرواسون والسنبلة)'}
                    </p>
                    <p className="text-[11px] text-[#857361] leading-relaxed">
                      يظهر الشعار في شاشة الترحيب (Splash Screen)، وشريط التنقل العلوي، وشاشة الحساب، والتقارير.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#251b14] hover:bg-[#3d2c1d] border border-[#3d2c1d] text-[#c69a59] hover:text-[#d4af37] text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة شعار جديدة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageFileChange(e, (url) =>
                              setSettings({ ...settings, logoUrl: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, logoUrl: '' })}
                          className="px-3 py-1.5 rounded-lg bg-[#201510] hover:bg-[#301c14] border border-[#3d2c1d] text-[#b8a594] text-xs font-medium transition-all"
                        >
                          إلغاء التخصيص
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-xs text-[#857361] mb-1">
                    أو أدخل رابط صورة الشعار مباشرة (Image URL)
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://... أو اترك الحقل فارغاً للشعار الافتراضي"
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs text-[#f5ebe1] placeholder-[#5a4a3c] outline-none focus:border-[#c69a59]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-[#c69a59]">معلومات وهوية المتجر</h3>
                <div>
                  <label className="block text-xs text-[#857361] mb-1">اسم المتجر</label>
                  <input
                    type="text"
                    value={settings.shopName || ''}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#857361] mb-1">الشعار النصي (Tagline)</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#857361] mb-1">الشعار الفرعي (Sub-Tagline)</label>
                  <input
                    type="text"
                    value={settings.subTagline || ''}
                    onChange={(e) => setSettings({ ...settings, subTagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[#857361] mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#857361] mb-1">واتساب</label>
                    <input
                      type="text"
                      value={settings.whatsapp || ''}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#857361] mb-1">ساعات العمل</label>
                  <input
                    type="text"
                    value={settings.workingHours || ''}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#18110c] border border-[#2d2118] rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-[#c69a59]">شروط التوصيل والحد الأدنى</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[#857361] mb-1">الحد الأدنى للطلب (ريال)</label>
                    <input
                      type="number"
                      value={settings.minOrderAmount ?? settings.minOrder ?? 0}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minOrderAmount: Number(e.target.value),
                          minOrder: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#857361] mb-1">
                      حد التوصيل المجاني (ريال)
                    </label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold ?? 0}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeDeliveryThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    await api.updateSettings(settings);
                    notify('تم حفظ الإعدادات بنجاح');
                    loadAllData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="w-full py-3 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
              >
                حفظ التغييرات
              </button>
            </div>
          )}

          {/* 7. AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#b8a594]">
                سجل النشاط الإداري والعمليات ({auditLogs.length})
              </h3>
              <div className="divide-y divide-[#251b14] bg-[#18110c] border border-[#2d2118] rounded-2xl p-4 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#c69a59]">{log.action}</span>
                      <span className="text-[#f5ebe1] mr-2">بواسطة {log.actor}</span>
                      <p className="text-[11px] text-[#857361] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-[#736353]">
                      {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-lg bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#251b14]">
              <h3 className="text-sm font-bold text-[#f5ebe1]">
                {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-xs text-[#857361]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#857361] mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                />
              </div>

              <div>
                <label className="block text-[#857361] mb-1">الوصف والمكونات</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#857361] mb-1">سعر الأفراد (ريال) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#857361] mb-1">سعر الجملة للبقالات (ريال)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.wholesalePrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        wholesalePrice: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    placeholder="اتركه فارغاً لإيقاف بيع الجملة"
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                  <p className="text-[10px] text-[#857361] mt-1">لا يظهر هذا السعر للزوار أو الأفراد.</p>
                </div>
                <div>
                  <label className="block text-[#857361] mb-1">السعر القديم قبل الخصم</label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        oldPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#857361] mb-1">القسم *</label>
                <select
                  value={editingProduct.categoryId || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs text-[#f5ebe1]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Input & Upload */}
              <div>
                <label className="block text-[#857361] mb-1">رابط أو رفع صورة المنتج</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#251b14] text-[#c69a59] cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageFileChange(e, (url) =>
                          setEditingProduct({ ...editingProduct, image: url })
                        )
                      }
                    />
                  </label>
                </div>
                {editingProduct.image && (
                  <img
                    src={editingProduct.image}
                    alt="معاينة"
                    className="w-16 h-16 rounded-xl object-cover mt-2 bg-[#0c0907]"
                  />
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#251b14] flex gap-2">
              <button
                onClick={async () => {
                  try {
                    if (editingProduct.id) {
                      await api.updateProduct(editingProduct.id, editingProduct);
                      notify('تم تحديث المنتج بنجاح');
                    } else {
                      await api.createProduct(editingProduct);
                      notify('تم إنشاء المنتج بنجاح');
                    }
                    setEditingProduct(null);
                    loadAllData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
              >
                حفظ المنتج
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-[#3d2c1d] text-xs text-[#857361]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-sm bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#f5ebe1]">
              {editingCategory.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>
            <input
              type="text"
              value={editingCategory.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              placeholder="اسم القسم (مثال: حلويات شرقية)"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <input
              type="text"
              value={editingCategory.subtitle || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, subtitle: e.target.value })}
              placeholder="الوصف الفرعي (مثال: بقلاوة ومعمول طازج)"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <input
              type="text"
              value={editingCategory.image || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
              placeholder="رابط الصورة"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  try {
                    if (editingCategory.id) {
                      await api.updateCategory(editingCategory.id, editingCategory);
                      notify('تم تحديث القسم');
                    } else {
                      await api.createCategory(editingCategory);
                      notify('تم إنشاء القسم');
                    }
                    setEditingCategory(null);
                    loadAllData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="px-3 py-2 rounded-xl border border-[#3d2c1d] text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT OFFER MODAL */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#f5ebe1]">
              {editingOffer.id ? 'تعديل العرض' : 'إضافة عرض جديد'}
            </h3>
            <input
              type="text"
              value={editingOffer.title || ''}
              onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
              placeholder="عنوان العرض (مثال: بوكس الجمعات الفاخر)"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <textarea
              value={editingOffer.description || ''}
              onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
              placeholder="تفاصيل العرض"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-[#857361]">السعر الجديد</label>
                <input
                  type="number"
                  value={editingOffer.newPrice || 0}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, newPrice: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#857361]">السعر القديم</label>
                <input
                  type="number"
                  value={editingOffer.oldPrice || 0}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, oldPrice: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#857361]">مدة العرض (ثواني)</label>
                <input
                  type="number"
                  value={editingOffer.displayDuration || 4}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, displayDuration: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
                />
              </div>
            </div>
            <input
              type="text"
              value={editingOffer.image || ''}
              onChange={(e) => setEditingOffer({ ...editingOffer, image: e.target.value })}
              placeholder="رابط صورة العرض"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  try {
                    if (editingOffer.id) {
                      await api.updateOffer(editingOffer.id, editingOffer);
                      notify('تم تحديث العرض');
                    } else {
                      await api.createOffer(editingOffer);
                      notify('تم إنشاء العرض');
                    }
                    setEditingOffer(null);
                    loadAllData();
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
              >
                حفظ العرض
              </button>
              <button
                onClick={() => setEditingOffer(null)}
                className="px-3 py-2 rounded-xl border border-[#3d2c1d] text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-sm bg-[#16100c] border border-[#3d2c1d] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#f5ebe1]">تغيير كلمة مرور الإدارة</h3>
            <input
              type="password"
              value={newPassword || ''}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة (6 خانات على الأقل)"
              className="w-full px-3 py-2 rounded-xl bg-[#120d0a] border border-[#2d2118] text-xs"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  try {
                    await api.changePassword(newPassword);
                    notify('تم تغيير كلمة المرور بنجاح');
                    setShowPasswordModal(false);
                    setNewPassword('');
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-[#c69a59] text-[#0c0907] font-bold text-xs"
              >
                حفظ كلمة المرور
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-2 rounded-xl border border-[#3d2c1d] text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
