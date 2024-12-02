import EditarVeiculoClient from './EditarVeiculoClient';
import { mockAnuncios } from '@/mocks/anuncios';

export default async function EditarVeiculoPage({ params }) {
  // Aguarda o parâmetro slug
  const slug = await params.slug;
  
  // Busca o veículo
  const veiculo = mockAnuncios.publicados.find(v => v.slug === slug);
  
  if (!veiculo) {
    return <div>Veículo não encontrado</div>;
  }
  
  return <EditarVeiculoClient veiculo={veiculo} />;
} 