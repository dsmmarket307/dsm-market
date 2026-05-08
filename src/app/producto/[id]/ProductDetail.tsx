'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: string
  seller_id: string
}

interface Image {
  id: string
  url: string
  position: number
}

interface Seller {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Props {
  product: Product
  images: Image[]
  seller: Seller | null
}

export default function ProductDetail({ product, images, seller }: Props) {
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(product.price)

  async function handleAddToCart() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('carts').upsert({
      buyer_id: user.id,
      product_id: product.id,
      quantity,
    }, { onConflict: 'buyer_id,product_id' })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    setAdding(false)
  }

  async function handleBuyNow() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('carts').upsert({
      buyer_id: user.id,
      product_id: product.id,
      quantity,
    }, { onConflict: 'buyer_id,product_id' })
    router.push('/checkout')
    setAdding(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-gray-600 transition-colors">Inicio</a>
          <span>/</span>
          <a href="/catalogo" className="hover:text-gray-600 transition-colors">Catalogo</a>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-4">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImage ? 'border-[#C9A84C]' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-widest text-[#C9A84C] uppercase mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              {formattedPrice}
            </div>
            <p className="text-gray-500 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600 font-medium">Cantidad</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                >
                  -
                </button>
                <span className="px-5 py-2 text-gray-900 font-medium border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="w-full bg-[#C9A84C] hover:bg-[#b8943d] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60 text-base"
              >
                {adding ? 'Procesando...' : 'Comprar ahora'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full border-2 border-gray-200 hover:border-[#C9A84C] text-gray-700 hover:text-[#C9A84C] font-semibold py-4 rounded-xl transition-all disabled:opacity-60 text-base"
              >
                {added ? 'Agregado' : 'Agregar al carrito'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Pago seguro</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Envio rapido</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Compra segura</span>
              </div>
            </div>

            {seller && (
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 font-semibold text-sm">
                      {seller.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Vendedor</p>
                  <p className="text-sm font-semibold text-gray-700">{seller.full_name}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                    Verificado
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}