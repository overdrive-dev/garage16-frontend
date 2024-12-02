// Server Component
import VeiculoDetalhesClient from './VeiculoDetalhesClient';

export default async function VeiculoPage({ params }) {
  const id = await Promise.resolve(params.id);
  return <VeiculoDetalhesClient id={id} />;
} 