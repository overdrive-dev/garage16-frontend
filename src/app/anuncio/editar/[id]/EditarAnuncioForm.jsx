'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function EditarAnuncioForm({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!id) return;

    const fetchAnuncio = async () => {
      try {
        // Simular carregamento dos dados do anúncio
        // Aqui você faria uma chamada real à API
        setTimeout(() => {
          setFormData({
            marca: 'Honda',
            modelo: 'Civic',
            ano: 2020,
            preco: 98000,
            imagens: ['/images/civic.jpg'],
            disponibilidade: {
              diasSelecionados: [],
              janelas: {
                'Segunda-feira': [],
                'Terça-feira': [],
                'Quarta-feira': ['09:00'],
                'Quinta-feira': ['10:00'],
                'Sexta-feira': []
              }
            }
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar anúncio:', error);
        setLoading(false);
      }
    };

    fetchAnuncio();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implementar lógica de atualização
      console.log('Atualizando anúncio:', formData);
      router.push('/meus-anuncios');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const DisponibilidadeSection = () => (
    <div className="form-section">
      <h3 className="text-lg font-medium leading-6 text-gray-100 mb-6">
        Disponibilidade para Visitas
      </h3>

      <div className="space-y-6">
        <div>
          <label className="form-label">Selecione os dias disponíveis</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {diasSemana.map((dia) => (
              <label
                key={dia}
                className={`checkbox-container ${
                  formData.disponibilidade.diasSelecionados.includes(dia)
                    ? 'ring-2 ring-orange-500 bg-gray-700/70'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-gray-300">{dia}</span>
                  <input
                    type="checkbox"
                    checked={formData.disponibilidade.diasSelecionados.includes(dia)}
                    onChange={() => handleDiaSemanaChange(dia)}
                    className="form-checkbox"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

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

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              Editar Anúncio
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações básicas */}
          <div className="form-section">
            <h3 className="text-lg font-medium leading-6 text-gray-100">
              Informações do Veículo
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label" htmlFor="marca">Marca</label>
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modelo">Modelo</label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ano">Ano</label>
                <input
                  type="number"
                  id="ano"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="preco">Preço</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-400 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div className="form-section">
            <h3 className="text-lg font-medium leading-6 text-gray-100 mb-6">
              Fotos do Veículo
            </h3>

            <div className="space-y-6">
              <div className="image-grid">
                {formData.imagens.map((img, index) => (
                  <div key={index} className="image-item">
                    <Image
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          imagens: prev.imagens.filter((_, i) => i !== index)
                        }));
                      }}
                      className="image-delete-btn"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="form-label">Adicionar Novas Fotos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="form-file"
                />
              </div>
            </div>
          </div>

          {/* Disponibilidade */}
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 