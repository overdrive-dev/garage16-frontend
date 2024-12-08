'use client'
import { getAuth } from 'firebase/auth';

export default function Page() {
  const testarToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      console.log('Token:', token);
      
      // Copiar para área de transferência
      await navigator.clipboard.writeText(token);
      alert('Token copiado para área de transferência!');
    } else {
      console.log('Nenhum usuário logado');
    }
  };

  return (
    <button 
      onClick={testarToken}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Obter Token
    </button>
  );
}