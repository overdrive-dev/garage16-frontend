'use client'

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingComponent from '@/components/disponibilidade/LoadingComponent';

// Componente do formulário de resetar senha
function ResetarSenhaForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('Email não encontrado');
      } else {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded">
                Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>

              <div className="text-center">
                <Link 
                  href="/entrar"
                  className="text-orange-500 hover:text-orange-400 text-sm"
                >
                  Voltar para o login
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

// Componente que lida com a lógica de resetar senha
function ResetarSenhaContent() {
  return <ResetarSenhaForm />;
}

// Página principal com Suspense
export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ResetarSenhaContent />
    </Suspense>
  );
} 