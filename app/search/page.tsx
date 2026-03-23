'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, MAIN_CATEGORIES, type Product } from '@/lib/products'

const POPULAR_SEARCHES = [
  'Vitamin C Serum', 'Niacinamide', 'SPF 50', 'Retinol', 'Hyaluronic Acid',
  'Body Lotion', 'Anti-aging', 'Acne', 'Dark Spots', 'Hair Growth',
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<Product[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedCat, setSelectedCat] = useState('All')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('dermiq_recent_searches') || '[]')
    setRecentSearches(recent)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    if (q) doSearch(q)
  }, [searchParams])

  function doSearch(q: string) {
    if (!q.trim()) { setResults([]); return }
    const lower = q.toLowerCase()
    const found = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.shortDesc.toLowerCase().includes(lower) ||
      p.tags.some(t => t.includes(lower)) ||
      p.concerns.some(c => c.toLowerCase().includes(lower)) ||
      p.ingredients.some(i => i.toLowerCase().includes(lower))
    )
    setResults(found)

    // Save to recent
    const recent = JSON.parse(localStorage.getItem('dermiq_recent_searches') || '[]')
    const updated = [q, ...recent.filter((r: string) => r !== q)].slice(0, 8)
    localStorage.setItem('dermiq_recent_searches', JSON.stringify(updated))
    setRecentSearches(updated)
  }

  function handleSearch(q: string) {
    setQuery(q)
    router.push(`/search?q=${encodeURIComponent(q)}`)
    doSearch(q)
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
  }

  let filtered = results
    .filter(p => selectedCat === 'All' || p.mainCategory === selectedCat || p.category === selectedCat)
    .filter(p => p.price <= maxPrice)
    .filter(p => p.rating >= minRating)

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  else if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  else if (sortBy === 'discount') filtered = [...filtered].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 20px 80px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #2D5F5A', display: 'flex', alignItems: 'center', padding: '4px 4px 4px 16px', gap: 8, maxWidth: 680, boxShadow: '0 4px 20px rgba(45,95,90,0.15)' }}>
            <span style={{ fontSize: 18, color: '#9CA3AF' }}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search products, brands, ingredients..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: 'DM Sans, sans-serif', color: '#1A2E2B', background: 'transparent' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, padding: '0 4px' }}>×</button>
            )}
            <button
              onClick={() => handleSearch(query)}
              style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
        </div>

        {query === '' ? (
          /* No query state */
          <div>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#374151' }}>Recent Searches</h3>
                  <button onClick={() => { localStorage.removeItem('dermiq_recent_searches'); setRecentSearches([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12 }}>Clear All</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => handleSearch(s)} style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 20, padding: '7px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                      🕐 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Popular Searches</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {POPULAR_SEARCHES.map(s => (
                  <button key={s} onClick={() => handleSearch(s)} style={{ background: '#F7F3EE', border: '1px solid #E8E0D8', borderRadius: 20, padding: '7px 16px', fontSize: 13, cursor: 'pointer', color: '#2D5F5A', fontWeight: 600 }}>
                    🔥 {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending categories */}
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 20 }}>Browse by Category</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {MAIN_CATEGORIES.map(cat => {
                  const catSlug = cat.slug === 'lipscare' ? 'lips-care' : cat.slug === 'babycare' ? 'baby-care' : cat.slug === 'colorcosmetics' ? 'color-cosmetics' : cat.slug
                  return (
                    <Link key={cat.slug} href={`/category/${catSlug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', borderRadius: 14, background: '#fff', border: '1px solid #E8E0D8', textDecoration: 'none' }}>
                      <span style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B' }}>{cat.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Filters row */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, marginRight: 4 }}>Filter:</span>
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
                <option value="All">All Categories</option>
                {MAIN_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
              <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={{ border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
                <option value={0}>Any Rating</option>
                <option value={4}>4★ & above</option>
                <option value={4.5}>4.5★ & above</option>
              </select>
              <select value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
                <option value={5000}>Any Price</option>
                <option value={500}>Under ₹500</option>
                <option value={1000}>Under ₹1000</option>
                <option value={2000}>Under ₹2000</option>
              </select>
              <div style={{ marginLeft: 'auto' }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
              {filtered.length > 0 ? (
                <><strong style={{ color: '#1A2E2B' }}>{filtered.length}</strong> results for "<strong style={{ color: '#2D5F5A' }}>{query}</strong>"</>
              ) : (
                <>No results for "<strong>{query}</strong>"</>
              )}
            </p>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 8 }}>No products found</h3>
                <p style={{ color: '#6B7280', marginBottom: 20 }}>Try different keywords or browse our categories</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {POPULAR_SEARCHES.slice(0, 5).map(s => (
                    <button key={s} onClick={() => handleSearch(s)} style={{ background: '#F7F3EE', border: '1px solid #E8E0D8', borderRadius: 20, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#2D5F5A', fontWeight: 600 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {filtered.map(product => {
                  const disc = Math.round((1 - product.price / product.mrp) * 100)
                  return (
                    <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} onClick={() => router.push(`/product/${product.id}`)}>
                      <div style={{ height: 180, position: 'relative', background: '#F7F3EE' }}>
                        <Image src={product.image} alt={product.name} fill sizes="220px" style={{ objectFit: 'cover' }} />
                        {product.badge && <span style={{ position: 'absolute', top: 10, left: 10, background: product.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{product.badge}</span>}
                        {disc > 0 && <span style={{ position: 'absolute', bottom: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 12 }}>-{disc}%</span>}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand} · {product.category}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>★ {product.rating}</span>
                          <span style={{ fontSize: 11, color: '#6B7280' }}>({product.reviews.toLocaleString()})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A2E2B' }}>₹{product.price}</span>
                            {product.mrp > product.price && <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.mrp}</span>}
                          </div>
                          <button onClick={e => { e.stopPropagation(); addToCart(product) }} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <MobileToolbar />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
