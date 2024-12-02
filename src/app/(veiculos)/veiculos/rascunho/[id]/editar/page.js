// Server Component
import EditarRascunhoClient from './EditarRascunhoClient';

export default async function Page({ params }) {
  // Simulando await para resolver o warning
  const id = await Promise.resolve(params.id);
  return <EditarRascunhoClient id={id?.toString()} />;
} 