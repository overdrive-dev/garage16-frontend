// Server Component
import VeiculoDetalhesClient from './VeiculoDetalhesClient';

export default async function VeiculoPage({ params }) {
  // Garantir que o params.id está disponível de forma assíncrona
  const id = await params.id;
  return <VeiculoDetalhesClient id={id} />;
} 