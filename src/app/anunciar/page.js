'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';

export default function AnunciarVeiculo() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    preco: '',
    imagens: [],
    disponibilidade: {
      diasSelecionados: [],
      janelas: {
        'Segunda-feira': [],
        'Terça-feira': [],
        'Quarta-feira': [],
        'Quinta-feira': [],
        'Sexta-feira': []
      }
    }
  });

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira'
  ];

  const horariosDisponiveis = Array.from({ length: 9 }, (_, i) => {
    const hora = i + 9; // 9h até 17h
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagemChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      imagens: [...prev.imagens, ...files]
    }));
  };

  const handleDiaSemanaChange = (dia) => {
    setFormData(prev => ({
      ...prev,
      disponibilidade: {
        ...prev.disponibilidade,
        diasSelecionados: prev.disponibilidade.diasSelecionados.includes(dia)
          ? prev.disponibilidade.diasSelecionados.filter(d => d !== dia)
          : [...prev.disponibilidade.diasSelecionados, dia],
        janelas: {
          ...prev.disponibilidade.janelas,
          [dia]: prev.disponibilidade.diasSelecionados.includes(dia) ? [] : prev.disponibilidade.janelas[dia]
        }
      }
    }));
  };

  const handleHorarioChange = (dia, horario) => {
    setFormData(prev => ({
      ...prev,
      disponibilidade: {
        ...prev.disponibilidade,
        janelas: {
          ...prev.disponibilidade.janelas,
          [dia]: prev.disponibilidade.janelas[dia].includes(horario)
            ? prev.disponibilidade.janelas[dia].filter(h => h !== horario)
            : [...prev.disponibilidade.janelas[dia], horario].sort()
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implementar lógica de criação
      console.log('Criando anúncio:', formData);
      router.push('/meus-anuncios');
    } catch (error) {
      console.error('Erro ao criar:', error);
    }
  };

  // Componente para a seção de disponibilidade com calendário
  const DisponibilidadeSection = () => {
    const getDiaSemana = (date) => {
      const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      return dias[date.getDay()];
    };

    const tileDisabled = ({ date }) => {
      const diaSemana = getDiaSemana(date);
      return !diasSemana.includes(diaSemana);
    };

    const tileClassName = ({ date }) => {
      const diaSemana = getDiaSemana(date);
      return formData.disponibilidade.diasSelecionados.includes(diaSemana)
        ? 'bg-orange-500 text-white hover:bg-orange-600'
        : '';
    };

    return (
      <div className="form-section">
        <h3 className="text-lg font-medium leading-6 text-gray-100 mb-6">
          Disponibilidade para Visitas
        </h3>

        <div className="space-y-8">
          {/* Calendário para seleção de dias */}
          <div>
            <label className="form-label">Selecione os dias disponíveis no calendário</label>
            <div className="calendar-container">
              <Calendar
                onChange={(value) => {
                  const diaSemana = getDiaSemana(value);
                  handleDiaSemanaChange(diaSemana);
                }}
                tileDisabled={tileDisabled}
                tileClassName={tileClassName}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 dias à frente
                className="dark-calendar"
              />
            </div>
          </div>

          {/* Horários para os dias selecionados */}
          {formData.disponibilidade.diasSelecionados.map((dia) => (
            <div key={dia} className="dia-section">
              <div className="dia-header">
                <h4 className="dia-titulo">{dia}</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      disponibilidade: {
                        ...prev.disponibilidade,
                        janelas: {
                          ...prev.disponibilidade.janelas,
                          [dia]: []
                        }
                      }
                    }));
                  }}
                  className="limpar-horarios"
                >
                  Limpar horários
                </button>
              </div>

              <div className="horarios-grid">
                {horariosDisponiveis.map((horario) => (
                  <label
                    key={`${dia}-${horario}`}
                    className={`horario-item ${
                      formData.disponibilidade.janelas[dia].includes(horario)
                        ? 'selected'
                        : ''
                    }`}
                  >
                    <span className="horario-texto">{horario}</span>
                    <input
                      type="checkbox"
                      checked={formData.disponibilidade.janelas[dia].includes(horario)}
                      onChange={() => handleHorarioChange(dia, horario)}
                      className="form-checkbox"
                    />
                  </label>
                ))}
              </div>

              {formData.disponibilidade.janelas[dia].length > 0 && (
                <div className="horarios-selecionados">
                  Selecionados: {formData.disponibilidade.janelas[dia].join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              Anunciar Veículo
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ... resto do formulário igual ao EditarAnuncioForm ... */}
          
          {/* Disponibilidade com calendário */}
          <DisponibilidadeSection />

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Publicar Anúncio
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 