import EditarRascunhoClient from './EditarRascunhoClient';
import { mockAnuncios } from '@/mocks/anuncios';

export default async function EditarRascunhoPage({ params }) {
  // Aguarda o parâmetro id
  const id = await params.id;
  
  // Busca o rascunho
  const rascunho = mockAnuncios.rascunhos.find(v => v.id === id);
  
  if (!rascunho) {
    return <div>Rascunho não encontrado</div>;
  }
  
  return <EditarRascunhoClient rascunho={rascunho} />;
} 