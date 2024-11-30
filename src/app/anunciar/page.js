'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoPersonalizada from '@/components/disponibilidade/ConfiguracaoPersonalizada';

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
  const [selectedRange, setSelectedRange] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [previewImages] = useState([
    'https://via.placeholder.com/800x600/1f2937/ffffff?text=Foto+1',
    'https://via.placeholder.com/800x600/1f2937/ffffff?text=Foto+2',
    'https://via.placeholder.com/800x600/1f2937/ffffff?text=Foto+3',
    'https://via.placeholder.com/800x600/1f2937/ffffff?text=Foto+4'
  ]);

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira'
  ];

  const horariosDisponiveis = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

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

  const handleDateRangeSelect = (range) => {
    setSelectedRange(range);
    // Resetar horários quando mudar a seleção de datas
    setTimeSlots([]);
  };

  const handleTimeSlotSelect = (horario) => {
    setTimeSlots(prev => {
      if (prev.includes(horario)) {
        return prev.filter(h => h !== horario);
      }
      return [...prev, horario].sort();
    });
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
    const [tipoRepeticao, setTipoRepeticao] = useState('semanal'); // 'unica', 'semanal', 'personalizada'
    const [numeroSemanas, setNumeroSemanas] = useState(1);
    const [dataUnica, setDataUnica] = useState(null);
    
    const [disponibilidade, setDisponibilidade] = useState({
      tipo: 'semanal',
      dataUnica: {},
      semanal: {
        dom: { ativo: false, horarios: [] },
        seg: { ativo: true, horarios: ['09:00'] },
        ter: { ativo: true, horarios: ['09:00'] },
        qua: { ativo: true, horarios: ['09:00'] },
        qui: { ativo: true, horarios: ['09:00'] },
        sex: { ativo: true, horarios: ['09:00'] },
        sab: { ativo: false, horarios: [] }
      },
      personalizada: {
        numeroSemanas: 1,
        horarios: {
          dom: { ativo: false, horarios: [] },
          seg: { ativo: false, horarios: [] },
          ter: { ativo: false, horarios: [] },
          qua: { ativo: false, horarios: [] },
          qui: { ativo: false, horarios: [] },
          sex: { ativo: false, horarios: [] },
          sab: { ativo: false, horarios: [] }
        }
      }
    });

    return (
      <div className="space-y-6">
        {/* Bloco de Disponibilidade Geral */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="space-y-6">
            {/* Seleção do tipo de disponibilidade */}
            <div>
              <h3 className="text-lg font-medium text-gray-100 mb-4">
                Disponibilidade geral
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setDisponibilidade(prev => ({ ...prev, tipo: 'unica' }))}
                  className={`p-4 rounded-lg border-2 transition-colors
                    ${disponibilidade.tipo === 'unica' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-gray-700 hover:border-gray-600'}`}
                >
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="block font-medium text-gray-200">Data Única</span>
                    <span className="text-sm text-gray-400">Sem repetição</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDisponibilidade(prev => ({ ...prev, tipo: 'semanal' }))}
                  className={`p-4 rounded-lg border-2 transition-colors
                    ${disponibilidade.tipo === 'semanal' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-gray-700 hover:border-gray-600'}`}
                >
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="block font-medium text-gray-200">Semanal</span>
                    <span className="text-sm text-gray-400">Repete toda semana</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDisponibilidade(prev => ({ ...prev, tipo: 'personalizada' }))}
                  className={`p-4 rounded-lg border-2 transition-colors
                    ${disponibilidade.tipo === 'personalizada' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-gray-700 hover:border-gray-600'}`}
                >
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="block font-medium text-gray-200">Personalizada</span>
                    <span className="text-sm text-gray-400">Configure o período</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Conteúdo baseado no tipo selecionado */}
            <div className="mt-6">
              {disponibilidade.tipo === 'unica' && (
                <DataUnicaConfig 
                  datas={disponibilidade.dataUnica}
                  onChange={(updates) => {
                    setDisponibilidade(prev => ({
                      ...prev,
                      dataUnica: updates
                    }));
                  }}
                />
              )}

              {disponibilidade.tipo === 'semanal' && (
                <ConfiguracaoSemanal 
                  horarios={disponibilidade.semanal}
                  onChange={(updates) => {
                    setDisponibilidade(prev => ({
                      ...prev,
                      semanal: updates
                    }));
                  }}
                />
              )}

              {disponibilidade.tipo === 'personalizada' && (
                <ConfiguracaoPersonalizada 
                  config={disponibilidade.personalizada}
                  onChange={(updates) => {
                    setDisponibilidade(prev => ({
                      ...prev,
                      personalizada: updates
                    }));
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ... resto do código ... */}
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
          {/* Seção de Imagens */}
          <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">
              Fotos do Veículo
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative aspect-[4/3] group">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              <label className="relative aspect-[4/3] border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-500 transition-colors cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagemChange}
                  className="hidden"
                />
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-400">
                    Adicionar foto
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Disponibilidade com calendário */}
          <DisponibilidadeSection />

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Publicar Anúncio
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 