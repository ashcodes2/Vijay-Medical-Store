import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import DailyEssentials from './components/DailyEssentials';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import CartSection from './components/CartSection';
import Footer from './components/Footer';
import PolicyModal from './components/PolicyModal';
import ProductDetailModal from './components/ProductDetailModal';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import NotFound from './components/NotFound';
import OrderConfirmModal from './components/OrderConfirmModal';
import CheckoutPage from './components/CheckoutPage';
import OrderTrackingPage from './components/OrderTrackingPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import { createOrder } from './services/api';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: "Rajesh Malhotra",
    role: "Regular Customer",
    text: "The only pharmacy where I can trust the medicine's authenticity. Their doorstep delivery has been a lifesaver for my parents during the pandemic. 40 years of trust is visible in their service.",
    rating: 5
  },
  {
    name: "Ananya Sharma",
    role: "Fitness Enthusiast",
    text: "Their wellness section is amazing. I get all my supplements here. The pharmacists are very knowledgeable and helped me understand my dosage schedule perfectly. Highly recommended!",
    rating: 5
  },
  {
    name: "Dr. Vikram Sethi",
    role: "Local Physician",
    text: "As a doctor, I always recommend Vijay Medical Store to my patients. Their storage standards (especially for temperature-sensitive drugs) are the best in the city. Truly a clinical atelier.",
    rating: 5
  },
  {
    name: "Priya Das",
    role: "New Mother",
    text: "The baby care range is extensive and they always have the latest Indian and international brands in stock. The WhatsApp ordering is so convenient when you have a toddler at home!",
    rating: 5
  }
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [policyModal, setPolicyModal] = useState({ isOpen: false, type: null });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Order confirmation modal state
  const [orderConfirm, setOrderConfirm] = useState(null); // { shortId, totalAmount, customerName, phone } | null
  const [confirmedCartSnapshot, setConfirmedCartSnapshot] = useState([]);

  // 404 View state
  const [isNotFound, setIsNotFound] = useState(() => {
    return window.location.hash === '#404';
  });

  // Guest Checkout View state
  const [isCheckoutView, setIsCheckoutView] = useState(() => {
    return window.location.hash === '#checkout' || window.location.pathname === '/checkout';
  });

  // Guest Order Confirmation View state (persisted across page refresh via sessionStorage)
  const [isOrderConfirmedView, setIsOrderConfirmedView] = useState(() => {
    return window.location.hash === '#order-confirmed';
  });
  const [confirmedOrderReceipt, setConfirmedOrderReceipt] = useState(() => {
    try {
      const saved = sessionStorage.getItem('vms_last_order_confirmation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Guest Order Tracking View state
  const [trackingToken, setTrackingToken] = useState(() => {
    const hash = window.location.hash;
    return hash.startsWith('#track/') ? hash.replace('#track/', '') : '';
  });
  const [isTrackingView, setIsTrackingView] = useState(() => {
    return window.location.hash.startsWith('#track') || window.location.pathname.startsWith('/track');
  });

  // Admin portal state
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin' || window.location.pathname === '/admin';
  });
  const [adminUser, setAdminUser] = useState(() => {
    const token = localStorage.getItem('adminToken');
    const name = localStorage.getItem('adminName');
    return token ? { token, name: name || 'Admin' } : null;
  });

  // Dynamic Document Title
  useEffect(() => {
    if (isAdminView) {
      document.title = "Admin Portal | Vijay Medical Store";
    } else if (isCheckoutView) {
      document.title = "Guest Checkout | Vijay Medical Store";
    } else if (isOrderConfirmedView) {
      document.title = "Order Confirmed | Vijay Medical Store";
    } else if (isTrackingView) {
      document.title = "Order Tracking | Vijay Medical Store";
    } else if (isNotFound) {
      document.title = "Page Not Found | Vijay Medical Store";
    } else {
      document.title = "Vijay Medical Store — Authentic Medicines & Healthcare Since 1984";
    }
  }, [isAdminView, isCheckoutView, isOrderConfirmedView, isTrackingView, isNotFound]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      setIsAdminView(hash === '#admin' || window.location.pathname === '/admin');
      setIsNotFound(hash === '#404');
      setIsCheckoutView(hash === '#checkout' || window.location.pathname === '/checkout');

      const isConfirmed = hash === '#order-confirmed';
      setIsOrderConfirmedView(isConfirmed);
      if (isConfirmed) {
        try {
          const saved = sessionStorage.getItem('vms_last_order_confirmation');
          if (saved) setConfirmedOrderReceipt(JSON.parse(saved));
        } catch {
          // ignore session parse errors
        }
      }

      const isTrack = hash.startsWith('#track') || window.location.pathname.startsWith('/track');
      setIsTrackingView(isTrack);
      if (hash.startsWith('#track/')) {
        setTrackingToken(hash.replace('#track/', ''));
      } else if (hash === '#track') {
        setTrackingToken('');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openCheckout = () => {
    setIsCheckoutView(true);
    window.location.hash = 'checkout';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeCheckout = () => {
    setIsCheckoutView(false);
    if (window.location.hash === '#checkout') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const closeTracking = () => {
    setIsTrackingView(false);
    setTrackingToken('');
    if (window.location.hash.startsWith('#track')) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const openAdmin = () => {
    setIsAdminView(true);
    window.location.hash = 'admin';
  };

  const closeAdmin = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const handleAdminLogin = (data) => {
    setAdminUser(data);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    setAdminUser(null);
  };

  const handleAddToCart = (product) => {
    const prodId = product.id || product._id;
    const availableStock = typeof product.stock === 'number' ? product.stock : 0;

    if (availableStock <= 0) {
      setToast(`"${product.name}" is currently out of stock.`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const existing = cartItems.find(item => (item.id || item._id) === prodId);
    if (existing && existing.quantity >= availableStock) {
      setToast(`Only ${availableStock} unit(s) of "${product.name}" available in stock.`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const prodImage = product.image || (Array.isArray(product.images) && product.images[0]) || '';
    const normalizedProduct = {
      ...product,
      id: prodId,
      image: prodImage,
      stock: availableStock,
    };

    setCartItems(prev => {
      const match = prev.find(item => (item.id || item._id) === prodId);
      if (match) {
        if (match.quantity >= availableStock) return prev;
        return prev.map(item => 
          (item.id || item._id) === prodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity: 1 }];
    });

    // Show interactive toast
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddMultipleToCart = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;

    setCartItems((prev) => {
      const updated = [...prev];

      items.forEach((newItem) => {
        const prodId = newItem.id || newItem._id;
        const availableStock = typeof newItem.stock === 'number' ? newItem.stock : 0;
        if (availableStock <= 0) return;

        const reqQty = Math.max(1, Number(newItem.quantity) || 1);
        const existingIdx = updated.findIndex((i) => (i.id || i._id) === prodId);

        if (existingIdx > -1) {
          const currentQty = updated[existingIdx].quantity;
          const newQty = Math.min(availableStock, currentQty + reqQty);
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
          };
        } else {
          const initialQty = Math.min(availableStock, reqQty);
          const prodImage = newItem.image || (Array.isArray(newItem.images) && newItem.images[0]) || '';
          updated.push({
            ...newItem,
            id: prodId,
            image: prodImage,
            stock: availableStock,
            quantity: initialQty,
          });
        }
      });

      return updated;
    });

    setToast(`Added ${items.length} prescription medicine(s) to cart`);
    setTimeout(() => setToast(null), 3500);
    setIsCartOpen(true); // Open cart drawer to display added items
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }

    const item = cartItems.find(i => i.id === id || i._id === id);
    if (item && typeof item.stock === 'number' && newQuantity > item.stock) {
      setToast(`Only ${item.stock} unit(s) of "${item.name}" available in stock.`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setCartItems(prev => prev.map(item => 
      (item.id === id || item._id === id) ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id && item._id !== id));
  };

  // New checkout flow: save to DB, SMS sent server-side, show confirm modal
  const handleConfirmOrder = async (customerInfo, totalAmount, onSuccess, onError) => {
    try {
      const orderData = {
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        items: cartItems.map(item => {
          const rawId = item._id || item.id;
          const isValidObjectId = typeof rawId === 'string' && /^[0-9a-fA-F]{24}$/.test(rawId);
          return {
            ...(isValidObjectId ? { product: rawId } : {}),
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        totalAmount,
      };

      // Save to database — server sends SMS automatically
      const result = await createOrder(orderData);

      // Snapshot the cart before clearing it (for modal display)
      setConfirmedCartSnapshot([...cartItems]);

      // Prepare confirmation receipt
      const receiptData = {
        orderReference: result.orderReference || `#VMS-${result.shortId}`,
        shortId: result.shortId,
        orderId: result.orderId,
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        totalAmount: result.totalAmount,
        status: result.status || 'pending',
        createdAt: new Date().toISOString(),
        trackingToken: result.trackingToken || '',
        trackingUrl: result.trackingUrl || (result.trackingToken ? `/#track/${result.trackingToken}` : ''),
        items: [...cartItems],
      };

      // Persist in sessionStorage so page refreshes never lose the confirmation receipt
      try {
        sessionStorage.setItem('vms_last_order_confirmation', JSON.stringify(receiptData));
      } catch {
        // ignore storage errors
      }

      setConfirmedOrderReceipt(receiptData);
      setOrderConfirm({
        shortId: result.shortId,
        totalAmount: result.totalAmount,
        customerName: result.customerName || customerInfo.name,
        phone: customerInfo.phone,
      });

      // Clear cart
      setCartItems([]);
      window.location.hash = 'order-confirmed';
      setIsOrderConfirmedView(true);

      if (typeof onSuccess === 'function') {
        onSuccess(result);
      }
    } catch (error) {
      if (typeof onError === 'function') {
        onError(error.message || 'Failed to place order');
      }
    }
  };

  const openPolicy = (type) => {
    setPolicyModal({ isOpen: true, type });
  };

  if (isAdminView) {
    if (adminUser) {
      return (
        <AdminDashboard
          adminName={adminUser.name}
          onLogout={handleAdminLogout}
          onBack={closeAdmin}
        />
      );
    }
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLogin}
        onBack={closeAdmin}
      />
    );
  }

  if (isCheckoutView) {
    return (
      <CheckoutPage
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handleConfirmOrder}
        onBack={closeCheckout}
      />
    );
  }

  if (isOrderConfirmedView) {
    return (
      <OrderConfirmationPage
        orderData={confirmedOrderReceipt}
        onContinueShopping={() => {
          setIsOrderConfirmedView(false);
          window.location.hash = '';
        }}
      />
    );
  }

  if (isTrackingView) {
    return (
      <OrderTrackingPage
        token={trackingToken}
        onBack={closeTracking}
      />
    );
  }

  if (isNotFound) {
    return (
      <NotFound
        onGoHome={() => {
          setIsNotFound(false);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-fixed selection:text-primary scroll-smooth overflow-x-hidden max-w-[100vw]">
      {/* Toast feedback notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#00332e] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#d1a154]/30"
          >
            <CheckCircle2 className="w-5 h-5 text-[#f1be6e] flex-shrink-0" />
            <span className="text-sm font-semibold tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
        onUploadPrescription={() => setIsPrescriptionModalOpen(true)}
      />
      
      <main>
        <Hero onUploadPrescription={() => setIsPrescriptionModalOpen(true)} />
        <TrustStrip />
        <DailyEssentials />
        <ProductGrid onAddToCart={handleAddToCart} searchQuery={searchQuery} onProductClick={setSelectedProduct} />
        <CartSection 
          cartItems={cartItems} 
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveItem}
          onConfirm={handleConfirmOrder}
        />
        
        {/* Authentic Testimonials */}
        <section className="bg-surface-container-low py-32 px-8 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Voices of Trust</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Hear from our community of long-standing customers who rely on us for their daily well-being.</p>
            </div>
            <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar px-4 snap-x">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="min-w-[320px] md:min-w-[450px] bg-white p-10 rounded-3xl shadow-xl border border-outline-variant/10 text-left snap-center hover:shadow-2xl transition-shadow duration-500"
                >
                  <div className="flex gap-1 text-tertiary-fixed-dim mb-6">
                    {Array(t.rating).fill(0).map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-primary italic leading-relaxed mb-8">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-outline-variant/10 pt-6">
                    <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary font-black text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-primary text-xl">{t.name}</div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>



      {/* WhatsApp Chat Bubble — fixed bottom-left */}
      <motion.a
        href="https://wa.me/918738033229?text=Hello!%20I'd%20like%20to%20enquire%20about%20medicines%20at%20Vijay%20Medical%20Store."
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, x: -50 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 1.2, type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-8 left-8 z-40 bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-0 overflow-hidden group hover:gap-2 hover:pr-5 transition-all duration-300"
        style={{ maxWidth: '56px', width: 'auto' }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.522 5.828L.057 23.177a.75.75 0 0 0 .916.916l5.349-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.707 9.707 0 0 1-4.953-1.354l-.355-.211-3.695 1.012 1.012-3.695-.211-.355A9.707 9.707 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        <span className="text-sm font-black whitespace-nowrap max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300">
          Chat with us
        </span>
      </motion.a>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onConfirm={handleConfirmOrder}
        onCheckout={openCheckout}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Prescription OCR & Assisted Auto-Cart Modal */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onAddMultiple={handleAddMultipleToCart}
      />

      <PolicyModal 
        isOpen={policyModal.isOpen} 
        type={policyModal.type} 
        onClose={() => setPolicyModal({ ...policyModal, isOpen: false })} 
      />

      {/* Order Confirmation Modal — shown after successful checkout */}
      <OrderConfirmModal
        isOpen={!!orderConfirm}
        onClose={() => setOrderConfirm(null)}
        orderData={orderConfirm}
        cartItems={confirmedCartSnapshot}
      />
      
      <Footer onOpenPolicy={openPolicy} onOpenAdmin={openAdmin} />
    </div>
  );
}

export default App;
