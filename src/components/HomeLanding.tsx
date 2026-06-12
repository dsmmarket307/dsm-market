'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeLanding({ products, images, banners }: any) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    if (!banners.length) return
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 4000)
    return () => clearInterval(t)
  }, [banners.length])

  const filtered = search.trim()
    ? products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111' }}>

      <nav style={{ borderBottom: '2px solid #C9A84C', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>DMS Market</span>
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem', display: 'flex' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            style={{ flex: 1, padding: '0.625rem 1rem', border: '2px solid #ddd', borderRight: 'none', fontSize: '0.875rem', outline: 'none' }}
          />
          <button onClick={() => router.push('/auth/login')} style={{ padding: '0.625rem 1.25rem', background: '#C9A84C', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/auth/login" style={{ fontSize: '0.875rem', color: '#111', textDecoration: 'none', padding: '0.5rem 1rem' }}>Ingresar</a>
          <a href="/auth/register" style={{ fontSize: '0.875rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none' }}>Registrarse</a>
        </div>
      </nav>

      <div style={{ background: '#111', padding: '3rem 2rem', textAlign: 'center', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Destacado</p>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#fff', marginBottom: '0.5rem' }}>
          {banners[currentBanner]?.title ?? 'Bienvenido a DMS Market'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#aaa', marginBottom: '1.25rem' }}>
          {banners[currentBanner]?.subtitle ?? 'Compra y vende con seguridad'}
        </p>
        <a href="/auth/register" style={{ background: '#C9A84C', color: '#fff', padding: '0.75rem 2rem', textDecoration: 'none', fontSize: '0.875rem', textTransform: 'uppercase' }}>
          Ver ofertas
        </a>
        {banners.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            {banners.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentBanner(i)} style={{ width: i === currentBanner ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === currentBanner ? '#C9A84C' : '#444', border: 'none', cursor: 'pointer' }} />
            ))}
          </div>
        )}
      </div>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>{search ? 'Resultados' : 'Productos destacados'}</h2>
          <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none' }}>Ver todos</a>
        </div>
        {filtered.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No se encontraron productos.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
            {filtered.map((product: any) => {
              const img = images.filter((i: any) => i.product_id === product.id)[0]?.url
              return (
                <a key={product.id} href="/auth/login" style={{ textDecoration: 'none', color: '#111', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '4px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                ></a>