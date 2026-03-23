'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { getProductById, ALL_PRODUCTS, type Product } from '@/lib/products'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('details')
  const [wishlist, setWishlist] = useState(false)

  const product = getProductById(Number(id))

  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => window.removeEventListener('dermiq_open_cart', handler)
  }, [])

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1A2E2B' }}>Product not found</h2>
      <Link href="/shop" style={{ padding: '12px 28px', background: '#2D5F5A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Back to Shop</Link>
    </div>
  )

  const disc = Math.round((1 - product.price / product.mrp) * 100)

  function addToCart() {
    if (typeof window === 'undefined' || !product) return
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const idx = cart.findIndex((i: { id: number }) => i.id === product.id)
    if (idx >= 0) { cart[idx].qty += qty } else {
      cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, emoji: '🧴', qty })
    }
    localStorage.setItem('dermiq_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
    toast.success(`${qty} item${qty > 1 ? 's' : ''} added to bag!`, { icon: '🛍️' })
    setCartOpen(true)
  }

  const related = ALL_PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand)).slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 100 }}>
      {/* Announcement bar */}
      <div style={{ background: '#1A2E2B', color: '#fff', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ann-track" style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ann-scroll 32s linear infinite' }}>
          {['✨ FREE shipping on orders above ₹799', 'Use code DERMIQ15 for 15% off', '🧠 Free AI Skin Analysis', '👨‍⚕️ Expert Consultations from ₹499', '🌿 100% Clean Ingredients', '🚚 Same-day dispatch before 2 PM',
            '✨ FREE shipping on orders above ₹799', 'Use code DERMIQ15 for 15% off', '🧠 Free AI Skin Analysis', '👨‍⚕️ Expert Consultations from ₹499', '🌿 100% Clean Ingredients', '🚚 Same-day dispatch before 2 PM'].map((item, i) => (
            <span key={i} style={{ padding: '0 36px', fontSize: 12, fontWeight: 500 }}>
              {item} <span style={{ color: '#C8976A', marginLeft: 32 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <Navbar activePage="shop" />

      <div style={{ paddingTop: 70 }}>
        {/* Breadcrumb */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/shop" style={{ color: '#6B7280', textDecoration: 'none' }}>Shop</Link>
            <span>›</span>
            <Link href="/shop" style={{ color: '#6B7280', textDecoration: 'none' }}>{product.category}</Link>
            <span>›</span>
            <span style={{ color: '#1A2E2B', fontWeight: 500 }}>{product.name}</span>
          </div>
        </div>

        {/* Main product section */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="product-layout">
          <style>{`@media(max-width:768px){.product-layout{grid-template-columns:1fr!important;gap:24px!important}}`}</style>

          {/* Product Image */}
          <div>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#F7F3EE,#E8F0EF)', aspectRatio: '1', position: 'relative' }}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.badge && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: product.badgeBg, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}>
                  {product.badge}
                </span>
              )}
              <button
                onClick={() => setWishlist(!wishlist)}
                style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
              >
                {wishlist ? '❤️' : '🤍'}
              </button>
            </div>
            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
              {[['🧪', 'Clinically Tested'], ['🌿', 'Clean Formula'], ['🐰', 'Cruelty Free']].map(([icon, label]) => (
                <div key={label as string} style={{ textAlign: 'center', padding: '12px 8px', background: '#F7F3EE', borderRadius: 12, border: '1px solid #E8E0D8' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#2D5F5A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              {product.brand} · {product.category}
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1A2E2B', lineHeight: 1.2, marginBottom: 12 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#2D5F5A', color: '#fff', padding: '4px 10px', borderRadius: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>★</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{product.rating}</span>
              </div>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>
                {product.reviews.toLocaleString()} verified reviews
              </span>
              <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>
              {product.shortDesc}
            </p>

            {/* Key Ingredients quick view */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {product.keyIngredients.map(ki => (
                <div key={ki.name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0F9F8', border: '1px solid #C8E6E4', borderRadius: 20, padding: '5px 12px' }}>
                  <span style={{ fontSize: 14 }}>{ki.icon}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#2D5F5A' }}>{ki.name}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: '#1A2E2B' }}>₹{product.price}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.mrp}</span>
              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}>
                {disc}% OFF
              </span>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              MRP inclusive of all taxes · {product.size}
            </p>

            {/* Quantity + Add to Cart */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E8E0D8', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 48, border: 'none', background: '#F7F3EE', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#1A2E2B' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 48, border: 'none', background: '#F7F3EE', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#1A2E2B' }}>+</button>
              </div>
              <button
                onClick={addToCart}
                style={{ flex: 1, height: 48, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(45,95,90,0.3)', transition: 'all 0.2s' }}
              >
                Add to Bag — ₹{(product.price * qty).toLocaleString()}
              </button>
            </div>

            <button style={{ width: '100%', height: 48, background: 'transparent', color: '#2D5F5A', border: '2px solid #2D5F5A', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>
              Buy Now
            </button>

            {/* Free shipping note */}
            {product.price >= 799 ? (
              <div style={{ background: '#F0F9F8', border: '1px solid #C8E6E4', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#2D5F5A', fontWeight: 500 }}>
                ✓ Qualifies for FREE shipping
              </div>
            ) : (
              <div style={{ background: '#FFF8F0', border: '1px solid #F5E6D3', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#C8976A', fontWeight: 500 }}>
                Add ₹{(799 - product.price).toLocaleString()} more for FREE shipping 🚚
              </div>
            )}

            {/* Delivery info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['🚚', 'Free delivery', '₹799+'], ['↩️', 'Easy returns', '7 days'], ['✅', 'Authentic', '100% genuine'], ['💳', 'Secure payment', 'All methods']].map(([icon, title, sub]) => (
                <div key={title as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #F0EBE5' }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#1A2E2B' }}>{title}</p>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ border: '1px solid #E8E0D8', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E8E0D8', overflowX: 'auto' }} className="no-scrollbar">
              {[['details', '📋 Details'], ['ingredients', '🔬 Ingredients'], ['howto', '✋ How to Use'], ['benefits', '✨ Benefits']].map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flexShrink: 0, padding: '14px 24px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                  color: tab === t ? '#2D5F5A' : '#6B7280',
                  borderBottom: tab === t ? '2px solid #2D5F5A' : '2px solid transparent',
                }}>{label}</button>
              ))}
            </div>

            <div style={{ padding: 28 }}>
              {tab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 12 }}>About This Product</h3>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{product.description}</p>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 12 }}>Skin Types</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {product.skinTypes.map(st => (
                        <span key={st} style={{ background: '#F0F9F8', color: '#2D5F5A', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', border: '1px solid #C8E6E4' }}>{st}</span>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 12 }}>Targets</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {product.concerns.map(c => (
                        <span key={c} style={{ background: '#FFF8F0', color: '#C8976A', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', border: '1px solid #F5E6D3' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'ingredients' && (
                <div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 16 }}>Key Ingredients</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14, marginBottom: 28 }}>
                    {product.keyIngredients.map(ki => (
                      <div key={ki.name} style={{ background: '#F7F3EE', borderRadius: 14, padding: '16px 18px', border: '1px solid #E8E0D8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 24 }}>{ki.icon}</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>{ki.name}</span>
                        </div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{ki.benefit}</p>
                      </div>
                    ))}
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#1A2E2B', marginBottom: 10 }}>Full Ingredient List</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', lineHeight: 1.8 }}>
                    {product.ingredients.join(' · ')}
                  </p>
                </div>
              )}

              {tab === 'howto' && (
                <div style={{ maxWidth: 600 }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 16 }}>How to Use</h3>
                  <div style={{ background: '#F7F3EE', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8', fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#374151', lineHeight: 1.9 }}>
                    {product.howToUse}
                  </div>
                  <div style={{ marginTop: 20, padding: '14px 18px', background: '#FEF3C7', borderRadius: 12, border: '1px solid #FDE68A' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#92400E', margin: 0, fontWeight: 500 }}>
                      ⚠️ Always do a patch test before using any new skincare product. Discontinue if irritation occurs.
                    </p>
                  </div>
                </div>
              )}

              {tab === 'benefits' && (
                <div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 16 }}>What You Get</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {product.benefits.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: '#F0F9F8', borderRadius: 12, border: '1px solid #C8E6E4' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2D5F5A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A2E2B', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 20 }}>You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              {related.map(p => {
                const d = Math.round((1 - p.price / p.mrp) * 100)
                return (
                  <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} style={{ border: '1px solid #E8E0D8', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', background: '#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <div style={{ height: 180, position: 'relative', background: '#F7F3EE' }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="250px" />
                    </div>
                    <div style={{ padding: 14 }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', margin: '0 0 4px' }}>{p.brand}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>₹{p.price}</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#16A34A', fontWeight: 600, marginLeft: 6 }}>{d}% off</span>
                        </div>
                        <span style={{ background: '#2D5F5A', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>★ {p.rating}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <MobileToolbar activePage="shop" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
