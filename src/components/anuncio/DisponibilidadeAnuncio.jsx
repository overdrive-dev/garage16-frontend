import { useState, useEffect } from 'react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { anuncioService } from '@/services/anuncioService';
import { Dialog } from '@headlessui/react';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoPersonalizada from '@/components/disponibilidade/ConfiguracaoPersonalizada';
import CalendarioPreview from '@/components/disponibilidade/CalendarioPreview';

export default function DisponibilidadeAnuncio({ userId, onSave }) {
  const { disponibilidade, updateDisponibilidade } = useDisponibilidade();
  const [currentConfig, setCurrentConfig] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasOtherVehicles, setHasOtherVehicles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserVehicles = async () => {
      try {
        const anuncios = await anuncioService.getAnuncios({ userId });
        setHasOtherVehicles(anuncios.length > 0);
      } catch (error) {
        console.error('Erro ao verificar veículos:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserVehicles();
  }, [userId]);

  useEffect(() => {
    // Se já tem disponibilidade salva, usa ela como base
    if (disponibilidade) {
      setCurrentConfig(disponibilidade);
    } else {
      // Se não tem, usa o padrão
      setCurrentConfig({
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
          horarios: {/* ... */}
        }
      });
    }
  }, [disponibilidade]);

  const handleConfirm = async () => {
    try {
      // Se tem outros veículos, mostra o modal de confirmação
      if (hasOtherVehicles) {
        setShowConfirmModal(true);
      } else {
        // Se não tem, salva direto
        await updateDisponibilidade(currentConfig);
        onSave(currentConfig);
      }
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
    }
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateDisponibilidade(currentConfig);
      onSave(currentConfig);
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="space-y-6">
          {/* Aviso se já tem disponibilidade configurada */}
          {disponibilidade && (
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
              <p className="text-orange-200">
                Você já tem uma disponibilidade configurada. 
                Qualquer alteração será aplicada a todos os seus veículos.
              </p>
            </div>
          )}

          {/* Seleção do tipo de disponibilidade */}
          <div>
            <h3 className="text-lg font-medium text-gray-100 mb-4">
              Disponibilidade para visitas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* ... botões de tipo igual ao outro componente ... */}
            </div>
          </div>

          {/* Grid com configuração e preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
            {/* Coluna de Configurações */}
            <div>
              {currentConfig?.tipo === 'unica' && (
                <DataUnicaConfig 
                  datas={currentConfig.dataUnica}
                  onChange={(updates) => {
                    setCurrentConfig(prev => ({
                      ...prev,
                      dataUnica: updates
                    }));
                  }}
                />
              )}

              {/* ... outros tipos de configuração ... */}
            </div>

            {/* Coluna do Calendário */}
            <div className="lg:sticky lg:top-8 self-start">
              <CalendarioPreview 
                config={currentConfig} 
                onChange={setCurrentConfig}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão de confirmar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Confirmar Disponibilidade
        </button>
      </div>

      {/* Modal de confirmação para atualização em outros veículos */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
              Atualizar disponibilidade
            </Dialog.Title>

            <p className="text-gray-300 mb-6">
              Esta alteração será aplicada a todos os seus veículos anunciados. 
              Deseja continuar?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 