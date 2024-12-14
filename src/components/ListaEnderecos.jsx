'use client'

import { useState } from 'react';
import EnderecoModal from './EnderecoModal';

export default function ListaEnderecos({ enderecos = [], onSave, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [enderecoParaEditar, setEnderecoParaEditar] = useState(null);

  const handleNovoEndereco = () => {
    setEnderecoParaEditar(null);
    setModalOpen(true);
  };

  const handleEditarEndereco = (endereco) => {
    setEnderecoParaEditar(endereco);
    setModalOpen(true);
  };

  const handleSalvarEndereco = async (endereco) => {
    // Se for endereço principal, remove o principal dos outros
    if (endereco.principal) {
      enderecos.forEach(e => {
        if (e.id !== endereco.id) {
          e.principal = false;
        }
      });
    }
    
    // Se não houver nenhum endereço principal, define este como principal
    if (enderecos.length === 0 || !enderecos.some(e => e.principal)) {
      endereco.principal = true;
    }

    await onSave(endereco, enderecoParaEditar?.id);
    setModalOpen(false);
    setEnderecoParaEditar(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Meus Endereços</h2>
        <button
          onClick={handleNovoEndereco}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
        >
          Adicionar Endereço
        </button>
      </div>

      {enderecos.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-400">Você ainda não tem endereços cadastrados</p>
          <button
            onClick={handleNovoEndereco}
            className="mt-4 text-orange-500 hover:text-orange-400"
          >
            Cadastrar meu primeiro endereço
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {enderecos.map((endereco) => (
            <div
              key={endereco.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 relative"
            >
              {endereco.principal && (
                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Principal
                </span>
              )}
              <div className="space-y-2">
                <h3 className="font-medium text-white">{endereco.nome}</h3>
                <p className="text-sm text-gray-300">
                  {endereco.logradouro}, {endereco.numero}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                </p>
                <p className="text-sm text-gray-300">
                  {endereco.bairro}
                </p>
                <p className="text-sm text-gray-300">
                  {endereco.cidade} - {endereco.estado}
                </p>
                <p className="text-sm text-gray-300">
                  CEP: {endereco.cep}
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditarEndereco(endereco)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Editar
                </button>
                {!endereco.principal && (
                  <button
                    onClick={() => onDelete(endereco.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <EnderecoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEnderecoParaEditar(null);
        }}
        onSave={handleSalvarEndereco}
        endereco={enderecoParaEditar}
      />
    </div>
  );
} 