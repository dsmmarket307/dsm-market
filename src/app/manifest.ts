import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DMS Market',
    short_name: 'DMS Market',
    description: 'Plataforma premium de comercio digital',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0B',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
