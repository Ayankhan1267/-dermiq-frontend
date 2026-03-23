'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, type Product } from '@/lib/products'

export default function WishlistPage() {
  const router = useRouter()
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const wl = JSON.parse(localStorage.getItem('dermiq_wishlist') || '[]')
    setWishlistIds(wl)
  }, [])

  function removeFromWishlist(id: number) {
    const updated = wishlistIds.filter(wid => wid !== id)
    setWishlistIds(updated)
    localStorage.setItem('dermiq_wishlist', JSON.stringify(updated))
    toast.success('Removed from wishlist')
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
  }

  function shareWishlist() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success('Wishlist link copied!')
    } else {
      toast.success('Share this URL: ' + url)
    }
  }

  const wishlistProducts = ALL_PRODUCTS.filter(p => wishlistIds.includes(p.id))

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 20px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', marginBottom: 4 }}>
              My Wishlist ❤️
            </h1>
            <p style={{ color: '#6B7280', fontSize: 14 }}>
              {wishlistProducts.length > 0 ? `${wishlistProducts.length} saved product${wishlistProducts.length > 1 ? 's' : ''}` : 'Nothing saved yet'}
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={shareWishlist}
                style={{ background: '#F7F3EE', color: '#2D5F5A', border: '1px solid #E8E0D8', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🔗 Share Wishlist
              </button>
              <button
                onClick={() => {
                  wishlistProducts.forEach(p => addToCart(p))
                  toast.success('All items added to cart!')
                }}
                style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Add All to Cart
              </button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🤍</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 12 }}>
              Start adding products you love
            </h2>
            <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
              Tap the heart icon on any product to save it here for later.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                Explore Products
              </Link>
              <Link href="/skin-quiz" style={{ background: '#F7F3EE', color: '#2D5F5A', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 600, fontSize: 15, border: '1px solid #E8E0D8' }}>
                Get Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {wishlistProducts.map(product => {
              const disc = Math.round((1 - product.price / product.mrp) * 100)
              return (
                <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  {/* Image */}
                  <div
                    style={{ height: 200, position: 'relative', background: '#F7F3EE', cursor: 'pointer', overflow: 'hidden' }}
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    <Image src={product.image} alt={product.name} fill sizes="240px" style={{ objectFit: 'cover' }} />
                    {product.badge && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: product.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                        {product.badge}
                      </span>
                    )}
                    {disc > 0 && (
                      <span style={{ position: 'absolute', bottom: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                        -{disc}%
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand} · {product.category}</p>
                    <p
                      style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.35, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>★ {product.rating}</span>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>({product.reviews.toLocaleString()})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#1A2E2B' }}>₹{product.price}</span>
                      {product.mrp > product.price && <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => addToCart(product)}
                        style={{ flex: 1, background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 16, cursor: 'pointer' }}
                        title="Remove from wishlist"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Recommendations */}
        {wishlistProducts.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 8 }}>
              You Might Also Love
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>Based on your saved items</p>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {ALL_PRODUCTS.filter(p => !wishlistIds.includes(p.id)).slice(0, 8).map(product => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  style={{ width: 175, flexShrink: 0, borderRadius: 12, border: '1px solid #E8E0D8', background: '#fff', cursor: 'pointer', overflow: 'hidden' }}
                >
                  <div style={{ height: 150, position: 'relative', background: '#F7F3EE' }}>
                    <Image src={product.image} alt={product.name} fill sizes="175px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{product.name}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#2D5F5A' }}>₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MobileToolbar />
    </div>
  )
}
