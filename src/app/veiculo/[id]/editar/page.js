import EditarVeiculoClient from './EditarVeiculoClient';

// Server Component
export default function EditarVeiculoPage({ params }) {
  return <EditarVeiculoClient id={params.id} />;
} 