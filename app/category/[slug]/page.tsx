'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { ALL_PRODUCTS, MAIN_CATEGORIES, type Product } from '@/lib/products'

interface CartItem { id: number; qty: number }

const CATEGORY_CONFIG: Record<string, {
  label: string; description: string; heroImage: string;
  color: string; bg: string; lightBg: string;
  subcategories: string[]; concerns: string[]; skinTypes: string[]
}> = {
  skincare: {
    label: 'Skincare',
    description: 'Science-backed formulations for every skin concern. From cleansers to serums, build your perfect routine.',
    heroImage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&h=500&fit=crop&q=80',
    color: '#2D5F5A', bg: '#E8F5E9', lightBg: '#F0FAF0',
    subcategories: ['All', 'Serum', 'Moisturiser', 'Sunscreen', 'Cleanser', 'Treatment', 'Kit'],
    concerns: ['Dark spots', 'Acne', 'Anti-aging', 'Dryness', 'Dullness', 'Pores', 'Sensitivity'],
    skinTypes: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
  },
  bodycare: {
    label: 'Body Care',
    description: 'Nourish every inch. Rich butters, exfoliating scrubs, and targeted treatments for your body.',
    heroImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1400&h=500&fit=crop&q=80',
    color: '#C8976A', bg: '#FFF3E0', lightBg: '#FFF8F2',
    subcategories: ['All', 'Body Lotion', 'Body Scrub', 'Body Wash', 'Body Treatment', 'Body Butter'],
    concerns: ['Dryness', 'Stretch marks', 'Tanning', 'Rough skin', 'Cellulite'],
    skinTypes: ['Dry', 'Normal', 'Sensitive', 'Very Dry'],
  },
  lipscare: {
    label: 'Lips Care',
    description: 'Plump, protect, and perfect your pout. SPF lip care, serums, and treatments for beautiful lips.',
    heroImage: 'https://images.unsplash.com/photo-1586495777744-4e6b0c8b9e0f?w=1400&h=500&fit=crop&q=80',
    color: '#C2185B', bg: '#FCE4EC', lightBg: '#FFF0F5',
    subcategories: ['All', 'Lip Balm', 'Lip Serum', 'Lip Scrub', 'Lip Mask'],
    concerns: ['Chapped lips', 'Dark lips', 'Thin lips', 'Dryness', 'Lip lines'],
    skinTypes: ['All lip types'],
  },
  haircare: {
    label: 'Hair Care',
    description: 'From root to tip. Serums, oils, shampoos, and masks for strong, shiny, healthy hair.',
    heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&h=500&fit=crop&q=80',
    color: '#5C35D4', bg: '#EDE7F6', lightBg: '#F5F0FF',
    subcategories: ['All', 'Hair Serum', 'Scalp Oil', 'Shampoo', 'Hair Mask', 'Dry Shampoo'],
    concerns: ['Hair fall', 'Frizz', 'Dandruff', 'Damage', 'Thinning', 'Dullness'],
    skinTypes: ['All hair types', 'Oily scalp', 'Dry hair', 'Chemically treated'],
  },
  supplements: {
    label: 'Supplements',
    description: 'Beauty from within. Clinical-grade vitamins, collagen, and nutrients for skin, hair, and overall health.',
    heroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1400&h=500&fit=crop&q=80',
    color: '#D4A853', bg: '#FFF8E1', lightBg: '#FFFDF5',
    subcategories: ['All', 'Collagen', 'Hair & Nail Supplement', 'Skin Supplement', 'Omega-3', 'Probiotic'],
    concerns: ['Anti-aging', 'Hair growth', 'Skin glow', 'Gut health', 'Inflammation'],
    skinTypes: ['All'],
  },
  babycare: {
    label: 'Baby Care',
    description: 'Pure, safe, and gentle. Paediatrician-tested products for your little one\'s delicate skin.',
    heroImage: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1400&h=500&fit=crop&q=80',
    color: '#4ECDC4', bg: '#E0F7FA', lightBg: '#F0FFFE',
    subcategories: ['All', 'Baby Moisturiser', 'Baby Wash', 'Diaper Cream', 'Baby Sunscreen'],
    concerns: ['Dryness', 'Diaper rash', 'Sun protection', 'Gentle cleansing'],
    skinTypes: ['Baby skin', 'Sensitive'],
  },
  colorcosmetics: {
    label: 'Color Cosmetics',
    description: 'Make up, never cover up. Skincare-infused colour products that care while they colour.',
    heroImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&h=500&fit=crop&q=80',
    color: '#FF6B6B', bg: '#FFF3F3', lightBg: '#FFF8F8',
    subcategories: ['All', 'Tinted Moisturiser', 'Lip Colour', 'BB Cream', 'Concealer', 'Blush'],
    concerns: ['Natural coverage', 'Sun protection', 'Dark circles', 'Glow'],
    skinTypes: ['All skin types'],
  },
}

// Map URL slug → mainCategory key
function slugToMainCat(slug: string): string {
  const map: Record<string, string> = {
    'skincare': 'skincare',
    'bodycare': 'bodycare',
    'lips-care': 'lipscare',
    'haircare': 'haircare',
    'supplements': 'supplements',
    'baby-care': 'babycare',
    'color-cosmetics': 'colorcosmetics',
  }
  return map[slug] || slug
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const router = useRouter()
  const disc = Math.round((1 - product.price / product.mrp) * 100)
  const [wished, setWished] = useState(false)

  useEffect(() => {
    const wl: number[] = JSON.parse(localStorage.getItem('dermiq_wishlist') || '[]')
    setWished(wl.includes(product.id))
  }, [product.id])

  function toggleWish(e: React.MouseEvent) {
    e.stopPropagation()
    const wl: number[] = JSON.parse(localStorage.getItem('dermiq_wishlist') || '[]')
    const updated = wished ? wl.filter(id => id !== product.id) : [...wl, product.id]
    localStorage.setItem('dermiq_wishlist', JSON.stringify(updated))
    setWished(!wished)
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div
      style={{ borderRadius: 16, border: '1px solid #E8E0D8', background: '#fff', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div style={{ height: 200, position: 'relative', background: '#F7F3EE', overflow: 'hidden' }}>
        <Image src={product.image} alt={product.name} fill sizes="280px" style={{ objectFit: 'cover' }} />
        {product.badge && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: product.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}>
            {product.badge}
          </span>
        )}
        <button onClick={toggleWish} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? '#EF4444' : 'none'} stroke={wished ? '#EF4444' : '#D4856A'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        {disc > 0 && (
          <span style={{ position: 'absolute', bottom: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif' }}>
            -{disc}%
          </span>
        )}
      </div>
      <div style={{ padding: '12px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>{product.brand} · {product.category}</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.35, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>★ {product.rating}</span>
          <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>({product.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 800, color: '#1A2E2B' }}>₹{product.price}</span>
            {product.mrp > product.price && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.mrp}</span>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product) }}
            style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const mainCat = slugToMainCat(slug)
  const config = CATEGORY_CONFIG[mainCat]
  const router = useRouter()

  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedSub, setSelectedSub] = useState('All')
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dermiq_cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  function addToCart(product: Product) {
    const updated = cart.find(i => i.id === product.id)
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { id: product.id, qty: 1 }]
    setCart(updated)
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
  }

  if (!config) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <h1 style={{ fontSize: 32 }}>Category not found</h1>
        <Link href="/" style={{ color: '#2D5F5A', marginTop: 16 }}>Go Home</Link>
      </div>
    )
  }

  // Filter products
  let products = ALL_PRODUCTS.filter(p => p.mainCategory === mainCat)
  if (selectedSub !== 'All') products = products.filter(p => p.category === selectedSub)
  if (selectedConcerns.length > 0) products = products.filter(p => selectedConcerns.some(c => p.concerns.includes(c)))
  if (selectedSkinTypes.length > 0) products = products.filter(p => selectedSkinTypes.some(st => p.skinTypes.includes(st)))
  products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

  // Sort
  if (sortBy === 'popular') products = [...products].sort((a, b) => b.reviews - a.reviews)
  else if (sortBy === 'rating') products = [...products].sort((a, b) => b.rating - a.rating)
  else if (sortBy === 'price-asc') products = [...products].sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-desc') products = [...products].sort((a, b) => b.price - a.price)
  else if (sortBy === 'discount') products = [...products].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden', marginTop: 64 }}>
        <Image src={config.heroImage} alt={config.label} fill style={{ objectFit: 'cover' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${config.color}CC 0%, ${config.color}88 50%, transparent 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 40px', maxWidth: 600 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {MAIN_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug === 'lipscare' ? 'lips-care' : cat.slug === 'babycare' ? 'baby-care' : cat.slug === 'colorcosmetics' ? 'color-cosmetics' : cat.slug}`}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: cat.slug === mainCat ? '#fff' : 'rgba(255,255,255,0.25)', color: cat.slug === mainCat ? config.color : '#fff', fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}
              >
                {cat.emoji} {cat.label}
              </Link>
            ))}
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            {config.label}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 20 }}>{config.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '6px 16px', fontSize: 14, fontWeight: 600 }}>
              {ALL_PRODUCTS.filter(p => p.mainCategory === mainCat).length} Products
            </span>
            <button
              onClick={() => { setSelectedConcerns([]); setSelectedSkinTypes([]); setSortBy('popular'); setSelectedSub('All') }}
              style={{ background: '#fff', color: config.color, border: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Subcategory Filter Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E0D8', padding: '0 20px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
          {config.subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              style={{ flexShrink: 0, padding: '7px 18px', borderRadius: 20, border: `1px solid ${selectedSub === sub ? config.color : '#E8E0D8'}`, background: selectedSub === sub ? config.color : '#fff', color: selectedSub === sub ? '#fff' : '#1A2E2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}
            >
              {sub}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#1A2E2B', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <div style={{ width: 240, flexShrink: 0, position: 'sticky', top: 120 }}>
          {/* Price Range */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#1A2E2B', marginBottom: 12 }}>Price Range</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 – ₹1000', min: 500, max: 1000 },
                { label: '₹1000 – ₹2000', min: 1000, max: 2000 },
                { label: '₹2000+', min: 2000, max: 99999 },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => setPriceRange([p.min, p.max])}
                  style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${priceRange[0] === p.min && priceRange[1] === p.max ? config.color : '#E8E0D8'}`, background: priceRange[0] === p.min && priceRange[1] === p.max ? config.bg : '#fff', color: priceRange[0] === p.min && priceRange[1] === p.max ? config.color : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setPriceRange([0, 5000])}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #E8E0D8', background: '#fff', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Concerns */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#1A2E2B', marginBottom: 12 }}>Skin Concerns</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {config.concerns.map(concern => (
                <label key={concern} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedConcerns.includes(concern)}
                    onChange={() => setSelectedConcerns(prev => prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern])}
                    style={{ width: 14, height: 14, accentColor: config.color }}
                  />
                  <span style={{ fontSize: 13, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>{concern}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skin Types */}
          {config.skinTypes.length > 1 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 16 }}>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#1A2E2B', marginBottom: 12 }}>Skin Type</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {config.skinTypes.map(st => (
                  <label key={st} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSkinTypes.includes(st)}
                      onChange={() => setSelectedSkinTypes(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st])}
                      style={{ width: 14, height: 14, accentColor: config.color }}
                    />
                    <span style={{ fontSize: 13, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>{st}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          {/* Active Filters */}
          {(selectedConcerns.length > 0 || selectedSkinTypes.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {selectedConcerns.map(c => (
                <span key={c} style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}40`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c}
                  <button onClick={() => setSelectedConcerns(prev => prev.filter(x => x !== c))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: config.color, fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
              {selectedSkinTypes.map(st => (
                <span key={st} style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}40`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {st}
                  <button onClick={() => setSelectedSkinTypes(prev => prev.filter(x => x !== st))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: config.color, fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <button onClick={() => { setSelectedConcerns([]); setSelectedSkinTypes([]); setPriceRange([0, 5000]) }} style={{ background: 'none', border: '1px solid #E8E0D8', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>
                Clear all
              </button>
            </div>
          )}

          {/* Results count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
              Showing <strong style={{ color: '#1A2E2B' }}>{products.length}</strong> products
            </p>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 8 }}>No products found</h3>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Try adjusting your filters</p>
              <button
                onClick={() => { setSelectedConcerns([]); setSelectedSkinTypes([]); setPriceRange([0, 5000]); setSelectedSub('All') }}
                style={{ background: config.color, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Categories Section */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E0D8', padding: '48px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 24, textAlign: 'center' }}>Shop All Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {MAIN_CATEGORIES.map(cat => {
              const catSlug = cat.slug === 'lipscare' ? 'lips-care' : cat.slug === 'babycare' ? 'baby-care' : cat.slug === 'colorcosmetics' ? 'color-cosmetics' : cat.slug
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${catSlug}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 12px', borderRadius: 12, background: cat.slug === mainCat ? cat.bg : '#FAFAF8', border: `2px solid ${cat.slug === mainCat ? cat.color : '#E8E0D8'}`, textDecoration: 'none', transition: 'all 0.15s', textAlign: 'center' }}
                >
                  <span style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: cat.slug === mainCat ? cat.color : '#1A2E2B', fontFamily: 'DM Sans, sans-serif' }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>{ALL_PRODUCTS.filter(p => p.mainCategory === cat.slug).length} items</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileToolbar />
    </div>
  )
}
