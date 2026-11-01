/**
 * MAZAQ Express API Routes
 * Production-ready server endpoints with strict server-side validation
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db';
import { authenticateAdmin, requireRoles, AuthenticatedRequest } from './auth';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MAZAQ',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. SHOP SETTINGS & HOMEPAGE
// ==========================================

router.get('/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/settings', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user?.name || 'Owner';
    const updated = db.updateSettings(req.body, actor);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. CATEGORIES
// ==========================================

router.get('/categories', (req: Request, res: Response) => {
  try {
    const all = req.query.all === 'true';
    const categories = all ? db.getAllCategories() : db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subtitle, icon, image, sortOrder, isActive } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, error: 'اسم القسم والصورة مطلوبان' });
    }
    const actor = req.user?.name || 'Owner';
    const created = db.createCategory(
      {
        name,
        subtitle: subtitle || '',
        icon: icon || 'cake',
        image,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
      actor
    );
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/categories/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || 'Owner';
    const updated = db.updateCategory(id, req.body, actor);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'القسم غير موجود' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/categories/:id', authenticateAdmin, requireRoles(['OWNER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || 'Owner';
    const result = db.deleteCategory(id, actor);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: `لا يمكن حذف القسم لوجود ${result.linkedProductsCount} منتج مرتبط به. يرجى نقل المنتجات أو أرشفتها أولاً.`,
      });
    }
    res.json({ success: true, message: 'تم حذف القسم بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. PRODUCTS
// ==========================================

router.get('/products', (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const all = req.query.all === 'true';

    if (all) {
      const products = db.getAllProducts(req.query.archived === 'true').map(({ wholesalePrice, ...product }) => product);
      return res.json({ success: true, data: products });
    }

    const products = db.getProducts(categoryId, search).map(({ wholesalePrice, ...product }) => product);
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/products', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.getAllProducts(req.query.archived === 'true');
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    const { wholesalePrice, ...publicProduct } = product;
    res.json({ success: true, data: publicProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price, wholesalePrice, oldPrice, categoryId, image, gallery, options, isFeatured, isAvailable, sortOrder } = req.body;
    if (!name || price === undefined || !categoryId || !image) {
      return res.status(400).json({ success: false, error: 'الاسم، السعر، القسم، والصورة حقول مطلوبة' });
    }
    if (wholesalePrice !== undefined && wholesalePrice !== null && wholesalePrice !== '' && (!Number.isFinite(Number(wholesalePrice)) || Number(wholesalePrice) < 0)) {
      return res.status(400).json({ success: false, error: 'سعر الجملة يجب أن يكون رقماً صحيحاً غير سالب' });
    }

    const actor = req.user?.name || 'Owner';
    const created = db.createProduct(
      {
        name,
        description: description || '',
        price: Number(price),
        wholesalePrice: wholesalePrice === undefined || wholesalePrice === null || wholesalePrice === '' ? undefined : Number(wholesalePrice),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        rating: 5.0,
        reviewsCount: 1,
        categoryId,
        image,
        gallery: gallery || [],
        isActive: true,
        isFeatured: Boolean(isFeatured),
        isAvailable: isAvailable !== false,
        isArchived: false,
        sortOrder: Number(sortOrder) || 0,
        options: options || [],
      },
      actor
    );
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const wholesalePrice = req.body?.wholesalePrice;
    if (wholesalePrice !== undefined && wholesalePrice !== null && wholesalePrice !== '' && (!Number.isFinite(Number(wholesalePrice)) || Number(wholesalePrice) < 0)) {
      return res.status(400).json({ success: false, error: 'سعر الجملة يجب أن يكون رقماً صحيحاً غير سالب' });
    }
    if (wholesalePrice === '') req.body.wholesalePrice = null;
    const actor = req.user?.name || 'Owner';
    const updated = db.updateProduct(id, req.body, actor);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || 'Owner';
    // Soft delete to protect past orders!
    const ok = db.archiveProduct(id, actor);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم أرشفة المنتج بأمان مع حفظ سلامة الطلبات السابقة' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. OFFERS (DYNAMIC CAROUSEL)
// ==========================================

router.get('/offers', (req: Request, res: Response) => {
  try {
    const all = req.query.all === 'true';
    const offers = all ? db.getAllOffers() : db.getActiveOffers();
    res.json({ success: true, data: offers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/offers', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      image,
      mobileImage,
      oldPrice,
      newPrice,
      discountPercentage,
      buttonText,
      actionType,
      actionTarget,
      linkedCategoryId,
      linkedProductId,
      startDate,
      endDate,
      displayDuration,
      sortOrder,
      isActive,
      isFeatured,
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, error: 'عنوان العرض والصورة حقول مطلوبة' });
    }

    const actor = req.user?.name || 'Owner';
    const created = db.createOffer(
      {
        title,
        description: description || '',
        image,
        mobileImage,
        oldPrice: Number(oldPrice) || 0,
        newPrice: Number(newPrice) || 0,
        discountPercentage: Number(discountPercentage) || 0,
        buttonText: buttonText || 'اطلب الآن',
        actionType: actionType || 'NONE',
        actionTarget: actionTarget || '',
        linkedCategoryId,
        linkedProductId,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        displayDuration: Number(displayDuration) || 4,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
        isFeatured: Boolean(isFeatured),
      },
      actor
    );
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/offers/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || 'Owner';
    const updated = db.updateOffer(id, req.body, actor);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'العرض غير موجود' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/offers/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || 'Owner';
    const ok = db.deleteOffer(id, actor);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'العرض غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف العرض بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
 // GROCERY ACCOUNTS & WHOLESALE ACCESS
// ==========================================

router.post('/grocery/register', (req: Request, res: Response) => {
  try {
    const { storeName, contactName, phone, address, password } = req.body || {};
    if (![storeName, contactName, phone, address, password].every((v) => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ success: false, error: 'يرجى إكمال اسم البقالة واسم المسؤول والهاتف والعنوان وكلمة المرور' });
    }
    if (password.length < 8) return res.status(400).json({ success: false, error: 'كلمة المرور يجب ألا تقل عن 8 أحرف' });
    if (phone.replace(/\D/g, '').length < 8) return res.status(400).json({ success: false, error: 'رقم الهاتف غير صحيح' });
    const result = db.registerGroceryAccount({ storeName, contactName, phone, address, password });
    if (result.success === false) return res.status(409).json({ success: false, error: result.error });
    res.status(201).json({ success: true, data: { account: result.account, token: result.token } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/grocery/login', (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) return res.status(400).json({ success: false, error: 'رقم الهاتف وكلمة المرور مطلوبان' });
    const result = db.loginGroceryAccount(String(phone), String(password));
    if (result.success === false) return res.status(401).json({ success: false, error: result.error });
    res.json({ success: true, data: { account: result.account, token: result.token } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/grocery-accounts', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: db.getGroceryAccounts() });
});

router.patch('/admin/grocery-accounts/:id/status', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const status = req.body?.status;
  if (status !== 'APPROVED' && status !== 'REJECTED') return res.status(400).json({ success: false, error: 'الحالة غير صحيحة' });
  const ok = db.setGroceryAccountStatus(req.params.id, status, req.user?.name || 'Admin');
  if (!ok) return res.status(404).json({ success: false, error: 'حساب البقالة غير موجود' });
  res.json({ success: true, message: status === 'APPROVED' ? 'تم اعتماد حساب البقالة' : 'تم رفض حساب البقالة' });
});

// MARKETING COUPONS (ADMIN ONLY)
router.get('/admin/coupons', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (_req: AuthenticatedRequest, res: Response) => { res.json({ success: true, data: db.getCoupons() }); });
router.post('/admin/coupons', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try { const b = req.body || {};
    if (!b.code || !b.title || !['PERCENT', 'FIXED'].includes(b.discountType) || !Number.isFinite(Number(b.discountValue)) || Number(b.discountValue) <= 0) return res.status(400).json({ success: false, error: 'أكمل بيانات الكوبون وقيمة الخصم بشكل صحيح' });
    if (b.discountType === 'PERCENT' && Number(b.discountValue) > 100) return res.status(400).json({ success: false, error: 'نسبة الخصم لا تتجاوز 100%' });
    const data = db.createCoupon({ code: String(b.code), title: String(b.title), description: String(b.description || ''), discountType: b.discountType, discountValue: Number(b.discountValue), minOrderAmount: Math.max(0, Number(b.minOrderAmount) || 0), maxDiscountAmount: b.maxDiscountAmount ? Number(b.maxDiscountAmount) : undefined, firstOrderOnly: Boolean(b.firstOrderOnly), usageLimit: b.usageLimit ? Number(b.usageLimit) : undefined, startDate: b.startDate || new Date().toISOString(), endDate: b.endDate || new Date(Date.now() + 30*86400000).toISOString(), isActive: b.isActive !== false }, req.user?.name || 'Admin');
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(400).json({ success: false, error: err.message }); }
});
router.put('/admin/coupons/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try { const data = db.updateCoupon(req.params.id, req.body, req.user?.name || 'Admin'); if (!data) return res.status(404).json({ success: false, error: 'الكوبون غير موجود' }); res.json({ success: true, data }); }
  catch (err: any) { res.status(400).json({ success: false, error: err.message }); }
});
router.delete('/admin/coupons/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteCoupon(req.params.id, req.user?.name || 'Admin'); if (!ok) return res.status(404).json({ success: false, error: 'الكوبون غير موجود' }); res.json({ success: true, message: 'تم حذف الكوبون' });
});

// ==========================================
// 5. ORDERS (SERVER-AUTHORITATIVE)
// ==========================================

// Create Order (Public client checkout)
router.post('/orders', (req: Request, res: Response) => {
  try {
    const { customer, items, paymentMethod, notes, accountType, groceryAccountToken, couponCode } = req.body;
    const result = db.createOrder({
      customer,
      items,
      paymentMethod: paymentMethod || 'WHATSAPP',
      accountType,
      groceryAccountToken,
      couponCode,
      notes,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: (result as any).error });
    }

    res.status(201).json({
      success: true,
      message: 'تم استلام طلبك بنجاح وجارٍ تجهيزه',
      data: result.order,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Orders (Admin or Customer query by phone)
router.get('/orders', authenticateAdmin, requireRoles(['OWNER', 'ADMIN', 'MANAGER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const phone = req.query.phone as string | undefined;
    const orders = db.getOrders(phone);
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Order Details by ID or Number
router.get('/orders/:id', authenticateAdmin, requireRoles(['OWNER', 'ADMIN', 'MANAGER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Order Status (Admin only)
router.patch('/orders/:id/status', authenticateAdmin, requireRoles(['OWNER', 'ADMIN', 'MANAGER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'الحالة الجديدة مطلوبة' });
    }

    const actor = req.user?.name || 'Staff';
    const updated = db.updateOrderStatus(id, status, actor);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. AUTHENTICATION & ADMIN
// ==========================================

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const user = db.validateAdminCredentials(username, password);
    if (!user) {
      return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
    }

    const token = db.createSession(user.id);
    res.json({
      success: true,
      token,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/logout', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      db.destroySession(token);
    }
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/auth/me', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

router.post('/auth/change-password', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 خانات' });
    }
    const ok = db.changeAdminPassword(req.user!.id, newPassword, req.user!.name);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'تعذر تغيير كلمة المرور' });
    }
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Dashboard Stats
router.get('/admin/stats', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Audit Logs
router.get('/admin/audit-logs', authenticateAdmin, requireRoles(['OWNER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.getAuditLogs(100);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Catalog Seed
router.post('/admin/reset-catalog', authenticateAdmin, requireRoles(['OWNER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    db.resetCatalog(req.user!.name);
    res.json({ success: true, message: 'تمت استعادة كتالوج البيانات المعتمد' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. SECURE IMAGE UPLOAD
// ==========================================

router.post('/upload', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'صيغة الصورة غير صحيحة (مسموح فقط بالصور)' });
    }

    // Match mime type
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'ملف الصورة تالف أو غير صالح' });
    }

    const extension = matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const allowedExtensions = ['jpg', 'png', 'webp', 'svg', 'gif'];
    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({ success: false, error: 'نوع الملف غير مدعوم. المسموح: JPG, PNG, WEBP, SVG' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    // Check size limit: 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت' });
    }

    const cleanName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, cleanName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${cleanName}`;
    res.json({
      success: true,
      url: publicUrl,
      size: buffer.length,
      name: filename || cleanName,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. DOWNLOAD PROJECT ZIP
// ==========================================
router.get('/download-zip', (req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), 'public', 'mazaq-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mazaq-project.zip"');
    return res.sendFile(zipPath);
  }
  res.status(404).json({ success: false, error: 'الملف المضغوط غير متوفر حالياً' });
});

export default router;
