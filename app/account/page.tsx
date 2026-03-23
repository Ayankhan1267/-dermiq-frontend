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

type Tab = 'profile' | 'orders' | 'wishlist' | 'skinprofile'

interface UserProfile { id: string; email: string; name?: string; phone?: string }
interface Order {
  id?: string; order_id: string; total: number; status: string;
  created_at: string; items: { name: string; qty: number; price: number; image?: string }[]
}

export default function AccountPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [skinProfile, setSkinProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    loadUser()
    const wl = JSON.parse(localStorage.getItem('dermiq_wishlist') || '[]')
    setWishlistIds(wl)
    const sp = localStorage.getItem('ksProfile')
    if (sp) { try { setSkinProfile(JSON.parse(sp)) } catch {} }
  }, [])

  async function loadUser() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser({ id: u.id, email: u.email || '', name: u.user_metadata?.name || u.email?.split('@')[0] || 'User', phone: u.user_metadata?.phone || '' })
      setEditName(u.user_metadata?.name || u.email?.split('@')[0] || '')
      setEditPhone(u.user_metadata?.phone || '')
      loadOrders(u.id)
    }
    setLoading(false)
  }

  async function loadOrders(userId: string) {
    const { data } = await supabase.from('dermiq_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setOrders(data as Order[])
  }

  async function handleLogin() {
    setAuthLoading(true)
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
        if (error) throw error
        toast.success('Logged in successfully!')
      } else {
        const { error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword })
        if (error) throw error
        toast.success('Account created! Check your email to verify.')
      }
      loadUser()
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setOrders([])
    toast.success('Logged out successfully')
  }

  async function saveProfile() {
    if (!user) return
    const { error } = await supabase.auth.updateUser({ data: { name: editName, phone: editPhone } })
    if (!error) {
      setUser({ ...user, name: editName, phone: editPhone })
      setEditing(false)
      toast.success('Profile updated!')
    } else {
      toast.error('Failed to update profile')
    }
  }

  function removeFromWishlist(id: number) {
    const updated = wishlistIds.filter(wid => wid !== id)
    setWishlistIds(updated)
    localStorage.setItem('dermiq_wishlist', JSON.stringify(updated))
    toast.success('Removed from wishlist')
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
  }

  const wishlistProducts = ALL_PRODUCTS.filter(p => wishlistIds.includes(p.id))

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
    background: active ? '#2D5F5A' : 'transparent',
    color: active ? '#fff' : '#6B7280',
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>⏳</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 20px 80px' }}>
        {!user ? (
          /* Login / Register */
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👤</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#1A2E2B', marginBottom: 8 }}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p style={{ color: '#6B7280', fontSize: 15 }}>
                {authMode === 'login' ? 'Sign in to view orders and recommendations' : 'Join 50,000+ skincare enthusiasts'}
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 32 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input
                  type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="priya@example.com"
                  style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
                <input
                  type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <button
                onClick={handleLogin} disabled={authLoading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: authLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                {authLoading ? '...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6B7280' }}>
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D5F5A', fontWeight: 700, fontSize: 14 }}>
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'flex-start' }} className="account-grid">
            <style>{`@media(max-width:768px){.account-grid{grid-template-columns:1fr!important}}`}</style>
            {/* Sidebar */}
            <div>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', padding: 20, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #2D5F5A, #C8976A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24, color: '#fff', fontWeight: 700 }}>
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#1A2E2B', marginBottom: 2 }}>{user.name || user.email?.split('@')[0]}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>{user.email}</p>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {([
                  { id: 'profile', icon: '👤', label: 'Profile' },
                  { id: 'orders', icon: '📦', label: 'My Orders' },
                  { id: 'wishlist', icon: '❤️', label: 'Wishlist', count: wishlistIds.length },
                  { id: 'skinprofile', icon: '🧬', label: 'Skin Profile' },
                ] as { id: Tab; icon: string; label: string; count?: number }[]).map(item => (
                  <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === item.id ? '#F0FAF0' : 'transparent', color: tab === item.id ? '#2D5F5A' : '#374151', fontWeight: tab === item.id ? 700 : 400, fontSize: 14, fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                    <span>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && <span style={{ background: '#EF4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{item.count}</span>}
                  </button>
                ))}
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontSize: 14, fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
                  🚪 Logout
                </button>
              </div>
            </div>

            {/* Content */}
            <div>
              {/* Profile Tab */}
              {tab === 'profile' && (
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B' }}>My Profile</h2>
                    {!editing && (
                      <button onClick={() => setEditing(true)} style={{ background: '#F7F3EE', border: '1px solid #E8E0D8', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1A2E2B' }}>
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phone Number</label>
                        <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="9876543210" style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
                        <input value={user.email} disabled style={{ width: '100%', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', background: '#F7F3EE', color: '#9CA3AF' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={saveProfile} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
                        <button onClick={() => setEditing(false)} style={{ background: '#F7F3EE', color: '#6B7280', border: '1px solid #E8E0D8', borderRadius: 10, padding: '12px 24px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {[
                        { label: 'Full Name', value: user.name || '—' },
                        { label: 'Email', value: user.email },
                        { label: 'Phone', value: user.phone || '—' },
                        { label: 'Skin Type', value: skinProfile?.skinType || '—' },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{item.label}</p>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#1A2E2B' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {tab === 'orders' && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginBottom: 20 }}>My Orders</h2>
                  {orders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 8 }}>No orders yet</h3>
                      <p style={{ color: '#6B7280', marginBottom: 24 }}>Your order history will appear here</p>
                      <Link href="/shop" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Shop Now</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {orders.map(order => (
                        <div key={order.order_id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 2 }}>Order ID</p>
                              <p style={{ fontSize: 15, fontWeight: 800, color: '#2D5F5A', letterSpacing: 0.5 }}>{order.order_id}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ background: order.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7', color: order.status === 'confirmed' ? '#059669' : '#D97706', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            {order.items?.slice(0, 3).map((item, i) => (
                              <span key={i} style={{ fontSize: 12, background: '#F7F3EE', borderRadius: 6, padding: '4px 10px', color: '#374151' }}>
                                {item.name} × {item.qty}
                              </span>
                            ))}
                            {order.items?.length > 3 && <span style={{ fontSize: 12, color: '#9CA3AF' }}>+{order.items.length - 3} more</span>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 12, color: '#9CA3AF' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p style={{ fontSize: 16, fontWeight: 800, color: '#1A2E2B' }}>₹{order.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {tab === 'wishlist' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B' }}>My Wishlist</h2>
                    <Link href="/wishlist" style={{ color: '#2D5F5A', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View Full Wishlist →</Link>
                  </div>
                  {wishlistProducts.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 60, marginBottom: 16 }}>❤️</div>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 8 }}>Wishlist is empty</h3>
                      <p style={{ color: '#6B7280', marginBottom: 24 }}>Save products you love for later</p>
                      <Link href="/shop" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Explore Products</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {wishlistProducts.map(product => (
                        <div key={product.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E0D8', overflow: 'hidden' }}>
                          <div style={{ height: 160, position: 'relative', background: '#F7F3EE', cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
                            <Image src={product.image} alt={product.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: 12 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                            <p style={{ fontSize: 14, fontWeight: 800, color: '#2D5F5A', marginBottom: 8 }}>₹{product.price}</p>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => addToCart(product)} style={{ flex: 1, background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add to Cart</button>
                              <button onClick={() => removeFromWishlist(product.id)} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: 8, padding: '7px 10px', fontSize: 14, cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skin Profile Tab */}
              {tab === 'skinprofile' && (
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginBottom: 20 }}>Skin Profile</h2>
                  {skinProfile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', borderRadius: 20, padding: 28, color: '#fff' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 16 }}>Your Skin Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {[
                            { label: 'Skin Type', value: skinProfile.skinType },
                            { label: 'Age Group', value: skinProfile.ageGroup },
                            { label: 'Skin Tone', value: skinProfile.skinTone },
                            { label: 'Primary Goal', value: skinProfile.goal },
                          ].map(item => item.value && (
                            <div key={item.label}>
                              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{item.label}</p>
                              <p style={{ fontSize: 15, fontWeight: 700 }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        {skinProfile.concerns?.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Concerns</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {skinProfile.concerns.map((c: string) => (
                                <span key={c} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Link href="/skin-quiz" style={{ background: '#F7F3EE', color: '#2D5F5A', border: '1px solid #E8E0D8', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                          Retake Quiz
                        </Link>
                        <Link href="/specialists" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                          Book Consultation
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 60, marginBottom: 16 }}>🧬</div>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 8 }}>No skin profile yet</h3>
                      <p style={{ color: '#6B7280', marginBottom: 24 }}>Take our 2-minute skin quiz to get personalised product recommendations</p>
                      <Link href="/skin-quiz" style={{ background: '#2D5F5A', color: '#fff', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                        Take Skin Quiz →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <MobileToolbar />
    </div>
  )
}
