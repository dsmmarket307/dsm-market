import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DMS Market',
  description: 'Plataforma premium de comercio digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}