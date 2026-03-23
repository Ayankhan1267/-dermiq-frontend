'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  tags?: string[]
}

const ALL_PRODUCTS: Product[] = [
  { id:1, name:'Vitamin C Brightening Serum', brand:'DermIQ', category:'Serum', price:799, mrp:1299, rating:4.9, reviews:2341, emoji:'✨', badge:'Bestseller', badgeBg:'#1A2E2B', tags:['brightening','oily','combination'] },
  { id:2, name:'Hyaluronic Acid Deep Hydra Gel', brand:'DermIQ', category:'Moisturiser', price:649, mrp:999, rating:4.8, reviews:1876, emoji:'💧', badge:'New', badgeBg:'#D4856A', tags:['hydration','dry','combination'] },
  { id:3, name:'Mineral Sunscreen SPF 50+ PA++++', brand:'DermIQ', category:'Sunscreen', price:549, mrp:899, rating:4.9, reviews:3102, emoji:'☀️', badge:'SPF 50+', badgeBg:'#C8976A', tags:['protection','all'] },
  { id:4, name:'Gentle Amino Acid Foaming Wash', brand:'DermIQ', category:'Cleanser', price:399, mrp:599, rating:4.7, reviews:1543, emoji:'🫧', badge:'', badgeBg:'', tags:['cleanser','sensitive'] },
  { id:5, name:'Retinol 0.2% Night Serum', brand:'Minimalist', category:'Serum', price:699, mrp:999, rating:4.6, reviews:987, emoji:'🌙', badge:'Derma Pick', badgeBg:'#2D5F5A', tags:['anti-aging','oily','combination'] },
  { id:6, name:'Ceramide & Hyaluronic Moisturiser', brand:'DermIQ', category:'Moisturiser', price:849, mrp:1299, rating:4.8, reviews:2103, emoji:'🏺', badge:'', badgeBg:'', tags:['barrier','dry','sensitive'] },
  { id:7, name:'Niacinamide 10% + Zinc Serum', brand:'Minimalist', category:'Serum', price:449, mrp:699, emoji:'🔬', badge:'New', badgeBg:'#D4856A', rating:4.7, reviews:432, tags:['pores','oily','acne'] },
  { id:8, name:'Watermelon Glow Sleeping Mask', brand:'Dot & Key', category:'Treatment', price:699, mrp:999, emoji:'🍉', badge:'New', badgeBg:'#D4856A', rating:4.8, reviews:321, tags:['hydration','all'] },
  { id:9, name:'SPF 50 Matte Sunscreen', brand:'Pilgrim', category:'Sunscreen', price:599, mrp:899, emoji:'☀️', badge:'New', badgeBg:'#D4856A', rating:4.6, reviews:215, tags:['protection','matte','oily'] },
  { id:10, name:'Kojic Acid Dark Spot Serum', brand:'Plum', category:'Serum', price:549, mrp:799, emoji:'✨', badge:'New', badgeBg:'#D4856A', rating:4.5, reviews:189, tags:['brightening','hyperpigmentation'] },
  { id:11, name:'Peptide Complex Eye Cream', brand:'DermIQ', category:'Treatment', price:999, mrp:1499, emoji:'👁️', badge:'Launch', badgeBg:'#3D7A74', rating:4.9, reviews:87, tags:['anti-aging','all'] },
  { id:12, name:'AHA 30% + BHA 2% Peeling Solution', brand:'Minimalist', category:'Treatment', price:549, mrp:799, emoji:'⚗️', badge:'Trending', badgeBg:'#C8976A', rating:4.7, reviews:654, tags:['exfoliation','oily','acne'] },
  { id:13, name:'Salicylic Acid 2% Face Wash', brand:'Minimalist', category:'Cleanser', price:299, mrp:499, emoji:'🫧', badge:'', badgeBg:'', rating:4.6, reviews:2341, tags:['acne','oily'] },
  { id:14, name:'Vitamin C 10% Face Serum', brand:'Plum', category:'Serum', price:449, mrp:699, emoji:'🍊', badge:'', badgeBg:'', rating:4.5, reviews:1234, tags:['brightening','combination'] },
  { id:15, name:'SPF 30 PA+++ Sunscreen', brand:'Pilgrim', category:'Sunscreen', price:399, mrp:599, emoji:'🌤️', badge:'', badgeBg:'', rating:4.4, reviews:876, tags:['protection','daily'] },
  { id:16, name:'Rose & Aloe Toner', brand:'Plum', category:'Toner', price:349, mrp:499, emoji:'🌹', badge:'', badgeBg:'', rating:4.5, reviews:543, tags:['hydration','sensitive'] },
  { id:17, name:'Niacinamide Face Mist', brand:'Dot & Key', category:'Mist', price:399, mrp:599, emoji:'💨', badge:'', badgeBg:'', rating:4.6, reviews:432, tags:['pores','refresh'] },
  { id:18, name:'Aloe Vera Soothing Gel', brand:'DermIQ', category:'Gel', price:199, mrp:349, emoji:'🌿', badge:'', badgeBg:'', rating:4.7, reviews:1876, tags:['soothing','sensitive','all'] },
  { id:19, name:'Alpha Arbutin 2% Serum', brand:'Minimalist', category:'Serum', price:399, mrp:599, emoji:'🌟', badge:'', badgeBg:'', rating:4.6, reviews:1023, tags:['brightening','pigmentation'] },
  { id:20, name:'Ceramide Barrier Repair Serum', brand:'DermIQ', category:'Serum', price:899, mrp:1399, emoji:'🧬', badge:'Premium', badgeBg:'#1A2E2B', rating:4.9, reviews:456, tags:['barrier','dry','sensitive'] },
  { id:21, name:'Green Tea Foaming Cleanser', brand:'Dot & Key', category:'Cleanser', price:349, mrp:499, emoji:'🍵', badge:'', badgeBg:'', rating:4.5, reviews:678, tags:['antioxidant','oily'] },
  { id:22, name:'Skin Brightening Kit (4 products)', brand:'DermIQ', category:'Kit', price:1999, mrp:3299, emoji:'🎁', badge:'Save 39%', badgeBg:'#2D5F5A', rating:4.9, reviews:234, tags:['brightening','gift','kit'] },
]

const CATEGORIES_FILTER = ['All', 'Serum', 'Moisturiser', 'Sunscreen', 'Cleanser', 'Treatment', 'Toner', 'Kit', 'Gel', 'Mist']
const BRANDS = ['All Brands', 'DermIQ', 'Minimalist', 'Plum', 'Pilgrim', 'Dot & Key']
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
]

const ANN_ITEMS = [
  '✨ FREE shipping on orders above ₹799',
  'Use code DERMIQ15 for 15% off',
  '🧠 Free AI Skin Analysis — 30 seconds',
  '👨‍⚕️ Consultations from ₹499',
  '🌿 100% Clean Ingredients',
  '🚚 Same-day dispatch before 2 PM',
]

export default function ShopPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBrand, setSelectedBrand] = useState('All Brands')
  const [sortBy, setSortBy] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      if (idx >= 0) { cart[idx].qty += 1 } else {
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, emoji: product.emoji, qty: 1 })
      }
      localStorage.setItem('dermiq_cart', JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
      toast.success(`Added to bag!`, { icon: '🛍️' })
    } catch { toast.error('Could not add to cart') }
  }

  const filtered = ALL_PRODUCTS
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => selectedBrand === 'All Brands' || p.brand === selectedBrand)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'newest') return b.id - a.id
      return 0
    })

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Announcement bar */}
      <div style={{ background: '#1A2E2B', color: '#fff', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ann-track">
          {[...ANN_ITEMS, ...ANN_ITEMS].map((item, i) => (
            <span key={i} style={{ padding: '0 40px', fontSize: 12, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              {item}<span style={{ marginLeft: 40, color: '#C8976A' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      <Navbar activePage="shop" />

      <div style={{ paddingTop: 106, paddingBottom: 100 }}>
        {/* Page header */}
        <div style={{ background: '#F7F3EE', padding: '40px 20px', textAlign: 'center', marginBottom: 0 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', marginBottom: 8 }}>Shop All Products</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280' }}>
              {filtered.length} products · Science-backed skincare for every skin type
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E8E0D8', padding: '0 20px', position: 'sticky', top: 70, zIndex: 40 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto', padding: '10px 0' }} className="no-scrollbar">
            {CATEGORIES_FILTER.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                  border: selectedCategory === cat ? '1.5px solid #2D5F5A' : '1.5px solid #E8E0D8',
                  background: selectedCategory === cat ? '#2D5F5A' : '#fff',
                  color: selectedCategory === cat ? '#fff' : '#1A1A1A',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                }}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }} className="shop-layout">
          <style>{`@media(max-width:768px){.shop-layout{grid-template-columns:1fr!important} .desktop-sidebar{display:none!important}}`}</style>

          {/* Sidebar */}
          <div className="desktop-sidebar" style={{ position: 'sticky', top: 130, background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', padding: 20 }}>
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A2E2B', display: 'block', marginBottom: 8 }}>Search</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1.5px solid #E8E0D8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: '#1A1A1A', background: '#FAFAF8' }}
                />
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A2E2B', display: 'block', marginBottom: 8 }}>Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E8E0D8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: '#1A1A1A', background: '#FAFAF8', cursor: 'pointer' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Brand filter */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A2E2B', display: 'block', marginBottom: 10 }}>Brand</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: 'none', textAlign: 'left',
                      background: selectedBrand === brand ? 'rgba(45,95,90,0.08)' : 'transparent',
                      color: selectedBrand === brand ? '#2D5F5A' : '#374151',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: selectedBrand === brand ? 600 : 400, cursor: 'pointer',
                    }}
                  >
                    {selectedBrand === brand && <span style={{ marginRight: 6, color: '#2D5F5A' }}>✓</span>}
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range note */}
            <div style={{ padding: '14px', borderRadius: 10, background: '#F7F3EE', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#6B7280', lineHeight: 1.6 }}>
              🌿 All DermIQ products are dermatologist-tested and cruelty-free.
            </div>
          </div>

          {/* Main content */}
          <div>
            {/* Mobile filter row */}
            <div className="md:hidden" style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }} >
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                />
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#fff', cursor: 'pointer', flexShrink: 0 }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Brand filter chips - mobile */}
            <div className="md:hidden" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                    border: selectedBrand === brand ? '1.5px solid #2D5F5A' : '1.5px solid #E8E0D8',
                    background: selectedBrand === brand ? '#2D5F5A' : '#fff',
                    color: selectedBrand === brand ? '#fff' : '#1A1A1A',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                  }}
                >{brand}</button>
              ))}
            </div>

            {/* Results count */}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Showing {filtered.length} of {ALL_PRODUCTS.length} products
            </p>

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A2E2B', marginBottom: 8 }}>No products found</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280' }}>Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 }}>
                {filtered.map(product => {
                  const disc = Math.round((1 - product.price / product.mrp) * 100)
                  return (
                    <div
                      key={product.id}
                      style={{ borderRadius: 16, border: '1px solid #E8E0D8', background: '#fff', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onClick={() => router.push(`/product/${product.id}`)}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
                    >
                      <div style={{ height: 160, background: 'linear-gradient(135deg, #F7F3EE, #E8E0D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <span style={{ fontSize: 56 }}>{product.emoji}</span>
                        {product.badge && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: product.badgeBg, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}>
                            {product.badge}
                          </span>
                        )}
                        <button
                          onClick={e => e.stopPropagation()}
                          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4856A" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </button>
                      </div>
                      <div style={{ padding: '10px 10px 12px' }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>{product.brand} · {product.category}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.35, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>★ {product.rating}</span>
                          <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>({product.reviews.toLocaleString()})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>₹{product.price}</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 4 }}>₹{product.mrp}</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#16A34A', fontWeight: 600, marginLeft: 4 }}>{disc}% off</span>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); addToCart(product) }}
                            style={{ width: 28, height: 28, borderRadius: 8, background: '#2D5F5A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileToolbar activePage="shop" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
