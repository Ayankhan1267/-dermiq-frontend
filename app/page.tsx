'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  mrp: number
  rating: number
  reviews: number
  emoji: string
  badge: string
  badgeBg: string
}

const BESTSELLERS: Product[] = [
  { id:1, name:'Vitamin C Brightening Serum', brand:'DermIQ', category:'Serum', price:799, mrp:1299, rating:4.9, reviews:2341, emoji:'✨', badge:'Bestseller', badgeBg:'#1A2E2B' },
  { id:2, name:'Hyaluronic Acid Deep Hydra Gel', brand:'DermIQ', category:'Moisturiser', price:649, mrp:999, rating:4.8, reviews:1876, emoji:'💧', badge:'New', badgeBg:'#D4856A' },
  { id:3, name:'Mineral Sunscreen SPF 50+ PA++++', brand:'DermIQ', category:'Sunscreen', price:549, mrp:899, rating:4.9, reviews:3102, emoji:'☀️', badge:'SPF 50+', badgeBg:'#C8976A' },
  { id:4, name:'Gentle Amino Acid Foaming Wash', brand:'DermIQ', category:'Cleanser', price:399, mrp:599, rating:4.7, reviews:1543, emoji:'🫧', badge:'', badgeBg:'' },
  { id:5, name:'Retinol 0.2% Night Serum', brand:'Minimalist', category:'Serum', price:699, mrp:999, rating:4.6, reviews:987, emoji:'🌙', badge:'Derma Pick', badgeBg:'#2D5F5A' },
  { id:6, name:'Ceramide & Hyaluronic Moisturiser', brand:'DermIQ', category:'Moisturiser', price:849, mrp:1299, rating:4.8, reviews:2103, emoji:'🏺', badge:'', badgeBg:'' },
]

const NEW_LAUNCHES: Product[] = [
  { id:7, name:'Niacinamide 10% + Zinc Serum', brand:'Minimalist', category:'Serum', price:449, mrp:699, emoji:'🔬', badge:'New', badgeBg:'#D4856A', rating:4.7, reviews:432 },
  { id:8, name:'Watermelon Glow Sleeping Mask', brand:'Dot & Key', category:'Treatment', price:699, mrp:999, emoji:'🍉', badge:'New', badgeBg:'#D4856A', rating:4.8, reviews:321 },
  { id:9, name:'SPF 50 Matte Sunscreen', brand:'Pilgrim', category:'Sunscreen', price:599, mrp:899, emoji:'☀️', badge:'New', badgeBg:'#D4856A', rating:4.6, reviews:215 },
  { id:10, name:'Kojic Acid Dark Spot Serum', brand:'Plum', category:'Serum', price:549, mrp:799, emoji:'✨', badge:'New', badgeBg:'#D4856A', rating:4.5, reviews:189 },
  { id:11, name:'Peptide Complex Eye Cream', brand:'DermIQ', category:'Treatment', price:999, mrp:1499, emoji:'👁️', badge:'Launch', badgeBg:'#3D7A74', rating:4.9, reviews:87 },
  { id:12, name:'AHA 30% + BHA 2% Peeling Solution', brand:'Minimalist', category:'Treatment', price:549, mrp:799, emoji:'⚗️', badge:'Trending', badgeBg:'#C8976A', rating:4.7, reviews:654 },
]

const BUDGET: Product[] = [
  { id:13, name:'Salicylic Acid 2% Face Wash', brand:'Minimalist', category:'Cleanser', price:299, mrp:499, emoji:'🫧', badge:'', badgeBg:'', rating:4.6, reviews:2341 },
  { id:14, name:'Vitamin C 10% Face Serum', brand:'Plum', category:'Serum', price:449, mrp:699, emoji:'🍊', badge:'', badgeBg:'', rating:4.5, reviews:1234 },
  { id:15, name:'SPF 30 PA+++ Sunscreen', brand:'Pilgrim', category:'Sunscreen', price:399, mrp:599, emoji:'🌤️', badge:'', badgeBg:'', rating:4.4, reviews:876 },
  { id:16, name:'Rose & Aloe Toner', brand:'Plum', category:'Toner', price:349, mrp:499, emoji:'🌹', badge:'', badgeBg:'', rating:4.5, reviews:543 },
  { id:17, name:'Niacinamide Face Mist', brand:'Dot & Key', category:'Mist', price:399, mrp:599, emoji:'💨', badge:'', badgeBg:'', rating:4.6, reviews:432 },
  { id:18, name:'Aloe Vera Soothing Gel', brand:'DermIQ', category:'Gel', price:199, mrp:349, emoji:'🌿', badge:'', badgeBg:'', rating:4.7, reviews:1876 },
]

const ANN_ITEMS = [
  '✨ FREE shipping on orders above ₹799',
  'Use code DERMIQ15 for 15% off',
  '🧠 Free AI Skin Analysis — 30 seconds',
  '👨‍⚕️ Consultations from ₹499',
  '🌿 100% Clean Ingredients',
  '🚚 Same-day dispatch before 2 PM',
]

const CATEGORIES = ['All Products', '✨ Serums', '💧 Moisturisers', '☀️ Sunscreen', '🫧 Cleansers', '🔬 Treatments', '🎁 Kits', '🏷️ All Brands']

const CATEGORY_LINKS = [
  { label: 'Serums', emoji: '✨', href: '/shop?cat=serum', bg: '#E8F5E9', color: '#2E7D32' },
  { label: 'Moisturisers', emoji: '💧', href: '/shop?cat=moisturiser', bg: '#EDE7F6', color: '#6A1B9A' },
  { label: 'Sunscreen', emoji: '☀️', href: '/shop?cat=sunscreen', bg: '#FFF8E1', color: '#F57F17' },
  { label: 'Cleansers', emoji: '🫧', href: '/shop?cat=cleanser', bg: '#ECEFF1', color: '#455A64' },
  { label: 'Treatments', emoji: '🔬', href: '/shop?cat=treatment', bg: '#FCE4EC', color: '#C2185B' },
  { label: 'Kits', emoji: '🎁', href: '/shop?cat=kit', bg: '#FFFDE7', color: '#F9A825' },
  { label: 'Skin Profile', emoji: '👤', href: '/skin-profile', bg: '#E3F2FD', color: '#1565C0' },
  { label: 'Skin Quiz', emoji: '🧪', href: '/skin-quiz', bg: '#E8F5E9', color: '#2E7D32' },
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
      {/* Image area */}
      <div style={{ height: 160, background: 'linear-gradient(135deg, #F7F3EE, #E8E0D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 56 }}>{product.emoji}</span>
        {product.badge && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: product.badgeBg, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', letterSpacing: 0.3 }}>
            {product.badge}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation() }}
          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, emoji: product.emoji, qty: 1 })
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
      {/* Announcement bar */}
      <div style={{ background: '#1A2E2B', color: '#fff', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ann-track">
          {[...ANN_ITEMS, ...ANN_ITEMS].map((item, i) => (
            <span key={i} style={{ padding: '0 40px', fontSize: 12, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              {item}
              <span style={{ marginLeft: 40, color: '#C8976A' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <Navbar activePage="home" />

      {/* Category nav */}
      <div className="cat-nav" style={{ marginTop: 36 }}>
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
      <section style={{ background: '#F7F3EE', minHeight: '90vh', display: 'flex', alignItems: 'center', paddingTop: 20 }}>
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
