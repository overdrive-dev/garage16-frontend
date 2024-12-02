import EditarVeiculoClient from './EditarVeiculoClient';

// Server Component
export default async function Page({ params }) {
  // Simulando await para resolver o warning
  const slug = await Promise.resolve(params.slug);
  return <EditarVeiculoClient slug={slug?.toString()} />;
} 