import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: "Cold & Flu",
    desc: "Vicks, Honitus, Zandu Balm and full symptom relief for the whole family.",
    image: "/products/vicks_vaporub.png"
  },
  {
    id: 2,
    name: "Baby Care",
    desc: "Gentle Himalaya, Johnson's and Mamaearth formulations for your little one.",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80"
  },
  {
    id: 3,
    name: "Wellness",
    desc: "Chyawanprash, Ashwagandha, multivitamins and immunity boosters.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80"
  },
  {
    id: 4,
    name: "Personal Care",
    desc: "Dettol, Savlon, Nivea and daily hygiene essentials.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
  }
];

const DailyEssentials = () => {
  const scrollToProducts = () => {
    document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="wellness" className="bg-surface py-32 px-8">
      <div className="max-w-screen-2xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-headline font-bold text-primary mb-4 tracking-tight">Curated Daily Essentials</h2>
            <p className="text-on-surface-variant leading-relaxed">Precision-picked categories for your family's health and wellness journey.</p>
          </div>
          <button 
            onClick={scrollToProducts}
            className="text-primary font-bold flex items-center gap-2 group"
          >
            Browse All Categories <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group glass-morphic rounded-3xl p-8 transition-all duration-300 cursor-pointer"
              onClick={scrollToProducts}
            >
              <div className="aspect-square mb-8 rounded-2xl overflow-hidden bg-white/50 shadow-inner flex items-center justify-center p-8 group-hover:scale-[1.02] transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">{cat.name}</h3>
              <p className="text-sm text-on-surface-variant mb-6">{cat.desc}</p>
              <motion.div 
                whileHover={{ x: 5 }}
                className="inline-flex items-center text-tertiary-fixed-dim"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DailyEssentials;
