/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Para fotos do Google
      'platform-lookaside.fbsbx.com', // Para fotos do Facebook
      'firebasestorage.googleapis.com', // Para imagens do Firebase Storage
      'via.placeholder.com'
    ],
  },
  transpilePackages: ['react-calendar']
}

module.exports = nextConfig 