import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import DailyEssentials from './components/DailyEssentials';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import CartSection from './components/CartSection';
import Footer from './components/Footer';
import PolicyModal from './components/PolicyModal';
import ProductDetailModal from './components/ProductDetailModal';
import { sendOrderToWhatsApp } from './services/WhatsAppService';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: "Rajesh Malhotra",
    role: "Regular Customer",
    text: "The only pharmacy where I can trust the medicine's authenticity. Their doorstep delivery has been a lifesaver for my parents during the pandemic. 40 years of trust is visible in their service.",
    rating: 5
  },
  {
    name: "Ananya Sharma",
    role: "Fitness Enthusiast",
    text: "Their wellness section is amazing. I get all my supplements here. The pharmacists are very knowledgeable and helped me understand my dosage schedule perfectly. Highly recommended!",
    rating: 5
  },
  {
    name: "Dr. Vikram Sethi",
    role: "Local Physician",
    text: "As a doctor, I always recommend Vijay Medical Store to my patients. Their storage standards (especially for temperature-sensitive drugs) are the best in the city. Truly a clinical atelier.",
    rating: 5
  },
  {
    name: "Priya Das",
    role: "New Mother",
    text: "The baby care range is extensive and they always have the latest Indian and international brands in stock. The WhatsApp ordering is so convenient when you have a toddler at home!",
    rating: 5
  }
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [policyModal, setPolicyModal] = useState({ isOpen: false, type: null });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleConfirmOrder = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const gst = subtotal * 0.12;
    const delivery = 20;
    sendOrderToWhatsApp(cartItems, subtotal + gst + delivery);
  };

  const openPolicy = (type) => {
    setPolicyModal({ isOpen: true, type });
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-fixed selection:text-primary scroll-smooth">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
      />
      
      <main>
        <Hero />
        <TrustStrip />
        <DailyEssentials />
        <ProductGrid onAddToCart={handleAddToCart} searchQuery={searchQuery} onProductClick={setSelectedProduct} />
        <CartSection 
          cartItems={cartItems} 
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveItem}
          onConfirm={handleConfirmOrder}
        />
        
        {/* Authentic Testimonials */}
        <section className="bg-surface-container-low py-32 px-8 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Voices of Trust</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Hear from our community of long-standing customers who rely on us for their daily well-being.</p>
            </div>
            <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar px-4 snap-x">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="min-w-[320px] md:min-w-[450px] bg-white p-10 rounded-3xl shadow-xl border border-outline-variant/10 text-left snap-center hover:shadow-2xl transition-shadow duration-500"
                >
                  <div className="flex gap-1 text-tertiary-fixed-dim mb-6">
                    {Array(t.rating).fill(0).map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-primary italic leading-relaxed mb-8">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-outline-variant/10 pt-6">
                    <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary font-black text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-primary text-xl">{t.name}</div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>



      {/* WhatsApp Chat Bubble — fixed bottom-left */}
      <motion.a
        href="https://wa.me/918738033229?text=Hello!%20I'd%20like%20to%20enquire%20about%20medicines%20at%20Vijay%20Medical%20Store."
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, x: -50 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 1.2, type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-8 left-8 z-40 bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-0 overflow-hidden group hover:gap-2 hover:pr-5 transition-all duration-300"
        style={{ maxWidth: '56px', width: 'auto' }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.522 5.828L.057 23.177a.75.75 0 0 0 .916.916l5.349-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.707 9.707 0 0 1-4.953-1.354l-.355-.211-3.695 1.012 1.012-3.695-.211-.355A9.707 9.707 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        <span className="text-sm font-black whitespace-nowrap max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300">
          Chat with us
        </span>
      </motion.a>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onConfirm={handleConfirmOrder}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <PolicyModal 
        isOpen={policyModal.isOpen} 
        type={policyModal.type} 
        onClose={() => setPolicyModal({ ...policyModal, isOpen: false })} 
      />
      
      <Footer onOpenPolicy={openPolicy} />
    </div>
  );
}

export default App;
