const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Category = require('./models/Category');

const products = [
  // Pharmacy
  { name: "Paracetamol 500mg (10 Tabs)", price: 16, category: "Pharmacy", stock: 100, images: ["/products/paracetamol.png"], description: "Reliable fever reducer and pain reliever for adults and children above 12. Standard 500mg dose, fast-acting formula." },
  { name: "Combiflam Tablet (20 Tabs)", price: 57, category: "Pharmacy", stock: 100, images: ["/products/combiflam.png"], description: "Ibuprofen + Paracetamol combination for stronger pain relief, inflammation reduction and fever management." },
  { name: "Pan-D Capsule (15 Caps)", price: 145, category: "Pharmacy", stock: 80, images: ["/products/pan_d.png"], description: "Pantoprazole + Domperidone combination for acidity, heartburn, gastritis and acid reflux relief." },
  { name: "Digene Antacid Gel 200ml", price: 132, category: "Pharmacy", stock: 60, images: ["/products/digene.png"], description: "Fast-acting antacid gel for instant relief from acidity, gas, indigestion and stomach discomfort." },
  { name: "Cetirizine 10mg (10 Tabs)", price: 15, category: "Pharmacy", stock: 150, images: ["/products/cetirizine.png"], description: "Non-drowsy antihistamine for allergy relief — sneezing, runny nose, watery eyes and skin itching." },
  { name: "Betadine Antiseptic 100ml", price: 92, category: "Pharmacy", stock: 75, images: ["/products/betadine.png"], description: "Povidone-iodine antiseptic solution for wound cleaning, infection prevention and pre-surgery skin preparation." },
  { name: "Burnol Antiseptic Cream 20g", price: 89, category: "Pharmacy", stock: 90, images: ["/products/burnol.png"], description: "Specially formulated antiseptic cream for minor burns, scalds and sunburns. Soothes and prevents infection." },
  { name: "Band-Aid Flexible Fabric 20s", price: 110, category: "Pharmacy", stock: 120, images: ["/products/bandaid.png"], description: "Flexible fabric bandages that move with you. For cuts, scrapes and blisters. Latex-free and water resistant." },
  { name: "Dr. Morepen Digital Thermometer", price: 299, category: "Pharmacy", stock: 40, images: ["/products/thermometer.jpg"], description: "Accurate digital thermometer with 10-second reading, fever alert beep and memory for last temperature." },
  { name: "Omron BP Monitor HEM-7120", price: 1799, category: "Pharmacy", stock: 25, images: ["/products/omron_bp.jpg"], description: "Clinically validated automatic blood pressure monitor for home use with irregular heartbeat detection." },

  // Cold & Flu
  { name: "Vicks VapoRub 50g", price: 186, category: "Cold & Flu", stock: 100, images: ["/products/vicks_vaporub.png"], description: "Classic mentholated chest rub for temporary relief from blocked nose, cough and minor muscle aches." },
  { name: "Dabur Honitus Cough Syrup 100ml", price: 115, category: "Cold & Flu", stock: 70, images: ["/products/dabur_honitus.png"], description: "Herbal cough syrup with honey, tulsi and mulethi for soothing relief from dry and productive cough." },
  { name: "Zandu Balm 25ml", price: 76, category: "Cold & Flu", stock: 110, images: ["/products/zandu_balm.png"], description: "Multi-purpose Ayurvedic pain balm for headache relief, cold discomfort and minor muscle or joint pain." },
  { name: "Strepsils Orange Lozenges 16s", price: 98, category: "Cold & Flu", stock: 130, images: ["/products/strepsils.png"], description: "Medicated lozenges with antibacterial action for sore throat relief. Pleasant orange flavor for adults." },
  { name: "D-Cold Total 10 Tablets", price: 42, category: "Cold & Flu", stock: 95, images: ["/products/dcold.jpg"], description: "Combination tablet for relief from cold symptoms — fever, body pain, nasal congestion and runny nose." },
  { name: "Amrutanjan Pain Balm 30ml", price: 76, category: "Cold & Flu", stock: 85, images: ["/products/amrutanjan.jpg"], description: "Classic Indian pain balm for headaches, minor cold discomfort and muscle soreness. Trusted for over 100 years." },
  { name: "Nasivion 0.1% Nasal Drops", price: 121, category: "Cold & Flu", stock: 65, images: ["/products/nasivion.jpg"], description: "Oxymetazoline nasal drops for fast and long-lasting relief from blocked nose. Effective for up to 12 hours." },
  { name: "Otrivin Adult Nasal Drops 10ml", price: 104, category: "Cold & Flu", stock: 70, images: ["/products/otrivin.jpg"], description: "Xylometazoline 0.1% nasal drops for effective decongestant action. Relieves blocked nose from colds and allergies." },
  { name: "Disprin Regular 10 Tablets", price: 18, category: "Cold & Flu", stock: 140, images: ["/products/disprin.jpg"], description: "Aspirin effervescent tablets for quick relief from headache, mild pain, fever and cold discomfort." },
  { name: "Crocin Cold & Flu Max 15s", price: 95, category: "Cold & Flu", stock: 80, images: ["/products/crocin.jpg"], description: "Fast-acting paracetamol formula for comprehensive relief from cold, flu, high fever and body pain." },

  // Wellness
  { name: "Dabur Chyawanprash 1kg", price: 660, category: "Wellness", stock: 45, images: ["/products/dabur_chyawanprash.png"], description: "Classic Ayurvedic immunity booster with 41 natural herbs, amla and ashwagandha. Builds stamina and resistance." },
  { name: "Volini Pain Relief Spray 55g", price: 350, category: "Wellness", stock: 60, images: ["/products/volini_spray.png"], description: "Diclofenac-based topical spray for fast relief from joint pain, muscle strain, back pain and sports injuries." },
  { name: "Electral ORS Lemon (10 Sachets)", price: 88, category: "Wellness", stock: 120, images: ["/products/electral_ors.png"], description: "WHO-recommended oral rehydration salts for quick recovery from dehydration. Available in lemon flavor." },
  { name: "Himalaya Liv.52 DS 60 Tabs", price: 235, category: "Wellness", stock: 75, images: ["/products/himalaya_liv52.png"], description: "Liver protection supplement with Capers and Chicory. Supports healthy liver function and natural detoxification." },
  { name: "Moov Fast Relief Spray 50g", price: 152, category: "Wellness", stock: 90, images: ["/products/moov.webp"], description: "Methyl salicylate pain relief spray for fast action on back pain, knee pain, neck stiffness and sprains." },
  { name: "Revital H Capsules 30s", price: 420, category: "Wellness", stock: 50, images: ["/products/revital.jpg"], description: "Complete daily multivitamin with ginseng for sustained energy, vitality and overall health for active adults." },
  { name: "Centrum Women Multivitamin 30s", price: 575, category: "Wellness", stock: 40, images: ["/products/centrum.jpg"], description: "Science-backed multivitamin formula with 24 essential nutrients designed specifically for women's health needs." },
  { name: "Himalaya Ashwagandha 60 Tabs", price: 199, category: "Wellness", stock: 80, images: ["/products/ashwagandha.jpg"], description: "Pure Ashwagandha root extract tablets for stress relief, improved energy, focus and overall wellbeing." },
  { name: "Glucon-D Nimbu Pani 500g", price: 155, category: "Wellness", stock: 65, images: ["/products/glucond.jpg"], description: "Instant energy glucose powder with Vitamin C for quick refreshment and energy replenishment. Refreshing lemon flavor." },
  { name: "Protinex Original 400g", price: 649, category: "Wellness", stock: 35, images: ["/products/protinex.jpg"], description: "High-protein nutritional supplement with 8 essential amino acids for daily protein needs and muscle health." },

  // Baby Care
  { name: "Himalaya Baby Oil 200ml", price: 245, category: "Baby Care", stock: 55, images: ["/products/himalaya_baby_oil.png"], description: "Gentle baby massage oil with olive oil and country mallow for nourishing and strengthening baby's delicate skin." },
  { name: "Mamaearth Baby Lotion 400ml", price: 399, category: "Baby Care", stock: 40, images: ["/products/mamaearth_lotion.png"], description: "Toxin-free daily moisturizing lotion with shea butter and oat extract. Dermatologically tested, safe for babies." },
  { name: "Johnson's Baby Powder 200g", price: 250, category: "Baby Care", stock: 60, images: ["/products/johnsons_powder.jpg"], description: "Classic baby powder to keep baby comfortable, fresh and dry. Mild formula gentle on sensitive baby skin." },
  { name: "Himalaya Baby Shampoo 400ml", price: 295, category: "Baby Care", stock: 50, images: ["/products/himalaya_baby_shampoo.jpg"], description: "No-tears, tear-free gentle shampoo with chickpea and licorice for baby's delicate hair and scalp." },
  { name: "Johnson's Baby Soap 100g", price: 72, category: "Baby Care", stock: 95, images: ["/products/johnsons_soap.png"], description: "Mild pH-balanced soap with 1/4 moisturizing lotion. Gentle enough for newborn skin from day one." },
  { name: "Pampers Baby Wipes with Aloe 72s", price: 320, category: "Baby Care", stock: 70, images: ["/products/pampers_wipes.jpg"], description: "Aloe vera-enriched wipes for gentle and thorough cleaning at every diaper change. 99% pure water formula." },
  { name: "MamyPoko Pants Medium 54pcs", price: 849, category: "Baby Care", stock: 30, images: ["/products/mamypoko.jpg"], description: "Extra absorbent diaper pants for babies 7–12 kg. Up to 12 hours of leak protection with elastic waistband." },
  { name: "Cetaphil Baby Daily Lotion 400ml", price: 699, category: "Baby Care", stock: 25, images: ["/products/cetaphil_baby.jpg"], description: "Dermatologist recommended daily moisturizing lotion for baby's sensitive skin. Fragrance-free and hypoallergenic." },
  { name: "Dabur Lal Tail Baby Oil 100ml", price: 135, category: "Baby Care", stock: 60, images: ["/products/dabur_lal_tail.jpg"], description: "Traditional Ayurvedic massage oil with 11 herbs to strengthen baby's bones and muscles. Trusted for generations." },
  { name: "WOW Kids 3-in-1 Baby Wash 300ml", price: 329, category: "Baby Care", stock: 45, images: ["/products/wow_baby_wash.jpg"], description: "Gentle 3-in-1 baby wash, shampoo and conditioner in one bottle. Sulfate-free, paraben-free and tear-free." },

  // Personal Care
  { name: "Dettol Original Liquid 500ml", price: 267, category: "Personal Care", stock: 85, images: ["/products/dettol_liquid.png"], description: "Original antiseptic liquid for personal hygiene, wound cleaning, bathing and effective surface disinfection." },
  { name: "Savlon Antiseptic Liquid 200ml", price: 148, category: "Personal Care", stock: 75, images: ["/products/savlon.png"], description: "Chlorhexidine-based antiseptic for first aid wound care, hygiene rinse and general household antiseptic use." },
  { name: "Odomos Mosquito Repellent Cream 50g", price: 99, category: "Personal Care", stock: 90, images: ["/products/odomos_cream.png"], description: "DEET-based mosquito repellent cream effective against mosquitoes and insects for up to 8 hours of protection." },
  { name: "Lifebuoy Immunity Hand Sanitizer", price: 199, category: "Personal Care", stock: 110, images: ["/products/lifebuoy_sanitizer.png"], description: "70% alcohol hand sanitizer for effective on-the-go protection against germs and harmful bacteria." },
  { name: "Dove Deep Nourishment Body Lotion", price: 379, category: "Personal Care", stock: 50, images: ["/products/dove_lotion.jpg"], description: "24-hour moisturizing body lotion with deep nourishment serum. Visibly heals dry skin in just 1 week." },
  { name: "Nivea Men All-in-1 Charcoal Face Wash", price: 249, category: "Personal Care", stock: 45, images: ["/products/nivea_facewash.jpg"], description: "Charcoal deep cleansing face wash for men. Removes dirt, excess oil and unclogs pores for clear skin." },
  { name: "Lacto Calamine Oil Control Lotion", price: 185, category: "Personal Care", stock: 55, images: ["/products/lacto_calamine.jpg"], description: "Kaolin clay-based oil control lotion for balanced, matte skin. Reduces shine and helps minimize open pores." },
  { name: "Vaseline Lip Therapy Rosy 100g", price: 125, category: "Personal Care", stock: 80, images: ["/products/vaseline.jpg"], description: "Rosy tinted lip balm with micro-droplets of rose oil for soft, moisturized and naturally pink lips all day." },
  { name: "Whisper Ultra Clean XL+ 44 Pads", price: 165, category: "Personal Care", stock: 70, images: ["/products/whisper.jpg"], description: "Premium sanitary pads with zig-zag cover for maximum leak-guard protection. Extra long for overnight security." },
  { name: "Pears Soft & Fresh Soap 75g", price: 58, category: "Personal Care", stock: 100, images: ["/products/pears.jpg"], description: "Transparent glycerine soap with natural lemon flower extracts. 98% pure glycerine for soft, glowing skin." }
];

const categories = [
  { name: "Pharmacy", slug: "pharmacy", description: "Prescription drugs, fever, pain, antacids, and diagnostic tools" },
  { name: "Cold & Flu", slug: "cold-flu", description: "Balms, cough syrups, lozenges, inhalers, and decongestants" },
  { name: "Wellness", slug: "wellness", description: "Multivitamins, pain sprays, protein, and Ayurvedic supplements" },
  { name: "Baby Care", slug: "baby-care", description: "Gentle baby oils, diapers, lotions, wipes, and shampoos" },
  { name: "Personal Care", slug: "personal-care", description: "Antiseptics, sanitizers, body lotions, face washes, and soaps" }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to Atlas successfully!');

    // 1. Seed Categories
    for (const cat of categories) {
      await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }
    console.log(`Seeded ${categories.length} categories.`);

    // 2. Seed Products
    let created = 0;
    for (const prod of products) {
      await Product.findOneAndUpdate({ name: prod.name }, prod, { upsert: true, new: true });
      created++;
    }
    console.log(`Seeded ${created} products in MongoDB Atlas.`);

    // 3. Ensure Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vijaymedical.com';
    const adminPass = process.env.ADMIN_INITIAL_PASSWORD;
    if (!adminPass) {
      console.log('Skipping Admin creation: ADMIN_INITIAL_PASSWORD not set in environment.');
    } else {
      const existingAdmin = await Admin.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPass, salt);
        await Admin.create({
          name: 'Vijay Medical Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        console.log('Created Admin account in Atlas.');
      } else {
        console.log('Admin account already exists in Atlas.');
      }
    }

    console.log('Atlas Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
