'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, type Product } from '@/lib/products'

interface CartItem { id: number; qty: number }

const COUPONS: Record<string, { type: 'percent' | 'shipping'; value: number; label: string }> = {
  'DERMIQ15': { type: 'percent', value: 15, label: '15% off on your order' },
  'FREESHIP': { type: 'shipping', value: 0, label: 'Free shipping on this order' },
  'FIRST20': { type: 'percent', value: 20, label: '20% off — first order special' },
}

const DELIVERY_CHARGE = 79
const GST_RATE = 0.18

function RecommendedCard({ product }: { product: Product }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      style={{ width: 160, flexShrink: 0, cursor: 'pointer', borderRadius: 12, border: '1px solid #E8E0D8', background: '#fff', overflow: 'hidden' }}
    >
      <div style={{ height: 140, position: 'relative', background: '#F7F3EE' }}>
        <Image src={product.image} alt={product.name} fill sizes="160px" style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ padding: 10 }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand}</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {product.name}
        </p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 800, color: '#2D5F5A' }}>₹{product.price}</p>
      </div>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('dermiq_cart')
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch {}
    }
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function saveCart(updated: CartItem[]) {
    setCart(updated)
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
  }

  function updateQty(id: number, delta: number) {
    const updated = cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    saveCart(updated)
  }

  function removeItem(id: number) {
    const product = ALL_PRODUCTS.find(p => p.id === id)
    saveCart(cart.filter(i => i.id !== id))
    toast.success(`${product?.name || 'Item'} removed from cart`)
  }

  function applyCoupon() {
    setCouponError('')
    const code = couponCode.trim().toUpperCase()
    if (COUPONS[code]) {
      setAppliedCoupon(code)
      toast.success(`Coupon ${code} applied! ${COUPONS[code].label}`)
    } else {
      setCouponError('Invalid coupon code. Try DERMIQ15 or FREESHIP.')
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const cartProducts = cart.map(item => {
    const product = ALL_PRODUCTS.find(p => p.id === item.id)
    return product ? { product, qty: item.qty } : null
  }).filter(Boolean) as { product: Product; qty: number }[]

  const subtotal = cartProducts.reduce((s, { product, qty }) => s + product.price * qty, 0)
  const totalMrp = cartProducts.reduce((s, { product, qty }) => s + product.mrp * qty, 0)
  const savedFromMrp = totalMrp - subtotal

  let discount = 0
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    const c = COUPONS[appliedCoupon]
    if (c.type === 'percent') discount = Math.round(subtotal * c.value / 100)
  }

  const afterDiscount = subtotal - discount
  const freeShipping = appliedCoupon === 'FREESHIP' || afterDiscount >= 799
  const delivery = freeShipping ? 0 : DELIVERY_CHARGE
  const gst = Math.round(afterDiscount * GST_RATE)
  const total = afterDiscount + delivery + gst

  const recommended = ALL_PRODUCTS.filter(p => !cart.map(i => i.id).includes(p.id) && p.mainCategory === 'skincare').slice(0, 6)

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 20px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', marginBottom: 4 }}>
            Your Cart 🛒
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            {cartProducts.length > 0 ? `${cartProducts.length} item${cartProducts.length > 1 ? 's' : ''} in your bag` : 'Your cart is empty'}
          </p>
        </div>

        {cartProducts.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 12 }}>Your cart is empty</h2>
            <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Discover science-backed skincare products trusted by 50,000+ customers.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Shop Now
              </Link>
              <Link href="/skin-quiz" style={{ background: '#F7F3EE', color: '#2D5F5A', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1px solid #E8E0D8' }}>
                Take Skin Quiz
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
            {/* Cart Items */}
            <div>
              {/* Offers banner */}
              {!freeShipping && afterDiscount < 799 && (
                <div style={{ background: '#F0FAF4', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🚚</span>
                  <p style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                    Add ₹{799 - afterDiscount} more to get FREE delivery!
                  </p>
                </div>
              )}
              {freeShipping && (
                <div style={{ background: '#F0FAF4', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <p style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>You have FREE delivery on this order!</p>
                </div>
              )}

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cartProducts.map(({ product, qty }) => (
                  <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', padding: isMobile ? 12 : 16, display: 'flex', gap: isMobile ? 10 : 16, alignItems: 'flex-start' }}>
                    {/* Image */}
                    <div
                      style={{ width: isMobile ? 70 : 90, height: isMobile ? 70 : 90, borderRadius: 10, overflow: 'hidden', background: '#F7F3EE', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      <Image src={product.image} alt={product.name} width={90} height={90} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand} · {product.category}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 2, cursor: 'pointer', lineHeight: 1.4 }} onClick={() => router.push(`/product/${product.id}`)}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>{product.size}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #E8E0D8', borderRadius: 8, overflow: 'hidden' }}>
                          <button onClick={() => updateQty(product.id, -1)} style={{ width: 32, height: 32, background: '#F7F3EE', border: 'none', cursor: 'pointer', fontSize: 16, color: '#2D5F5A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>{qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} style={{ width: 32, height: 32, background: '#F7F3EE', border: 'none', cursor: 'pointer', fontSize: 16, color: '#2D5F5A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2E2B' }}>₹{product.price * qty}</span>
                          {product.mrp > product.price && (
                            <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.mrp * qty}</span>
                          )}
                        </div>

                        {/* Remove */}
                        <button onClick={() => removeItem(product.id)} style={{ background: 'none', border: '1px solid #FEE2E2', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended */}
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 16 }}>Complete Your Routine</h2>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                  {recommended.map(p => <RecommendedCard key={p.id} product={p} />)}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ background: '#fff', borderRadius: isMobile ? 0 : 20, border: isMobile ? 'none' : '1px solid #E8E0D8', borderTop: isMobile ? '1px solid #E8E0D8' : undefined, padding: isMobile ? '20px 0 0' : 24, position: isMobile ? 'static' : 'sticky', top: isMobile ? undefined : 100 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 20 }}>Order Summary</h2>

              {/* Coupon */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B', marginBottom: 8 }}>Apply Coupon</p>
                {appliedCoupon ? (
                  <div style={{ background: '#F0FAF4', border: '1px solid #A7F3D0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>🎁 {appliedCoupon}</span>
                      <p style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{COUPONS[appliedCoupon].label}</p>
                    </div>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value); setCouponError('') }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter coupon code"
                        style={{ flex: 1, border: '1px solid #E8E0D8', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                      />
                      <button onClick={applyCoupon} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Apply
                      </button>
                    </div>
                    {couponError && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>{couponError}</p>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {['DERMIQ15', 'FREESHIP'].map(code => (
                        <button key={code} onClick={() => { setCouponCode(code); setCouponError('') }} style={{ background: '#F7F3EE', border: '1px dashed #C8976A', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#C8976A', fontWeight: 700, cursor: 'pointer' }}>
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E8E0D8', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal ({cartProducts.reduce((s, { qty }) => s + qty, 0)} items)</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A2E2B' }}>₹{subtotal}</span>
                </div>
                {savedFromMrp > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>MRP Discount</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>-₹{savedFromMrp}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>Coupon ({appliedCoupon})</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>-₹{discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>Delivery</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: freeShipping ? '#10B981' : '#1A2E2B' }}>
                    {freeShipping ? 'FREE' : `₹${DELIVERY_CHARGE}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>GST (18%)</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A2E2B' }}>₹{gst}</span>
                </div>

                <div style={{ borderTop: '2px solid #E8E0D8', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2E2B' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#2D5F5A' }}>₹{total}</span>
                </div>

                {(savedFromMrp + discount) > 0 && (
                  <div style={{ background: '#F0FAF4', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>
                      You save ₹{savedFromMrp + discount} on this order! 🎉
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/checkout')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16, fontFamily: 'DM Sans, sans-serif' }}
              >
                Proceed to Checkout →
              </button>
              <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>
                Secure checkout · 256-bit SSL encryption
              </p>

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8E0D8' }}>
                {['🔒 Secure', '🚚 Fast Ship', '↩️ 7-Day Return'].map(badge => (
                  <span key={badge} style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>{badge}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileToolbar />
    </div>
  )
}
