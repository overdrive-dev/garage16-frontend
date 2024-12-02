import { NextResponse } from 'next/server';
import { ADMIN_ROUTES } from '@/config/routes';

async function isAdmin(request) {
  // Implementar verificação real de admin
  // Por exemplo:
  // const session = await getSession(request);
  // return session?.user?.role === 'admin';
  return false;
}

export async function middleware(request) {
  const isAdminRoute = ADMIN_ROUTES.some(route => {
    const routePattern = new RegExp(route.replace('[id]', '\\d+'));
    return routePattern.test(request.nextUrl.pathname);
  });

  if (isAdminRoute) {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/veiculo/:path*', // Aplica o middleware em todas as rotas de veículo
  ]
}; 