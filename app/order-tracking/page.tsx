'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { supabase } from '@/lib/supabase'

const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280',
  border: '#E8E0D8', cream: '#F7F3EE', bg: '#FAFAF8', accent: '#C8976A',
  green: '#10B981', red: '#EF4444', gold: '#D4A853',
}

interface OrderStep {
  label: string
  time: string
  status: 'done' | 'current' | 'pending'
}

const MOCK_ORDER = {
  id: 'DQ-2025-00874',
  product: 'DermIQ Vitamin C Brightening Serum',
  vendor: 'DermIQ Essentials',
  amount: 1399,
  date: 'Mar 20, 2025',
  steps: [
    { label: 'Order Placed', time: 'Mar 20, 2:34 PM', status: 'done' },
    { label: 'Payment Confirmed', time: 'Mar 20, 2:35 PM', status: 'done' },
    { label: 'Vendor Packed', time: 'Mar 21, 11:00 AM', status: 'done' },
    { label: 'Picked Up by Courier', time: 'Mar 21, 3:00 PM', status: 'done' },
    { label: 'In Transit', time: 'Mar 22', status: 'current' },
    { label: 'Out for Delivery', time: '', status: 'pending' },
    { label: 'Delivered', time: '', status: 'pending' },
  ] as OrderStep[],
  courier: 'Delhivery',
  awb: '1234567890',
  eta: 'Today by 8 PM',
}

export default function OrderTrackingPage() {
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<typeof MOCK_ORDER | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId || !contact) { toast.error('Please fill in both fields'); return }
    setLoading(true)

    // Try Supabase first
    const { data, error } = await supabase
      .from('dermiq_orders')
      .select('*')
      .eq('order_id', orderId.trim())
      .single()

    setLoading(false)

    if (data) {
      // Map DB data to display format
      setOrder({ ...MOCK_ORDER, id: data.order_id, amount: data.total, date: new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })
    } else {
      // Show mock for demo
      if (orderId.trim().toUpperCase() === 'DQ-2025-00874') {
        setOrder(MOCK_ORDER)
      } else {
        toast.error('Order not found. Try DQ-2025-00874 for demo.')
      }
    }
  }

  const stepIcons: Record<string, string> = {
    done: '✅',
    current: '🔄',
    pending: '⬜',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', border: `1.5px solid ${C.border}`,
    borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-dm)', background: C.bg,
    color: C.dark, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <Navbar activePage="order-tracking" />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s ease forwards; }
      `}</style>

      <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, paddingBottom: 80, fontFamily: 'var(--font-dm)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>

          {!order ? (
            /* ── ENTER ORDER ID CARD ── */
            <div className="fade-in-up" style={{
              background: '#fff', borderRadius: 20, padding: isMobile ? '36px 24px' : '56px 48px',
              boxShadow: '0 4px 40px rgba(0,0,0,0.07)', textAlign: 'center',
              border: `1px solid ${C.border}`,
            }}>
              {/* Logo */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: `${C.teal}10`, borderRadius: 12, padding: '10px 20px',
                }}>
                  <span style={{ fontSize: 24 }}>🧬</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.teal, fontFamily: 'var(--font-playfair)' }}>DermIQ</span>
                </div>
              </div>

              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, color: C.dark, marginBottom: 8 }}>
                Track Your Order
              </h1>
              <p style={{ color: C.mu, fontSize: 14, marginBottom: 36 }}>
                Enter your order ID and email or phone to get live updates.
              </p>

              <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
                    Order ID
                  </label>
                  <input
                    type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                    placeholder="e.g. DQ-2025-00874" style={inputStyle} required
                  />
                  <p style={{ fontSize: 11, color: C.mu, marginTop: 4 }}>Find this in your confirmation email</p>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
                    Email / Phone
                  </label>
                  <input
                    type="text" value={contact} onChange={e => setContact(e.target.value)}
                    placeholder="your@email.com or 9876543210" style={inputStyle} required
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '13px', background: C.teal, color: '#fff', border: 'none',
                  borderRadius: 10, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-dm)',
                  cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.2s',
                }}>
                  {loading ? 'Searching…' : '🔍 Track Order'}
                </button>
              </form>

              <p style={{ marginTop: 24, fontSize: 12, color: C.mu }}>
                Try <strong>DQ-2025-00874</strong> for a live demo
              </p>
            </div>
          ) : (
            /* ── ORDER TIMELINE ── */
            <div className="fade-in-up">
              {/* Back button */}
              <button onClick={() => setOrder(null)} style={{
                background: 'none', border: 'none', color: C.teal, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-dm)', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ← Track Another Order
              </button>

              {/* Order Summary Card */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.mu, marginBottom: 4 }}>Order ID</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: 'var(--font-playfair)' }}>{order.id}</div>
                    <div style={{ fontSize: 13, color: C.mu, marginTop: 4 }}>Placed on {order.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: C.mu, marginBottom: 4 }}>Total</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>₹{order.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 2 }}>{order.product}</div>
                  <div style={{ fontSize: 12, color: C.mu }}>Sold by {order.vendor}</div>
                </div>
              </div>

              {/* ETA Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${C.teal}15, ${C.green}10)`,
                border: `1px solid ${C.green}30`, borderRadius: 14,
                padding: '14px 20px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 24 }}>🚚</span>
                <div>
                  <div style={{ fontSize: 13, color: C.mu }}>Estimated Delivery</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{order.eta}</div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: isMobile ? '24px 20px' : '32px 36px',
                border: `1px solid ${C.border}`, boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
                marginBottom: 20,
              }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, color: C.dark, marginBottom: 28 }}>
                  Shipment Timeline
                </h2>

                {isMobile ? (
                  /* Vertical timeline for mobile */
                  <div style={{ position: 'relative' }}>
                    {/* Vertical line */}
                    <div style={{
                      position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
                      background: `linear-gradient(to bottom, ${C.green}, ${C.border})`,
                    }} />

                    {order.steps.map((step, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 20, marginBottom: i < order.steps.length - 1 ? 28 : 0,
                        position: 'relative',
                      }}>
                        {/* Dot */}
                        <div style={{ flexShrink: 0, width: 40, display: 'flex', justifyContent: 'center' }}>
                          {step.status === 'current' ? (
                            <div className="pulse-dot" style={{
                              width: 16, height: 16, borderRadius: '50%', background: C.green,
                              border: `3px solid #fff`, boxShadow: `0 0 0 3px ${C.green}40`,
                              marginTop: 3,
                            }} />
                          ) : step.status === 'done' ? (
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: C.green,
                              border: '3px solid #fff', boxShadow: `0 0 0 2px ${C.green}30`,
                              marginTop: 3,
                            }} />
                          ) : (
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: C.border,
                              border: '3px solid #fff', marginTop: 3,
                            }} />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 14, fontWeight: step.status !== 'pending' ? 600 : 400,
                            color: step.status === 'pending' ? C.mu : C.dark,
                          }}>
                            {step.status === 'current' && <span style={{ color: C.green, marginRight: 6 }}>🔄</span>}
                            {step.label}
                            {step.status === 'current' && (
                              <span style={{
                                marginLeft: 8, fontSize: 10, background: `${C.green}15`, color: C.green,
                                padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                              }}>LIVE</span>
                            )}
                          </div>
                          {step.time && (
                            <div style={{ fontSize: 12, color: C.mu, marginTop: 2 }}>{step.time}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Horizontal timeline for desktop */
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 600 }}>
                      {order.steps.map((step, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                          {/* Connector line */}
                          {i < order.steps.length - 1 && (
                            <div style={{
                              position: 'absolute', top: 20, left: '50%', right: '-50%', height: 2,
                              background: step.status === 'done' ? C.green : C.border, zIndex: 0,
                            }} />
                          )}

                          {/* Dot */}
                          <div style={{ position: 'relative', zIndex: 1, marginBottom: 10 }}>
                            {step.status === 'current' ? (
                              <div className="pulse-dot" style={{
                                width: 20, height: 20, borderRadius: '50%', background: C.green,
                                border: '3px solid #fff', boxShadow: `0 0 0 4px ${C.green}30`,
                              }} />
                            ) : step.status === 'done' ? (
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%', background: C.green,
                                border: '3px solid #fff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', boxShadow: `0 0 0 2px ${C.green}20`,
                              }}>
                                <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
                                  <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            ) : (
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                border: `2px solid ${C.border}`,
                              }} />
                            )}
                          </div>

                          {/* Label */}
                          <div style={{
                            fontSize: 11, fontWeight: step.status !== 'pending' ? 600 : 400,
                            color: step.status === 'pending' ? C.mu : C.dark,
                            textAlign: 'center', lineHeight: 1.4, padding: '0 4px',
                          }}>
                            {step.label}
                          </div>
                          {step.time && (
                            <div style={{ fontSize: 10, color: C.mu, marginTop: 3, textAlign: 'center' }}>{step.time}</div>
                          )}
                          {step.status === 'current' && (
                            <span style={{
                              marginTop: 4, fontSize: 9, background: `${C.green}15`, color: C.green,
                              padding: '2px 6px', borderRadius: 20, fontWeight: 700,
                            }}>LIVE</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Courier Info */}
              <div style={{
                background: '#fff', borderRadius: 14, padding: '18px 24px', marginBottom: 20,
                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: `${C.teal}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>📦</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{order.courier}</div>
                    <div style={{ fontSize: 12, color: C.mu }}>AWB: {order.awb}</div>
                  </div>
                </div>
                <a
                  href={`https://www.delhivery.com/track/package/${order.awb}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '9px 16px', background: C.teal, color: '#fff', borderRadius: 8,
                    textDecoration: 'none', fontSize: 13, fontWeight: 600,
                  }}
                >
                  Track on Delhivery →
                </a>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/shop" style={{
                  flex: 1, minWidth: 140, padding: '12px', background: C.teal, color: '#fff',
                  borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  textAlign: 'center', fontFamily: 'var(--font-dm)',
                }}>
                  🛒 Buy Again
                </Link>
                <Link href="/account" style={{
                  flex: 1, minWidth: 140, padding: '12px', background: '#fff',
                  color: C.teal, border: `1.5px solid ${C.teal}`,
                  borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  textAlign: 'center', fontFamily: 'var(--font-dm)',
                }}>
                  📋 All Orders
                </Link>
                <Link href="/account?tab=support" style={{
                  flex: 1, minWidth: 140, padding: '12px', background: C.cream,
                  color: C.dark, border: `1.5px solid ${C.border}`,
                  borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  textAlign: 'center', fontFamily: 'var(--font-dm)',
                }}>
                  🆘 Need Help?
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileToolbar activePage="order-tracking" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
