export const STATUS_ANUNCIO = {
  RASCUNHO: 'rascunho',
  REVISAO: 'revisao',
  VENDENDO: 'vendendo',
  VENDIDO: 'vendido',
  CANCELADO: 'cancelado'
};

export const CATEGORIAS = {
  SPORT: 'sport',
  CUSTOM: 'custom',
  NAKED: 'naked',
  SCOOTER: 'scooter'
};

const MOTO_IMAGES = {
  SPORT: [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
    'https://images.unsplash.com/photo-1558981359-219d6364c9c8',
    'https://images.unsplash.com/photo-1558980664-769d59546b3d'
  ],
  NAKED: [
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f',
    'https://images.unsplash.com/photo-1517846693594-1567da4ef834',
    'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0',
    'https://images.unsplash.com/photo-1547549082-6bc09f2049ae'
  ],
  CUSTOM: [
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65',
    'https://images.unsplash.com/photo-1581829946844-8f1c41ab0acd',
    'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838',
    'https://images.unsplash.com/photo-1525160354320-d8e92641c563'
  ]
};

export const mockAnuncios = {
  publicados: [
    {
      id: '1',
      modelo: 'Kawasaki Z900',
      marca: 'Kawasaki',
      categoria: CATEGORIAS.NAKED,
      ano: 2020,
      preco: 98000,
      status: STATUS_ANUNCIO.VENDENDO,
      ativo: true,
      imagens: MOTO_IMAGES.NAKED,
      imageUrl: MOTO_IMAGES.NAKED[0],
      slug: 'kawasaki-z900-2020',
      cor: 'Verde',
      km: 45000,
      descricao: 'Moto em excelente estado, todas as revisões em dia.',
      userId: 'user123',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z'
    },
    {
      id: '2',
      modelo: 'BMW S1000RR',
      marca: 'BMW',
      categoria: CATEGORIAS.SPORT,
      ano: 2023,
      preco: 129900,
      status: STATUS_ANUNCIO.VENDENDO,
      ativo: false,
      imagens: MOTO_IMAGES.SPORT,
      imageUrl: MOTO_IMAGES.SPORT[0],
      slug: 'bmw-s1000rr-2023',
      cor: 'Branco',
      km: 3500,
      descricao: 'Superbike em estado de zero, todas as revisões na concessionária.',
      userId: 'user123',
      createdAt: '2024-03-14T10:00:00Z',
      updatedAt: '2024-03-15T15:00:00Z'
    },
    {
      id: '3',
      modelo: 'Yamaha YZF-R1',
      marca: 'Yamaha',
      categoria: CATEGORIAS.SPORT,
      ano: 2022,
      preco: 115000,
      status: STATUS_ANUNCIO.CANCELADO,
      ativo: false,
      imagens: MOTO_IMAGES.SPORT,
      imageUrl: MOTO_IMAGES.SPORT[0],
      slug: 'yamaha-yzf-r1-2022',
      cor: 'Azul Racing',
      km: 25000,
      descricao: 'Moto em excelente estado, revisões em dia.',
      userId: 'user123',
      createdAt: '2024-03-13T10:00:00Z',
      updatedAt: '2024-03-14T16:30:00Z',
      motivoCancelamento: 'Veículo vendido em outro canal'
    },
    {
      id: '4',
      modelo: 'Ducati Panigale V4',
      marca: 'Ducati',
      categoria: CATEGORIAS.SPORT,
      ano: 2023,
      preco: 189900,
      status: STATUS_ANUNCIO.VENDIDO,
      ativo: false,
      imagens: MOTO_IMAGES.SPORT,
      imageUrl: MOTO_IMAGES.SPORT[0],
      slug: 'ducati-panigale-v4-2023',
      cor: 'Vermelho',
      km: 1200,
      descricao: 'Superbike italiana em estado impecável.',
      userId: 'user123',
      createdAt: '2024-03-12T10:00:00Z',
      updatedAt: '2024-03-13T14:20:00Z'
    },
    {
      id: '5',
      modelo: 'Harley-Davidson Sportster S',
      marca: 'Harley-Davidson',
      categoria: CATEGORIAS.CUSTOM,
      ano: 2024,
      preco: 79900,
      status: STATUS_ANUNCIO.VENDENDO,
      ativo: true,
      imagens: MOTO_IMAGES.CUSTOM,
      imageUrl: MOTO_IMAGES.CUSTOM[0],
      slug: 'harley-davidson-sportster-s-2024',
      cor: 'Preto',
      km: 0,
      descricao: 'Nova, zero km, pronta entrega.',
      userId: 'user123',
      createdAt: '2024-03-11T10:00:00Z',
      updatedAt: '2024-03-11T10:00:00Z'
    },
    {
      id: '8',
      modelo: 'KTM Duke 390',
      marca: 'KTM',
      categoria: CATEGORIAS.NAKED,
      ano: 2023,
      preco: 32900,
      status: STATUS_ANUNCIO.REVISAO,
      ativo: true,
      imagens: MOTO_IMAGES.NAKED,
      imageUrl: MOTO_IMAGES.NAKED[0],
      slug: 'ktm-duke-390-2023',
      cor: 'Laranja',
      km: 2500,
      descricao: 'Naked em excelente estado, todas as revisões em dia.',
      userId: 'user123',
      createdAt: '2024-03-16T10:00:00Z',
      updatedAt: '2024-03-16T10:00:00Z'
    },
    {
      id: '9',
      modelo: 'MT-07',
      marca: 'Yamaha',
      categoria: CATEGORIAS.NAKED,
      ano: 2024,
      preco: 45900,
      status: STATUS_ANUNCIO.REVISAO,
      ativo: true,
      imagens: MOTO_IMAGES.NAKED,
      imageUrl: MOTO_IMAGES.NAKED[0],
      slug: 'yamaha-mt07-2024',
      cor: 'Azul',
      km: 0,
      descricao: 'Moto 0km, pronta entrega.',
      userId: 'user123',
      createdAt: '2024-03-16T11:00:00Z',
      updatedAt: '2024-03-16T11:00:00Z'
    }
  ],
  rascunhos: [
    {
      id: '6',
      modelo: 'Honda CB 1000R',
      marca: 'Honda',
      categoria: CATEGORIAS.NAKED,
      ano: 2023,
      preco: 72000,
      status: STATUS_ANUNCIO.RASCUNHO,
      imagens: MOTO_IMAGES.NAKED,
      imageUrl: MOTO_IMAGES.NAKED[0],
      slug: 'honda-cb-1000r-2023',
      cor: 'Prata',
      km: 12000,
      descricao: 'Naked em excelente estado.',
      userId: 'user123',
      createdAt: '2024-03-10T10:00:00Z',
      updatedAt: '2024-03-10T10:00:00Z'
    },
    {
      id: '7',
      modelo: 'Triumph Street Triple RS',
      marca: 'Triumph',
      categoria: CATEGORIAS.NAKED,
      ano: 2022,
      preco: null,
      status: STATUS_ANUNCIO.RASCUNHO,
      imagens: [],
      imageUrl: null,
      slug: null,
      cor: null,
      km: null,
      descricao: null,
      userId: 'user123',
      createdAt: '2024-03-09T10:00:00Z',
      updatedAt: '2024-03-09T10:00:00Z'
    }
  ]
}; 