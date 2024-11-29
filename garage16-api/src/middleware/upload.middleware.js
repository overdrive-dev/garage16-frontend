const { upload } = require('../config/cloudinary');

const uploadImages = upload.array('imagens', 10); // Máximo de 10 imagens por vez

const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Erro no upload de imagens', error: err.message });
    }
    
    if (req.files) {
      req.body.imagens = req.files.map(file => file.path);
    }
    
    next();
  });
};

module.exports = { handleUpload }; 