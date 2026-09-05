import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Send } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove, onConfirm }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = subtotal * 0.12;
  const delivery = subtotal > 0 ? 20 : 0;
  const total = subtotal + gst + delivery;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-primary-container text-on-primary">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-tertiary-fixed-dim" />
                <h2 className="text-xl font-bold font-headline tracking-tight">Your Order</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-medium text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="text-primary font-bold hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-primary">{item.name}</h4>
                      <p className="text-sm text-on-surface-variant mb-2">₹{item.price}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-outline-variant/20 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-surface-container transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 text-sm font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-surface-container transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-xs text-error font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-bold text-primary">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>GST (12%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Delivery Fee</span>
                    <span>₹{delivery.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-outline-variant/10">
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    // Close drawer and scroll to the full cart section where the checkout form is
                    onClose();
                    document.getElementById('cart-summary')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-[#d1a154] text-primary py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
