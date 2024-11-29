require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configuração direta do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinaryUpload() {
  try {
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg';
    
    console.log('Iniciando teste de upload no Cloudinary...');
    
    const result = await cloudinary.uploader.upload(testImageUrl, {
      folder: 'testes',
    });
    
    console.log('Upload realizado com sucesso!');
    console.log('URL da imagem:', result.secure_url);
    console.log('Detalhes completos:', result);
    
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
  }
}

testCloudinaryUpload(); 