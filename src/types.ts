/**
 * MAZAQ | مذاق
 * Master Domain Models and Types
 */

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type OfferActionType =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'OFFERS'
  | 'WHATSAPP'
  | 'INTERNAL_LINK'
  | 'NONE';

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  oldPrice: number;
  newPrice: number;
  discountPercentage: number;
  buttonText: string;
  actionType: OfferActionType;
  actionTarget: string;
  linkedCategoryId?: string;
  linkedProductId?: string;
  startDate: string;
  endDate: string;
  displayDuration: number; // in seconds, default 4
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DiscountCoupon {
  id: string; code: string; title: string; description?: string;
  discountType: 'PERCENT' | 'FIXED'; discountValue: number; minOrderAmount: number;
  maxDiscountAmount?: number; firstOrderOnly: boolean; usageLimit?: number;
  usageCount: number; startDate: string; endDate: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  icon: 'cake' | 'croissant' | 'bread' | 'party' | 'delivery' | 'star' | 'coffee' | string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOptionChoice {
  id?: string;
  name: string; // e.g. "صغيرة", "متوسطة", "كبيرة"
  priceModifier: number; // +0, +15, etc.
  extraPrice?: number;
  isDefault?: boolean;
}

export interface ProductOption {
  id?: string;
  name: string; // e.g. "الحجم", "النكهة"
  required?: boolean;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  wholesalePrice?: number | null;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  isArchived?: boolean; // Soft delete to protect past orders
  sortOrder: number;
  options: ProductOption[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'OutForDelivery'
  | 'Completed'
  | 'Cancelled'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'WHATSAPP'
  | 'CASH_ON_DELIVERY'
  | 'MADA_CARD'
  | 'APPLE_PAY'
  | 'CREDIT_CARD';

export interface SelectedOption {
  optionId?: string;
  optionName?: string;
  choiceId?: string;
  choiceName?: string;
  name?: string;
  priceModifier?: number;
  extraPrice?: number;
}

export interface OrderItemSnapshot {
  productId: string;
  name?: string;
  image?: string;
  productName?: string;
  productImage?: string;
  unitPrice?: number;
  unitBasePrice?: number;
  selectedOptions?: SelectedOption[] | Record<string, ProductOptionChoice>;
  calculatedItemPrice?: number;
  quantity: number;
  totalPrice?: number;
  totalItemPrice?: number;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address:
    | string
    | {
        area?: string;
        details?: string;
        lat?: number;
        lng?: number;
        landmark?: string;
      };
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Order {
  id: string;
  accountType?: 'individual' | 'grocery';
  groceryStoreName?: string;
  groceryAccountId?: string;
  orderNumber: string; // e.g. "#12345" or "MZQ-2026-0001"
  customer: CustomerInfo;
  items: OrderItemSnapshot[];
  itemsTotal: number;
  deliveryFee: number;
  discountAmount?: number;
  couponCode?: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: 'PENDING' | 'PAID';
  status: OrderStatus;
  estimatedDeliveryMinutes?: number;
  timeline?: OrderTimelineEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimatedMinutes: number;
}

export type DeliveryZone = DeliveryArea;

export interface ShopSettings {
  shopName: string;
  tagline: string;
  subTagline: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  currency: string;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  minOrder: number;
  minOrderAmount?: number;
  isAcceptingOrders: boolean;
  hero?: {
    title: string;
    subtitle: string;
    badge: string;
    ctaText: string;
    bannerImage: string;
  };
  heroBanner?: {
    title: string;
    subtitle: string;
    ctaText: string;
    image: string;
  };
  partyService?: {
    title: string;
    subtitle: string;
    image: string;
    phoneOrWhatsapp: string;
    enabled: boolean;
  };
  deliveryServiceCard?: {
    title: string;
    subtitle: string;
    badge: string;
    enabled: boolean;
  };
  deliveryAreas: DeliveryArea[];
  deliveryZones?: DeliveryArea[];
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actor: string;
  timestamp: string;
  ip?: string;
}

export interface CartItem {
  cartItemId?: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: Record<string, ProductOptionChoice>;
  product?: Product;
}
