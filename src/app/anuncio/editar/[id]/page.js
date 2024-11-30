import EditarAnuncioForm from './EditarAnuncioForm';

export default async function EditarAnuncioPage({ params }) {
  // Aguardar a resolução dos parâmetros
  const id = await params.id;
  
  return <EditarAnuncioForm id={id} />;
} 