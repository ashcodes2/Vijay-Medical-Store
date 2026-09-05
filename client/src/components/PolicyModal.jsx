import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Truck, RotateCcw, FileText } from 'lucide-react';

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    icon: <Shield className="w-8 h-8" />,
    content: "At Vijay Medical Store, your health data is handled with clinical precision and absolute confidentiality. We collect personal information (name, address, phone) only for order fulfillment. Your prescriptions are stored securely and are only accessible by licensed pharmacists. We never share your data with third-party marketing agencies."
  },
  terms: {
    title: "Terms of Service",
    icon: <FileText className="w-8 h-8" />,
    content: "By using our services, you agree that: 1) Prescription-only medicines will only be dispensed upon validation of a legitimate doctor's prescription. 2) You are at least 18 years of age. 3) Delivery is limited to authorized city zones. 4) We reserve the right to verify prescriptions with the issuing physician if necessary."
  },
  shipping: {
    title: "Shipping Info",
    icon: <Truck className="w-8 h-8" />,
    content: "We provide priority pharmaceutical delivery within 2-4 business hours across Central City. A flat delivery fee of ₹20 applies to all orders. Orders above ₹500 qualify for complimentary free delivery. Real-time tracking is available via WhatsApp once your order is dispatched."
  },
  returns: {
    title: "Returns & Refunds",
    icon: <RotateCcw className="w-8 h-8" />,
    content: "Your satisfaction is our priority. You may return unopened, non-prescription items within 7 days of delivery for a full refund. Please note: For safety reasons, we cannot accept returns of temperature-sensitive (refrigerated) medicines, specialized oncology drugs, or opened packages."
  }
};

const PolicyModal = ({ type, isOpen, onClose }) => {
  if (!type || !policyContent[type]) return null;

  const data = policyContent[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-3xl p-8 shadow-2xl z-[201] border border-outline-variant/10"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-container text-tertiary-fixed-dim rounded-2xl shadow-lg">
                  {data.icon}
                </div>
                <h2 className="text-3xl font-headline font-bold text-primary">{data.title}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>
            
            <div className="prose prose-sm text-on-surface-variant font-body leading-relaxed space-y-4">
              <p className="text-lg font-medium">{data.content}</p>
              <div className="h-px bg-outline-variant/10 my-6" />
              <p className="text-xs text-on-surface-variant/60 italic font-bold uppercase tracking-widest">
                Last Updated: April 2026 • Vijay Medical Store Legal Team
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-8 bg-primary-container text-on-primary py-4 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Understand & Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PolicyModal;
