const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

const newPassword = process.argv[2];
const newEmail = process.argv[3]; // optional

if (!newPassword || newPassword.length < 6) {
  console.error('\n❌ Error: Please provide a new password with at least 6 characters.');
  console.log('\nUsage:');
  console.log('  node changeAdminPassword.js "YOUR_NEW_STRONG_PASSWORD" [optional_new_email]');
  console.log('\nExample:');
  console.log('  node changeAdminPassword.js "MySecretPass@2026!" "myemail@gmail.com"\n');
  process.exit(1);
}

async function updatePassword() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in server/.env');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to Atlas.');

    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ No Admin account found in the database.');
      process.exit(1);
    }

    admin.password = newPassword;
    if (newEmail) {
      admin.email = newEmail.toLowerCase().trim();
    }
    await admin.save();

    console.log('\n🎉 SUCCESS! Admin credentials updated in production MongoDB Atlas:');
    console.log(`   Admin Email: ${admin.email}`);
    console.log(`   Admin Name:  ${admin.name}`);
    console.log('   Password:    [UPDATED AND HASHED WITH BCRYPT]\n');
    console.log('👉 You can now log in at: https://vijay-medical.vercel.app/#admin\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin credentials:', err);
    process.exit(1);
  }
}

updatePassword();
