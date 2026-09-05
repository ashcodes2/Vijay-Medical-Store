import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, FileText, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    label: '100% Authentic Medicines',
    sub: 'Sourced directly from licensed distributors',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    label: 'Open 8 AM – 10 PM',
    sub: 'Seven days a week, including holidays',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    label: 'Digital Billing',
    sub: 'Instant GST invoices on every purchase',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    label: '40+ Years of Trusted Care',
    sub: 'Serving Gorakhpur families since 1984',
  },
];

const TrustStrip = () => (
  <section
    aria-label="Why customers trust us"
    className="bg-primary-container py-10 px-8 border-y border-tertiary-fixed-dim/10"
  >
    <div className="max-w-screen-2xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-tertiary-fixed-dim/20">
      {pillars.map((p, i) => (
        <motion.div
          key={p.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex flex-col items-center text-center gap-2 px-6 py-2"
        >
          <div className="text-tertiary-fixed-dim mb-1">{p.icon}</div>
          <p className="font-black text-sm text-on-primary leading-tight">{p.label}</p>
          <p className="text-xs text-on-primary/60 leading-snug hidden sm:block">{p.sub}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TrustStrip;
