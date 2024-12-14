import { NextResponse } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/perfil',
  '/meus-anuncios',
  '/meus-agendamentos',
  '/veiculo/novo',
  '/perfil/disponibilidade',
  '/completar-cadastro'
];

// Rotas de autenticação (não devem ser acessadas se já estiver logado)
const authRoutes = [
  '/entrar',
  '/criar-conta',
  '/recuperar-senha',
  '/nova-senha'
];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Verifica o cookie específico do Firebase
  const firebaseAuthCookie = request.cookies.get('firebase-auth-token');
  const isAuthenticated = !!firebaseAuthCookie;

  // Se o usuário está logado
  if (isAuthenticated) {
    // Se tentar acessar uma rota de auth, redireciona para home
    if (authRoutes.includes(path)) {
      console.log('Usuário autenticado tentando acessar rota de auth, redirecionando para home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Permite acesso a rotas protegidas
    return NextResponse.next();
  }

  // Se não está logado e tenta acessar rota protegida
  if (protectedRoutes.some(route => path.startsWith(route))) {
    console.log('Usuário não autenticado tentando acessar rota protegida, redirecionando para login');
    const url = new URL('/entrar', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 