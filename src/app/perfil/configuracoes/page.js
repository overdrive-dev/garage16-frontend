'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoPersonalizada from '@/components/disponibilidade/ConfiguracaoPersonalizada';

export default function ConfiguracoesPerfil() {
  const router = useRouter();
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

  const handleSalvar = async () => {
    try {
      // Salvar no Firebase
      // const userRef = doc(db, 'users', userId);
      // await updateDoc(userRef, {
      //   disponibilidade: disponibilidade
      // });
      
      router.push('/perfil');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              Configurações de Disponibilidade
            </h2>
          </div>
        </div>

        <div className="space-y-8">
          {/* Bloco de Disponibilidade */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="space-y-6">
              {/* Seleção do tipo de disponibilidade */}
              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  Disponibilidade geral
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* ... botões de tipo de disponibilidade ... */}
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

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 