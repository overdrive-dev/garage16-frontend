const express = require('express');
const { auth, isAdmin } = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');
const router = express.Router();

// Rota de teste para upload
router.post('/test', auth, handleUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
    }

    const urls = req.files.map(file => file.path);
    res.json({ 
      message: 'Upload realizado com sucesso!',
      urls 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 