'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getMotoById } from '@/data/motos';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import 'react-day-picker/dist/style.css';
import ConfirmacaoAgendamentoModal from '@/components/ConfirmacaoAgendamentoModal';

const HORARIOS_DISPONIVEIS = [
  { id: '09:00', label: '09:00', periodo: 'Manhã' },
  { id: '10:00', label: '10:00', periodo: 'Manhã' },
  { id: '11:00', label: '11:00', periodo: 'Manhã' },
  { id: '14:00', label: '14:00', periodo: 'Tarde' },
  { id: '15:00', label: '15:00', periodo: 'Tarde' },
  { id: '16:00', label: '16:00', periodo: 'Tarde' },
];

export default function AgendarVisita() {
  const params = useParams();
  const [moto, setMoto] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [horario, setHorario] = useState('');
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  useEffect(() => {
    const fetchMoto = async () => {
      const data = await getMotoById(params.id);
      setMoto(data);
    };
    fetchMoto();
  }, [params.id]);

  if (!moto) return null;

  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #FD4308;
      --rdp-background-color: #FD4308;
      margin: 0;
    }
    .rdp-day_selected:not([disabled]) { 
      background-color: #FD4308;
    }
    .rdp-day_selected:hover:not([disabled]) { 
      background-color: #e63d07;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: rgba(253, 67, 8, 0.2);
    }
  `;

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmacao(true);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <style>{css}</style>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Agendar Visita</h2>
            <Link
              href={`/veiculo/${moto.id}`}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Link>
          </div>

          {/* Resumo do veículo */}
          <div className="bg-gray-900 rounded p-4 mb-6">
            <div className="flex gap-4">
              <div className="relative w-24 h-24">
                <Image
                  src={moto.imagens[0]}
                  alt={moto.titulo}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{moto.titulo}</h3>
                <p className="text-[#FD4308] font-bold">{moto.preco}</p>
              </div>
            </div>
          </div>

          {/* Formulário de agendamento */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 font-semibold">Selecione a data da visita</label>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  fromDate={new Date()}
                  modifiers={{
                    disabled: [
                      { dayOfWeek: [0] }, // Desabilita domingos
                    ],
                  }}
                  modifiersStyles={{
                    disabled: { fontSize: '75%', color: '#666' },
                  }}
                  styles={{
                    caption: { color: 'white' },
                    head_cell: { color: 'white' },
                    day: { color: 'white' },
                  }}
                />
              </div>
              <input
                type="text"
                className="w-full bg-gray-900 rounded p-2 text-white"
                value={selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : ''}
                readOnly
                placeholder="Data selecionada aparecerá aqui"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Horários Disponíveis</label>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="space-y-4">
                  {['Manhã', 'Tarde'].map((periodo) => (
                    <div key={periodo}>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">{periodo}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {HORARIOS_DISPONIVEIS
                          .filter(h => h.periodo === periodo)
                          .map((h) => (
                            <label
                              key={h.id}
                              className={`
                                flex items-center justify-center p-3 rounded-lg border
                                ${horario === h.id
                                  ? 'border-[#FD4308] bg-[#FD4308]/10 text-white'
                                  : 'border-gray-700 hover:border-gray-600 text-gray-300'
                                }
                                cursor-pointer transition-colors
                              `}
                            >
                              <input
                                type="radio"
                                name="horario"
                                value={h.id}
                                checked={horario === h.id}
                                onChange={(e) => setHorario(e.target.value)}
                                className="hidden"
                              />
                              {h.label}
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Informações da loja */}
            <div className="bg-gray-900 rounded p-4">
              <h4 className="font-semibold mb-2">Localização da loja</h4>
              <p className="text-gray-400">
                Rua das Motos, 123
                <br />
                São Paulo - SP
                <br />
                Tel: (11) 99999-9999
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-3 px-6 rounded transition-colors"
              disabled={!selectedDate || !horario}
            >
              Confirmar Agendamento
            </button>
          </form>
        </div>
      </div>

      <ConfirmacaoAgendamentoModal
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        agendamento={{
          moto,
          data: selectedDate,
          horario,
        }}
      />
    </>
  );
} 