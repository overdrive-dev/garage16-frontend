require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');
    
    // Listar as coleções existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection(); 