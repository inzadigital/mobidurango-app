/**
 * Configuración de Next.js para Mobidurango
 *
 * IMPORTANTE: aquí configuramos los headers CORS.
 * Esto permite que la web estática de durangokirolak.net pueda
 * hacer peticiones al endpoint /api/eventos-destacados sin problemas.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de headers para permitir CORS en los endpoints de /api
  async headers() {
    return [
      {
        // Aplicar a todas las rutas /api/*
        source: '/api/:path*',
        headers: [
          // Permitir peticiones desde cualquier origen (para la web estática de DK)
          // En producción estricta podríamos limitarlo a durangokirolak.net
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Otras configuraciones útiles
  reactStrictMode: true,

  // Imágenes: permitir dominios remotos si fuera necesario en el futuro
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
