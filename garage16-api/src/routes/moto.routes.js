const express = require('express');
const Moto = require('../models/moto.model');
const { auth, isAdmin } = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');
const { cloudinary } = require('../config/cloudinary');
const router = express.Router();

// Listar todas as motos
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find()
      .populate('autorizadoPor', 'name')
      .sort('-createdAt');
    res.json(motos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buscar moto por ID
router.get('/:id', async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id)
      .populate('autorizadoPor', 'name');
    
    if (!moto) {
      return res.status(404).json({ message: 'Moto não encontrada.' });
    }
    
    res.json(moto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar nova moto com imagens
router.post('/', auth, isAdmin, handleUpload, async (req, res) => {
  try {
    const moto = new Moto({
      ...req.body,
      autorizadoPor: req.user._id
    });
    
    await moto.save();
    res.status(201).json(moto);
  } catch (error) {
    // Se houver erro, deletar as imagens enviadas
    if (req.body.imagens) {
      for (const imagem of req.body.imagens) {
        const publicId = imagem.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`garage16/motos/${publicId}`);
      }
    }
    res.status(400).json({ message: error.message });
  }
});

// Atualizar moto com imagens
router.put('/:id', auth, isAdmin, handleUpload, async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ message: 'Moto não encontrada.' });
    }

    // Se houver novas imagens, deletar as antigas
    if (req.body.imagens && req.body.imagens.length > 0) {
      for (const imagem of moto.imagens) {
        const publicId = imagem.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`garage16/motos/${publicId}`);
      }
    }

    const motoAtualizada = await Moto.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        imagens: req.body.imagens || moto.imagens,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(motoAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar moto e suas imagens
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ message: 'Moto não encontrada.' });
    }

    // Deletar imagens do Cloudinary
    for (const imagem of moto.imagens) {
      const publicId = imagem.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`garage16/motos/${publicId}`);
    }

    await moto.deleteOne();
    res.json({ message: 'Moto removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar motos pendentes (admin)
router.get('/pendentes', auth, isAdmin, async (req, res) => {
  try {
    const motos = await Moto.find({ status: 'pendente' })
      .populate('vendedor', 'name email')
      .sort('-createdAt');
    res.json(motos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Aprovar moto
router.patch('/:id/aprovar', auth, isAdmin, async (req, res) => {
  try {
    const moto = await Moto.findByIdAndUpdate(
      req.params.id,
      {
        status: 'disponivel',
        autorizadoPor: req.user._id,
        dataAutorizacao: new Date()
      },
      { new: true }
    );

    if (!moto) {
      return res.status(404).json({ message: 'Moto não encontrada.' });
    }

    res.json(moto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rejeitar moto
router.patch('/:id/rejeitar', auth, isAdmin, async (req, res) => {
  try {
    const { motivo } = req.body;
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo da rejeição é obrigatório.' });
    }

    const moto = await Moto.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejeitado',
        statusMotivo: motivo,
        autorizadoPor: req.user._id,
        dataAutorizacao: new Date()
      },
      { new: true }
    );

    if (!moto) {
      return res.status(404).json({ message: 'Moto não encontrada.' });
    }

    res.json(moto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 