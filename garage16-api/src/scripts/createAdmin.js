const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@garage16.com',
      password: 'senha_segura', // será hasheada automaticamente
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(); 