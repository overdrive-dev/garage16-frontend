import { NextResponse } from 'next/server'

export function middleware(request) {
  // Redireciona /veiculo para /veiculos
  if (request.nextUrl.pathname === '/veiculo') {
    return NextResponse.redirect(new URL('/veiculos', request.url))
  }
}

export const config = {
  matcher: [
    '/veiculo',
  ]
}