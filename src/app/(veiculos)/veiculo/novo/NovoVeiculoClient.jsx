'use client'

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';
import { useMemo } from 'react';
import LoadingComponent from '@/components/disponibilidade/LoadingComponent';

// Componente que lida com o formulário e submissão
function NovoVeiculoForm({ dadosIniciais }) {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/entrar');
    return null;
  }

  const handleSubmit = async (data) => {
    try {
      await anuncioService.createAnuncio(data);
      router.push('/meus-anuncios');
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
    }
  };

  return (
    <AnuncioForm 
      tipo="novo"
      anuncio={dadosIniciais}
      onSubmit={handleSubmit}
      userId={user.uid}
    />
  );
}

// Componente que lida com os parâmetros da URL
function NovoVeiculoContent() {
  const searchParams = useSearchParams();

  // Recuperar dados do anúncio cancelado, se existirem
  const dadosIniciais = useMemo(() => {
    const dadosString = searchParams.get('dados');
    if (dadosString) {
      try {
        return JSON.parse(decodeURIComponent(dadosString));
      } catch (error) {
        console.error('Erro ao decodificar dados:', error);
      }
    }
    return null;
  }, [searchParams]);

  return <NovoVeiculoForm dadosIniciais={dadosIniciais} />;
}

// Componente principal
export default function NovoVeiculoClient() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <NovoVeiculoContent />
    </Suspense>
  );
} 