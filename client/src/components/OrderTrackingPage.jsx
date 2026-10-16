import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Search,
  Lock,
  HelpCircle,
  PhoneCall,
  KeyRound,
} from 'lucide-react';
import { trackOrderByToken } from '../services/api';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Received', desc: 'Registered at pharmacy counter' },
  { key: 'confirmed', label: 'Confirmed & Packed', desc: 'Verified by registered pharmacist' },
  { key: 'shipped', label: 'Out for Delivery', desc: 'Dispatched with local courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Received safely at doorstep' },
];

const OrderTrackingPage = ({ token: initialToken, onBack }) => {
  const [token, setToken] = useState(initialToken || '');
  const [prevToken, setPrevToken] = useState(initialToken);
  const [inputVal, setInputVal] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inputValidationWarning, setInputValidationWarning] = useState('');

  if (initialToken !== prevToken) {
    setPrevToken(initialToken);
    setToken(initialToken || '');
    if (!initialToken) {
      setOrder(null);
      setError(null);
      setLoading(false);
      setRefreshing(false);
    }
  }

  const fetchTracking = useCallback(async (tokenToUse) => {
    if (!tokenToUse || !tokenToUse.trim()) {
      setError('Please enter a valid tracking link or token.');
      return;
    }

    setLoading(true);
    setError(null);
    setInputValidationWarning('');

    try {
      const res = await trackOrderByToken(tokenToUse.trim());
      if (res && res.order) {
        setOrder(res.order);
      } else {
        setError('Order not found or tracking link is invalid.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve order details. Please verify your link.');
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!token || !token.trim()) return;

    let ignore = false;
    trackOrderByToken(token.trim())
      .then((res) => {
        if (!ignore) {
          if (res && res.order) {
            setOrder(res.order);
          } else {
            setError('Order not found or tracking link is invalid.');
            setOrder(null);
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Unable to retrieve order details. Please verify your link.');
          setOrder(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  // Handle manual input & validation
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    setInputValidationWarning('');
    if (error) setError(null);

    const trimmed = val.trim();
    // Proactively guide user if they try typing an order ID or phone number
    if (/^#?VMS/i.test(trimmed)) {
      setInputValidationWarning(
        'For customer privacy, orders cannot be tracked using an Order ID alone. Please paste the secure tracking link or token from your order confirmation.'
      );
    } else if (/^\+?[0-9]{10,12}$/.test(trimmed)) {
      setInputValidationWarning(
        'Orders cannot be tracked using a mobile number to prevent unauthorized access. Please use your secure tracking link or token.'
      );
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    const raw = inputVal.trim();

    if (!raw) {
      setInputValidationWarning('Please enter your tracking link or 64-character token.');
      return;
    }

    // Check if user submitted Order ID or phone number
    if (/^#?VMS/i.test(raw)) {
      setInputValidationWarning(
        'For customer privacy, orders cannot be tracked using an Order ID alone. Please enter the secure tracking link or token provided on your confirmation receipt.'
      );
      return;
    }

    if (/^\+?[0-9]{10,12}$/.test(raw)) {
      setInputValidationWarning(
        'Orders cannot be tracked using a mobile number to safeguard customer privacy. Please use the secure tracking link or token generated during checkout.'
      );
      return;
    }

    // Extract token from full or relative URL (e.g. https://domain.com/#track/<token> or #track/<token> or /#track/<token>)
    const clean = raw.replace(/^.*#track\//, '').replace(/^.*track\//, '').trim();

    if (clean.length < 32) {
      setInputValidationWarning(
        'The provided token is too short. Secure tracking tokens are 64 hexadecimal characters long. Please check the complete link.'
      );
      return;
    }

    setToken(clean);
    window.location.hash = `track/${clean}`;
    fetchTracking(clean);
  };

  const handleRefresh = () => {
    if (token) {
      setRefreshing(true);
      fetchTracking(token);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/#track/${token}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackAnother = () => {
    setOrder(null);
    setToken('');
    setInputVal('');
    setError(null);
    setInputValidationWarning('');
    window.location.hash = 'track';
  };

  // Polling & visibility-change live sync (gentle polling every 30s while order is active and not terminal)
  useEffect(() => {
    if (!token || !order) return;
    const isTerminal = order.currentStatus === 'delivered' || order.currentStatus === 'cancelled';
    if (isTerminal) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTracking(token);
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchTracking(token);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [token, order, fetchTracking]);

  // Determine active step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return -1;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.currentStatus) : -1;
  const isCancelled = order?.currentStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-tertiary-fixed-dim transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-primary rounded"
            aria-label="Return to store homepage"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Store
          </button>
          <div className="flex items-center gap-3">
            {order && (
              <>
                <button
                  type="button"
                  onClick={handleTrackAnother}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-container-low text-primary hover:bg-surface-container border border-outline-variant/20 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-tertiary-fixed-dim" />
                  <span className="hidden sm:inline">Track Another</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-container-low text-primary hover:bg-surface-container border border-outline-variant/20 transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Refresh order status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </>
            )}
            <span className="text-xs font-bold tracking-widest uppercase text-tertiary-fixed-dim bg-primary-container px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f1be6e]" />
              Secure Tracker
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-outline-variant/10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary">
              <RefreshCw className="w-8 h-8 animate-spin text-[#d1a154]" />
            </div>
            <h2 className="text-xl font-bold font-headline text-primary">Looking Up Your Order...</h2>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              Verifying your cryptographic tracking token securely with our store database.
            </p>
          </div>
        )}

        {/* Token Entry Screen: Shown when not loading and no active order */}
        {!loading && !order && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Hero */}
            <div
              className="rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #001c19 0%, #00332e 100%)',
              }}
            >
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f1be6e] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <KeyRound className="w-3.5 h-3.5" />
                  Cryptographic Guest Order Tracking
                </span>
                <h1 className="text-2xl sm:text-4xl font-headline font-black text-white">
                  Track Your Medicine Order
                </h1>
                <p className="text-sm text-white/80 leading-relaxed">
                  Enter or paste the secure tracking link or token you received after completing your checkout to view live packaging, dispatch, and delivery status.
                </p>
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#d1a154]/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Error banner if backend returned 404 or lookup failed */}
            {error && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">Tracking Look-up Failed</h3>
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                  <p className="text-[11px] text-red-600">
                    Please ensure you pasted the full 64-character token or the exact tracking URL from your confirmation receipt.
                  </p>
                </div>
              </div>
            )}

            {/* Input Form Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-outline-variant/15 space-y-6">
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div>
                  <label
                    htmlFor="tracking-token-input"
                    className="block text-sm font-bold text-primary mb-2"
                  >
                    Paste Tracking URL or 64-Character Token
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
                        <KeyRound className="w-4 h-4 text-tertiary-fixed-dim" />
                      </div>
                      <input
                        id="tracking-token-input"
                        name="trackingToken"
                        type="text"
                        value={inputVal}
                        onChange={handleInputChange}
                        placeholder="e.g., https://.../#track/7a9b... or 64-char token"
                        aria-describedby="tracking-help-text"
                        aria-invalid={!!inputValidationWarning || !!error}
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary placeholder:text-on-surface-variant/40 transition-all ${
                          inputValidationWarning ? 'border-amber-400 focus:ring-amber-300' : 'border-outline-variant/25'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !inputVal.trim()}
                      className="bg-[#d1a154] text-primary px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#f1be6e] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Search className="w-4 h-4" />
                      Track Order
                    </button>
                  </div>
                  <p id="tracking-help-text" className="text-xs text-on-surface-variant/70 mt-2">
                    Accepts either the full tracking URL or your 64-character token string.
                  </p>
                </div>

                {/* Validation Warning Notice (Order ID / Phone / Short Token) */}
                {inputValidationWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{inputValidationWarning}</p>
                  </motion.div>
                )}
              </form>

              {/* Security & Architecture Reassurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-outline-variant/10">
                <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/10 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-tertiary-fixed-dim" />
                    <span>Why Can't I Track With Order ID Alone?</span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Order IDs like <span className="font-mono bg-white px-1 py-0.5 rounded text-primary">#VMS-XXXXXX</span> and phone numbers are not secrets. Requiring the 256-bit cryptographic token ensures strangers cannot peek at your private medical prescriptions or orders.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/10 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-tertiary-fixed-dim" />
                    <span>Lost Your Tracking Link?</span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Because our database stores only an irreversible SHA-256 hash of your key, raw links cannot be resent automatically. Please check your browser history, order receipt, or call our pharmacy support at <a href="tel:+918738033229" className="font-bold text-primary hover:underline">+91 87380 33229</a>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Order Tracking Screen */}
        {!loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Order Hero Card */}
            <div
              className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #001c19 0%, #00332e 100%)',
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <span className="text-[11px] font-bold text-[#f1be6e] uppercase tracking-widest block mb-1">
                    Authentic Pharmacy Order
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-headline font-black text-white">
                    {order.orderReference}
                  </h1>
                  <p className="text-xs text-white/60 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Copy tracking link CTA */}
                <button
                  type="button"
                  id="copy-tracking-link-btn"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-white/15 transition-all cursor-pointer shadow-sm"
                  aria-label="Copy tracking URL to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#f1be6e]" />
                      <span>Copy Tracking Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress Stepper */}
              {isCancelled ? (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Order Cancelled</h3>
                    <p className="text-xs text-red-300">This order has been cancelled by the pharmacy or customer.</p>
                  </div>
                </div>
              ) : (
                <div className="pt-2 pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="flex flex-col items-start space-y-2 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              isCurrent
                                ? 'bg-[#d1a154] text-primary shadow-lg ring-4 ring-[#d1a154]/30'
                                : isCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isCurrent ? 'text-[#f1be6e]' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-white/50">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Grid: Status History & Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Timeline */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-outline-variant/15 space-y-6">
                <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-tertiary-fixed-dim" />
                  Status Updates & History
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/15 pl-6">
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    order.statusHistory.map((item, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-[#d1a154] ring-4 ring-white" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            Status: <span className="text-[#d1a154]">{item.status}</span>
                          </span>
                          <span className="text-[11px] text-on-surface-variant/70">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {item.note || 'Status verified by pharmacy'}
                        </p>
                        {item.actor && (
                          <p className="text-[10px] text-on-surface-variant/60">
                            Verified by: <span className="font-semibold text-primary/80">{item.actor}</span>
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant">Order placed and queued for pharmacist inspection.</p>
                  )}
                </div>

                {/* Privacy reassurance */}
                <div className="pt-4 border-t border-outline-variant/10 flex items-start gap-2.5 text-xs text-on-surface-variant/80">
                  <ShieldCheck className="w-4 h-4 text-tertiary-fixed-dim flex-shrink-0 mt-0.5" />
                  <span>
                    Cryptographically protected. Personal street address and customer phone details are redacted to prevent unauthorized disclosure.
                  </span>
                </div>
              </div>

              {/* Right Column: Order Summary & Item Snapshot */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-outline-variant/15 space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                    <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-tertiary-fixed-dim" />
                      Items in this Order
                    </h3>
                    <span className="text-xs font-bold text-on-surface-variant">
                      {order.items?.length || 0} item(s)
                    </span>
                  </div>

                  <div className="divide-y divide-outline-variant/5 max-h-56 overflow-y-auto">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-primary truncate">{it.name}</p>
                          <span className="text-xs text-on-surface-variant">
                            Qty: {it.quantity} × ₹{it.price}
                          </span>
                        </div>
                        <span className="font-bold text-primary whitespace-nowrap">
                          ₹{Number(it.itemTotal || it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial totals */}
                  <div className="border-t border-outline-variant/10 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span className="font-semibold text-primary">₹{Number(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>GST (12%)</span>
                      <span className="font-semibold text-primary">₹{Number(order.gst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-green-700">₹{Number(order.deliveryFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-outline-variant/10 pt-2 flex justify-between text-base font-black text-primary">
                      <span>Total Amount</span>
                      <span className="text-[#d1a154]">₹{Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment status badge */}
                  <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant flex items-center gap-2 border border-outline-variant/10">
                    <Truck className="w-4 h-4 text-tertiary-fixed-dim flex-shrink-0" />
                    <span>Pay ₹{Number(order.totalAmount).toFixed(2)} via Cash on Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
