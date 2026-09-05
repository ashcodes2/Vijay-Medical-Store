import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, SearchX, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Fallback SVG — shown when any image URL fails to load
───────────────────────────────────────────────────────── */
const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23f8f3e9'/><rect x='72' y='88' width='56' height='24' rx='12' fill='%2300332e' opacity='0.15' transform='rotate(-45 100 100)'/><rect x='72' y='88' width='56' height='24' rx='12' fill='none' stroke='%2300332e' stroke-width='3' opacity='0.3' transform='rotate(-45 100 100)'/><circle cx='100' cy='100' r='38' fill='none' stroke='%2300332e' stroke-width='2' opacity='0.1'/><text x='100' y='155' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23001c19' opacity='0.4'>Image unavailable</text></svg>`;

/* ─────────────────────────────────────────────────────────
   ProductImage — handles loading skeleton + onError fallback
───────────────────────────────────────────────────────── */
const ProductImage = ({ src, alt }) => {
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  return (
    <div className="relative w-full h-full">
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container animate-pulse rounded-xl" />
      )}
      <img
        src={status === 'error' ? FALLBACK_SVG : src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`w-full h-full transition-all duration-500 ${
          status === 'error'
            ? 'object-contain p-4 opacity-60'
            : 'object-contain group-hover:scale-105'
        } ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Product data with descriptions
───────────────────────────────────────────────────────── */
const products = [
  // ── Pharmacy ──
  { id: 101, name: "Paracetamol 500mg (10 Tabs)", price: 16, category: "Pharmacy",
    image: "/products/paracetamol.png", description: "Reliable fever reducer and pain reliever for adults and children above 12. Standard 500mg dose, fast-acting formula." },
  { id: 102, name: "Combiflam Tablet (20 Tabs)", price: 57, category: "Pharmacy",
    image: "/products/combiflam.png", description: "Ibuprofen + Paracetamol combination for stronger pain relief, inflammation reduction and fever management." },
  { id: 103, name: "Pan-D Capsule (15 Caps)", price: 145, category: "Pharmacy",
    image: "/products/pan_d.png", description: "Pantoprazole + Domperidone combination for acidity, heartburn, gastritis and acid reflux relief." },
  { id: 104, name: "Digene Antacid Gel 200ml", price: 132, category: "Pharmacy",
    image: "/products/digene.png", description: "Fast-acting antacid gel for instant relief from acidity, gas, indigestion and stomach discomfort." },
  { id: 105, name: "Cetirizine 10mg (10 Tabs)", price: 15, category: "Pharmacy",
    image: "/products/cetirizine.png", description: "Non-drowsy antihistamine for allergy relief — sneezing, runny nose, watery eyes and skin itching." },
  { id: 106, name: "Betadine Antiseptic 100ml", price: 92, category: "Pharmacy",
    image: "/products/betadine.png", description: "Povidone-iodine antiseptic solution for wound cleaning, infection prevention and pre-surgery skin preparation." },
  { id: 107, name: "Burnol Antiseptic Cream 20g", price: 89, category: "Pharmacy",
    image: "/products/burnol.png", description: "Specially formulated antiseptic cream for minor burns, scalds and sunburns. Soothes and prevents infection." },
  { id: 108, name: "Band-Aid Flexible Fabric 20s", price: 110, category: "Pharmacy",
    image: "/products/bandaid.png", description: "Flexible fabric bandages that move with you. For cuts, scrapes and blisters. Latex-free and water resistant." },
  { id: 109, name: "Dr. Morepen Digital Thermometer", price: 299, category: "Pharmacy",
    image: "/products/thermometer.jpg", description: "Accurate digital thermometer with 10-second reading, fever alert beep and memory for last temperature." },
  { id: 110, name: "Omron BP Monitor HEM-7120", price: 1799, category: "Pharmacy",
    image: "/products/omron_bp.jpg", description: "Clinically validated automatic blood pressure monitor for home use with irregular heartbeat detection." },

  // ── Cold & Flu ──
  { id: 111, name: "Vicks VapoRub 50g", price: 186, category: "Cold & Flu",
    image: "/products/vicks_vaporub.png", description: "Classic mentholated chest rub for temporary relief from blocked nose, cough and minor muscle aches." },
  { id: 112, name: "Dabur Honitus Cough Syrup 100ml", price: 115, category: "Cold & Flu",
    image: "/products/dabur_honitus.png", description: "Herbal cough syrup with honey, tulsi and mulethi for soothing relief from dry and productive cough." },
  { id: 113, name: "Zandu Balm 25ml", price: 76, category: "Cold & Flu",
    image: "/products/zandu_balm.png", description: "Multi-purpose Ayurvedic pain balm for headache relief, cold discomfort and minor muscle or joint pain." },
  { id: 114, name: "Strepsils Orange Lozenges 16s", price: 98, category: "Cold & Flu",
    image: "/products/strepsils.png", description: "Medicated lozenges with antibacterial action for sore throat relief. Pleasant orange flavor for adults." },
  { id: 115, name: "D-Cold Total 10 Tablets", price: 42, category: "Cold & Flu",
    image: "/products/dcold.jpg", description: "Combination tablet for relief from cold symptoms — fever, body pain, nasal congestion and runny nose." },
  { id: 116, name: "Amrutanjan Pain Balm 30ml", price: 76, category: "Cold & Flu",
    image: "/products/amrutanjan.jpg", description: "Classic Indian pain balm for headaches, minor cold discomfort and muscle soreness. Trusted for over 100 years." },
  { id: 117, name: "Nasivion 0.1% Nasal Drops", price: 121, category: "Cold & Flu",
    image: "/products/nasivion.jpg", description: "Oxymetazoline nasal drops for fast and long-lasting relief from blocked nose. Effective for up to 12 hours." },
  { id: 118, name: "Otrivin Adult Nasal Drops 10ml", price: 104, category: "Cold & Flu",
    image: "/products/otrivin.jpg", description: "Xylometazoline 0.1% nasal drops for effective decongestant action. Relieves blocked nose from colds and allergies." },
  { id: 119, name: "Disprin Regular 10 Tablets", price: 18, category: "Cold & Flu",
    image: "/products/disprin.jpg", description: "Aspirin effervescent tablets for quick relief from headache, mild pain, fever and cold discomfort." },
  { id: 120, name: "Crocin Cold & Flu Max 15s", price: 95, category: "Cold & Flu",
    image: "/products/crocin.jpg", description: "Fast-acting paracetamol formula for comprehensive relief from cold, flu, high fever and body pain." },

  // ── Wellness ──
  { id: 121, name: "Dabur Chyawanprash 1kg", price: 660, category: "Wellness",
    image: "/products/dabur_chyawanprash.png", description: "Classic Ayurvedic immunity booster with 41 natural herbs, amla and ashwagandha. Builds stamina and resistance." },
  { id: 122, name: "Volini Pain Relief Spray 55g", price: 350, category: "Wellness",
    image: "/products/volini_spray.png", description: "Diclofenac-based topical spray for fast relief from joint pain, muscle strain, back pain and sports injuries." },
  { id: 123, name: "Electral ORS Lemon (10 Sachets)", price: 88, category: "Wellness",
    image: "/products/electral_ors.png", description: "WHO-recommended oral rehydration salts for quick recovery from dehydration. Available in lemon flavor." },
  { id: 124, name: "Himalaya Liv.52 DS 60 Tabs", price: 235, category: "Wellness",
    image: "/products/himalaya_liv52.png", description: "Liver protection supplement with Capers and Chicory. Supports healthy liver function and natural detoxification." },
  { id: 125, name: "Moov Fast Relief Spray 50g", price: 152, category: "Wellness",
    image: "/products/moov.webp", description: "Methyl salicylate pain relief spray for fast action on back pain, knee pain, neck stiffness and sprains." },
  { id: 126, name: "Revital H Capsules 30s", price: 420, category: "Wellness",
    image: "/products/revital.jpg", description: "Complete daily multivitamin with ginseng for sustained energy, vitality and overall health for active adults." },
  { id: 127, name: "Centrum Women Multivitamin 30s", price: 575, category: "Wellness",
    image: "/products/centrum.jpg", description: "Science-backed multivitamin formula with 24 essential nutrients designed specifically for women's health needs." },
  { id: 128, name: "Himalaya Ashwagandha 60 Tabs", price: 199, category: "Wellness",
    image: "/products/ashwagandha.jpg", description: "Pure Ashwagandha root extract tablets for stress relief, improved energy, focus and overall wellbeing." },
  { id: 129, name: "Glucon-D Nimbu Pani 500g", price: 155, category: "Wellness",
    image: "/products/glucond.jpg", description: "Instant energy glucose powder with Vitamin C for quick refreshment and energy replenishment. Refreshing lemon flavor." },
  { id: 130, name: "Protinex Original 400g", price: 649, category: "Wellness",
    image: "/products/protinex.jpg", description: "High-protein nutritional supplement with 8 essential amino acids for daily protein needs and muscle health." },

  // ── Baby Care ──
  { id: 131, name: "Himalaya Baby Oil 200ml", price: 245, category: "Baby Care",
    image: "/products/himalaya_baby_oil.png", description: "Gentle baby massage oil with olive oil and country mallow for nourishing and strengthening baby's delicate skin." },
  { id: 132, name: "Mamaearth Baby Lotion 400ml", price: 399, category: "Baby Care",
    image: "/products/mamaearth_lotion.png", description: "Toxin-free daily moisturizing lotion with shea butter and oat extract. Dermatologically tested, safe for babies." },
  { id: 133, name: "Johnson's Baby Powder 200g", price: 250, category: "Baby Care",
    image: "/products/johnsons_powder.jpg", description: "Classic baby powder to keep baby comfortable, fresh and dry. Mild formula gentle on sensitive baby skin." },
  { id: 134, name: "Himalaya Baby Shampoo 400ml", price: 295, category: "Baby Care",
    image: "/products/himalaya_baby_shampoo.jpg", description: "No-tears, tear-free gentle shampoo with chickpea and licorice for baby's delicate hair and scalp." },
  { id: 135, name: "Johnson's Baby Soap 100g", price: 72, category: "Baby Care",
    image: "/products/johnsons_soap.png", description: "Mild pH-balanced soap with 1/4 moisturizing lotion. Gentle enough for newborn skin from day one." },
  { id: 136, name: "Pampers Baby Wipes with Aloe 72s", price: 320, category: "Baby Care",
    image: "/products/pampers_wipes.jpg", description: "Aloe vera-enriched wipes for gentle and thorough cleaning at every diaper change. 99% pure water formula." },
  { id: 137, name: "MamyPoko Pants Medium 54pcs", price: 849, category: "Baby Care",
    image: "/products/mamypoko.jpg", description: "Extra absorbent diaper pants for babies 7–12 kg. Up to 12 hours of leak protection with elastic waistband." },
  { id: 138, name: "Cetaphil Baby Daily Lotion 400ml", price: 699, category: "Baby Care",
    image: "/products/cetaphil_baby.jpg", description: "Dermatologist recommended daily moisturizing lotion for baby's sensitive skin. Fragrance-free and hypoallergenic." },
  { id: 139, name: "Dabur Lal Tail Baby Oil 100ml", price: 135, category: "Baby Care",
    image: "/products/dabur_lal_tail.jpg", description: "Traditional Ayurvedic massage oil with 11 herbs to strengthen baby's bones and muscles. Trusted for generations." },
  { id: 140, name: "WOW Kids 3-in-1 Baby Wash 300ml", price: 329, category: "Baby Care",
    image: "/products/wow_baby_wash.jpg", description: "Gentle 3-in-1 baby wash, shampoo and conditioner in one bottle. Sulfate-free, paraben-free and tear-free." },

  // ── Personal Care ──
  { id: 141, name: "Dettol Original Liquid 500ml", price: 267, category: "Personal Care",
    image: "/products/dettol_liquid.png", description: "Original antiseptic liquid for personal hygiene, wound cleaning, bathing and effective surface disinfection." },
  { id: 142, name: "Savlon Antiseptic Liquid 200ml", price: 148, category: "Personal Care",
    image: "/products/savlon.png", description: "Chlorhexidine-based antiseptic for first aid wound care, hygiene rinse and general household antiseptic use." },
  { id: 143, name: "Odomos Mosquito Repellent Cream 50g", price: 99, category: "Personal Care",
    image: "/products/odomos_cream.png", description: "DEET-based mosquito repellent cream effective against mosquitoes and insects for up to 8 hours of protection." },
  { id: 144, name: "Lifebuoy Immunity Hand Sanitizer", price: 199, category: "Personal Care",
    image: "/products/lifebuoy_sanitizer.png", description: "70% alcohol hand sanitizer for effective on-the-go protection against germs and harmful bacteria." },
  { id: 145, name: "Dove Deep Nourishment Body Lotion", price: 379, category: "Personal Care",
    image: "/products/dove_lotion.jpg", description: "24-hour moisturizing body lotion with deep nourishment serum. Visibly heals dry skin in just 1 week." },
  { id: 146, name: "Nivea Men All-in-1 Charcoal Face Wash", price: 249, category: "Personal Care",
    image: "/products/nivea_facewash.jpg", description: "Charcoal deep cleansing face wash for men. Removes dirt, excess oil and unclogs pores for clear skin." },
  { id: 147, name: "Lacto Calamine Oil Control Lotion", price: 185, category: "Personal Care",
    image: "/products/lacto_calamine.jpg", description: "Kaolin clay-based oil control lotion for balanced, matte skin. Reduces shine and helps minimize open pores." },
  { id: 148, name: "Vaseline Lip Therapy Rosy 100g", price: 125, category: "Personal Care",
    image: "/products/vaseline.jpg", description: "Rosy tinted lip balm with micro-droplets of rose oil for soft, moisturized and naturally pink lips all day." },
  { id: 149, name: "Whisper Ultra Clean XL+ 44 Pads", price: 165, category: "Personal Care",
    image: "/products/whisper.jpg", description: "Premium sanitary pads with zig-zag cover for maximum leak-guard protection. Extra long for overnight security." },
  { id: 150, name: "Pears Soft & Fresh Soap 75g", price: 58, category: "Personal Care",
    image: "/products/pears.jpg", description: "Transparent glycerine soap with natural lemon flower extracts. 98% pure glycerine for soft, glowing skin." },
];

/* ─────────────────────────────────────────────────────────
   Category tabs config
───────────────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Pharmacy', 'Cold & Flu', 'Wellness', 'Baby Care', 'Personal Care'];

/* ─────────────────────────────────────────────────────────
   ProductGrid
───────────────────────────────────────────────────────── */
const ProductGrid = ({ onAddToCart, searchQuery, onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = products
    .filter(p => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'low-high') return a.price - b.price;
      if (sortOrder === 'high-low') return b.price - a.price;
      return 0;
    });

  return (
    <section id="medicines" className="py-20 px-6 md:px-8 max-w-screen-2xl mx-auto scroll-mt-28">

      {/* ── Header row ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            {searchQuery ? 'Search Results' : 'Best Sellers'}
          </h2>
          {searchQuery && (
            <p className="text-on-surface-variant font-medium text-sm">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-primary-fixed-dim cursor-pointer transition-shadow"
          >
            <option value="default">Sort: Default</option>
            <option value="low-high">Price: Low → High</option>
            <option value="high-low">Price: High → Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            whileTap={{ scale: 0.94 }}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-primary-container text-on-primary shadow-md ring-2 ring-primary-container/40'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary border border-outline-variant/10'
            }`}
          >
            {cat}
            {activeCategory === cat && cat !== 'All' && (
              <span className="ml-1.5 text-[10px] font-black opacity-60">
                ({products.filter(p => p.category === cat).length})
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(product => (
            <motion.article
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="group bg-white rounded-2xl border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
              style={{ minHeight: '280px' }}
              onClick={() => onProductClick(product)}
              aria-label={`View details for ${product.name} — ₹${product.price}`}
            >
              {/* ── Image container ── */}
              <div className="relative flex-shrink-0 bg-surface-container-low" style={{ height: '160px' }}>
                <ProductImage src={product.image} alt={product.name} />

                {/* Add-to-cart button */}
                <button
                  id={`add-to-cart-${product.id}`}
                  onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                  aria-label={`Add ${product.name} to cart`}
                  className="absolute bottom-2 right-2 w-9 h-9 bg-primary-container text-on-primary rounded-xl shadow-lg flex items-center justify-center
                             opacity-100 md:opacity-0 md:translate-y-1
                             group-hover:opacity-100 group-hover:translate-y-0
                             transition-all duration-200 active:scale-90 hover:bg-[#f1be6e] hover:text-primary z-10"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* ── Product info ── */}
              <div className="flex flex-col flex-grow p-3 gap-1.5">
                <span className="text-[9px] font-black text-tertiary-fixed-dim uppercase tracking-widest leading-none">
                  {product.category}
                </span>
                <h3
                  className="font-bold text-primary text-sm leading-snug"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.5rem',
                  }}
                >
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/8">
                  <span className="text-lg font-black text-primary">₹{product.price}</span>
                  <div className="flex items-center gap-1 text-tertiary-fixed-dim">
                    <ShoppingCart className="w-3 h-3 opacity-40" />
                    <span className="text-[9px] font-bold uppercase opacity-60">In Stock</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Empty state ── */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 space-y-6"
        >
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto">
            <SearchX className="w-12 h-12 text-on-surface-variant/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-primary">No results found</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
              We couldn&apos;t find anything matching &ldquo;{searchQuery || activeCategory}&rdquo;. Try a different search or category.
            </p>
          </div>
          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              className="text-primary font-bold hover:underline underline-offset-4 text-sm"
            >
              Clear category filter
            </button>
          )}
        </motion.div>
      )}
    </section>
  );
};

export default ProductGrid;
