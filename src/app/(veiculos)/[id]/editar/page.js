import EditarVeiculoClient from './EditarVeiculoClient';

export default async function EditarVeiculoPage({ params }) {
  const id = await Promise.resolve(params.id);
  return <EditarVeiculoClient id={id} />;
} 