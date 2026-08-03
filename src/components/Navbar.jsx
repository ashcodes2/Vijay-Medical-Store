import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OfferBanner from './OfferBanner';

const Navbar = ({ cartCount, onCartClick, onSearchChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearchChange(val);
    if (val.length > 0) {
      document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearchChange('');
    searchRef.current?.focus();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { name: 'Home',      href: '#home' },
    { name: 'Medicines', href: '#medicines' },
    { name: 'Contact',   href: '#footer' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md transition-shadow duration-300 ${
        isScrolled ? 'shadow-[0_4px_24px_-4px_rgba(0,28,25,0.12)]' : ''
      }`}
    >
      <OfferBanner />
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="flex items-center justify-between w-full px-6 py-3.5 max-w-screen-2xl mx-auto gap-4"
      >
        {/* ── Brand ── */}
        <a
          href="#home"
          className="text-xl font-black tracking-tighter text-primary-container font-headline flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
          aria-label="Vijay Medical Store — go to homepage"
        >
          Vijay Medical Store
        </a>

        {/* ── Desktop Nav links ── */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-primary/70 hover:text-primary transition-colors hover:underline underline-offset-4 decoration-tertiary-fixed-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* ── Search bar (always visible on desktop) ── */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder="Search medicines, strips…"
            aria-label="Search medicines"
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-full pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary placeholder:text-on-surface-variant/40 transition-shadow"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-container rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">

          {/* Phone number — desktop only */}
          <a
            href="tel:+918738033229"
            aria-label="Call Vijay Medical Store"
            className="hidden lg:flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-primary transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center group-hover:bg-primary-container/40 transition-colors">
              <Phone className="w-4 h-4 text-tertiary-fixed-dim" />
            </div>
            <span className="tracking-tight">+91 87380 33229</span>
          </a>

          {/* Cart */}
          <button
            id="cart-button"
            onClick={onCartClick}
            aria-label={`Open cart — ${cartCount} items`}
            className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ShoppingBag className="w-5 h-5 text-primary" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0.5 right-0.5 bg-tertiary-fixed-dim text-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-black"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>



          {/* Mobile hamburger — 44×44px touch target */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-6 h-6 text-primary" /></motion.span>
                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-6 h-6 text-primary" /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* ── Mobile search bar ── */}
      <div className="md:hidden px-4 pb-3 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
        <input
          type="search"
          value={searchValue}
          onChange={handleSearchInput}
          placeholder="Search medicines, strips…"
          aria-label="Search medicines"
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-full pl-9 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-primary-fixed-dim outline-none text-primary placeholder:text-on-surface-variant/40"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-7 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-full"
          >
            <X className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        )}
      </div>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-surface border-t border-outline-variant/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="text-xl font-bold text-primary py-3 px-4 rounded-xl hover:bg-surface-container transition-colors min-h-[52px] flex items-center"
                >
                  {link.name}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-outline-variant/10 my-2" />

              {/* Phone CTA */}
              <a
                href="tel:+918738033229"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-primary font-bold py-3 px-4 rounded-xl hover:bg-surface-container transition-colors min-h-[52px]"
              >
                <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-tertiary-fixed-dim" />
                </div>
                +91 87380 33229
              </a>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
