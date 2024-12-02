'use client'

import { mockAnuncios } from '@/mocks/anuncios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';
import Breadcrumb from '@/components/Breadcrumb';

export default function EditarVeiculoClient({ slug }) {
  const router = useRouter();
  const { user } = useAuth();
  const veiculo = mockAnuncios.publicados.find(v => v.slug === slug);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!veiculo) {
    return <div>Veículo não encontrado</div>;
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Meus Anúncios', href: '/meus-anuncios' },
    { label: veiculo.modelo, href: `/veiculo/${veiculo.slug}` },
    { label: 'Editar' }
  ];

  const handleSubmit = async (data) => {
    try {
      await anuncioService.updateAnuncio(veiculo.id, data);
      router.push(`/veiculo/${data.slug}`);
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <AnuncioForm 
          tipo="editar"
          anuncio={veiculo}
          onSubmit={handleSubmit}
          userId={user.uid}
        />
      </div>
    </div>
  );
} 