/**
 * MAZAQ Client API Service
 * Interacts directly with the full-stack server
 */

import {
  Category,
  Product,
  Offer,
  Order,
  ShopSettings,
  AdminUser,
  AuditLog,
  DiscountCoupon,
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('mazaq_admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('mazaq_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('mazaq_admin_token');
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'حدث خطأ في الاتصال بالسيرفر');
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Settings
  getSettings: () => fetchJson<ShopSettings>(`${API_BASE}/settings`),
  updateSettings: (settings: Partial<ShopSettings>) =>
    fetchJson<ShopSettings>(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Categories
  getCategories: (all = false) =>
    fetchJson<Category[]>(`${API_BASE}/categories${all ? '?all=true' : ''}`),
  createCategory: (cat: Partial<Category>) =>
    fetchJson<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(cat),
    }),
  updateCategory: (id: string, cat: Partial<Category>) =>
    fetchJson<Category>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat),
    }),
  deleteCategory: (id: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: (categoryId?: string, search?: string, all = false) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (search) params.set('search', search);
    if (all) params.set('all', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    const endpoint = all ? `${API_BASE}/admin/products${query}` : `${API_BASE}/products${query}`;
    return fetchJson<Product[]>(endpoint);
  },
  getProductById: (id: string) => fetchJson<Product>(`${API_BASE}/products/${id}`),
  createProduct: (product: Partial<Product>) =>
    fetchJson<Product>(`${API_BASE}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, product: Partial<Product>) =>
    fetchJson<Product>(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    }),

  // Offers
  getOffers: (all = false) =>
    fetchJson<Offer[]>(`${API_BASE}/offers${all ? '?all=true' : ''}`),
  createOffer: (offer: Partial<Offer>) =>
    fetchJson<Offer>(`${API_BASE}/offers`, {
      method: 'POST',
      body: JSON.stringify(offer),
    }),
  updateOffer: (id: string, offer: Partial<Offer>) =>
    fetchJson<Offer>(`${API_BASE}/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    }),
  deleteOffer: (id: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/offers/${id}`, {
      method: 'DELETE',
    }),

  // Marketing coupons
  getCoupons: () => fetchJson<DiscountCoupon[]>(`${API_BASE}/admin/coupons`),
  createCoupon: (coupon: Partial<DiscountCoupon>) => fetchJson<DiscountCoupon>(`${API_BASE}/admin/coupons`, { method: 'POST', body: JSON.stringify(coupon) }),
  updateCoupon: (id: string, coupon: Partial<DiscountCoupon>) => fetchJson<DiscountCoupon>(`${API_BASE}/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(coupon) }),
  deleteCoupon: (id: string) => fetchJson<{ message: string }>(`${API_BASE}/admin/coupons/${id}`, { method: 'DELETE' }),

  // Grocery wholesale accounts
  registerGrocery: (payload: { storeName: string; contactName: string; phone: string; address: string; password: string }) =>
    fetchJson<{ account: any; token: string }>(`${API_BASE}/grocery/register`, { method: 'POST', body: JSON.stringify(payload) }),
  loginGrocery: (phone: string, password: string) =>
    fetchJson<{ account: any; token: string }>(`${API_BASE}/grocery/login`, { method: 'POST', body: JSON.stringify({ phone, password }) }),
  getGroceryAccounts: () => fetchJson<any[]>(`${API_BASE}/admin/grocery-accounts`),
  setGroceryAccountStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
    fetchJson<{ message: string }>(`${API_BASE}/admin/grocery-accounts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Orders
  createOrder: (payload: {
    customer: any;
    items: any[];
    paymentMethod: string;
    accountType?: 'individual' | 'grocery';
    groceryAccountToken?: string;
    couponCode?: string;
    notes?: string;
  }) =>
    fetchJson<Order>(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getOrders: (phone?: string) =>
    fetchJson<Order[]>(`${API_BASE}/orders${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  getOrderById: (id: string) => fetchJson<Order>(`${API_BASE}/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    fetchJson<Order>(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Admin notifications
  getNotifications: (unread = false) => fetchJson<Array<{ id: string; title: string; body: string; type: string; referenceId?: string; isRead: boolean; createdAt: string }>>(`${API_BASE}/admin/notifications${unread ? '?unread=true' : ''}`),
  markNotificationRead: (id: string) => fetchJson<{ message: string }>(`${API_BASE}/admin/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => fetchJson<{ message: string }>(`${API_BASE}/admin/notifications/read-all`, { method: 'PATCH' }),

  // Auth & Admin
  login: async (username: string, password: string): Promise<{ token: string; user: AdminUser }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل تسجيل الدخول');
    }
    setAuthToken(data.token);
    return { token: data.token, user: data.user };
  },
  logout: async () => {
    try {
      await fetchJson(`${API_BASE}/auth/logout`, { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },
  getMe: () => fetchJson<{ user: AdminUser }>(`${API_BASE}/auth/me`),
  changePassword: (newPassword: string) =>
    fetchJson<{ message: string }>(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
  getStats: () =>
    fetchJson<{
      totalOrders: number;
      totalRevenue: number;
      activeProducts: number;
      pendingOrders: number;
      activeOffers: number;
    }>(`${API_BASE}/admin/stats`),
  getAuditLogs: () => fetchJson<AuditLog[]>(`${API_BASE}/admin/audit-logs`),
  resetCatalog: () =>
    fetchJson<{ message: string }>(`${API_BASE}/admin/reset-catalog`, {
      method: 'POST',
    }),

  // Image upload
  uploadImage: async (dataUrl: string, filename?: string): Promise<{ url: string; size: number }> => {
    return fetchJson<{ url: string; size: number }>(`${API_BASE}/upload`, {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    });
  },
};
