import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 👇 Tu configuración actual, conservada
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Esto es necesario para permitir peticiones desde el entorno de desarrollo (Firebase Studio).
    allowedDevOrigins: [
        "https://*.cloudworkstations.dev",
        "https://*.web.app",
        "https://*.firebaseapp.com"
    ],
  },
};

export default nextConfig;
