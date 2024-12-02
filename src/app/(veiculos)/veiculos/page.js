'use client'

import { useState, useMemo } from 'react';
import VehicleCard from '@/components/VehicleCard';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';
import Breadcrumb from '@/components/Breadcrumb';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency, parseCurrency } from '@/utils/format';

// Mock de filtros salvos - Futuramente virá do backend
const FILTROS_SALVOS = {
  'filtro-1': {
    nome: 'Motos até 50 mil',
    filtros: {
      marca: '',
      anoMin: '2020',
      anoMax: '',
      precoMin: '',
      precoMax: '50000'
    }
  },
  'filtro-2': {
    nome: 'Harleys novas',
    filtros: {
      marca: 'Harley-Davidson',
      anoMin: '2022',
      anoMax: '',
      precoMin: '',
      precoMax: ''
    }
  }
};

export default function VeiculosPage() {
  const [filtros, setFiltros] = useState({
    marca: '',
    anoMin: '',
    anoMax: '',
    precoMin: '',
    precoMax: ''
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtrosSalvos, setFiltrosSalvos] = useState(FILTROS_SALVOS);
  const [filtroSelecionadoId, setFiltroSelecionadoId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, filtroId: null });

  // Extrair dados únicos do mock para os filtros
  const dadosFiltros = useMemo(() => {
    const anuncios = mockAnuncios.publicados.filter(a => a.status === STATUS_ANUNCIO.VENDENDO);
    
    const marcas = [...new Set(anuncios.map(a => a.marca))].sort();
    const anos = anuncios.map(a => a.ano);
    const precos = anuncios.map(a => a.preco);
    
    return {
      marcas,
      anoMin: Math.min(...anos),
      anoMax: Math.max(...anos),
      precoMin: Math.min(...precos),
      precoMax: Math.max(...precos)
    };
  }, []);

  // Verificar se há filtros ativos
  const temFiltrosAtivos = useMemo(() => {
    return Object.values(filtros).some(valor => valor !== '');
  }, [filtros]);

  // Formatar valores monetários
  const formatarPreco = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Filtrar veículos
  const veiculos = useMemo(() => {
    return mockAnuncios.publicados.filter(anuncio => {
      if (anuncio.status !== STATUS_ANUNCIO.VENDENDO) return false;

      const matchMarca = !filtros.marca || 
        anuncio.marca?.toLowerCase() === filtros.marca.toLowerCase();

      const matchAnoMin = !filtros.anoMin || 
        anuncio.ano >= parseInt(filtros.anoMin);

      const matchAnoMax = !filtros.anoMax || 
        anuncio.ano <= parseInt(filtros.anoMax);

      const matchPrecoMin = !filtros.precoMin || 
        anuncio.preco >= parseInt(filtros.precoMin);

      const matchPrecoMax = !filtros.precoMax || 
        anuncio.preco <= parseInt(filtros.precoMax);

      return matchMarca && matchAnoMin && matchAnoMax && matchPrecoMin && matchPrecoMax;
    });
  }, [filtros]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Veículos' }
  ];

  const handleSaveFiltro = () => {
    if (!filtroNome.trim()) return;

    const novoFiltro = {
      nome: filtroNome,
      filtros: { ...filtros }
    };

    setFiltrosSalvos(prev => ({
      ...prev,
      [`filtro-${Date.now()}`]: novoFiltro
    }));

    setShowSaveModal(false);
    setFiltroNome('');
  };

  const handleUpdateFiltro = () => {
    // Atualiza o filtro existente sem pedir nome
    setFiltrosSalvos(prev => ({
      ...prev,
      [filtroSelecionadoId]: {
        ...prev[filtroSelecionadoId],
        filtros: { ...filtros }
      }
    }));
  };

  const handleLoadFiltro = (filtroId, filtroSalvo) => {
    if (filtroId === filtroSelecionadoId) {
      // Se clicar no mesmo filtro, desmarca
      setFiltroSelecionadoId(null);
    } else {
      // Se clicar em outro filtro, seleciona ele
      setFiltros(filtroSalvo.filtros);
      setFiltroSelecionadoId(filtroId);
    }
  };

  const handleDeleteClick = (e, filtroId) => {
    e.stopPropagation(); // Evita trigger do onClick do botão pai
    setDeleteModal({ isOpen: true, filtroId });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.filtroId) {
      const { [deleteModal.filtroId]: removed, ...rest } = filtrosSalvos;
      setFiltrosSalvos(rest);
      
      // Se o filtro excluído estava selecionado, desmarca
      if (deleteModal.filtroId === filtroSelecionadoId) {
        setFiltroSelecionadoId(null);
      }
    }
    setDeleteModal({ isOpen: false, filtroId: null });
  };

  // Verificar se os filtros atuais são diferentes do filtro selecionado
  const temAlteracoes = useMemo(() => {
    if (!filtroSelecionadoId) return false;
    
    const filtroAtual = filtrosSalvos[filtroSelecionadoId].filtros;
    return Object.entries(filtros).some(([key, value]) => {
      return value !== filtroAtual[key];
    });
  }, [filtros, filtroSelecionadoId, filtrosSalvos]);

  // Handler para valores monetários
  const handlePrecoChange = (e, tipo) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
    setFiltros(prev => ({
      ...prev,
      [tipo]: value
    }));
  };

  // Handler para anos
  const handleAnoChange = (e, tipo) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Limita a 4 dígitos
    setFiltros(prev => ({
      ...prev,
      [tipo]: value
    }));
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex gap-8 p-6">
          {/* Sidebar com Filtros */}
          <div className="w-64 flex-shrink-0 space-y-6">
            {/* Filtros Salvos */}
            {Object.keys(filtrosSalvos).length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-200">Filtros Salvos</h3>
                <div className="space-y-2">
                  {Object.entries(filtrosSalvos).map(([id, filtro]) => (
                    <div 
                      key={id}
                      className={`flex items-center justify-between p-2 rounded transition-colors group
                        ${id === filtroSelecionadoId 
                          ? 'bg-orange-500/10 border border-orange-500/20' 
                          : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <button
                        onClick={() => handleLoadFiltro(id, filtro)}
                        className="flex-1 text-left text-sm text-gray-200"
                      >
                        {filtro.nome}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, id)}
                        className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros Atuais */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-6">
              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Marca
                </label>
                <select
                  value={filtros.marca}
                  onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Todas as marcas</option>
                  {dadosFiltros.marcas.map(marca => (
                    <option key={`marca-${marca}`} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>

              {/* Ano */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative group">
                  <input
                    type="text"
                    value={filtros.anoMin}
                    onChange={(e) => handleAnoChange(e, 'anoMin')}
                    placeholder={dadosFiltros.anoMin.toString()}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 pr-8 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    maxLength={4}
                  />
                  {filtros.anoMin && (
                    <button
                      onClick={() => setFiltros(prev => ({ ...prev, anoMin: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={filtros.anoMax}
                    onChange={(e) => handleAnoChange(e, 'anoMax')}
                    placeholder={dadosFiltros.anoMax.toString()}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 pr-8 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    maxLength={4}
                  />
                  {filtros.anoMax && (
                    <button
                      onClick={() => setFiltros(prev => ({ ...prev, anoMax: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preço */}
              <div className="space-y-2">
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formatCurrency(filtros.precoMin)}
                    onChange={(e) => handlePrecoChange(e, 'precoMin')}
                    placeholder={`${formatarPreco(dadosFiltros.precoMin)}`.replace('R$', '').trim()}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 pl-8 pr-8 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {filtros.precoMin && (
                    <button
                      onClick={() => setFiltros(prev => ({ ...prev, precoMin: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    R$
                  </span>
                  <input
                    type="text"
                    value={formatCurrency(filtros.precoMax)}
                    onChange={(e) => handlePrecoChange(e, 'precoMax')}
                    placeholder={`${formatarPreco(dadosFiltros.precoMax)}`.replace('R$', '').trim()}
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 pl-8 pr-8 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {filtros.precoMax && (
                    <button
                      onClick={() => setFiltros(prev => ({ ...prev, precoMax: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              {temFiltrosAtivos && (
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setFiltros({
                      marca: '',
                      anoMin: '',
                      anoMax: '',
                      precoMin: '',
                      precoMax: ''
                    })}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Limpar
                  </button>

                  <div className="flex gap-2">
                    {filtroSelecionadoId ? (
                      // Só mostra botão de atualizar se houver alterações
                      temAlteracoes && (
                        <button
                          onClick={handleUpdateFiltro}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                        >
                          Atualizar
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                      >
                        Salvar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Veículos */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {veiculos.map((veiculo) => (
                <VehicleCard 
                  key={`vehicle-${veiculo.id}`}
                  veiculo={veiculo} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Salvar Filtro - Só aparece quando não tem filtro selecionado */}
      {showSaveModal && !filtroSelecionadoId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-white mb-4">
              Salvar Filtro
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Nome do filtro"
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFiltro}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-white mb-4">
              Excluir Filtro
            </h3>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir este filtro salvo? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ isOpen: false, filtroId: null })}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 