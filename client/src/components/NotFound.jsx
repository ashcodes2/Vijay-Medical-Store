import React from 'react';
import { motion } from 'framer-motion';
import { Home, Phone, AlertCircle, ShoppingBag } from 'lucide-react';

const NotFound = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-outline-variant/10"
      >
        <div className="w-24 h-24 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <span className="text-4xl font-headline font-black text-primary-container">404</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary">
            Page Not Found
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The page, category, or medicine view you're looking for doesn't exist or may have been relocated.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onGoHome}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary py-3.5 px-6 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4 text-tertiary-fixed-dim" />
            Return to Store
          </button>

          <a
            href="tel:+918738033229"
            className="w-full inline-flex items-center justify-center gap-2 border border-outline-variant/20 text-primary py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-surface-container transition-colors"
          >
            <Phone className="w-4 h-4 text-[#d1a154]" />
            Call Pharmacist (+91 87380 33229)
          </a>
        </div>

        <p className="text-xs text-on-surface-variant/60">
          Vijay Medical Store • Serving Since 1984
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
