export const STATUS_ANUNCIO = {
  RASCUNHO: 'rascunho',
  REVISAO: 'revisao',
  ATIVO: 'ativo',
  REPROVADO: 'reprovado',
  VENDIDO: 'vendido'
};

export const mockAnuncios = {
  publicados: [
    {
      id: '1',
      modelo: 'Honda Civic',
      ano: 2020,
      preco: 98000,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Honda+Civic',
      userId: 'user123'
    },
    {
      id: '2',
      modelo: 'Toyota Corolla',
      ano: 2021,
      preco: 105000,
      status: STATUS_ANUNCIO.REVISAO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Toyota+Corolla',
      userId: 'user123'
    },
    {
      id: '3',
      modelo: 'Fiat Argo',
      ano: 2022,
      preco: 75000,
      status: STATUS_ANUNCIO.REPROVADO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Fiat+Argo',
      userId: 'user123'
    },
    {
      id: '4',
      modelo: 'VW Gol',
      ano: 2019,
      preco: 55000,
      status: STATUS_ANUNCIO.VENDIDO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=VW+Gol',
      userId: 'user123'
    }
  ],
  rascunhos: [
    {
      id: 'draft1',
      modelo: 'Fiat Argo',
      ano: 2023,
      preco: 75000,
      status: STATUS_ANUNCIO.RASCUNHO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Fiat+Argo+2023',
      userId: 'user123',
      updatedAt: '2024-03-15T10:00:00Z'
    }
  ]
}; 