import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Package,
  Phone,
  MapPin,
  Star,
  X,
  ShoppingBag,
} from "lucide-react";

/* ─── Confetti particle (pure CSS/JS, no library) ─── */
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
    animate={{
      opacity: 0,
      y: style.finalY,
      x: style.finalX,
      rotate: style.finalRotate,
      scale: 0,
    }}
    transition={{ duration: 1.2, ease: "easeOut", delay: style.delay }}
  />
);

const COLORS = ["#FFD700", "#d1a154", "#4ade80", "#60a5fa", "#f472b6", "#a78bfa"];

const generateParticles = (count = 40) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    style: {
      width: `${Math.random() * 10 + 6}px`,
      height: `${Math.random() * 10 + 6}px`,
      background: COLORS[i % COLORS.length],
      top: "50%",
      left: "50%",
      finalY: (Math.random() - 0.3) * -320,
      finalX: (Math.random() - 0.5) * 400,
      finalRotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.4,
    },
  }));

/* ─── Main Modal ─── */
const OrderConfirmModal = ({ isOpen, onClose, orderData, cartItems }) => {
  const particles = useMemo(() => generateParticles(50), []);
  const { shortId, totalAmount, customerName, phone } = orderData || {};

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = cartItems
    ? cartItems.reduce((a, i) => a + i.price * i.quantity, 0)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="order-confirm-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(10, 8, 20, 0.75)", backdropFilter: "blur(12px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Confetti burst from card centre */}
          <div className="relative">
            {particles.map((p) => (
              <Particle key={p.id} style={p.style} />
            ))}

            {/* Card */}
            <motion.div
              id="order-confirm-card"
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full mx-auto"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              style={{ maxHeight: "92vh", overflowY: "auto" }}
            >
              {/* Gold gradient header */}
              <div
                className="relative px-6 pt-10 pb-8 text-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1a1207 0%, #3d2a08 50%, #1a1207 100%)",
                }}
              >
                {/* Decorative rings */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, #d1a154 0%, transparent 60%), radial-gradient(circle at 80% 20%, #f1be6e 0%, transparent 50%)",
                  }}
                />

                {/* Close button */}
                <button
                  id="order-confirm-close"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Animated check icon */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #d1a154, #f1be6e)",
                    boxShadow: "0 0 40px rgba(209,161,84,0.5)",
                  }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
                    style={{ background: "rgba(209,161,84,0.2)", color: "#d1a154" }}>
                    Order Confirmed 🎉
                  </span>
                  <h2 className="text-2xl font-black text-white mb-1">
                    {customerName ? `Thank you, ${customerName.split(" ")[0]}!` : "Thank You!"}
                  </h2>
                  <p className="text-white/60 text-sm">Your order has been placed successfully</p>
                </motion.div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Order ID + ETA pills */}
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="rounded-2xl p-4 text-center border border-amber-100"
                    style={{ background: "linear-gradient(135deg, #fffbf0, #fef3c7)" }}>
                    <Package className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="text-base font-black text-amber-800">#VMS-{shortId}</p>
                  </div>

                  <div className="rounded-2xl p-4 text-center border border-green-100"
                    style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                    <Clock3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider mb-0.5">Est. Delivery</p>
                    <p className="text-base font-black text-green-800">2 – 4 Hours</p>
                  </div>
                </motion.div>

                {/* Order Confirmation Notice */}
                <motion.div
                  className="flex items-start gap-3 rounded-2xl px-4 py-3 border border-green-100"
                  style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <Package className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-800 font-medium leading-relaxed">
                    Order confirmed and sent to our pharmacy counter. You will receive an SMS confirmation at <strong>+91 {phone ? String(phone).slice(-10) : ''}</strong> with delivery updates.
                  </p>
                </motion.div>

                {/* Items summary */}
                {cartItems && cartItems.length > 0 && (
                  <motion.div
                    className="rounded-2xl border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2"
                      style={{ background: "#f9f7f3" }}>
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Items</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {cartItems.map((item) => (
                        <div key={item.id || item._id} className="px-4 py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image && (
                              <img src={item.image} alt={item.name}
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                            )}
                            <span className="text-sm font-semibold text-gray-800 truncate">{item.name}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <span className="text-xs text-gray-500 block">x{item.quantity}</span>
                            <span className="text-sm font-bold text-amber-700">₹{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center"
                      style={{ background: "#fafaf8" }}>
                      <span className="text-sm font-bold text-gray-700">Total Paid</span>
                      <span className="text-lg font-black" style={{ color: "#d1a154" }}>
                        ₹{totalAmount ? Number(totalAmount).toFixed(2) : subtotal.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Delivery address hint */}
                <motion.div
                  className="flex items-start gap-2.5 text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>Cash on delivery available. Pay after you inspect your medicines at the door.</span>
                </motion.div>

                {/* Stars */}
                <motion.div
                  className="flex gap-1 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                >
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {/* Primary Return to Shopping button */}
                  <button
                    id="order-confirm-cta-primary"
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl font-black text-sm text-primary flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #d1a154, #f1be6e)",
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Back to Store / Continue Shopping
                  </button>

                  {/* Continue shopping */}
                  <button
                    id="order-confirm-cta"
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 transition-all hover:scale-[1.02] active:scale-95"
                    style={{ borderColor: "#d1a154", color: "#d1a154", background: "transparent" }}
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderConfirmModal;
