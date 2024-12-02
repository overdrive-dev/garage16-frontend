// Server Component
import VeiculoDetalhesClient from './VeiculoDetalhesClient';
import { mockAnuncios } from '@/mocks/anuncios';

export default async function VeiculoPage({ params }) {
  // Simulando await para resolver o warning
  const slug = await Promise.resolve(params.slug);
  const veiculo = mockAnuncios.publicados.find(v => v.slug === slug);
  
  if (!veiculo) {
    return <div>Veículo não encontrado</div>;
  }
  
  return <VeiculoDetalhesClient veiculo={veiculo} />;
} 