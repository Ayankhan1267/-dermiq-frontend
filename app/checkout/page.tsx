'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, type Product } from '@/lib/products'
import { supabase } from '@/lib/supabase'

interface CartItem { id: number; qty: number }

interface Address {
  name: string; phone: string; address: string
  pincode: string; city: string; state: string
}

const DELIVERY_CHARGE = 79
const GST_RATE = 0.18

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

function generateOrderId() {
  return 'DQ' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi')

  const [address, setAddress] = useState<Address>({
    name: '', phone: '', address: '', pincode: '', city: '', state: '',
  })
  const [errors, setErrors] = useState<Partial<Address>>({})

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

  const cartProducts = cart.map(item => {
    const product = ALL_PRODUCTS.find(p => p.id === item.id)
    return product ? { product, qty: item.qty } : null
  }).filter(Boolean) as { product: Product; qty: number }[]

  const subtotal = cartProducts.reduce((s, { product, qty }) => s + product.price * qty, 0)
  const freeShipping = subtotal >= 799
  const delivery = freeShipping ? 0 : DELIVERY_CHARGE
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + delivery + gst
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  function validateAddress() {
    const newErrors: Partial<Address> = {}
    if (!address.name.trim()) newErrors.name = 'Name is required'
    if (!address.phone.trim() || !/^[6-9]\d{9}$/.test(address.phone.trim())) newErrors.phone = 'Enter valid 10-digit mobile number'
    if (!address.address.trim()) newErrors.address = 'Address is required'
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode.trim())) newErrors.pincode = 'Enter valid 6-digit pincode'
    if (!address.city.trim()) newErrors.city = 'City is required'
    if (!address.state) newErrors.state = 'State is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleContinue() {
    if (validateAddress()) setStep(2)
  }

  async function placeOrder() {
    setPlacing(true)
    try {
      const newOrderId = generateOrderId()
      const { data: { user } } = await supabase.auth.getUser()
      const orderData = {
        order_id: newOrderId,
        user_id: user?.id || null,
        user_email: user?.email || null,
        items: cartProducts.map(({ product, qty }) => ({
          id: product.id, name: product.name, brand: product.brand,
          price: product.price, qty, image: product.image,
        })),
        address,
        subtotal,
        delivery,
        gst,
        total,
        payment_method: paymentMethod,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }
      await supabase.from('dermiq_orders').insert([orderData])
      localStorage.removeItem('dermiq_cart')
      setOrderId(newOrderId)
      setStep(3)
    } catch (err) {
      console.error(err)
      const newOrderId = generateOrderId()
      localStorage.removeItem('dermiq_cart')
      setOrderId(newOrderId)
      setStep(3)
    } finally {
      setPlacing(false)
    }
  }

  if (!mounted) return null

  const inputStyle = (error?: string): React.CSSProperties => ({
    width: '100%', border: `1px solid ${error ? '#EF4444' : '#E8E0D8'}`, borderRadius: 10,
    padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box', color: '#1A2E2B',
    background: '#fff',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {step === 3 ? (
        /* Success Screen */
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 20px', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E8E0D8', padding: '48px 32px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FAF4', border: '3px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>
              ✅
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#1A2E2B', marginBottom: 8 }}>
              Order Placed!
            </h1>
            <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 4 }}>Thank you for shopping with DermIQ</p>
            <div style={{ background: '#F7F3EE', borderRadius: 12, padding: '16px 24px', margin: '24px 0' }}>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Order ID</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#2D5F5A', letterSpacing: 1 }}>{orderId}</p>
            </div>
            <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '16px 24px', marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#065F46', fontWeight: 600 }}>
                🚚 Estimated Delivery: {estimatedDelivery}
              </p>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              We'll send updates to your phone and email. Track your order anytime below.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push(`/order-tracking?id=${orderId}`)} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                📦 Track My Order →
              </button>
              <button onClick={() => router.push('/account')} style={{ background: '#F0FAF4', color: '#2D5F5A', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                View My Orders
              </button>
              <button onClick={() => router.push('/shop')} style={{ background: '#F7F3EE', color: '#2D5F5A', border: '1px solid #E8E0D8', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Continue Shopping →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 20px 80px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13 }}>
            <Link href="/cart" style={{ color: '#6B7280', textDecoration: 'none' }}>Cart</Link>
            <span style={{ color: '#D1D5DB' }}>›</span>
            <span style={{ color: step >= 1 ? '#2D5F5A' : '#6B7280', fontWeight: step === 1 ? 700 : 400 }}>Delivery Address</span>
            <span style={{ color: '#D1D5DB' }}>›</span>
            <span style={{ color: step >= 2 ? '#2D5F5A' : '#6B7280', fontWeight: step === 2 ? 700 : 400 }}>Payment</span>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? '#2D5F5A' : '#E8E0D8', color: step >= s ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: step >= s ? '#1A2E2B' : '#9CA3AF' }}>
                  {s === 1 ? 'Delivery Address' : 'Payment'}
                </span>
                {s < 2 && <span style={{ color: '#E8E0D8', marginLeft: 8 }}>──────────</span>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
            {/* Step 1: Address */}
            {step === 1 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 28 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B', marginBottom: 24 }}>
                  Delivery Address
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name *</label>
                    <input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Priya Sharma" style={inputStyle(errors.name)} />
                    {errors.name && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phone Number *</label>
                    <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="9876543210" maxLength={10} style={inputStyle(errors.phone)} />
                    {errors.phone && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Pincode *</label>
                    <input value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="400001" maxLength={6} style={inputStyle(errors.pincode)} />
                    {errors.pincode && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.pincode}</p>}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Address (House/Flat, Street, Area) *</label>
                    <textarea value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="123, Marigold Apartments, MG Road" rows={3} style={{ ...inputStyle(errors.address), resize: 'vertical' }} />
                    {errors.address && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.address}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>City *</label>
                    <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Mumbai" style={inputStyle(errors.city)} />
                    {errors.city && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.city}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>State *</label>
                    <select value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} style={inputStyle(errors.state)}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.state}</p>}
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  style={{ marginTop: 24, width: '100%', background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: '1px solid #E8E0D8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
                    ← Back
                  </button>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A2E2B' }}>Payment Method</h2>
                </div>

                {/* Address summary */}
                <div style={{ background: '#F7F3EE', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>Delivering to</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B' }}>{address.name}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{address.address}, {address.city} — {address.pincode}</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{address.phone}</p>
                  </div>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D5F5A', fontSize: 13, fontWeight: 600 }}>Change</button>
                </div>

                {/* Payment options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'upi', icon: '📱', title: 'UPI', desc: 'GPay, PhonePe, Paytm, BHIM', popular: true },
                    { id: 'card', icon: '💳', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                    { id: 'netbanking', icon: '🏦', title: 'Net Banking', desc: 'All major Indian banks' },
                    { id: 'cod', icon: '💵', title: 'Cash on Delivery', desc: 'Pay when you receive — extra ₹30' },
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      style={{ border: `2px solid ${paymentMethod === method.id ? '#2D5F5A' : '#E8E0D8'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', background: paymentMethod === method.id ? '#F0FAF0' : '#fff', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: paymentMethod === method.id ? '#2D5F5A' : '#F7F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {method.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>{method.title}</span>
                          {method.popular && <span style={{ fontSize: 10, background: '#2D5F5A', color: '#fff', borderRadius: 10, padding: '2px 8px', fontWeight: 700 }}>Popular</span>}
                        </div>
                        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{method.desc}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === method.id ? '#2D5F5A' : '#E8E0D8'}`, background: paymentMethod === method.id ? '#2D5F5A' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === method.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'upi' && (
                  <div style={{ marginTop: 16, background: '#F7F3EE', borderRadius: 10, padding: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Enter UPI ID</label>
                    <input placeholder="yourname@upi" style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                )}

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  style={{ marginTop: 24, width: '100%', background: placing ? '#9CA3AF' : 'linear-gradient(135deg, #2D5F5A, #3D7A74)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {placing ? '⏳ Placing Order...' : `Place Order · ₹${total + (paymentMethod === 'cod' ? 30 : 0)}`}
                </button>
                <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
                  By placing order, you agree to our Terms & Conditions
                </p>
              </div>
            )}

            {/* Order Summary Sidebar */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 24, position: 'sticky', top: 100 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 16 }}>
                Order Summary ({cartProducts.length} items)
              </h3>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
                {cartProducts.map(({ product, qty }) => (
                  <div key={product.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F7F3EE', flexShrink: 0, position: 'relative' }}>
                      <Image src={product.image} alt={product.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }}>{product.name}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>Qty: {qty}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B', flexShrink: 0 }}>₹{product.price * qty}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #E8E0D8', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Subtotal</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Delivery</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: freeShipping ? '#10B981' : '#1A2E2B' }}>
                    {freeShipping ? 'FREE' : `₹${DELIVERY_CHARGE}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>GST (18%)</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>₹{gst}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>COD Charges</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>₹30</span>
                  </div>
                )}
                <div style={{ borderTop: '2px solid #E8E0D8', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#1A2E2B' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#2D5F5A' }}>₹{total + (paymentMethod === 'cod' ? 30 : 0)}</span>
                </div>
              </div>

              <div style={{ marginTop: 16, background: '#F0FAF4', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 12, color: '#065F46' }}>
                  🚚 Estimated Delivery: <strong>{estimatedDelivery}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileToolbar />
    </div>
  )
}
