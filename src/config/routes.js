export const ADMIN_ROUTES = [
  '/veiculo/[id]', // Protege a rota com ID
];

export const PUBLIC_ROUTES = [
  '/veiculo/[slug]', // Permite acesso público à rota com slug
  '/veiculos',
  '/',
  // ... outras rotas públicas
]; 