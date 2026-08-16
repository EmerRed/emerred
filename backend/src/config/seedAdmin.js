const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';
    const adminName = 'Administrador';
    const adminRole = 'admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      return;
    }

    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(adminPassword, bcryptRounds);

    await User.create({
      email: adminEmail,
      passwordHash,
      name: adminName,
      role: adminRole
    });

    console.log('✅ Usuario admin creado exitosamente');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${adminRole}`);
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
  }
};

module.exports = seedAdmin;