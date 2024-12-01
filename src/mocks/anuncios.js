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
    },
    {
      id: '5',
      modelo: 'BMW S1000RR',
      marca: 'BMW',
      ano: 2023,
      preco: 129900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=BMW+S1000RR',
      userId: 'user123'
    },
    {
      id: '6',
      modelo: 'Ducati Panigale V4',
      marca: 'Ducati',
      ano: 2023,
      preco: 159900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Ducati+Panigale',
      userId: 'user123'
    },
    {
      id: '7',
      modelo: 'Yamaha MT-09',
      marca: 'Yamaha',
      ano: 2022,
      preco: 59900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Yamaha+MT09',
      userId: 'user123'
    },
    {
      id: '8',
      modelo: 'Kawasaki Ninja ZX-10R',
      marca: 'Kawasaki',
      ano: 2023,
      preco: 109900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Ninja+ZX10R',
      userId: 'user123'
    },
    {
      id: '9',
      modelo: 'Suzuki GSX-R1000R',
      marca: 'Suzuki',
      ano: 2022,
      preco: 99900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=GSXR+1000R',
      userId: 'user123'
    },
    {
      id: '10',
      modelo: 'KTM 1290 Super Duke R',
      marca: 'KTM',
      ano: 2023,
      preco: 119900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=KTM+SuperDuke',
      userId: 'user123'
    },
    {
      id: '11',
      modelo: 'Aprilia RSV4',
      marca: 'Aprilia',
      ano: 2023,
      preco: 139900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Aprilia+RSV4',
      userId: 'user123'
    },
    {
      id: '12',
      modelo: 'Triumph Street Triple RS',
      marca: 'Triumph',
      ano: 2022,
      preco: 69900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Street+Triple',
      userId: 'user123'
    },
    {
      id: '13',
      modelo: 'Harley-Davidson Fat Bob',
      marca: 'Harley-Davidson',
      ano: 2023,
      preco: 89900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=Fat+Bob',
      userId: 'user123'
    },
    {
      id: '14',
      modelo: 'Honda CB1000R',
      marca: 'Honda',
      ano: 2022,
      preco: 79900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=CB1000R',
      userId: 'user123'
    },
    {
      id: '15',
      modelo: 'MV Agusta F3 800',
      marca: 'MV Agusta',
      ano: 2023,
      preco: 129900,
      status: STATUS_ANUNCIO.ATIVO,
      imageUrl: 'https://placehold.co/400x300/1f2937/ffffff?text=MV+F3+800',
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