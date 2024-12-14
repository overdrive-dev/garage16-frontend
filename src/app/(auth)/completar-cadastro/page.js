'use client'

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ListaEnderecos from '@/components/ListaEnderecos';
import LoadingComponent from '@/components/disponibilidade/LoadingComponent';

// Componente do formulário de completar cadastro
function CompletarCadastroForm() {
  const { user, updateUserProfile, saveEndereco, deleteEndereco, isProfileComplete } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.displayName || '',
    email: user?.email || '',
    whatsapp: '',
    notificacoes: {
      email: true,
      whatsapp: true
    }
  });

  useEffect(() => {
    // Se o usuário não estiver logado, redireciona para login
    if (!user) {
      router.push('/entrar');
      return;
    }

    // Se o perfil já estiver completo, redireciona para home
    if (isProfileComplete(user)) {
      router.push('/');
      return;
    }

    // Atualiza o formulário com os dados do usuário
    setFormData(prev => ({
      ...prev,
      nome: user.displayName || '',
      email: user.email || ''
    }));
  }, [user, router, isProfileComplete]);

  // Verifica se todos os critérios estão completos
  const isCadastroCompleto = () => {
    const dadosPessoaisCompletos = !!(
      formData.nome &&
      formData.whatsapp
    );

    const temEnderecoPrincipal = user?.enderecos?.some(e => e.principal);

    return dadosPessoaisCompletos && temEnderecoPrincipal;
  };

  const handleSubmit = async () => {
    if (!isCadastroCompleto()) return;
    
    setLoading(true);

    try {
      await updateUserProfile(formData);
      router.push('/');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isCadastroCompleto()) return;
    handleSubmit();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notificacoes.')) {
      const notificationType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notificacoes: {
          ...prev.notificacoes,
          [notificationType]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <>
      <Header simple />
      <main className="min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6.5rem)] bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full space-y-8 mb-16">
          <div>
            <h2 className="text-center text-3xl font-bold text-white">
              Complete seu Cadastro
            </h2>
            <p className="mt-2 text-center text-gray-400">
              Precisamos de mais algumas informações para continuar
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              {/* Dados Pessoais */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-400 cursor-not-allowed"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-200">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Preferências de Notificação */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white">Notificações</h3>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificacoes.email"
                        checked={formData.notificacoes.email}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                      />
                      <label className="ml-2 block text-sm text-gray-200">
                        Receber notificações por email
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificacoes.whatsapp"
                        checked={formData.notificacoes.whatsapp}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                      />
                      <label className="ml-2 block text-sm text-gray-200">
                        Receber notificações por WhatsApp
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Endereços */}
              <div className="pt-6 border-t border-gray-700">
                <ListaEnderecos
                  enderecos={user?.enderecos || []}
                  onSave={saveEndereco}
                  onDelete={deleteEndereco}
                />
              </div>
            </div>

            {/* Critérios e Botão de Conclusão */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Complete seu cadastro</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${formData.nome ? 'text-green-500' : 'text-gray-400'}`}>
                      {formData.nome ? '✓' : '○'} Nome completo preenchido
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${formData.whatsapp ? 'text-green-500' : 'text-gray-400'}`}>
                      {formData.whatsapp ? '✓' : '○'} WhatsApp preenchido
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${user?.enderecos?.some(e => e.principal) ? 'text-green-500' : 'text-gray-400'}`}>
                      {user?.enderecos?.some(e => e.principal) ? '✓' : '○'} Endereço principal cadastrado
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClick}
                  disabled={loading || !isCadastroCompleto()}
                  className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Componente que lida com a lógica de completar cadastro
function CompletarCadastroContent() {
  return <CompletarCadastroForm />;
}

// Página principal com Suspense
export default function CompletarCadastroPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <CompletarCadastroContent />
    </Suspense>
  );
} 