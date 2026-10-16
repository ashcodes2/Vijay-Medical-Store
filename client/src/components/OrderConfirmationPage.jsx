import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Lock,
  Calendar,
  CreditCard,
} from 'lucide-react';

const OrderConfirmationPage = ({ orderData: propOrderData, onContinueShopping }) => {
  // Hydrate order data from props or sessionStorage (for refresh safety)
  const [order, setOrder] = useState(() => {
    if (propOrderData && propOrderData.orderReference) {
      return propOrderData;
    }
    try {
      const saved = sessionStorage.getItem('vms_last_order_confirmation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [prevPropOrderData, setPrevPropOrderData] = useState(propOrderData);
  if (propOrderData !== prevPropOrderData) {
    setPrevPropOrderData(propOrderData);
    if (propOrderData?.orderReference) {
      setOrder(propOrderData);
    }
  }

  const [copied, setCopied] = useState(false);

  // If order data is provided via props, sync it to sessionStorage
  useEffect(() => {
    if (propOrderData && propOrderData.orderReference) {
      try {
        sessionStorage.setItem('vms_last_order_confirmation', JSON.stringify(propOrderData));
      } catch {
        // ignore storage errors
      }
    }
  }, [propOrderData]);

  const handleCopyLink = () => {
    if (!order?.trackingToken) return;
    const trackingFullUrl = `${window.location.origin}/#track/${order.trackingToken}`;
    navigator.clipboard?.writeText(trackingFullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackLive = () => {
    if (order?.trackingToken) {
      window.location.hash = `track/${order.trackingToken}`;
    }
  };

  const handleBackToStore = () => {
    try {
      sessionStorage.removeItem('vms_last_order_confirmation');
    } catch {
      // ignore storage errors
    }
    if (typeof onContinueShopping === 'function') {
      onContinueShopping();
    } else {
      window.location.hash = '';
    }
  };

  // If no order data exists (e.g. direct visit without placing an order)
  if (!order) {
    return (
      <div className="min-h-screen bg-surface py-16 px-4">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-outline-variant/10">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40">
            <Package className="w-10 h-10 text-tertiary-fixed-dim" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-headline font-bold text-primary">No Active Confirmation</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              You haven't placed an order in this browsing session. If you have an existing tracking link, you can track it anytime.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => { window.location.hash = ''; }}
              className="w-full bg-[#d1a154] text-primary py-3.5 rounded-xl font-bold text-sm hover:bg-[#f1be6e] transition-colors shadow-md cursor-pointer"
            >
              Explore Medicines
            </button>
            <button
              onClick={() => { window.location.hash = 'track'; }}
              className="w-full border border-outline-variant/30 text-primary py-3 rounded-xl font-bold text-sm hover:bg-surface-container transition-colors cursor-pointer"
            >
              Track an Existing Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trackingUrl = order.trackingToken ? `${window.location.origin}/#track/${order.trackingToken}` : '';

  return (
    <div className="min-h-screen bg-surface py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl border border-outline-variant/15 overflow-hidden"
        >
          {/* Header Banner */}
          <div
            className="p-8 sm:p-10 text-center text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #001c19 0%, #00332e 100%)',
            }}
          >
            {/* Subtle background glow */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, #d1a154 0%, transparent 60%), radial-gradient(circle at 80% 80%, #f1be6e 0%, transparent 50%)',
              }}
            />

            {/* Checkmark Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-primary shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #d1a154, #f1be6e)',
              }}
            >
              <CheckCircle2 className="w-11 h-11 text-primary stroke-[2.5]" />
            </motion.div>

            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-2 bg-[#d1a154]/25 text-[#f1be6e] border border-[#d1a154]/30">
              Order Confirmed & Placed
            </span>
            <h1 className="text-2xl sm:text-4xl font-headline font-black text-white mb-2">
              Thank You{order.customerName ? `, ${order.customerName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
              Your guest order is registered with our store. A registered pharmacist is preparing your medicines for doorstep delivery.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Stat Pills: Order Reference, Status, Date, Total */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">
                  Order Ref
                </span>
                <p className="text-base sm:text-lg font-black text-primary font-headline">
                  {order.orderReference || `#VMS-${order.shortId}`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                  Status
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                  {order.status || 'Pending'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-0.5">
                  Delivery Method
                </span>
                <p className="text-base sm:text-lg font-black text-green-900 font-headline">
                  Direct Local Courier
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">
                  Total (COD)
                </span>
                <p className="text-base sm:text-lg font-black text-[#d1a154] font-headline">
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* ── MANDATORY PRIVACY CALLOUT CARD ── */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-200/70 flex items-center justify-center text-amber-900 flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    Save & Keep Your Tracking Link Private
                  </h3>
                  <p className="text-xs text-amber-900/80 leading-relaxed mt-0.5">
                    Because you checked out as a guest without creating an account or password, your tracking link contains a <strong>cryptographic security key</strong>. Save or bookmark this link so you can check your live order and delivery status anytime.
                  </p>
                </div>
              </div>

              {/* Copy URL Box */}
              {trackingUrl && (
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-white border border-amber-300/60 rounded-xl px-3.5 py-2.5 text-xs text-amber-900 font-mono truncate select-all">
                    {trackingUrl}
                  </div>
                  <button
                    type="button"
                    id="confirm-copy-token-btn"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Live Track CTA Button */}
            {order.trackingToken && (
              <button
                type="button"
                id="confirm-track-live-btn"
                onClick={handleTrackLive}
                className="w-full bg-[#d1a154] text-primary py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all shadow-[0_12px_28px_-5px_rgba(209,161,84,0.4)] flex items-center justify-center gap-2.5 cursor-pointer text-sm"
              >
                <Truck className="w-5 h-5" />
                Track Order Status Live
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Order Items Breakdown */}
            {order.items && order.items.length > 0 && (
              <div className="border border-outline-variant/10 rounded-2xl overflow-hidden">
                <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/10 flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>Ordered Items</span>
                  <span>Total</span>
                </div>
                <div className="divide-y divide-outline-variant/5 max-h-56 overflow-y-auto">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex justify-between items-center text-xs sm:text-sm">
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-primary truncate">{it.name}</p>
                        <span className="text-xs text-on-surface-variant">
                          Qty: {it.quantity} × ₹{it.price}
                        </span>
                      </div>
                      <span className="font-bold text-primary whitespace-nowrap">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-surface-container-low px-4 py-3 border-t border-outline-variant/10 flex justify-between items-center text-sm sm:text-base font-black text-primary">
                  <span>Amount to Pay on Delivery</span>
                  <span className="text-[#d1a154]">
                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Delivery address & recipient hint */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 flex flex-col sm:flex-row justify-between text-xs text-on-surface-variant gap-2">
              <div>
                <span className="font-bold text-primary block">Recipient:</span>
                {order.customerName} {order.phone ? `(+91 ${String(order.phone).slice(-10)})` : ''}
              </div>
              <div>
                <span className="font-bold text-primary block">Payment Method:</span>
                Cash on Delivery (Pay after inspecting your medicines)
              </div>
            </div>

            {/* Back to store action */}
            <div className="pt-2">
              <button
                type="button"
                id="confirm-continue-shopping-btn"
                onClick={handleBackToStore}
                className="w-full border-2 border-outline-variant/30 text-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Back to Store / Continue Shopping
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
