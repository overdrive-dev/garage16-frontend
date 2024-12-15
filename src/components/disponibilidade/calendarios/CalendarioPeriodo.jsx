import { format, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';
import { useEffect, useState, useCallback, useMemo } from 'react';
import ResetPeriodoModal from './ResetPeriodoModal';

// Função auxiliar para normalizar a data
function normalizeDate(date) {
  if (!date) return null;
  
  try {
    // Se for string, tenta converter para Date
    if (typeof date === 'string') {
      return startOfDay(parseISO(date));
    }
    // Se já for Date, apenas normaliza
    if (date instanceof Date) {
      return startOfDay(date);
    }
    console.warn('⚠️ [CalendarioPeriodo] Data inválida:', date);
    return null;
  } catch (error) {
    console.error('❌ [CalendarioPeriodo] Erro ao normalizar data:', error);
    return null;
  }
}

export default function CalendarioPeriodo({ 
  selected = { inicio: null, fim: null },
  onChange,
  minDate = new Date()
}) {
  // Estado para controlar se o período está travado
  const [isPeriodoTravado, setIsPeriodoTravado] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [shouldClearHorarios, setShouldClearHorarios] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);

  // Memoiza as datas normalizadas para evitar cálculos desnecessários
  const normalizedDates = useMemo(() => {
    console.log('📅 [CalendarioPeriodo] Normalizando datas:', {
      selected,
      inicio: selected.inicio ? format(normalizeDate(selected.inicio), 'dd/MM/yyyy') : null,
      fim: selected.fim ? format(normalizeDate(selected.fim), 'dd/MM/yyyy') : null
    });

    return {
      inicio: normalizeDate(selected.inicio),
      fim: normalizeDate(selected.fim)
    };
  }, [selected.inicio, selected.fim]);

  // Efeito para sincronizar o estado travado com as datas selecionadas
  useEffect(() => {
    const hasValidDates = normalizedDates.inicio && normalizedDates.fim;
    
    console.log('🔍 [CalendarioPeriodo] Verificando datas:', {
      hasValidDates,
      inicio: normalizedDates.inicio ? format(normalizedDates.inicio, 'dd/MM/yyyy') : null,
      fim: normalizedDates.fim ? format(normalizedDates.fim, 'dd/MM/yyyy') : null,
      isPeriodoTravado
    });

    if (hasValidDates) {
      setSelectedRange({
        from: normalizedDates.inicio,
        to: normalizedDates.fim
      });
    }
  }, [normalizedDates.inicio, normalizedDates.fim]);

  // Memoiza a função handleDateSelect para evitar re-renderizações desnecessárias
  const handleDateSelect = useCallback((range) => {
    console.log('👆 [CalendarioPeriodo] handleDateSelect:', range ? {
      from: range.from ? format(range.from, 'dd/MM/yyyy') : null,
      to: range.to ? format(range.to, 'dd/MM/yyyy') : null
    } : null);

    // Se não houver range, limpa a seleção
    if (!range) {
      console.log('🗑️ [CalendarioPeriodo] Limpando seleção');
      setSelectedRange(null);
      onChange({ inicio: null, fim: null });
      return;
    }

    // Atualiza o range selecionado
    setSelectedRange(range);

    // Se for um clique único (from === to), considera como data inicial
    if (range.from && (!range.to || range.from.getTime() === range.to.getTime())) {
      console.log('👆 [CalendarioPeriodo] Seleção única:', format(range.from, 'dd/MM/yyyy'));
      const normalizedDate = normalizeDate(range.from);
      const dateStr = format(normalizedDate, 'yyyy-MM-dd');
      
      onChange({
        inicio: dateStr,
        fim: null
      });
      return;
    }

    // Se tiver início e fim, normaliza e atualiza
    if (range.from && range.to) {
      let dataInicio = range.from;
      let dataFim = range.to;

      // Troca as datas se necessário
      if (dataFim < dataInicio) {
        console.log('🔄 [CalendarioPeriodo] Trocando datas');
        [dataInicio, dataFim] = [dataFim, dataInicio];
      }

      const normalizedRange = {
        inicio: format(normalizeDate(dataInicio), 'yyyy-MM-dd'),
        fim: format(normalizeDate(dataFim), 'yyyy-MM-dd')
      };

      console.log('📅 [CalendarioPeriodo] Range completo:', normalizedRange);
      onChange(normalizedRange);
    }
  }, [onChange]);

  // Memoiza a função handleReset
  const handleReset = useCallback(() => {
    console.log('🔄 [CalendarioPeriodo] Iniciando processo de reset');
    setShowResetModal(true);
  }, []);

  // Memoiza a função confirmReset
  const confirmReset = useCallback(() => {
    console.log('✅ [CalendarioPeriodo] Confirmando reset:', {
      limparHorarios: shouldClearHorarios
    });
    
    setSelectedRange(null);
    setShowResetModal(false);
    
    if (shouldClearHorarios) {
      onChange({ inicio: null, fim: null });
    }
    
    setShouldClearHorarios(false);
  }, [shouldClearHorarios, onChange]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-gray-200 font-medium">Selecione o período</h2>
          {selectedRange?.from && selectedRange?.to && (
            <span className="text-sm text-gray-400">
              {format(selectedRange.from, 'dd/MM/yyyy')} até {format(selectedRange.to, 'dd/MM/yyyy')}
            </span>
          )}
        </div>
        {selectedRange?.from && selectedRange?.to && (
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1 text-sm"
          >
            <LockOpenIcon className="w-4 h-4" />
            Resetar período
          </button>
        )}
      </div>

      <Calendar
        mode="range"
        selected={selectedRange}
        onChange={handleDateSelect}
        minDate={startOfDay(minDate)}
        classNames={{
          day_selected: "bg-orange-500 text-white hover:bg-orange-600 font-semibold",
          day_today: "bg-gray-700 text-white",
          day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
          day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
          day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold",
          day_disabled: "text-gray-500 cursor-not-allowed opacity-50"
        }}
        locale={ptBR}
      />

      <ResetPeriodoModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        shouldClearHorarios={shouldClearHorarios}
        onClearHorariosChange={setShouldClearHorarios}
      />
    </div>
  );
} 