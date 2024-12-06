import { Dialog, Tab } from '@headlessui/react';
import Calendar from '@/components/Calendar';
import { format } from 'date-fns';

export default function DatePickerModal({ isOpen, onClose, onSelect, selectedStartDate, selectedEndDate, title }) {
  const handleDateClick = (date, type) => {
    onSelect(format(date, 'yyyy-MM-dd'), type);
  };

  const getDisabledDates = (isEndDate) => {
    const disabledDates = [];
    
    // Datas passadas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= 365; i++) {
      const date = new Date(hoje);
      date.setDate(date.getDate() - i);
      disabledDates.push(date);
    }

    // Se estiver selecionando a data final e tiver uma data inicial,
    // adiciona todas as datas anteriores à data inicial
    if (isEndDate && selectedStartDate) {
      const dataInicial = new Date(selectedStartDate);
      dataInicial.setHours(0, 0, 0, 0);
      
      for (let i = 1; i <= 365; i++) {
        const date = new Date(dataInicial);
        date.setDate(date.getDate() - i);
        if (date >= hoje) { // Só adiciona se não for uma data passada (para evitar duplicatas)
          disabledDates.push(date);
        }
      }
    }

    return disabledDates;
  };

  const getTileClassName = ({ date }, selectedDate, isDisabled) => {
    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === selectedDate;

    return `
      relative w-full h-full
      ${isSelected && !isDisabled
        ? 'after:absolute after:inset-0 after:bg-orange-500/20 after:rounded-full hover:after:bg-orange-500/30'
        : ''}
      ${isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : ''}
    `;
  };

  // Função vazia para horários, já que não precisamos mostrar horários no modal de seleção de data
  const getHorariosForDate = () => '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
            {title}
          </Dialog.Title>

          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1 mb-4">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-600/[0.12] hover:text-white'
                  }`
                }
              >
                Data Início
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-600/[0.12] hover:text-white'
                  }`
                }
              >
                Data Fim
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <Calendar
                  selectedDate={selectedStartDate ? new Date(selectedStartDate) : null}
                  onChange={(date) => handleDateClick(date, 'dataInicio')}
                  disabledDates={getDisabledDates(false)}
                  minDate={new Date()}
                  tileClassName={(date) => getTileClassName(date, selectedStartDate, false)}
                  getHorariosForDate={getHorariosForDate}
                />
              </Tab.Panel>
              <Tab.Panel>
                <Calendar
                  selectedDate={selectedEndDate ? new Date(selectedEndDate) : null}
                  onChange={(date) => handleDateClick(date, 'dataFim')}
                  disabledDates={getDisabledDates(true)}
                  minDate={selectedStartDate ? new Date(selectedStartDate) : new Date()}
                  tileClassName={(date) => getTileClassName(date, selectedEndDate, date < (selectedStartDate ? new Date(selectedStartDate) : new Date()))}
                  getHorariosForDate={getHorariosForDate}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 