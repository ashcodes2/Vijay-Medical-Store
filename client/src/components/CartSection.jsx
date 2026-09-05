import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Send, CheckCircle, Loader2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const CartSection = ({ cartItems, onUpdateQuantity, onRemove, onConfirm }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = subtotal * 0.12;
  const delivery = subtotal > 0 ? 20 : 0;
  const total = subtotal + gst + delivery;

  // Checkout form state
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderStatus, setOrderStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = () => {
    // Form Validation
    const trimmedName = customerInfo.name.trim();
    const trimmedPhone = customerInfo.phone.trim();
    const trimmedAddress = customerInfo.address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
      setErrorMsg('Please fill in all details (Name, Phone number, and Address).');
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    const phoneRegex = /^[0-9+ -]{10,15}$/;
    if (!phoneRegex.test(trimmedPhone) || trimmedPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please provide a valid 10-digit phone number for delivery updates.');
      return;
    }

    if (trimmedAddress.length < 5) {
      setErrorMsg('Please provide a complete street and delivery address.');
      return;
    }

    setErrorMsg('');
    setOrderStatus('loading');

    // Pass customer info + totals up to App.jsx which handles the API call
    onConfirm(
      { name: trimmedName, phone: trimmedPhone, address: trimmedAddress },
      total,
      () => {
        // Success callback
        setOrderStatus('success');
        setCustomerInfo({ name: '', phone: '', address: '' });
      },
      (err) => {
        // Error callback
        setOrderStatus('error');
        setErrorMsg(err || 'Failed to place order. Please check your connection and try again.');
      }
    );
  };

  // ── Success State Screen ──
  if (orderStatus === 'success') {
    return (
      <section id="cart-summary" className="py-24 px-6 sm:px-8 bg-surface-container-low border-t border-outline-variant/10">
        <div className="max-w-xl mx-auto text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-outline-variant/10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full">
              Order Confirmed & Saved
            </span>
            <h2 className="text-3xl font-headline font-bold text-primary">Thank You for Your Order!</h2>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
              Your order has been recorded in our system. Our pharmacist will review it and confirm delivery via WhatsApp & phone call.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setOrderStatus('idle')}
              className="bg-[#d1a154] text-primary px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#f1be6e] transition-colors"
            >
              Place Another Order
            </button>
            <button
              onClick={() => {
                setOrderStatus('idle');
                document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-outline-variant/30 text-primary px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-surface-container transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Empty State Screen ──
  if (cartItems.length === 0) {
    return (
      <section id="cart-summary" className="py-24 px-6 sm:px-8 bg-surface-container-low border-t border-outline-variant/10 scroll-mt-20">
        <div className="max-w-md mx-auto text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Your Cart is Empty</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              You haven't added any medicines or wellness products yet. Explore our genuine catalog to find what you need.
            </p>
          </div>
          <button
            onClick={() => document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-7 py-3.5 rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-tertiary-fixed-dim" />
            Explore Medicines
          </button>
        </div>
      </section>
    );
  }

  // ── Active Cart Screen ──
  return (
    <section id="cart-summary" className="py-24 px-6 sm:px-8 bg-surface-container-low border-t border-outline-variant/10 scroll-mt-20">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-primary flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-fixed-dim" />
              Review Your Cart
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
            </p>
          </div>
          <button
            onClick={() => document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-primary font-bold text-sm hover:text-tertiary-fixed-dim transition-colors flex items-center gap-1 group"
          >
            + Add more items <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-primary text-base sm:text-lg truncate">{item.name}</h3>
                      <p className="text-sm font-bold text-[#d1a154]">₹{item.price}</p>
                      <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-semibold">In Stock</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-low">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-2 sm:p-2.5 hover:bg-surface-container transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-primary" />
                      </button>
                      <span className="px-3 sm:px-4 font-bold text-sm text-primary">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-2 sm:p-2.5 hover:bg-surface-container transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-black text-lg text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove item"
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout & Delivery Details */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-outline-variant/10 space-y-6">
            <h3 className="text-xl font-headline font-bold text-primary">Delivery & Checkout</h3>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3.5">
              <div>
                <label htmlFor="customer-name" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  id="customer-name"
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Amit Kumar"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone Number (10 Digits) *
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary"
                />
              </div>

              <div>
                <label htmlFor="customer-address" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  id="customer-address"
                  name="address"
                  rows="2"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  placeholder="House/Flat No, Landmark, Area, City..."
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary resize-none"
                />
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Estimated GST (12%)</span>
                <span className="font-semibold text-primary">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Charge</span>
                <span className="font-semibold text-green-600">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
              </div>
              <div className="border-t border-outline-variant/10 pt-3 flex justify-between text-2xl font-black text-primary">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA button */}
            <button
              id="place-order-btn"
              onClick={handleSubmit}
              disabled={orderStatus === 'loading'}
              className="w-full bg-[#d1a154] text-primary py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all flex items-center justify-center gap-3 shadow-[0_15px_35px_-5px_rgba(209,161,84,0.35)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {orderStatus === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Place Order
                </>
              )}
            </button>

            <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3 border border-outline-variant/10">
              <CreditCard className="w-5 h-5 text-tertiary-fixed-dim flex-shrink-0" />
              <p className="text-xs text-on-surface-variant font-medium">
                Cash on Delivery Available • Pay after inspection
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartSection;
