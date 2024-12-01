/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Para fotos do Google
      'platform-lookaside.fbsbx.com', // Para fotos do Facebook
      'placehold.co', // Para imagens de placeholder
    ],
  },
  transpilePackages: ['react-calendar']
}

module.exports = nextConfig 