import EditarVeiculoClient from './EditarVeiculoClient';
import { mockAnuncios } from '@/mocks/anuncios';

export default function EditarVeiculoPage({ params }) {
  const { id } = params;
  
  // Procurar primeiro nos rascunhos
  const veiculo = mockAnuncios.rascunhos.find(v => v.id === id) || 
                 mockAnuncios.publicados.find(v => v.id === id);
  
  if (!veiculo) {
    return <div>Veículo não encontrado</div>;
  }
  
  return <EditarVeiculoClient veiculo={veiculo} />;
} 