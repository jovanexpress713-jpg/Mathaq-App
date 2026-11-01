/**
 * MAZAQ | مذاق
 * Master Full-Stack Application Entry Point
 * Production-Ready Implementation matching V4.0 Protocol & Approved Mobile Direction
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Cake, Croissant, UtensilsCrossed, Phone } from 'lucide-react';
import {
  Category,
  Product,
  Offer,
  Order,
  ShopSettings,
  CartItem,
  ProductOptionChoice,
} from './types';
import { api } from './services/api';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNavigation, TabKey } from './components/BottomNavigation';
import { OffersCarousel } from './components/OffersCarousel';
import { QuickCategories } from './components/QuickCategories';
import { PromoServiceCards } from './components/PromoServiceCards';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CategoriesView } from './components/CategoriesView';
import { OrdersListView } from './components/OrdersListView';
import { AccountView } from './components/AccountView';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // App View & Tab State
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [activeOverlay, setActiveOverlay] = useState<'cart' | 'checkout' | 'tracking' | null>(null);

  // Viewport Frame Toggle (Mobile Mockup Frame vs Full Responsive Desktop)
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Core Data loaded from Server
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selected State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mazaq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User's Local Orders (Persisted in localStorage)
  const [myOrders, setMyOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mazaq_my_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('mazaq_cart', JSON.stringify(cart));
  }, [cart]);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem('mazaq_my_orders', JSON.stringify(myOrders));
  }, [myOrders]);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [shopSettings, catList, prodList, offerList] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getCategories().catch(() => []),
        api.getProducts().catch(() => []),
        api.getOffers().catch(() => []),
      ]);

      if (shopSettings) setSettings(shopSettings);
      setCategories(catList);
      setProducts(prodList);
      setOffers(offerList);
    } catch (err) {
      console.error('Failed to load shop data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cart Actions
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, ProductOptionChoice>
  ) => {
    const extraPrice = Object.values(selectedOptions).reduce(
      (sum, choice: any) => sum + (choice?.extraPrice ?? choice?.priceModifier ?? 0),
      0
    );
    const unitPrice = product.price + extraPrice;
    const totalPrice = unitPrice * quantity;

    setCart((prev) => {
      // Find if identical product + option configuration exists
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          unitPrice,
          quantity,
          totalPrice,
          selectedOptions,
        },
      ];
    });
  };

  const handleQuickAdd = (product: Product) => {
    // If product has options, open modal for choice
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
    } else {
      handleAddToCart(product, 1, {});
    }
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        totalPrice: updated[index].unitPrice * newQty,
      };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout Success Flow
  const handleOrderSuccess = (createdOrder: Order) => {
    setMyOrders((prev) => [createdOrder, ...prev]);
    setCart([]);
    setActiveTrackingOrder(createdOrder);
    setActiveOverlay('tracking');
  };

  // Delivery Fee Calculation
  const itemsTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee =
    settings?.freeDeliveryThreshold && itemsTotal >= settings.freeDeliveryThreshold
      ? 0
      : settings?.deliveryZones?.[0]?.fee || 5;

  // Total cart items count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products for Home View
  const homeFilteredProducts = products.filter((p) => {
    if (!selectedCategoryId) return true;
    return p.categoryId === selectedCategoryId;
  });

  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <div className="min-h-screen bg-[#0c0907]"><AdminDashboard onClose={() => { window.location.href = '/'; }} onDataChanged={loadInitialData} /></div>;
  }

  return (
    <div
      className="min-h-screen bg-[#0c0907] text-[#f5ebe1] flex flex-col items-center justify-start selection:bg-[#c69a59] selection:text-[#0c0907]"
      dir="rtl"
    >
      {/* 1. Splash Screen (Initial Entry) */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          shopTagline={settings?.tagline || 'طعم الأصالة في كل لقمة'}
          shopSubTagline={settings?.subTagline || 'بمذاق يليق بذوقك'}
          logoUrl={settings?.logoUrl}
        />
      )}

      {/* Main Responsive Frame Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[440px] my-4 rounded-[40px] border-4 border-[#3d2c1d] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden min-h-[90vh]'
            : 'max-w-7xl'
        } flex flex-col flex-1 bg-[#0c0907] relative`}
      >
        {/* Navigation Header */}
        <Header
          cartCount={cartCount}
          onOpenCart={() => setActiveOverlay('cart')}
          onGoHome={() => {
            setActiveOverlay(null);
            setCurrentTab('home');
            setSelectedCategoryId(null);
          }}
          isMobileFrame={isMobileFrame}
          onToggleViewMode={() => setIsMobileFrame(!isMobileFrame)}
          phone={settings?.phone}
          logoUrl={settings?.logoUrl}
        />

        {/* Viewport Canvas Body */}
        <div className="flex-1 px-3 sm:px-6 py-4">
          {/* ========================================================
              OVERLAYS: CART, CHECKOUT, TRACKING
          ======================================================== */}
          {activeOverlay === 'cart' && (
            <CartView
              cart={cart}
              onUpdateQuantity={handleUpdateCartQty}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onCheckout={() => setActiveOverlay('checkout')}
              onContinueShopping={() => setActiveOverlay(null)}
              deliveryFee={deliveryFee}
            />
          )}

          {activeOverlay === 'checkout' && (
            <CheckoutView
              cart={cart}
              settings={settings}
              onBackToCart={() => setActiveOverlay('cart')}
              onOrderSuccess={handleOrderSuccess}
            />
          )}

          {activeOverlay === 'tracking' && activeTrackingOrder && (
            <OrderTrackingView
              order={activeTrackingOrder}
              settings={settings}
              onBackToHome={() => {
                setActiveOverlay(null);
                setCurrentTab('home');
              }}
            />
          )}

          {/* ========================================================
              PRIMARY TAB SCREENS (WHEN NO OVERLAY ACTIVE)
          ======================================================== */}
          {!activeOverlay && (
            <>
              {/* TAB 1: HOME SCREEN (Screen 2 Mockup) */}
              {currentTab === 'home' && (
                <div id="home-view" className="space-y-6 pb-20">
                  {/* Hero Banner Card (Screen 2 Mockup) */}
                  <div
                    id="hero-banner-card"
                    className="relative w-full rounded-3xl overflow-hidden border border-[#3d2c1d] bg-[#16100c] shadow-2xl p-6 sm:p-8 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] group"
                  >
                    {/* Background bakery photography */}
                    <img
                      src={
                        settings?.heroBanner?.image ||
                        'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop'
                      }
                      alt="مخبوزات مذاق"
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907] via-[#0c0907]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c0907]/90 via-[#0c0907]/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 space-y-2 max-w-sm">
                      <span className="text-[10px] text-[#c69a59] font-black uppercase tracking-widest block">
                        مرحباً بكم في مذاق
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black text-[#f5ebe1] leading-tight">
                        {settings?.heroBanner?.title || 'طعم الأصالة في كل لقمة'}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#d1c2b4]">
                        {settings?.heroBanner?.subtitle || 'حلويات • معجنات • مخبوزات طازجة يومياً'}
                      </p>

                      <div className="pt-2">
                        <button
                          id="hero-cta-btn"
                          onClick={() => setCurrentTab('categories')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c69a59] hover:bg-[#d4af37] text-[#0c0907] text-xs sm:text-sm font-black shadow-lg transition-all active:scale-95"
                        >
                          <span>{settings?.heroBanner?.ctaText || 'اطلب الآن'}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3 Quick Categories (Screen 2 Mockup: حلويات، معجنات، مخبوزات) */}
                  <QuickCategories
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={(id) => setSelectedCategoryId(id)}
                    onViewAll={() => setCurrentTab('categories')}
                  />

                  {/* Dynamic Offers Carousel ("عروض مذاق") */}
                  <OffersCarousel
                    offers={offers}
                    onOfferClick={(offer) => {
                      if (offer.linkedProductId) {
                        const targetProd = products.find((p) => p.id === offer.linkedProductId);
                        if (targetProd) {
                          setSelectedProduct(targetProd);
                          return;
                        }
                      }
                      if (offer.linkedCategoryId) {
                        setSelectedCategoryId(offer.linkedCategoryId);
                        return;
                      }
                      setCurrentTab('categories');
                    }}
                  />

                  {/* Service Cards (Party Catering & Fast Delivery) */}
                  <PromoServiceCards settings={settings} />

                  {/* Featured / Categorized Products Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#c69a59]" />
                        <h2 className="text-sm sm:text-base font-bold text-[#f5ebe1]">
                          {selectedCategoryId
                            ? categories.find((c) => c.id === selectedCategoryId)?.name
                            : 'أشهى الأصناف المختارة'}
                        </h2>
                      </div>
                      {selectedCategoryId && (
                        <button
                          onClick={() => setSelectedCategoryId(null)}
                          className="text-xs text-[#c69a59] hover:underline"
                        >
                          إلغاء التصفية ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {homeFilteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onClick={() => setSelectedProduct(prod)}
                          onQuickAdd={() => handleQuickAdd(prod)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CATEGORIES SCREEN (Screen 3 Mockup) */}
              {currentTab === 'categories' && (
                <CategoriesView
                  categories={categories}
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onQuickAdd={handleQuickAdd}
                  onBackToHome={() => setCurrentTab('home')}
                  initialCategoryId={selectedCategoryId}
                />
              )}

              {/* TAB 3: ORDERS LIST SCREEN (Screen 40) */}
              {currentTab === 'orders' && (
                <OrdersListView
                  orders={myOrders}
                  onSelectOrder={(order) => {
                    setActiveTrackingOrder(order);
                    setActiveOverlay('tracking');
                  }}
                  onContinueShopping={() => setCurrentTab('home')}
                />
              )}

              {/* TAB 4: ACCOUNT / MORE SCREEN (Screen 8 Mockup) */}
              {currentTab === 'more' && (
                <AccountView
                  settings={settings}
                  ordersCount={myOrders.length}
                  onGoHome={() => setCurrentTab('home')}
                  onGoOrders={() => setCurrentTab('orders')}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation Bar (Across All Primary Views) */}
        {!activeOverlay && (
          <BottomNavigation
            currentTab={currentTab}
            onTabChange={(tab) => {
              setActiveOverlay(null);
              setCurrentTab(tab);
            }}
            ordersCount={myOrders.length}
          />
        )}
      </div>

      {/* ========================================================
          MODAL: PRODUCT DETAILS (Screen 4 Mockup)
      ======================================================== */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, quantity, selectedOptions) => {
            handleAddToCart(product, quantity, selectedOptions);
          }}
        />
      )}

    </div>
  );
}
