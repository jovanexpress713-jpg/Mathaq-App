/**
 * MAZAQ Database Engine
 * Persistent, ACID-compliant JSON Store with file locking and atomic writes
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Category,
  Product,
  Offer,
  Order,
  ShopSettings,
  AdminUser,
  AuditLog,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mazaq_db.json');

export interface GroceryAccount {
  id: string;
  storeName: string;
  contactName: string;
  phone: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  settings: ShopSettings;
  categories: Category[];
  products: Product[];
  offers: Offer[];
  orders: Order[];
  adminUsers: (AdminUser & { passwordHash: string; salt: string })[];
  auditLogs: AuditLog[];
  sessions: { token: string; userId: string; expiresAt: number }[];
  groceryAccounts: GroceryAccount[];
  grocerySessions: { token: string; accountId: string; expiresAt: number }[];
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, s, 64).toString('hex');
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
}

export function generateDefaultData(): DatabaseSchema {
  const ownerAuth = hashPassword('mazaq2026');

  return {
    settings: {
      shopName: 'مذاق | MAZAQ',
      tagline: 'طعم الأصالة في كل لقمة',
      subTagline: 'حلويات • معجنات • مخبوزات',
      phone: '+966551234567',
      whatsapp: '+966551234567',
      address: 'المملكة العربية السعودية — الرياض، حي الملقا',
      workingHours: 'يومياً من 6:00 صباحاً حتى 12:00 منتصف الليل',
      currency: 'ريال',
      defaultDeliveryFee: 5,
      freeDeliveryThreshold: 150,
      minOrder: 20,
      isAcceptingOrders: true,
      hero: {
        title: 'طعم الأصالة في كل لقمة',
        subtitle: 'حلويات • معجنات • مخبوزات',
        badge: 'بمذاق يليق بذوقك',
        ctaText: 'اطلب الآن',
        bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
      },
      partyService: {
        title: 'خدمة تجهيز الحفلات والمناسبات',
        subtitle: 'بمذاق فاخر .. ولمسة مميزة',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
        phoneOrWhatsapp: '+966551234567',
        enabled: true,
      },
      deliveryServiceCard: {
        title: 'خدمة التوصيل',
        subtitle: 'لجميع مناطق المدينة',
        badge: 'توصيل سريع',
        enabled: true,
      },
      deliveryAreas: [
        { id: 'area-1', name: 'حي الملقا وحطين', fee: 5, estimatedMinutes: 20 },
        { id: 'area-2', name: 'حي النرجس والياسمين', fee: 5, estimatedMinutes: 25 },
        { id: 'area-3', name: 'حي العارض والعقيق', fee: 7, estimatedMinutes: 30 },
        { id: 'area-4', name: 'وسط الرياض والعليا', fee: 10, estimatedMinutes: 35 },
        { id: 'area-5', name: 'باقي أحياء مدينة الرياض', fee: 15, estimatedMinutes: 45 },
      ],
    },
    categories: [
      {
        id: 'cat-sweets',
        name: 'حلويات',
        subtitle: 'طعم الحلاوة .. يجمعنا',
        icon: 'cake',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
        sortOrder: 1,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-pastries',
        name: 'معجنات',
        subtitle: 'طازجة كل صباح',
        icon: 'croissant',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
        sortOrder: 2,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-bakery',
        name: 'مخبوزات',
        subtitle: 'خبزنا على أصوله',
        icon: 'bread',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
        sortOrder: 3,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-party',
        name: 'تجهيز الحفلات',
        subtitle: 'بمذاق خاص لمناسباتكم',
        icon: 'party',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
        sortOrder: 4,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-delivery',
        name: 'خدمة التوصيل',
        subtitle: 'لجميع مناطق المدينة',
        icon: 'delivery',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
        sortOrder: 5,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    products: [
      {
        id: 'prod-choco-cake',
        name: 'كيكة الشوكولاتة الفاخرة',
        description: 'كيكة شوكولاتة غنية بطعمها اللذيذ ومكوناتها الطازجة، مناسبة لجميع المناسبات والجمعات.',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
        ],
        price: 35,
        oldPrice: 45,
        rating: 4.8,
        reviewsCount: 85,
        categoryId: 'cat-sweets',
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        isArchived: false,
        sortOrder: 1,
        options: [
          {
            id: 'opt-size',
            name: 'الحجم',
            required: true,
            choices: [
              { id: 'sz-sm', name: 'صغيرة', priceModifier: 0 },
              { id: 'sz-md', name: 'متوسطة', priceModifier: 15 },
              { id: 'sz-lg', name: 'كبيرة', priceModifier: 35 },
            ],
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-assorted-pastries',
        name: 'معجنات مشكلة',
        description: 'تشكيلة معجنات فاخرة طازجة محشوة بأجود أنواع الأجبان، الزعتر البلدي، واللحوم المتبلة بعناية.',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
        ],
        price: 18,
        oldPrice: 22,
        rating: 4.9,
        reviewsCount: 64,
        categoryId: 'cat-pastries',
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        isArchived: false,
        sortOrder: 2,
        options: [
          {
            id: 'opt-box-count',
            name: 'الكمية',
            required: true,
            choices: [
              { id: 'cnt-6', name: '6 قطع', priceModifier: 0 },
              { id: 'cnt-12', name: '12 قطعة', priceModifier: 16 },
              { id: 'cnt-24', name: '24 قطعة', priceModifier: 40 },
            ],
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-tannour-bread',
        name: 'خبز تنور',
        description: 'خبز تنور تقليدي ساخن يخبز يومياً في أفراننا الحجرية، هش من الخارج وطري من الداخل.',
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800&auto=format&fit=crop',
        ],
        price: 4,
        rating: 4.7,
        reviewsCount: 110,
        categoryId: 'cat-bakery',
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        isArchived: false,
        sortOrder: 3,
        options: [
          {
            id: 'opt-bread-type',
            name: 'النوع',
            required: false,
            choices: [
              { id: 'brd-1', name: 'قطعة واحدة', priceModifier: 0 },
              { id: 'brd-4', name: 'حزمة (4 قطع)', priceModifier: 10 },
            ],
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-croissant',
        name: 'كرواسون الزبدة الفرنسية',
        description: 'كرواسون أصيل بطبقات مورقة وزبدة فرنسية طبيعية 100%، يذوب في الفم مع قهوة الصباح.',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
        gallery: [],
        price: 9,
        oldPrice: 12,
        rating: 4.9,
        reviewsCount: 92,
        categoryId: 'cat-pastries',
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        isArchived: false,
        sortOrder: 4,
        options: [
          {
            id: 'opt-flavor',
            name: 'الحشوة',
            required: false,
            choices: [
              { id: 'fl-plain', name: 'سادة زبدة', priceModifier: 0 },
              { id: 'fl-choco', name: 'شوكولاتة بلجيكية', priceModifier: 3 },
              { id: 'fl-cheese', name: 'جبن شيدر مدخن', priceModifier: 3 },
            ],
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-party-box',
        name: 'بوكس الحفلات الملكي الفاخر',
        description: 'تشكيلة احتفالية راقية تحتوي على 36 قطعة ميني تارت وإكلير وتشيزكيك بتغليف فاخر.',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
        gallery: [],
        price: 120,
        oldPrice: 150,
        rating: 5.0,
        reviewsCount: 42,
        categoryId: 'cat-party',
        isActive: true,
        isFeatured: true,
        isAvailable: true,
        isArchived: false,
        sortOrder: 5,
        options: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-oriental-sweets',
        name: 'تشكيلة حلويات شرقية ملكية',
        description: 'بقلاوة مقرمشة بالفستق الحلبي، معمول بالتمر الملكي، وكنافة بالسمن البري الطبيعي.',
        image: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=800&auto=format&fit=crop',
        gallery: [],
        price: 65,
        oldPrice: 80,
        rating: 4.8,
        reviewsCount: 77,
        categoryId: 'cat-sweets',
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        isArchived: false,
        sortOrder: 6,
        options: [
          {
            id: 'opt-weight',
            name: 'الوزن',
            required: true,
            choices: [
              { id: 'w-half', name: 'نصف كيلو', priceModifier: 0 },
              { id: 'w-kilo', name: 'كيلو كامل', priceModifier: 55 },
            ],
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prod-baguette',
        name: 'باغيت فرنسي بالخميرة الطبيعية',
        description: 'خبز فرنسي أصيل يتم تخميره ببطء لمدة 24 ساعة، غني بالفقاعات والقرمشة الذهبية.',
        image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=800&auto=format&fit=crop',
        gallery: [],
        price: 6,
        rating: 4.9,
        reviewsCount: 38,
        categoryId: 'cat-bakery',
        isActive: true,
        isFeatured: false,
        isAvailable: true,
        isArchived: false,
        sortOrder: 7,
        options: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    offers: [
      {
        id: 'offer-weekend',
        title: 'عرض نهاية الأسبوع الفاخر',
        description: 'خصم 25% على كيكة الشوكولاتة الفاخرة وجميع قوالب المناسبات',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
        oldPrice: 45,
        newPrice: 35,
        discountPercentage: 25,
        buttonText: 'اطلب الآن',
        actionType: 'PRODUCT',
        actionTarget: 'prod-choco-cake',
        linkedProductId: 'prod-choco-cake',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2030-12-31T23:59:59.000Z',
        displayDuration: 4,
        sortOrder: 1,
        isActive: true,
        isFeatured: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdBy: 'Owner',
      },
      {
        id: 'offer-party',
        title: 'تجهيز حفلاتكم بلمسة ملكية',
        description: 'باقات متكاملة للحفلات والمناسبات تبدأ من 120 ريال مع توصيل مجاني',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=1200&auto=format&fit=crop',
        oldPrice: 150,
        newPrice: 120,
        discountPercentage: 20,
        buttonText: 'تصفح الباقات',
        actionType: 'CATEGORY',
        actionTarget: 'cat-party',
        linkedCategoryId: 'cat-party',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2030-12-31T23:59:59.000Z',
        displayDuration: 4,
        sortOrder: 2,
        isActive: true,
        isFeatured: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdBy: 'Owner',
      },
      {
        id: 'offer-breakfast',
        title: 'فطور الصباح الطازج',
        description: 'تشكيلة معجنات ومخبوزات مقرمشة طازجة مع خصم خاص للمجموعات',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200&auto=format&fit=crop',
        oldPrice: 30,
        newPrice: 25,
        discountPercentage: 15,
        buttonText: 'اطلب فطورك',
        actionType: 'CATEGORY',
        actionTarget: 'cat-pastries',
        linkedCategoryId: 'cat-pastries',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2030-12-31T23:59:59.000Z',
        displayDuration: 4,
        sortOrder: 3,
        isActive: true,
        isFeatured: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        createdBy: 'Owner',
      },
    ],
    orders: [
      {
        id: 'ord-12345',
        orderNumber: '#12345',
        customer: {
          name: 'عبدالله الشمري',
          phone: '0551234567',
          address: {
            area: 'حي الملقا',
            details: 'شارع أنس بن مالك، فيلا 24',
          },
        },
        items: [
          {
            productId: 'prod-choco-cake',
            productName: 'كيكة الشوكولاتة الفاخرة',
            productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
            unitBasePrice: 35,
            selectedOptions: [
              {
                optionId: 'opt-size',
                optionName: 'الحجم',
                choiceId: 'sz-md',
                choiceName: 'متوسطة',
                priceModifier: 0,
              },
            ],
            calculatedItemPrice: 35,
            quantity: 1,
            totalItemPrice: 35,
          },
          {
            productId: 'prod-assorted-pastries',
            productName: 'معجنات مشكلة',
            productImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
            unitBasePrice: 18,
            selectedOptions: [
              {
                optionId: 'opt-box-count',
                optionName: 'الكمية',
                choiceId: 'cnt-6',
                choiceName: '6 قطع',
                priceModifier: 0,
              },
            ],
            calculatedItemPrice: 18,
            quantity: 1,
            totalItemPrice: 18,
          },
          {
            productId: 'prod-tannour-bread',
            productName: 'خبز تنور',
            productImage: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800&auto=format&fit=crop',
            unitBasePrice: 4,
            selectedOptions: [],
            calculatedItemPrice: 4,
            quantity: 1,
            totalItemPrice: 4,
          },
        ],
        itemsTotal: 57,
        deliveryFee: 5,
        discountAmount: 0,
        grandTotal: 62,
        paymentMethod: 'MADA_CARD',
        paymentStatus: 'PAID',
        status: 'OutForDelivery',
        estimatedDeliveryMinutes: 25,
        timeline: [
          {
            status: 'New',
            label: 'تم الطلب',
            timestamp: '2026-09-12T14:15:00.000Z',
            completed: true,
          },
          {
            status: 'Preparing',
            label: 'قيد التحضير',
            timestamp: '2026-09-12T14:20:00.000Z',
            completed: true,
          },
          {
            status: 'OutForDelivery',
            label: 'في الطريق',
            timestamp: '2026-09-12T14:32:00.000Z',
            completed: true,
            notes: 'السائق في طريقه إلى موقعك (سيصل خلال 25 دقيقة)',
          },
          {
            status: 'Completed',
            label: 'تم التوصيل',
            timestamp: '',
            completed: false,
          },
        ],
        notes: 'يرجى وضع الطلب عند الباب الخارجي والتنبيه بالجرس',
        createdAt: '2026-09-12T14:15:00.000Z',
        updatedAt: '2026-09-12T14:32:00.000Z',
      },
    ],
    adminUsers: [
      {
        id: 'admin-owner-1',
        username: 'owner',
        name: 'مالك مذاق',
        role: 'OWNER',
        passwordHash: ownerAuth.hash,
        salt: ownerAuth.salt,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'log-1',
        action: 'SYSTEM_INITIALIZED',
        details: 'تم تهيئة وتدشين النظام بنجاح مع الكتالوج المعتمد',
        actor: 'النظام',
        timestamp: new Date().toISOString(),
      },
    ],
    sessions: [],
    groceryAccounts: [],
    grocerySessions: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
    // Backward-compatible migration for existing JSON database files.
    this.data.groceryAccounts ||= [];
    this.data.grocerySessions ||= [];
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = generateDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch {
      const defaultData = generateDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
  }

  private persist() {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // Shop Settings
  getSettings(): ShopSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<ShopSettings>, actor: string): ShopSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.addAuditLog('SETTINGS_UPDATE', 'تم تحديث إعدادات المتجر', actor);
    this.persist();
    return this.data.settings;
  }

  // Categories
  getCategories(): Category[] {
    return this.data.categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getAllCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find((c) => c.id === id);
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, actor: string): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.addAuditLog('CATEGORY_CREATE', `تم إنشاء القسم: ${newCat.name}`, actor);
    this.persist();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>, actor: string): Category | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog('CATEGORY_UPDATE', `تم تعديل القسم: ${this.data.categories[idx].name}`, actor);
    this.persist();
    return this.data.categories[idx];
  }

  deleteCategory(id: string, actor: string): { success: boolean; linkedProductsCount: number } {
    const linked = this.data.products.filter((p) => p.categoryId === id && !p.isArchived);
    if (linked.length > 0) {
      return { success: false, linkedProductsCount: linked.length };
    }
    const cat = this.data.categories.find((c) => c.id === id);
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.addAuditLog('CATEGORY_DELETE', `تم حذف القسم: ${cat?.name || id}`, actor);
    this.persist();
    return { success: true, linkedProductsCount: 0 };
  }

  // Products
  getProducts(categoryId?: string, search?: string): Product[] {
    return this.data.products.filter((p) => {
      if (p.isArchived) return false;
      if (!p.isActive) return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        return matchesName || matchesDesc;
      }
      return true;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getAllProducts(includeArchived = false): Product[] {
    return this.data.products
      .filter((p) => (includeArchived ? true : !p.isArchived))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, actor: string): Product {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(newProd);
    this.addAuditLog('PRODUCT_CREATE', `تم إنشاء منتج: ${newProd.name} بسعر ${newProd.price} ريال`, actor);
    this.persist();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product>, actor: string): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const oldPrice = this.data.products[idx].price;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.price !== undefined && updates.price !== oldPrice) {
      this.addAuditLog('PRICE_CHANGE', `تم تغيير سعر ${this.data.products[idx].name} من ${oldPrice} إلى ${updates.price} ريال`, actor);
    } else {
      this.addAuditLog('PRODUCT_UPDATE', `تم تحديث المنتج: ${this.data.products[idx].name}`, actor);
    }
    this.persist();
    return this.data.products[idx];
  }

  archiveProduct(id: string, actor: string): boolean {
    const prod = this.data.products.find((p) => p.id === id);
    if (!prod) return false;
    prod.isArchived = true;
    prod.isActive = false;
    prod.updatedAt = new Date().toISOString();
    this.addAuditLog('PRODUCT_ARCHIVE', `تم أرشفة المنتج: ${prod.name}`, actor);
    this.persist();
    return true;
  }

  // Offers
  getActiveOffers(): Offer[] {
    const now = new Date().toISOString();
    return this.data.offers
      .filter((o) => {
        if (!o.isActive) return false;
        if (o.startDate && o.startDate > now) return false;
        if (o.endDate && o.endDate < now) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.sortOrder - b.sortOrder;
      });
  }

  getAllOffers(): Offer[] {
    return this.data.offers.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  createOffer(offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>, actor: string): Offer {
    if (offer.isFeatured) {
      // Un-feature any existing featured offer
      this.data.offers.forEach((o) => {
        o.isFeatured = false;
      });
    }
    const newOffer: Offer = {
      ...offer,
      id: `offer-${Date.now()}`,
      displayDuration: offer.displayDuration || 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actor,
    };
    this.data.offers.push(newOffer);
    this.addAuditLog('OFFER_CREATE', `تم إنشاء عرض: ${newOffer.title}`, actor);
    this.persist();
    return newOffer;
  }

  updateOffer(id: string, updates: Partial<Offer>, actor: string): Offer | null {
    const idx = this.data.offers.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    if (updates.isFeatured) {
      this.data.offers.forEach((o) => {
        if (o.id !== id) o.isFeatured = false;
      });
    }
    this.data.offers[idx] = {
      ...this.data.offers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog('OFFER_UPDATE', `تم تعديل العرض: ${this.data.offers[idx].title}`, actor);
    this.persist();
    return this.data.offers[idx];
  }

  deleteOffer(id: string, actor: string): boolean {
    const off = this.data.offers.find((o) => o.id === id);
    if (!off) return false;
    this.data.offers = this.data.offers.filter((o) => o.id !== id);
    this.addAuditLog('OFFER_DELETE', `تم حذف العرض: ${off.title}`, actor);
    this.persist();
    return true;
  }

  // Grocery wholesale accounts
  registerGroceryAccount(input: { storeName: string; contactName: string; phone: string; address: string; password: string }): { success: true; account: Omit<GroceryAccount, 'passwordHash' | 'salt'>; token: string } | { success: false; error: string } {
    const phone = input.phone.replace(/[^0-9+]/g, '');
    if (this.data.groceryAccounts.some((a) => a.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))) {
      return { success: false, error: 'يوجد حساب بقالة مسجل بهذا الرقم بالفعل. سجّل الدخول أو تواصل مع الإدارة.' };
    }
    const auth = hashPassword(input.password);
    const now = new Date().toISOString();
    const account: GroceryAccount = { id: `grocery-${crypto.randomUUID()}`, storeName: input.storeName.trim(), contactName: input.contactName.trim(), phone, address: input.address.trim(), status: 'PENDING', passwordHash: auth.hash, salt: auth.salt, createdAt: now, updatedAt: now };
    this.data.groceryAccounts.push(account);
    const token = crypto.randomBytes(32).toString('hex');
    this.data.grocerySessions.push({ token, accountId: account.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
    this.addAuditLog('GROCERY_REGISTER', `تسجيل بقالة جديدة: ${account.storeName}`, 'عميل');
    this.persist();
    const { passwordHash, salt, ...safeAccount } = account;
    return { success: true, account: safeAccount, token };
  }

  loginGroceryAccount(phone: string, password: string): { success: true; account: Omit<GroceryAccount, 'passwordHash' | 'salt'>; token: string } | { success: false; error: string } {
    const normalized = phone.replace(/\D/g, '');
    const account = this.data.groceryAccounts.find((a) => a.phone.replace(/\D/g, '') === normalized);
    if (!account || !verifyPassword(password, account.passwordHash, account.salt)) return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
    const token = crypto.randomBytes(32).toString('hex');
    this.data.grocerySessions = this.data.grocerySessions.filter((s) => s.accountId !== account.id || s.expiresAt > Date.now());
    this.data.grocerySessions.push({ token, accountId: account.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
    this.persist();
    const { passwordHash, salt, ...safeAccount } = account;
    return { success: true, account: safeAccount, token };
  }

  getGroceryAccountByToken(token?: string): GroceryAccount | undefined {
    if (!token) return undefined;
    const session = this.data.grocerySessions.find((s) => s.token === token && s.expiresAt > Date.now());
    return session ? this.data.groceryAccounts.find((a) => a.id === session.accountId) : undefined;
  }

  getGroceryAccounts(): Omit<GroceryAccount, 'passwordHash' | 'salt'>[] {
    return this.data.groceryAccounts.map(({ passwordHash, salt, ...account }) => account).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  setGroceryAccountStatus(id: string, status: 'APPROVED' | 'REJECTED', actor: string): boolean {
    const account = this.data.groceryAccounts.find((a) => a.id === id);
    if (!account) return false;
    account.status = status;
    account.updatedAt = new Date().toISOString();
    this.addAuditLog('GROCERY_STATUS', `تم ${status === 'APPROVED' ? 'اعتماد' : 'رفض'} حساب البقالة: ${account.storeName}`, actor);
    this.persist();
    return true;
  }

  // Orders
  getOrders(customerPhone?: string): Order[] {
    return this.data.orders
      .filter((o) => {
        if (!customerPhone) return true;
        return o.customer.phone.replace(/\D/g, '').endsWith(customerPhone.replace(/\D/g, ''));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id || o.orderNumber === `#${id}`);
  }

  /**
   * Server-authoritative Order Creation
   * Re-evaluates product existence, pricing, options, delivery fees, and minimum order threshold!
   */
  createOrder(input: {
    customer: {
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
    };
    items: Array<{
      productId: string;
      selectedOptions: Array<{ optionId: string; choiceId: string }>;
      quantity: number;
    }>;
    paymentMethod: 'CASH_ON_DELIVERY' | 'MADA_CARD' | 'APPLE_PAY' | 'WHATSAPP';
    accountType?: 'individual' | 'grocery';
    groceryAccountToken?: string;
    notes?: string;
  }): { success: true; order: Order } | { success: false; error: string } {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'السلة فارغة، يرجى إضافة منتجات للطلب' };
    }

    // Extract address text regardless of string or object format
    let addressDetails = '';
    let addressArea = '';
    if (typeof input.customer?.address === 'string') {
      addressDetails = input.customer.address;
      addressArea = input.customer.address;
    } else if (input.customer?.address && typeof input.customer.address === 'object') {
      addressDetails = input.customer.address.details || '';
      addressArea = input.customer.address.area || '';
    }

    if (
      !input.customer?.name?.trim() ||
      !input.customer?.phone?.trim() ||
      (!addressDetails.trim() && !addressArea.trim())
    ) {
      return { success: false, error: 'بيانات العميل والعنوان مطلوبة بالكامل' };
    }

    const accountType = input.accountType === 'grocery' ? 'grocery' : 'individual';
    const groceryAccount = accountType === 'grocery' ? this.getGroceryAccountByToken(input.groceryAccountToken) : undefined;
    if (accountType === 'grocery' && !groceryAccount) return { success: false, error: 'سجّل الدخول بحساب البقالة أولاً لإكمال الطلب' };
    if (accountType === 'grocery' && groceryAccount?.status !== 'APPROVED') return { success: false, error: 'حساب البقالة بانتظار موافقة الإدارة، ويمكنك الطلب بسعر الأفراد حالياً' };
    if (accountType === 'grocery' && groceryAccount?.phone.replace(/\\D/g, '') !== input.customer.phone.replace(/\\D/g, '')) return { success: false, error: 'رقم هاتف الطلب يجب أن يطابق رقم حساب البقالة' };

    let calculatedItemsTotal = 0;
    const validatedSnapshots = [];

    for (const reqItem of input.items) {
      const product = this.getProductById(reqItem.productId);
      if (!product || product.isArchived || !product.isActive || !product.isAvailable) {
        return { success: false, error: `المنتج غير متوفر حالياً` };
      }

      const unitBasePrice = accountType === 'grocery' ? product.wholesalePrice : product.price;
      if (accountType === 'grocery' && (unitBasePrice === undefined || unitBasePrice === null || !Number.isFinite(unitBasePrice))) return { success: false, error: `المنتج ${product.name} غير متاح بسعر الجملة حالياً` };
      let itemPrice = unitBasePrice as number;
      const chosenOptions = [];

      for (const sel of reqItem.selectedOptions || []) {
        const optDef = product.options.find((o) => o.id === sel.optionId);
        if (optDef) {
          const choiceDef = optDef.choices.find((c) => c.id === sel.choiceId);
          if (choiceDef) {
            itemPrice += choiceDef.priceModifier;
            chosenOptions.push({
              optionId: optDef.id,
              optionName: optDef.name,
              choiceId: choiceDef.id,
              choiceName: choiceDef.name,
              priceModifier: choiceDef.priceModifier,
            });
          }
        }
      }

      const qty = Math.max(1, Math.floor(reqItem.quantity || 1));
      const totalItem = itemPrice * qty;
      calculatedItemsTotal += totalItem;

      validatedSnapshots.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        unitBasePrice: unitBasePrice as number,
        unitPrice: itemPrice,
        selectedOptions: chosenOptions,
        calculatedItemPrice: itemPrice,
        quantity: qty,
        totalItemPrice: totalItem,
      });
    }

    const settings = this.getSettings();
    if (calculatedItemsTotal < settings.minOrder) {
      return { success: false, error: `الحد الأدنى للطلب هو ${settings.minOrder} ${settings.currency}` };
    }

    // Determine delivery fee based on selected area
    let deliveryFee = settings.defaultDeliveryFee;
    const searchTarget = (addressArea + ' ' + addressDetails).toLowerCase();
    const matchedArea = settings.deliveryAreas.find(
      (a) =>
        (a.name && searchTarget.includes(a.name.toLowerCase())) ||
        (a.name && addressArea && a.name.toLowerCase().includes(addressArea.toLowerCase()))
    );
    if (matchedArea) {
      deliveryFee = matchedArea.fee;
    }

    if (calculatedItemsTotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    const grandTotal = calculatedItemsTotal + deliveryFee;
    const orderNum = `#${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customer: input.customer,
      accountType,
      groceryAccountId: groceryAccount?.id,
      groceryStoreName: groceryAccount?.storeName,
      items: validatedSnapshots,
      itemsTotal: calculatedItemsTotal,
      deliveryFee,
      discountAmount: 0,
      grandTotal,
      paymentMethod: input.paymentMethod,
      paymentStatus: (input.paymentMethod === 'CASH_ON_DELIVERY' || input.paymentMethod === 'WHATSAPP') ? 'PENDING' : 'PAID',
      status: 'New',
      estimatedDeliveryMinutes: matchedArea?.estimatedMinutes || 25,
      timeline: [
        {
          status: 'New',
          label: 'تم الطلب',
          timestamp: nowIso,
          completed: true,
        },
        {
          status: 'Preparing',
          label: 'قيد التحضير',
          timestamp: '',
          completed: false,
        },
        {
          status: 'OutForDelivery',
          label: 'في الطريق',
          timestamp: '',
          completed: false,
        },
        {
          status: 'Completed',
          label: 'تم التوصيل',
          timestamp: '',
          completed: false,
        },
      ],
      notes: input.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.data.orders.unshift(newOrder);
    this.addAuditLog('ORDER_CREATE', `تم إنشاء طلب جديد برقم ${orderNum} بقيمة ${grandTotal} ${settings.currency}`, input.customer.name);
    this.persist();
    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId: string, newStatus: Order['status'], actor: string): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    // Update timeline steps
    const statusOrder: Order['status'][] = ['New', 'Preparing', 'OutForDelivery', 'Completed'];
    const currentIdx = statusOrder.indexOf(newStatus);

    order.timeline.forEach((step) => {
      const stepIdx = statusOrder.indexOf(step.status);
      if (stepIdx !== -1 && stepIdx <= currentIdx) {
        step.completed = true;
        if (!step.timestamp) step.timestamp = new Date().toISOString();
      }
    });

    if (newStatus === 'Cancelled') {
      order.timeline.push({
        status: 'Cancelled',
        label: 'تم إلغاء الطلب',
        timestamp: new Date().toISOString(),
        completed: true,
      });
    }

    this.addAuditLog('ORDER_STATUS_UPDATE', `تم تغيير حالة الطلب ${order.orderNumber} إلى ${newStatus}`, actor);
    this.persist();
    return order;
  }

  // Authentication & Admin Users
  validateAdminCredentials(username: string, password: string): AdminUser | null {
    const user = this.data.adminUsers.find((u) => u.username === username);
    if (!user) return null;
    if (verifyPassword(password, user.passwordHash, user.salt)) {
      user.lastLogin = new Date().toISOString();
      this.addAuditLog('ADMIN_LOGIN', `تسجيل دخول ناجح للمستخدم: ${user.name} (${user.role})`, user.name);
      this.persist();
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };
    }
    return null;
  }

  createSession(userId: string): string {
    const token = `mzaq_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > Date.now());
    this.data.sessions.push({ token, userId, expiresAt });
    this.persist();
    return token;
  }

  validateSession(token: string): AdminUser | null {
    if (!token) return null;
    const session = this.data.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;
    const user = this.data.adminUsers.find((u) => u.id === session.userId);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  destroySession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  changeAdminPassword(userId: string, newPass: string, actor: string): boolean {
    const user = this.data.adminUsers.find((u) => u.id === userId);
    if (!user) return false;
    const { hash, salt } = hashPassword(newPass);
    user.passwordHash = hash;
    user.salt = salt;
    this.addAuditLog('ADMIN_PASSWORD_CHANGE', `تم تغيير كلمة مرور المدير ${user.name}`, actor);
    this.persist();
    return true;
  }

  // Audit Logs
  getAuditLogs(limit = 100): AuditLog[] {
    return (this.data.auditLogs || []).slice(-limit).reverse();
  }

  addAuditLog(action: string, details: string, actor: string) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      actor,
      timestamp: new Date().toISOString(),
    });
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
  }

  // Stats for Dashboard
  getStats() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.grandTotal : sum), 0);
    const activeProducts = this.data.products.filter((p) => p.isActive && !p.isArchived).length;
    const pendingOrders = this.data.orders.filter((o) => ['New', 'Preparing', 'OutForDelivery'].includes(o.status)).length;
    const activeOffers = this.getActiveOffers().length;

    return {
      totalOrders,
      totalRevenue,
      activeProducts,
      pendingOrders,
      activeOffers,
    };
  }

  // Reset to seed
  resetCatalog(actor: string) {
    const fresh = generateDefaultData();
    this.data = fresh;
    this.addAuditLog('CATALOG_RESET', 'تمت استعادة كتالوج البيانات الافتراضي المعتمد', actor);
    this.persist();
  }
}

export const db = new Database();
