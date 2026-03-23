'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { ALL_PRODUCTS, BESTSELLERS, NEW_LAUNCHES, BUDGET, type Product } from '@/lib/products'

const ANN_ITEMS = [
  '✨ FREE shipping on orders above ₹799',
  'Use code DERMIQ15 for 15% off',
  '🧠 Free AI Skin Analysis — 30 seconds',
  '👨‍⚕️ Consultations from ₹499',
  '🌿 100% Clean Ingredients',
  '🚚 Same-day dispatch before 2 PM',
  '💊 NEW: Supplements & Collagen Range',
  '🍼 NEW: Baby Care Collection — Paediatrician Tested',
  '💋 NEW: Lips Care & Peptide Serums',
  '🎨 NEW: Skincare-infused Color Cosmetics',
]

const CATEGORIES = ['All Products', '✨ Serums', '💧 Moisturisers', '☀️ Sunscreen', '🫧 Cleansers', '🔬 Treatments', '🎁 Kits', '🏷️ All Brands']

const CATEGORY_LINKS = [
  { label: 'Skincare', emoji: '✨', href: '/category/skincare', bg: '#E8F5E9', color: '#2D5F5A' },
  { label: 'Body Care', emoji: '🧴', href: '/category/bodycare', bg: '#FFF3E0', color: '#C8976A' },
  { label: 'Lips Care', emoji: '💋', href: '/category/lips-care', bg: '#FCE4EC', color: '#C2185B' },
  { label: 'Hair Care', emoji: '💈', href: '/category/haircare', bg: '#EDE7F6', color: '#5C35D4' },
  { label: 'Supplements', emoji: '💊', href: '/category/supplements', bg: '#FFF8E1', color: '#D4A853' },
  { label: 'Baby Care', emoji: '🍼', href: '/category/baby-care', bg: '#E0F7FA', color: '#4ECDC4' },
  { label: 'Color', emoji: '🎨', href: '/category/color-cosmetics', bg: '#FFF3F3', color: '#FF6B6B' },
  { label: 'Skin Quiz', emoji: '🧪', href: '/skin-quiz', bg: '#E8F5E9', color: '#2E7D32' },
]

const MAIN_CATEGORY_CARDS = [
  { label: 'Skincare', emoji: '✨', href: '/category/skincare', color: '#2D5F5A', bg: '#E8F5E9', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&q=80', desc: 'Serums, moisturisers & SPF' },
  { label: 'Body Care', emoji: '🧴', href: '/category/bodycare', color: '#C8976A', bg: '#FFF3E0', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=400&fit=crop&q=80', desc: 'Lotions, scrubs & butters' },
  { label: 'Lips Care', emoji: '💋', href: '/category/lips-care', color: '#C2185B', bg: '#FCE4EC', image: 'https://images.unsplash.com/photo-1586495777744-4e6b0c8b9e0f?w=600&h=400&fit=crop&q=80', desc: 'Balms, serums & treatments' },
  { label: 'Hair Care', emoji: '💈', href: '/category/haircare', color: '#5C35D4', bg: '#EDE7F6', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=80', desc: 'Serums, oils & masks' },
  { label: 'Supplements', emoji: '💊', href: '/category/supplements', color: '#D4A853', bg: '#FFF8E1', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&q=80', desc: 'Collagen, vitamins & more' },
  { label: 'Baby Care', emoji: '🍼', href: '/category/baby-care', color: '#4ECDC4', bg: '#E0F7FA', image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&h=400&fit=crop&q=80', desc: 'Gentle & paediatrician tested' },
  { label: 'Color Cosmetics', emoji: '🎨', href: '/category/color-cosmetics', color: '#FF6B6B', bg: '#FFF3F3', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop&q=80', desc: 'Tints, BB cream & more' },
]

const TRUST_ITEMS = [
  { emoji: '👩‍⚕️', label: 'Dermatologist Approved' },
  { emoji: '🐰', label: 'Cruelty Free' },
  { emoji: '🌿', label: 'Clean Ingredients' },
  { emoji: '🧪', label: 'Clinically Tested' },
  { emoji: '♻️', label: 'Sustainable Packaging' },
  { emoji: '🚚', label: 'Free Shipping ₹799+' },
]

const INGREDIENTS = [
  { emoji: '🍊', name: 'Vitamin C', desc: 'Brightening & antioxidant protection', color: '#FFF8E1' },
  { emoji: '🌙', name: 'Retinol', desc: 'Anti-aging & cell turnover', color: '#EDE7F6' },
  { emoji: '💎', name: 'Niacinamide', desc: 'Pore-minimizing & barrier repair', color: '#E3F2FD' },
  { emoji: '💧', name: 'Hyaluronic Acid', desc: 'Deep hydration & plumping', color: '#E8F5E9' },
  { emoji: '🏛️', name: 'Ceramides', desc: 'Skin barrier strengthening', color: '#FCE4EC' },
  { emoji: '☀️', name: 'SPF Filters', desc: 'Broad-spectrum UV protection', color: '#FFFDE7' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', skin: 'Oily, Acne-prone', review: 'The Vitamin C serum literally transformed my skin in 3 weeks. My dark spots are barely visible now!', rating: 5, emoji: '🌟' },
  { name: 'Ritu M.', skin: 'Dry, Sensitive', review: 'Finally a moisturiser that doesn\'t break me out. The Ceramide cream feels like a hug for my skin. Repurchasing forever!', rating: 5, emoji: '💚' },
  { name: 'Aisha K.', skin: 'Combination', review: 'Took the AI skin quiz and got a perfect routine. The recommendations were spot-on. My skin is glowing!', rating: 5, emoji: '✨' },
]

function ProductCard({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product) => void }) {
  const router = useRouter()
  const disc = Math.round((1 - product.price / product.mrp) * 100)

  return (
    <div
      style={{ width: 175, flexShrink: 0, borderRadius: 16, border: '1px solid #E8E0D8', background: '#fff', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Real product image */}
      <div style={{ height: 160, position: 'relative', background: '#F7F3EE', overflow: 'hidden' }}>
        <Image src={product.image} alt={product.name} fill sizes="175px" style={{ objectFit: 'cover' }} />
        {product.badge && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: product.badgeBg, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', letterSpacing: 0.3, zIndex: 1 }}>
            {product.badge}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation() }}
          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4856A" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 10px 10px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>{product.brand} · {product.category}</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.35, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>
            ★ {product.rating}
          </span>
          <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>₹{product.price}</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 4 }}>₹{product.mrp}</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#16A34A', fontWeight: 600, marginLeft: 4 }}>{disc}% off</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product) }}
            style={{ width: 28, height: 28, borderRadius: 8, background: '#2D5F5A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductSlider({ products, onAddToCart }: { products: Product[], onAddToCart: (p: Product) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (175 + 14) * 2, behavior: 'smooth' })
  }
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => scroll(-1)}
        className="hidden md:flex"
        style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #E8E0D8', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2E2B" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div className="pslider" ref={ref}>
        {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
      </div>
      <button
        onClick={() => scroll(1)}
        className="hidden md:flex"
        style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #E8E0D8', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2E2B" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  )
}

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All Products')
  const router = useRouter()

  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => window.removeEventListener('dermiq_open_cart', handler)
  }, [])

  const addToCart = (product: Product) => {
    if (typeof window === 'undefined') return
    try {
      const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
      const idx = cart.findIndex((i: { id: number }) => i.id === product.id)
      if (idx >= 0) {
        cart[idx].qty += 1
      } else {
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, qty: 1 })
      }
      localStorage.setItem('dermiq_cart', JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
      toast.success(`${product.name.substring(0, 24)}... added to bag!`, { icon: '🛍️' })
    } catch {
      toast.error('Could not add to cart')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Announcement bar — fixed at very top */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#1A2E2B', color: '#fff', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ann-track">
          {[...ANN_ITEMS, ...ANN_ITEMS].map((item, i) => (
            <span key={i} style={{ padding: '0 40px', fontSize: 12, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              {item}
              <span style={{ marginLeft: 40, color: '#C8976A' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Navbar — fixed below announcement bar */}
      <Navbar activePage="home" />

      {/* Spacer for fixed announcement bar + navbar */}
      <div style={{ height: 106 }} />

      {/* Category nav */}
      <div className="cat-nav">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }} className="no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: activeCategory === cat ? '1.5px solid #2D5F5A' : '1.5px solid #E8E0D8',
                  background: activeCategory === cat ? '#2D5F5A' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#1A1A1A',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section style={{ background: '#F7F3EE', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }} className="hero-grid">
          <style>{`@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important;text-align:center}}`}</style>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E8E0D8', borderRadius: 20, padding: '6px 14px', marginBottom: 24, fontSize: 13, fontWeight: 500, color: '#2D5F5A', fontFamily: 'DM Sans, sans-serif' }}>
              🌿 Dermatologist Formulated
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, color: '#1A2E2B', lineHeight: 1.15, marginBottom: 20 }}>
              Skin That{' '}
              <em style={{ fontStyle: 'italic', color: '#2D5F5A' }}>Speaks</em>{' '}
              For Itself
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, color: '#4B5563', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Science-backed formulas crafted with dermatologists. Know your skin type, build your routine, and see real results in 30 days.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
              <button
                onClick={() => router.push('/skin-quiz')}
                className="btn-know-skin"
              >
                🧠 Know Your Skin
              </button>
              <Link href="/shop" className="btn-primary">
                Explore Products
              </Link>
              <button
                onClick={() => router.push('/routine')}
                style={{ padding: '14px 24px', borderRadius: 12, border: '1.5px solid #1A2E2B', background: 'transparent', color: '#1A2E2B', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1A2E2B'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#1A2E2B' }}
              >
                Build My Routine
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { val: '50K+', label: 'Happy Customers' },
                { val: '4.9★', label: 'Average Rating' },
                { val: '100%', label: 'Clean Ingredients' },
              ].map(stat => (
                <div key={stat.val}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#1A2E2B' }}>{stat.val}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: 320, height: 380, borderRadius: 32, background: 'linear-gradient(135deg, #E8F4F3, #D4EDE9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, position: 'relative', boxShadow: '0 20px 60px rgba(45,95,90,0.15)' }}>
              🧴
              {/* Floating cards */}
              <div style={{ position: 'absolute', top: -16, right: -24, background: '#fff', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#1A2E2B', whiteSpace: 'nowrap' }}>
                🧠 AI Skin Match
              </div>
              <div style={{ position: 'absolute', bottom: 24, left: -32, background: '#1A2E2B', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                ✨ Bestseller Serum
              </div>
              <div style={{ position: 'absolute', bottom: -16, right: 20, background: '#C8976A', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 32px rgba(200,151,106,0.3)', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                🌿 100% Clean
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: '#1A2E2B', padding: '20px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
          {TRUST_ITEMS.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Category Quick Links */}
      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 8, textAlign: 'center' }}>Shop by Category</h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 36 }}>Find exactly what your skin needs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="cat-grid">
            <style>{`@media(max-width:640px){.cat-grid{grid-template-columns:repeat(4,1fr)!important;gap:10px!important}}`}</style>
            {CATEGORY_LINKS.map(cat => (
              <Link key={cat.label} href={cat.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 10px', borderRadius: 16, background: cat.bg, textDecoration: 'none', transition: 'transform 0.15s', border: '1px solid transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {cat.emoji}
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A2E2B', textAlign: 'center' }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deal strip */}
      <section style={{ background: 'linear-gradient(135deg, #1A2E2B, #2D5F5A)', padding: '24px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: '#C8976A', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>⚡ Flash Deal</span>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#fff', fontSize: 15, fontWeight: 500 }}>
              Vitamin C Serum — <strong>₹799</strong> <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>₹1299</span> · Today Only
            </p>
          </div>
          <Link href="/product/1" style={{ padding: '10px 24px', borderRadius: 10, background: '#C8976A', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(200,151,106,0.4)' }}>
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Product Sliders */}
      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          {/* Bestsellers */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Top Picks</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginTop: 4 }}>Bestsellers</h2>
              </div>
              <Link href="/shop" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D5F5A', textDecoration: 'none' }}>View All →</Link>
            </div>
            <ProductSlider products={BESTSELLERS} onAddToCart={addToCart} />
          </div>

          {/* New Launches */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#D4856A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Just Arrived</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginTop: 4 }}>New Launches</h2>
              </div>
              <Link href="/shop?sort=newest" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D5F5A', textDecoration: 'none' }}>View All →</Link>
            </div>
            <ProductSlider products={NEW_LAUNCHES} onAddToCart={addToCart} />
          </div>

          {/* Budget Picks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2D5F5A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Under ₹499</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginTop: 4 }}>Budget Picks</h2>
              </div>
              <Link href="/shop?filter=budget" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D5F5A', textDecoration: 'none' }}>View All →</Link>
            </div>
            <ProductSlider products={BUDGET} onAddToCart={addToCart} />
          </div>
        </div>
      </section>

      {/* Shop by Category Mega Grid */}
      <section style={{ padding: '80px 0', background: '#F7F3EE' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>All Categories</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', margin: '8px 0 12px' }}>Shop by Category</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280', maxWidth: 460, margin: '0 auto' }}>From skincare essentials to baby care — everything your family needs, backed by science.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {MAIN_CATEGORY_CARDS.map(cat => (
              <Link key={cat.label} href={cat.href} style={{ display: 'block', borderRadius: 20, overflow: 'hidden', textDecoration: 'none', position: 'relative', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.14)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
              >
                <div style={{ height: 200, position: 'relative' }}>
                  <Image src={cat.image} alt={cat.label} fill sizes="220px" style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${cat.color}DD 0%, transparent 60%)` }} />
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: `linear-gradient(to top, ${cat.color} 0%, transparent 100%)` }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.emoji}</div>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{cat.label}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Limited Time</span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#1A2E2B', marginTop: 4 }}>Today&apos;s Deals</h2>
            </div>
            <Link href="/offers" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D5F5A', textDecoration: 'none' }}>View All Offers →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {ALL_PRODUCTS.filter(p => p.mrp > p.price).sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp).slice(0, 6).map(product => {
              const disc = Math.round((1 - product.price / product.mrp) * 100)
              return (
                <div key={product.id} style={{ borderRadius: 16, border: '1px solid #E8E0D8', background: '#fff', overflow: 'hidden', cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
                  <div style={{ height: 160, position: 'relative', background: '#F7F3EE' }}>
                    <Image src={product.image} alt={product.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 8, left: 8, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif' }}>-{disc}%</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif' }}>{product.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#2D5F5A', fontFamily: 'DM Sans, sans-serif' }}>₹{product.price}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', fontFamily: 'DM Sans, sans-serif' }}>₹{product.mrp}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); addToCart(product) }} style={{ marginTop: 8, width: '100%', background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Add to Cart</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section style={{ padding: '80px 0', background: '#F7F3EE' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="phil-grid">
          <style>{`@media(max-width:768px){.phil-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Our Promise</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', margin: '8px 0 16px' }}>Science + Skin Intelligence</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#4B5563', lineHeight: 1.7, marginBottom: 24 }}>
              Every DermIQ product is formulated with clinically proven actives, tested by dermatologists, and optimized by our AI system that understands your unique skin biology.
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#4B5563', lineHeight: 1.7, marginBottom: 32 }}>
              We believe skincare should be personalized, transparent, and effective — not overwhelming.
            </p>
            <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D5F5A', textDecoration: 'none' }}>
              Learn About DermIQ →
            </Link>
          </div>

          {/* AI System card */}
          <div style={{ background: 'linear-gradient(135deg, #1A2E2B, #2D5F5A)', borderRadius: 24, padding: 32, color: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>🧠 DermIQ AI System</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 24 }}>Your Personal Skin Intelligence</h3>
            {[
              { step: '01', label: 'Scan', desc: 'Answer 30 skin questions' },
              { step: '02', label: 'Analyse', desc: 'AI maps your skin biology' },
              { step: '03', label: 'Match', desc: 'Get product recommendations' },
              { step: '04', label: 'Consult', desc: 'Talk to a dermatologist' },
              { step: '05', label: 'Track', desc: 'Monitor your skin progress' },
            ].map((s, i) => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < 4 ? 14 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,151,106,0.2)', border: '1px solid rgba(200,151,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif' }}>{s.step}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <button
              onClick={() => router.push('/skin-quiz')}
              style={{ marginTop: 24, width: '100%', padding: '14px', borderRadius: 12, background: '#C8976A', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Start Free Analysis →
            </button>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Powered By Science</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', margin: '8px 0 12px' }}>Key Ingredients</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>We use only research-backed actives at clinically effective concentrations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="ing-grid">
            <style>{`@media(max-width:768px){.ing-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
            {INGREDIENTS.map(ing => (
              <div key={ing.name} style={{ padding: 24, borderRadius: 16, background: ing.color, border: '1px solid rgba(0,0,0,0.04)', transition: 'transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{ing.emoji}</div>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A2E2B', marginBottom: 6 }}>{ing.name}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{ing.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', background: '#F7F3EE' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C8976A', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Real Results</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', margin: '8px 0' }}>What Our Customers Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="test-grid">
            <style>{`@media(max-width:768px){.test-grid{grid-template-columns:1fr!important}}`}</style>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #E8E0D8' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{t.emoji}</div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Array(t.rating).fill(0).map((_, i) => (
                    <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 20 }}>"{t.review}"</p>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>{t.name}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280' }}>{t.skin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A2E2B', color: '#fff', padding: '60px 0 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 48 }} className="footer-grid">
            <style>{`@media(max-width:768px){.footer-grid{grid-template-columns:repeat(2,1fr)!important;gap:32px!important}}`}</style>
            {/* About */}
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Derm<span style={{ color: '#C8976A' }}>IQ</span>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16 }}>
                Science-backed skincare designed for every skin type. Formulated with dermatologists, powered by AI.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['📸', '🐦', '📘'].map((icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>Shop</h4>
              {['Serums', 'Moisturisers', 'Sunscreen', 'Cleansers', 'Treatments', 'Gift Sets'].map(item => (
                <Link key={item} href="/shop" style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 8 }}>
                  {item}
                </Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>Support</h4>
              {['Track Order', 'Returns & Exchange', 'FAQs', 'Skin Quiz', 'Contact Us', 'Shipping Policy'].map(item => (
                <Link key={item} href={`/${item.toLowerCase().replace(/ /g, '-')}`} style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 8 }}>
                  {item}
                </Link>
              ))}
            </div>

            {/* Connect */}
            <div>
              <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>Connect</h4>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>Get skincare tips and exclusive offers in your inbox.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="Your email" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                <button style={{ padding: '10px 16px', borderRadius: 8, background: '#C8976A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>→</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>© 2025 DermIQ by Rabt Naturals. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <Link key={item} href={`/${item.toLowerCase().replace(/ /g, '-')}`} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Toolbar */}
      <MobileToolbar activePage="home" />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
