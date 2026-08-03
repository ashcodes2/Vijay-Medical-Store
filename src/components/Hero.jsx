import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Phone } from 'lucide-react';

const Hero = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative bg-surface-container-low pt-40 pb-24 px-8 overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-96 h-96 bg-tertiary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Trust badge */}
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-tertiary-fixed-dim text-xs font-bold tracking-widest uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
            Trusted Since 1984 · Gorakhpur
          </motion.span>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.08] tracking-tighter">
            Gorakhpur's Most <br />
            <span className="text-on-tertiary-container">Trusted</span> Medical Store.
          </h1>

          {/* Sub-copy */}
          <p className="text-lg text-on-surface-variant max-w-xl font-body leading-relaxed">
            Genuine medicines, expert pharmacist consultations, and fast doorstep delivery — all in one place. Serving families across Gorakhpur for over four decades.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="hero-browse-medicines"
              onClick={() => scrollTo('medicines')}
              className="flex items-center gap-2 bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-base hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5 text-tertiary-fixed-dim" />
              Browse Medicines
            </button>


          </div>

          {/* Quick phone CTA (mobile only — desktop has it in navbar) */}
          <a
            href="tel:+918738033229"
            className="lg:hidden inline-flex items-center gap-2 text-sm text-on-surface-variant font-medium hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4 text-tertiary-fixed-dim" />
            +91 87380 33229 — Call us anytime
          </a>
        </motion.div>

        {/* ── Right image ── */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative z-10"
          >
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFgz2HCRw9TyVp3yJBGeHWlAPN0NzczJzwodcEhJMlH14fKpV0NJw-QOVsw7r_24h6aVw_RTg5HG3uvUuKxSxa1sTgVEq7vxPtYpr1yBfpbz_aDzTtmbpqCT7dIdRrXW5z7CbTiSzSeVNrwmqNerqOfkzLEF1ymltYvp7ffNvsMnt8rRaHWF-DtJumcv0afSbT4S1WnjAvgMoMFCD4KJF_ON2knShM3V4HeCEqt1y-klVM0u9oVXlonOPNUhIDu0Plnsao9nuU4bpz"
                alt="Professional pharmacist at Vijay Medical Store serving a customer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating trust card */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -bottom-8 -left-8 bg-surface p-6 rounded-2xl shadow-xl z-20 max-w-[260px] border border-outline-variant/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏅</span>
                <span className="text-sm font-black text-primary">ISO 9001:2015</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-snug font-medium">
                Certified pharmaceutical storage & distribution standards — guaranteed quality on every product.
              </p>
            </motion.div>
          </motion.div>

          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-tertiary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
