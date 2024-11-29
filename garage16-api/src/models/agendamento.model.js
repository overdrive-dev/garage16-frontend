const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  moto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moto',
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['aguardando', 'confirmado', 'em_andamento', 'realizado', 'cancelado'],
    default: 'aguardando'
  },
  observacoes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualiza o updatedAt antes de salvar
agendamentoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

module.exports = Agendamento; 