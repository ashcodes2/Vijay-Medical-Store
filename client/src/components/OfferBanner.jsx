import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OFFERS = [
  "🎉 5% OFF on orders above ₹500 — Code: VIJAY5",
  "🚚 FREE Delivery on orders above ₹300",
  "💊 100% Genuine medicines from licensed distributors",
  "⏰ Order before 6 PM for same-day delivery in Gorakhpur",
  "🏅 ISO 9001:2015 Certified Pharmacy — Trusted Since 1984",
];

const OfferBanner = () => {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-[#001c19] text-[#f1be6e] overflow-hidden"
        >
          <div className="flex items-center px-4 py-2 gap-3">
            <Tag className="w-3 h-3 flex-shrink-0 text-[#d1a154]" />
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...OFFERS, ...OFFERS].map((offer, i) => (
                  <span key={i} className="text-[11px] font-semibold inline-block pr-12">
                    {offer}
                    <span className="pl-12 text-[#d1a154]/50">◆</span>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setVisible(false)}
              aria-label="Close offer banner"
              className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfferBanner;
