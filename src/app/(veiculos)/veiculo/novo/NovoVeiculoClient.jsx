'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';
import { useMemo } from 'react';

export default function NovoVeiculoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

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

  if (!user) {
    router.push('/login');
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