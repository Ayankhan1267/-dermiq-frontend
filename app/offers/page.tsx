'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, MAIN_CATEGORIES, type Product } from '@/lib/products'

const COUPONS = [
  { code: 'DERMIQ15', discount: '15% Off', desc: 'Flat 15% on your order', color: '#2D5F5A', bg: '#E8F5E9', min: 'Min. order ₹499' },
  { code: 'FREESHIP', discount: 'Free Shipping', desc: 'Free delivery on any order', color: '#5C35D4', bg: '#EDE7F6', min: 'No minimum order' },
  { code: 'FIRST20', discount: '20% Off', desc: 'First order exclusive', color: '#C2185B', bg: '#FCE4EC', min: 'For new customers' },
  { code: 'BUNDLE30', discount: '30% Off', desc: 'On combo / kit purchases', color: '#D4A853', bg: '#FFF8E1', min: 'On 3+ products' },
]

const BUNDLES = [
  {
    title: 'Glow Starter Kit',
    desc: 'Vitamin C Serum + Niacinamide Serum + Mineral SPF',
    originalPrice: 1797,
    bundlePrice: 1258,
    savings: 30,
    productIds: [1, 7, 3],
    color: '#2D5F5A',
    bg: '#E8F5E9',
    emoji: '✨',
  },
  {
    title: 'Anti-Aging Power Trio',
    desc: 'Retinol Serum + Peptide Eye Cream + Ceramide Cream',
    originalPrice: 2547,
    bundlePrice: 1783,
    savings: 30,
    productIds: [5, 11, 6],
    color: '#5C35D4',
    bg: '#EDE7F6',
    emoji: '🕰️',
  },
  {
    title: 'Acne Clear Routine',
    desc: 'Salicylic Cleanser + Niacinamide Serum + Hydra Gel',
    originalPrice: 1197,
    bundlePrice: 838,
    savings: 30,
    productIds: [13, 7, 2],
    color: '#C8976A',
    bg: '#FFF3E0',
    emoji: '🌿',
  },
]

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

export default function OffersPage() {
  const router = useRouter()
  const flashEnd = new Date(Date.now() + 4 * 3600000 + 37 * 60000)
  const { hours, minutes, seconds } = useCountdown(flashEnd)

  function copyCoupon(code: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(code)
    toast.success(`Coupon ${code} copied!`)
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added!`)
  }

  const dealOfDay = ALL_PRODUCTS.find(p => p.id === 14)!
  const flashDeals = ALL_PRODUCTS.filter(p => [1, 7, 3, 12].includes(p.id))

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden', marginTop: 64, background: 'linear-gradient(135deg, #2D5F5A 0%, #1A2E2B 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
          <span style={{ background: '#C8976A', color: '#fff', borderRadius: 20, padding: '5px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Limited Time Deals
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>
            Best Deals on Skincare
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 28 }}>
            Save up to 40% on India's most-loved skincare products
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#coupons" style={{ background: '#C8976A', color: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              🎁 Grab Coupons
            </Link>
            <Link href="#deals" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              Shop Deals
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,151,106,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(61,122,116,0.2)' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Coupons Section */}
        <div id="coupons" style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#1A2E2B', marginBottom: 6 }}>Active Coupons</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Copy and apply at checkout</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {COUPONS.map(coupon => (
              <div key={coupon.code} style={{ background: coupon.bg, borderRadius: 16, border: `2px dashed ${coupon.color}50`, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: `${coupon.color}15` }} />
                <div style={{ fontSize: 28, fontWeight: 800, color: coupon.color, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>{coupon.discount}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#374151', marginBottom: 4 }}>{coupon.desc}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>{coupon.min}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 800, color: coupon.color, letterSpacing: 1, border: `1px solid ${coupon.color}30` }}>
                    {coupon.code}
                  </code>
                  <button
                    onClick={() => copyCoupon(coupon.code)}
                    style={{ background: coupon.color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flash Sale */}
        <div id="deals" style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#1A2E2B' }}>⚡ Flash Sale</h2>
                <span style={{ background: '#EF4444', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>LIVE</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Ends in</p>
            </div>
            {/* Countdown */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[
                { val: hours, label: 'HRS' },
                { val: minutes, label: 'MIN' },
                { val: seconds, label: 'SEC' },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ background: '#1A2E2B', borderRadius: 8, padding: '8px 12px', textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#C8976A', fontFamily: 'DM Sans, sans-serif' }}>
                      {String(item.val).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>{item.label}</div>
                  </div>
                  {i < 2 && <span style={{ color: '#1A2E2B', fontWeight: 700, fontSize: 18 }}>:</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {flashDeals.map(product => {
              const disc = Math.round((1 - product.price / product.mrp) * 100)
              return (
                <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
                  <div style={{ height: 180, position: 'relative', background: '#F7F3EE' }}>
                    <Image src={product.image} alt={product.name} fill sizes="220px" style={{ objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>-{disc}% OFF</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2E2B' }}>₹{product.price}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.mrp}</span>
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
        </div>

        {/* Deal of the Day */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#1A2E2B', marginBottom: 20 }}>🌟 Deal of the Day</h2>
          <div style={{ background: 'linear-gradient(135deg, #F7F3EE 0%, #E8F5E9 100%)', borderRadius: 20, border: '1px solid #E8E0D8', padding: 28, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 200, height: 200, borderRadius: 16, overflow: 'hidden', background: '#fff', flexShrink: 0, position: 'relative' }}>
              <Image src={dealOfDay.image} alt={dealOfDay.name} fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ background: '#D4A853', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>DEAL OF THE DAY</span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', margin: '10px 0 8px', lineHeight: 1.3 }}>{dealOfDay.name}</h3>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{dealOfDay.shortDesc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#2D5F5A' }}>₹{dealOfDay.price}</span>
                <span style={{ fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{dealOfDay.mrp}</span>
                <span style={{ background: '#EF4444', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                  Save {Math.round((1 - dealOfDay.price / dealOfDay.mrp) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => addToCart(dealOfDay)} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Add to Cart
                </button>
                <button onClick={() => router.push(`/product/${dealOfDay.id}`)} style={{ background: '#fff', color: '#2D5F5A', border: '1px solid #2D5F5A', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Deals */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#1A2E2B', marginBottom: 8 }}>🎁 Bundle Deals</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Save 30% when you buy these curated combos together</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {BUNDLES.map(bundle => {
              const products = bundle.productIds.map(id => ALL_PRODUCTS.find(p => p.id === id)).filter(Boolean) as Product[]
              return (
                <div key={bundle.title} style={{ background: bundle.bg, borderRadius: 20, border: `1px solid ${bundle.color}30`, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{bundle.emoji}</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 6 }}>{bundle.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{bundle.desc}</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {products.map(p => (
                      <div key={p.id} style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', border: '2px solid #fff', position: 'relative' }}>
                        <Image src={p.image} alt={p.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: bundle.color }}>₹{bundle.bundlePrice}</span>
                    <span style={{ fontSize: 15, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{bundle.originalPrice}</span>
                    <span style={{ background: '#EF4444', color: '#fff', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                      Save {bundle.savings}%
                    </span>
                  </div>
                  <button
                    onClick={() => { products.forEach(p => addToCart(p)); toast.success(`${bundle.title} added to cart!`) }}
                    style={{ width: '100%', background: bundle.color, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add Bundle to Cart
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Deals */}
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#1A2E2B', marginBottom: 24 }}>Deals by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {MAIN_CATEGORIES.map(cat => {
              const catSlug = cat.slug === 'lipscare' ? 'lips-care' : cat.slug === 'babycare' ? 'baby-care' : cat.slug === 'colorcosmetics' ? 'color-cosmetics' : cat.slug
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${catSlug}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', borderRadius: 14, background: '#fff', border: '1px solid #E8E0D8', textDecoration: 'none', transition: 'all 0.15s' }}
                >
                  <span style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B', marginBottom: 4, textAlign: 'center' }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Up to 40% off</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <MobileToolbar />
    </div>
  )
}
