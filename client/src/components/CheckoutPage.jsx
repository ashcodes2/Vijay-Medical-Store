import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  Phone,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const CheckoutPage = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onBack,
}) => {
  // Exactly three guest customer fields
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    deliveryAddress: '',
  });

  // Touched state for progressive field validation
  const [touched, setTouched] = useState({
    fullName: false,
    mobileNumber: false,
    deliveryAddress: false,
  });

  // Component states: 'idle' | 'submitting' | 'error' | 'success'
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Duplicate submission guard ref
  const isSubmittingRef = useRef(false);

  // Price calculations (estimated display - verified by server upon submission)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const gst = Number((subtotal * 0.12).toFixed(2));
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const estimatedTotal = Number((subtotal + gst + deliveryFee).toFixed(2));

  // Phone sanitization helper (extracts 10 digits)
  const sanitizeMobile = (val) => {
    return String(val || '')
      .replace(/[\s-]/g, '')
      .replace(/^\+?91/, '')
      .slice(0, 10);
  };

  // Validation logic
  const validateForm = (data) => {
    const errors = {};
    const trimmedName = data.fullName.trim();
    const cleanPhone = sanitizeMobile(data.mobileNumber);
    const trimmedAddress = data.deliveryAddress.trim();

    if (!trimmedName) {
      errors.fullName = 'Full name is required';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      errors.fullName = 'Full name cannot exceed 100 characters';
    }

    if (!cleanPhone) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    if (!trimmedAddress) {
      errors.deliveryAddress = 'Delivery address is required';
    } else if (trimmedAddress.length < 5) {
      errors.deliveryAddress = 'Delivery address must be at least 5 characters';
    } else if (trimmedAddress.length > 300) {
      errors.deliveryAddress = 'Delivery address cannot exceed 300 characters';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let nextVal = value;

    if (name === 'mobileNumber') {
      // Allow only digits, space, plus, dash
      nextVal = value.replace(/[^0-9+\s-]/g, '').slice(0, 15);
    }

    const updatedData = { ...formData, [name]: nextVal };
    setFormData(updatedData);

    // Clear API error banner on change
    if (apiErrorMessage) setApiErrorMessage('');

    // Re-validate touched field
    if (touched[name]) {
      const errors = validateForm(updatedData);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: errors[name] || '',
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateForm(formData);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: errors[field] || '',
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Prevent duplicate concurrent submissions
    if (isSubmittingRef.current || status === 'submitting') {
      return;
    }

    // Mark all as touched
    setTouched({
      fullName: true,
      mobileNumber: true,
      deliveryAddress: true,
    });

    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('idle');
      return;
    }

    if (cartItems.length === 0) {
      setApiErrorMessage('Your cart is empty. Please add medicines before checkout.');
      return;
    }

    const cleanPhone = sanitizeMobile(formData.mobileNumber);
    const orderPayload = {
      name: formData.fullName.trim(),
      phone: cleanPhone,
      address: formData.deliveryAddress.trim(),
    };

    // Lock submission
    isSubmittingRef.current = true;
    setStatus('submitting');
    setApiErrorMessage('');

    try {
      await onPlaceOrder(
        orderPayload,
        estimatedTotal,
        (result) => {
          // Success callback
          isSubmittingRef.current = false;
          setStatus('success');
          setConfirmedOrder({
            shortId: result?.shortId || String(result?.orderId || '').slice(-6).toUpperCase() || 'CONFIRMED',
            totalAmount: result?.totalAmount || estimatedTotal,
            customerName: formData.fullName.trim(),
            phone: cleanPhone,
            address: formData.deliveryAddress.trim(),
            trackingToken: result?.trackingToken || '',
            items: [...cartItems],
            date: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        },
        (errorMsg) => {
          // Error callback
          isSubmittingRef.current = false;
          setStatus('error');
          setApiErrorMessage(errorMsg || 'Failed to place order. Please try again.');
        }
      );
    } catch (err) {
      isSubmittingRef.current = false;
      setStatus('error');
      setApiErrorMessage(err.message || 'Network error occurred. Please check your connection.');
    }
  };

  // ──────────────────────── SUCCESS STATE ────────────────────────
  if (status === 'success' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-outline-variant/15 overflow-hidden"
          >
            {/* Header banner */}
            <div
              className="p-8 text-center text-white relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #001c19 0%, #00332e 100%)',
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d1a154] text-primary flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2 bg-[#d1a154]/20 text-[#f1be6e] border border-[#d1a154]/30">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white mb-1">
                Thank you, {confirmedOrder.customerName.split(' ')[0]}!
              </h1>
              <p className="text-white/70 text-sm max-w-md mx-auto">
                Your order has been recorded in our store system. Our registered pharmacists will pack your genuine medicines shortly.
              </p>
            </div>

            {/* Order details body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Order ID & Estimated Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Order Reference
                  </span>
                  <p className="text-xl font-black text-primary font-headline tracking-tight">
                    #VMS-{confirmedOrder.shortId}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block mb-1">
                    Delivery Speed
                  </span>
                  <p className="text-xl font-black text-green-900 font-headline tracking-tight">
                    Standard Local Delivery
                  </p>
                </div>
              </div>

              {/* Delivery info summary */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 space-y-2 text-sm">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <Truck className="w-4 h-4 text-tertiary-fixed-dim" />
                  Delivery Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-on-surface-variant">
                  <div>
                    <span className="font-semibold text-primary block">Customer:</span>
                    {confirmedOrder.customerName}
                  </div>
                  <div>
                    <span className="font-semibold text-primary block">Mobile (SMS updates):</span>
                    +91 {confirmedOrder.phone}
                  </div>
                  <div className="sm:col-span-2 mt-1">
                    <span className="font-semibold text-primary block">Delivery Address:</span>
                    {confirmedOrder.address}
                  </div>
                </div>
              </div>

              {/* Ordered items breakdown */}
              {confirmedOrder.items && confirmedOrder.items.length > 0 && (
                <div className="border border-outline-variant/10 rounded-2xl overflow-hidden">
                  <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/10 flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-outline-variant/5 max-h-56 overflow-y-auto">
                    {confirmedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex justify-between items-center text-sm">
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-primary truncate">{item.name}</p>
                          <span className="text-xs text-on-surface-variant">
                            Qty: {item.quantity} × ₹{item.price}
                          </span>
                        </div>
                        <span className="font-bold text-primary whitespace-nowrap">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface-container-low px-4 py-3 border-t border-outline-variant/10 flex justify-between items-center text-base font-black text-primary">
                    <span>Amount Payable (Cash on Delivery)</span>
                    <span className="text-lg text-[#d1a154]">
                      ₹{Number(confirmedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Cash on delivery reassurance banner */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Pay on Delivery • 100% Genuine Medicines</p>
                  <p className="text-amber-800/80">
                    You can inspect your medicines at doorstep before paying. Our delivery executive will provide a printed physical receipt.
                  </p>
                </div>
              </div>

              {/* Tracking & Navigation Actions */}
              <div className="pt-2 space-y-3">
                {confirmedOrder.trackingToken && (
                  <button
                    type="button"
                    id="checkout-success-track-btn"
                    onClick={() => {
                      window.location.hash = `track/${confirmedOrder.trackingToken}`;
                    }}
                    className="w-full bg-[#d1a154] text-primary py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all shadow-[0_10px_25px_-5px_rgba(209,161,84,0.4)] flex items-center justify-center gap-2.5 cursor-pointer text-sm"
                  >
                    <Truck className="w-5 h-5" />
                    Track Order Status Live
                  </button>
                )}

                <button
                  id="checkout-success-back-btn"
                  onClick={onBack}
                  className="w-full border-2 border-outline-variant/30 text-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ──────────────────────── EMPTY CART VIEW ────────────────────────
  if (cartItems.length === 0 && status !== 'success') {
    return (
      <div className="min-h-screen bg-surface py-16 px-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-outline-variant/10">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-headline font-bold text-primary">Your Cart is Empty</h2>
            <p className="text-on-surface-variant text-sm">
              Please add medicines or healthcare essentials to your cart before proceeding to checkout.
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-[#d1a154] text-primary px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-[#f1be6e] transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Medicines
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────── ACTIVE CHECKOUT VIEW ────────────────────────
  return (
    <div className="min-h-screen bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/15">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-tertiary-fixed-dim transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </button>
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary">
              Guest Checkout
            </h1>
            <p className="text-xs text-on-surface-variant">No account or password needed</p>
          </div>
        </div>

        {/* Global API error notification */}
        <AnimatePresence>
          {apiErrorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Order Placement Error</p>
                <p className="text-xs text-red-700 mt-0.5">{apiErrorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setApiErrorMessage('')}
                className="text-red-500 hover:text-red-800 text-xs font-bold underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ──────── Left Column: Guest Delivery Form (Exactly 3 Fields) ──────── */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-outline-variant/15 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                <Truck className="w-5 h-5 text-tertiary-fixed-dim" />
                Delivery Information
              </h2>
              <p className="text-xs text-on-surface-variant">
                Please enter accurate recipient details for fast doorstep delivery.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-5" noValidate>
              {/* Field 1: Full Name */}
              <div>
                <label
                  htmlFor="checkout-fullname"
                  className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-on-surface-variant/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-fullname"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('fullName')}
                    disabled={status === 'submitting'}
                    placeholder="e.g. Ramesh Chandra"
                    autoComplete="name"
                    className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all text-primary ${
                      fieldErrors.fullName
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-outline-variant/20 focus:ring-2 focus:ring-primary-fixed-dim'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label
                  htmlFor="checkout-mobile"
                  className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5"
                >
                  Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-on-surface-variant/70 border-r border-outline-variant/20 pr-2 select-none">
                    +91
                  </span>
                  <input
                    id="checkout-mobile"
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    disabled={status === 'submitting'}
                    placeholder="9876543210"
                    maxLength={14}
                    autoComplete="tel"
                    className={`w-full bg-surface-container-low border rounded-xl pl-14 pr-4 py-3 text-sm outline-none transition-all text-primary ${
                      fieldErrors.mobileNumber
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-outline-variant/20 focus:ring-2 focus:ring-primary-fixed-dim'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {fieldErrors.mobileNumber ? (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.mobileNumber}
                  </p>
                ) : (
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">
                    We will send delivery status updates via SMS to this number.
                  </p>
                )}
              </div>

              {/* Field 3: Delivery Address */}
              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5"
                >
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-on-surface-variant/40 absolute left-3.5 top-3.5 pointer-events-none" />
                  <textarea
                    id="checkout-address"
                    name="deliveryAddress"
                    rows={3}
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('deliveryAddress')}
                    disabled={status === 'submitting'}
                    placeholder="House / Flat No., Landmark, Street, Area, Gorakhpur..."
                    autoComplete="street-address"
                    className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all text-primary resize-none ${
                      fieldErrors.deliveryAddress
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-outline-variant/20 focus:ring-2 focus:ring-primary-fixed-dim'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {fieldErrors.deliveryAddress && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.deliveryAddress}
                  </p>
                )}
              </div>

              {/* Cash on Delivery Notice */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-tertiary-fixed-dim flex-shrink-0 mt-0.5" />
                <div className="text-xs text-on-surface-variant space-y-0.5">
                  <p className="font-bold text-primary">Cash on Delivery (COD)</p>
                  <p>Pay comfortably after inspecting your items at the door.</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-guest-order-btn"
                disabled={status === 'submitting'}
                className="w-full bg-[#d1a154] text-primary py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all flex items-center justify-center gap-3 shadow-[0_12px_28px_-5px_rgba(209,161,84,0.35)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying & Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Place Guest Order (₹{estimatedTotal.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ──────── Right Column: Order Summary & Cart Review ──────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xl border border-outline-variant/15 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-tertiary-fixed-dim" />
                  Cart Review
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-container text-primary">
                  {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-outline-variant/10 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const itemId = item.id || item._id;
                  const itemStock = typeof item.stock === 'number' ? item.stock : null;
                  const isMaxReached = itemStock !== null && item.quantity >= itemStock;

                  return (
                    <div key={itemId} className="py-3.5 flex gap-3 items-center">
                      <div className="w-14 h-14 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-primary text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-[#d1a154] font-semibold">₹{item.price}</p>
                        {itemStock !== null && (
                          <span className="text-[10px] text-on-surface-variant/70 block">
                            {itemStock > 0 ? `Stock: ${itemStock}` : 'Out of stock'}
                          </span>
                        )}
                      </div>

                      {/* Quantity Steppers */}
                      <div className="flex items-center gap-1.5 border border-outline-variant/20 rounded-lg overflow-hidden bg-surface-container-low">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
                          disabled={status === 'submitting'}
                          aria-label="Decrease quantity"
                          className="p-1 hover:bg-surface-container transition-colors disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3 text-primary" />
                        </button>
                        <span className="px-2 text-xs font-bold text-primary">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
                          disabled={status === 'submitting' || isMaxReached}
                          aria-label="Increase quantity"
                          title={isMaxReached ? 'Maximum available stock reached' : 'Increase quantity'}
                          className={`p-1 transition-colors ${
                            isMaxReached ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-container'
                          }`}
                        >
                          <Plus className="w-3 h-3 text-primary" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(itemId)}
                          disabled={status === 'submitting'}
                          aria-label="Remove item"
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bill Details */}
              <div className="border-t border-outline-variant/10 pt-4 space-y-2.5 text-xs sm:text-sm">
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
                  <span className="font-semibold text-green-700">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-outline-variant/10 pt-3 flex justify-between text-lg sm:text-xl font-black text-primary">
                  <span>Estimated Total</span>
                  <span className="text-[#d1a154]">₹{estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security & Verification Note */}
              <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant flex items-center gap-2">
                <Clock className="w-4 h-4 text-tertiary-fixed-dim flex-shrink-0" />
                <span>Delivery guaranteed within 2–4 hours in Gorakhpur city.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
