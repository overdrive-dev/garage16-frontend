const mongoose = require('mongoose');

const motoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  ano: {
    type: String,
    required: true
  },
  km: {
    type: String,
    required: true
  },
  cor: {
    type: String,
    required: true
  },
  preco: {
    type: String,
    required: true
  },
  dataAutorizacao: {
    type: Date,
    default: Date.now
  },
  autorizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  descricao: {
    type: String,
    required: true
  },
  fichaTecnica: {
    marca: String,
    modelo: String,
    cilindrada: String,
    potencia: String,
    combustivel: String
  },
  imagens: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pendente', 'aprovado', 'rejeitado', 'disponivel', 'vendida', 'reservada'],
    default: 'pendente'
  },
  statusMotivo: {
    type: String,
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Moto = mongoose.model('Moto', motoSchema);

module.exports = Moto; 