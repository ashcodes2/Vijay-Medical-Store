import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight, Share2, Globe, MessageCircle } from 'lucide-react';

const WA_NUMBER = '918738033229';
const WA_CHAT_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello! I'd like to enquire about medicines and services at Vijay Medical Store.")}`;

const Footer = ({ onOpenPolicy }) => {
  const address = '134, Sahjanwa Market, Gorakhpur, Uttar Pradesh — 273209';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vijay Medical Store',
          text: 'Check out Vijay Medical Store — Gorakhpur\'s trusted pharmacy since 1984!',
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleGetDirections = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  return (
    <footer id="footer" className="bg-[#001c19] text-[#fef9ef] pt-16 pb-0 px-8 border-t border-[#d1a154]/10">

      {/* ── WhatsApp CTA Banner ── */}
      <div className="max-w-screen-2xl mx-auto mb-16">
        <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <p className="text-xl font-black text-[#f1be6e]">Need medicines quickly?</p>
            <p className="text-[#fef9ef]/60 text-sm max-w-md">
              Message us on WhatsApp — share your prescription or ask our pharmacist anything. We respond within minutes.
            </p>
          </div>
          <a
            id="footer-whatsapp-cta"
            href={WA_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-3 bg-[#25D366] text-white font-black px-8 py-4 rounded-2xl hover:bg-[#1ebe5a] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_8px_32px_-4px_rgba(37,211,102,0.35)] text-sm tracking-wide uppercase"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.522 5.828L.057 23.177a.75.75 0 0 0 .916.916l5.349-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.707 9.707 0 0 1-4.953-1.354l-.355-.211-3.695 1.012 1.012-3.695-.211-.355A9.707 9.707 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-screen-2xl mx-auto font-body text-sm tracking-wide pb-16 border-b border-white/5">

        {/* Brand */}
        <div className="space-y-5">
          <span className="text-xl font-black text-[#f1be6e] block font-headline tracking-tighter">
            Vijay Medical Store
          </span>
          <p className="text-[#fef9ef]/60 leading-relaxed max-w-xs">
            Gorakhpur's trusted clinical atelier for premium healthcare and genuine medicines. Serving families with integrity since 1984.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              aria-label="Share this store"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f1be6e] hover:text-[#001c19] transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open('https://www.vijaymedicalstore.com', '_blank')}
              aria-label="Visit website"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f1be6e] hover:text-[#001c19] transition-all"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location + Map */}
        <div className="space-y-5">
          <h2 className="font-bold text-lg text-[#f1be6e] font-headline">Store Location</h2>
          <address className="not-italic text-[#fef9ef]/60 space-y-3">
            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-[#f1be6e] flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{address}</p>
            </div>
          </address>

          {/* Embedded Google Maps */}
          <div className="rounded-2xl overflow-hidden border border-white/10 h-36">
            <iframe
              title="Vijay Medical Store location on Google Maps"
              src="https://maps.google.com/maps?q=134,+Sahjanwa+Market,+Gorakhpur,+Uttar+Pradesh+273209&output=embed&z=15"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.3) invert(0.9) hue-rotate(180deg)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <button
            onClick={handleGetDirections}
            className="flex items-center gap-2 text-[#f1be6e] font-bold group hover:underline underline-offset-4 text-sm"
          >
            Get Directions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Contact + Hours */}
        <div className="space-y-5">
          <h2 className="font-bold text-lg text-[#f1be6e] font-headline">Contact Us</h2>
          <div className="space-y-3">
            <a
              href={WA_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300 text-[#fef9ef]/60 hover:text-[#fef9ef]"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
              WhatsApp: +91 87380 33229
            </a>
            <a
              href="tel:+918738033229"
              className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300 text-[#fef9ef]/60 hover:text-[#fef9ef]"
            >
              <Phone className="w-5 h-5 text-[#f1be6e] flex-shrink-0" />
              +91 87380 33229
            </a>
            <a
              href="mailto:support@vijaymedical.com"
              className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300 text-[#fef9ef]/60 hover:text-[#fef9ef]"
            >
              <Mail className="w-5 h-5 text-[#f1be6e] flex-shrink-0" />
              support@vijaymedical.com
            </a>
          </div>

          {/* Store timings */}
          <div className="mt-4">
            <h3 className="font-bold text-sm text-[#f1be6e] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Store Hours
            </h3>
            <ul className="space-y-1.5 text-[#fef9ef]/60 text-xs">
              <li className="flex justify-between gap-6">
                <span>Monday – Saturday</span>
                <span className="font-semibold text-[#fef9ef]/80">8:00 AM – 10:00 PM</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Sunday</span>
                <span className="font-semibold text-[#fef9ef]/80">9:00 AM – 9:00 PM</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Public Holidays</span>
                <span className="font-semibold text-[#25D366]">Open ✓</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-5">
          <h2 className="font-bold text-lg text-[#f1be6e] font-headline">Quick Links</h2>
          <ul className="space-y-3 text-[#fef9ef]/60">
            <li>
              <a href="#medicines" className="hover:text-[#fef9ef] transition-colors hover:translate-x-1 inline-block">
                Browse Medicines
              </a>
            </li>

            <li>
              <a href="#wellness" className="hover:text-[#fef9ef] transition-colors hover:translate-x-1 inline-block">
                Wellness Products
              </a>
            </li>
            <li className="pt-2 border-t border-white/5">
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-[#fef9ef] transition-colors text-left">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-[#fef9ef] transition-colors text-left">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('shipping')} className="hover:text-[#fef9ef] transition-colors text-left">
                Shipping Info
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('returns')} className="hover:text-[#fef9ef] transition-colors text-left">
                Returns & Refunds
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="max-w-screen-2xl mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[#fef9ef]/30 text-xs">
        <p>© 2026 Vijay Medical Store. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>The Clinical Atelier · Since 1984</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>ISO 9001:2015 Registered</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
