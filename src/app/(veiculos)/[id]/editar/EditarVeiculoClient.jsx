'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';

export default function EditarVeiculoClient({ id }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [anuncio, setAnuncio] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadAnuncio = async () => {
      try {
        const data = await anuncioService.getAnuncio(id);
        if (data?.userId !== user.uid) {
          router.push('/meus-anuncios');
          return;
        }
        setAnuncio(data);
      } catch (error) {
        console.error('Erro ao carregar anúncio:', error);
        router.push('/meus-anuncios');
      } finally {
        setLoading(false);
      }
    };

    loadAnuncio();
  }, [user, id, router]);

  const handleSubmit = async (data) => {
    try {
      await anuncioService.updateAnuncio(id, data);
      router.push('/meus-anuncios');
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AnuncioForm 
      tipo="editar"
      anuncio={anuncio}
      onSubmit={handleSubmit}
      userId={user.uid}
    />
  );
} 