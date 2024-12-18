'use client'

import { mockAnuncios } from '@/mocks/anuncios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';
import Breadcrumb from '@/components/Breadcrumb';

export default function EditarRascunhoClient({ id }) {
  const router = useRouter();
  const { user } = useAuth();
  const rascunho = mockAnuncios.rascunhos.find(v => v.id === id);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!rascunho) {
    return <div>Rascunho não encontrado</div>;
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Meus Anúncios', href: '/meus-anuncios' },
    { label: 'Continuar Rascunho' }
  ];

  const handleSubmit = async (data) => {
    try {
      if (data.slug) {
        await anuncioService.createAnuncio(data);
        router.push(`/veiculo/${data.slug}`);
      } else {
        await anuncioService.updateAnuncio(rascunho.id, data);
        router.push('/meus-anuncios');
      }
    } catch (error) {
      console.error('Erro ao atualizar rascunho:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <AnuncioForm 
          tipo="rascunho"
          anuncio={rascunho}
          onSubmit={handleSubmit}
          userId={user.uid}
        />
      </div>
    </div>
  );
} 