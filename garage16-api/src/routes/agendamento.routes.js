const express = require('express');
const Agendamento = require('../models/agendamento.model');
const { auth, isAdmin } = require('../middleware/auth.middleware');
const router = express.Router();

// Listar agendamentos (admin vê todos, usuário vê apenas os seus)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { cliente: req.user._id };
    const agendamentos = await Agendamento.find(query)
      .populate('moto', 'titulo imagens preco')
      .populate('cliente', 'name email')
      .sort('-createdAt');
    
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar novo agendamento
router.post('/', auth, async (req, res) => {
  try {
    const agendamento = new Agendamento({
      ...req.body,
      cliente: req.user._id
    });
    
    await agendamento.save();
    
    const populatedAgendamento = await Agendamento.findById(agendamento._id)
      .populate('moto', 'titulo imagens preco')
      .populate('cliente', 'name email');
    
    res.status(201).json(populatedAgendamento);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Atualizar status do agendamento (apenas admin)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('moto', 'titulo imagens preco')
    .populate('cliente', 'name email');

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    res.json(agendamento);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancelar agendamento (usuário pode cancelar próprio agendamento)
router.patch('/:id/cancelar', auth, async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    // Verifica se o usuário é o dono do agendamento ou admin
    if (agendamento.cliente.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado.' });
    }

    agendamento.status = 'cancelado';
    await agendamento.save();

    res.json(agendamento);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 