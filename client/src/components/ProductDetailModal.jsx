import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShieldCheck, Truck, Clock } from 'lucide-react';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23f8f3e9'/><rect x='72' y='88' width='56' height='24' rx='12' fill='%2300332e' opacity='0.15' transform='rotate(-45 100 100)'/><rect x='72' y='88' width='56' height='24' rx='12' fill='none' stroke='%2300332e' stroke-width='3' opacity='0.3' transform='rotate(-45 100 100)'/><circle cx='100' cy='100' r='38' fill='none' stroke='%2300332e' stroke-width='2' opacity='0.1'/><text x='100' y='155' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23001c19' opacity='0.4'>Image unavailable</text></svg>`;

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto relative max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close product detail"
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors border border-outline-variant/10"
              >
                <X className="w-5 h-5 text-primary" />
              </button>

              {/* Image area */}
              <div className="bg-surface-container-low h-60 flex items-center justify-center p-8 flex-shrink-0">
                <img
                  src={imgError ? FALLBACK_SVG : product.image}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                  onError={() => setImgError(true)}
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto">

                {/* Category badge + Name */}
                <div>
                  <span className="inline-block text-[10px] font-black text-tertiary-fixed-dim uppercase tracking-widest bg-primary-container/20 px-3 py-1 rounded-full mb-2">
                    {product.category}
                  </span>
                  <h2 className="text-xl font-bold text-primary leading-snug">
                    {product.name}
                  </h2>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-on-surface-variant text-sm leading-relaxed border-l-2 border-tertiary-fixed-dim/40 pl-4 italic">
                    {product.description}
                  </p>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
                  </span>
                  <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-semibold">
                    <Truck className="w-3.5 h-3.5" /> Fast Delivery
                  </span>
                  <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-semibold">
                    <Clock className="w-3.5 h-3.5" /> In Stock
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">Price</p>
                    <span className="text-3xl font-black text-primary">₹{product.price}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className={`flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                      added
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-container text-on-primary hover:shadow-xl hover:scale-[1.03]'
                    }`}
                  >
                    <Plus className={`w-5 h-5 ${added ? 'text-white' : 'text-tertiary-fixed-dim'}`} />
                    {added ? 'Added! ✓' : 'Add to Cart'}
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
