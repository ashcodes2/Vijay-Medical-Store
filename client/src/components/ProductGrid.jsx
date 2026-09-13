import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, SearchX, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import { getProducts } from '../services/api';

/* ─────────────────────────────────────────────────────────
   Fallback SVG — shown when any image URL fails to load
───────────────────────────────────────────────────────── */
const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23f8f3e9'/><rect x='72' y='88' width='56' height='24' rx='12' fill='%2300332e' opacity='0.15' transform='rotate(-45 100 100)'/><rect x='72' y='88' width='56' height='24' rx='12' fill='none' stroke='%2300332e' stroke-width='3' opacity='0.3' transform='rotate(-45 100 100)'/><circle cx='100' cy='100' r='38' fill='none' stroke='%2300332e' stroke-width='2' opacity='0.1'/><text x='100' y='155' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23001c19' opacity='0.4'>Image unavailable</text></svg>`;

/* ─────────────────────────────────────────────────────────
   ProductImage — handles loading skeleton + onError fallback
───────────────────────────────────────────────────────── */
const ProductImage = ({ src, alt }) => {
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  useEffect(() => {
    setStatus('loading');
  }, [src]);

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
   Category tabs default list
───────────────────────────────────────────────────────── */
const DEFAULT_CATEGORIES = ['All', 'Pharmacy', 'Cold & Flu', 'Wellness', 'Baby Care', 'Personal Care'];

/* ─────────────────────────────────────────────────────────
   Data normalization helper
───────────────────────────────────────────────────────── */
const normalizeProduct = (item) => {
  const id = item._id || item.id;
  const image = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
    ? item.images[0]
    : (item.image || '');

  return {
    ...item,
    id,
    _id: id,
    name: item.name || 'Unnamed Medicine',
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
    stock: typeof item.stock === 'number' ? item.stock : Number(item.stock) || 0,
    category: item.category || 'Pharmacy',
    image,
    images: Array.isArray(item.images) ? item.images : (image ? [image] : []),
  };
};

/* ─────────────────────────────────────────────────────────
   ProductGrid Component
───────────────────────────────────────────────────────── */
const ProductGrid = ({ onAddToCart, searchQuery, onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  const fetchProductList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      if (Array.isArray(data)) {
        setProducts(data.map(normalizeProduct));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products from backend:', err);
      setError(err.message || 'Unable to connect to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  // Compute category list dynamically based on database products + default categories
  const categories = useMemo(() => {
    const fromProducts = products.map(p => p.category).filter(Boolean);
    const combined = ['All', ...DEFAULT_CATEGORIES.slice(1), ...fromProducts];
    return Array.from(new Set(combined));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const q = (searchQuery || '').toLowerCase().trim();
        const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'low-high') return a.price - b.price;
        if (sortOrder === 'high-low') return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, activeCategory, sortOrder]);

  return (
    <section id="medicines" className="py-20 px-6 md:px-8 max-w-screen-2xl mx-auto scroll-mt-28">

      {/* ── Header row ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">
            {searchQuery ? 'Search Results' : 'Best Sellers'}
          </h2>
          {searchQuery && !loading && (
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
        {categories.map(cat => {
          const count = cat === 'All'
            ? products.length
            : products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;

          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileTap={{ scale: 0.94 }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary-container text-on-primary shadow-md ring-2 ring-primary-container/40'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary border border-outline-variant/10'
              }`}
            >
              {cat}
              {activeCategory.toLowerCase() === cat.toLowerCase() && cat !== 'All' && (
                <span className="ml-1.5 text-[10px] font-black opacity-60">
                  ({count})
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Loading Skeleton State ── */}
      {loading && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
        >
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col p-3 space-y-3 animate-pulse"
              style={{ minHeight: '280px' }}
            >
              <div className="bg-surface-container-low rounded-xl w-full h-40" />
              <div className="h-3 bg-surface-container rounded w-1/3" />
              <div className="h-4 bg-surface-container rounded w-3/4" />
              <div className="mt-auto pt-2 flex justify-between items-center border-t border-outline-variant/8">
                <div className="h-5 bg-surface-container rounded w-1/4" />
                <div className="h-4 bg-surface-container rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error State with Retry ── */}
      {!loading && error && (
        <div className="bg-red-50/80 border border-red-200/60 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 my-12 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-primary">Unable to load medicines</h3>
            <p className="text-sm text-on-surface-variant">{error}</p>
          </div>
          <button
            onClick={fetchProductList}
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* ── Empty Catalog State ── */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-primary">No medicines in catalog</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
            Medicines added by the admin will appear here automatically.
          </p>
        </div>
      )}

      {/* ── Product Grid ── */}
      {!loading && !error && products.length > 0 && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => {
              const isOutOfStock = (product.stock ?? 0) <= 0;
              return (
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
                      disabled={isOutOfStock}
                      onClick={e => {
                        e.stopPropagation();
                        if (!isOutOfStock) onAddToCart(product);
                      }}
                      aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
                      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 z-10 ${
                        isOutOfStock
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-primary-container text-on-primary opacity-100 md:opacity-0 md:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 active:scale-90 hover:bg-[#f1be6e] hover:text-primary'
                      }`}
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
                      <div className="flex items-center gap-1">
                        <ShoppingCart className={`w-3 h-3 ${isOutOfStock ? 'text-red-400' : 'text-tertiary-fixed-dim'} opacity-40`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          isOutOfStock
                            ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-black'
                            : 'text-tertiary-fixed-dim opacity-60'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock})`}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Empty search / filter state ── */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
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
              className="text-primary font-bold hover:underline underline-offset-4 text-sm cursor-pointer"
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
