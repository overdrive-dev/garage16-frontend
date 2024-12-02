// Server Component
import VeiculoDetalhesClient from './VeiculoDetalhesClient';
import { mockAnuncios } from '@/mocks/anuncios';

export default async function VeiculoPage({ params }) {
  // Aguarda o parâmetro slug
  const slug = await params.slug;
  
  // Busca o veículo
  const veiculo = mockAnuncios.publicados.find(v => v.slug === slug);
  
  if (!veiculo) {
    return <div>Veículo não encontrado</div>;
  }
  
  return <VeiculoDetalhesClient veiculo={veiculo} />;
} 