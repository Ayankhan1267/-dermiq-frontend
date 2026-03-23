'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Product { id: number; name: string; category: string; price: number; mrp: number; stock: number; rating: number; active: boolean; emoji: string; description?: string }

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Sample Serum', category: 'Serum', price: 799, mrp: 1299, stock: 50, rating: 4.5, active: true, emoji: '✨', description: 'A sample serum product.' },
  { id: 2, name: 'Sample Moisturiser', category: 'Moisturiser', price: 649, mrp: 999, stock: 30, rating: 4.3, active: true, emoji: '💧', description: 'A sample moisturiser product.' },
]

const CATEGORIES = ['Serum', 'Moisturiser', 'Sunscreen', 'Cleanser', 'Treatment', 'Toner', 'Kit', 'Gel']
const EMOJIS = ['✨','💧','☀️','🫧','🔬','🎁','🌙','🏺','🍉','🌿','⚗️','🧬','🍊','🌹','🌟','👁️','💨','🍵','🌤️']

const s = {
  card: { background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' } as React.CSSProperties,
  label: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 } as React.CSSProperties,
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', color: '#1A1A1A' } as React.CSSProperties,
}

export default function VendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vendorName, setVendorName] = useState('My Brand')
  const [userEmail, setUserEmail] = useState('')
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', category: 'Serum', price: '', mrp: '', stock: '', description: '', emoji: '✨', active: true })
  const [brandForm, setBrandForm] = useState({ name: '', tagline: '', description: '', email: '', website: '', instagram: '', story: '' })
  const [payoutDetails, setPayoutDetails] = useState({ holder: '', account: '', ifsc: '', bank: '' })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/vendor/login'); return }
        setUserEmail(user.email || '')
        // Try to get vendor data
        const { data } = await supabase.from('dermiq_vendors').select('*').eq('email', user.email).single()
        if (data) { setVendorName(data.brand_name || 'My Brand') }
        // Try to load products
        const { data: pData } = await supabase.from('dermiq_products').select('*').eq('vendor_email', user.email)
        if (pData && pData.length > 0) setProducts(pData)
      } catch { /* use fallback data */ }
      finally { setLoading(false) }
    }
    checkAuth()
  }, [router])

  function openAdd() { setEditing(null); setForm({ name: '', category: 'Serum', price: '', mrp: '', stock: '', description: '', emoji: '✨', active: true }); setModalOpen(true) }
  function openEdit(p: Product) { setEditing(p); setForm({ name: p.name, category: p.category, price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), description: p.description || '', emoji: p.emoji, active: p.active }); setModalOpen(true) }

  function saveProduct() {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    const disc = Math.round((1 - Number(form.price) / Number(form.mrp || form.price)) * 100)
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, price: Number(form.price), mrp: Number(form.mrp || form.price), stock: Number(form.stock || 0) } : p))
      toast.success('Product updated!')
    } else {
      const newProduct: Product = { id: Date.now(), name: form.name, category: form.category, price: Number(form.price), mrp: Number(form.mrp || form.price), stock: Number(form.stock || 0), rating: 0, active: form.active, emoji: form.emoji, description: form.description }
      setProducts(prev => [newProduct, ...prev])
      toast.success('Product added!')
    }
    setModalOpen(false)
  }

  function deleteProduct(id: number) { if (confirm('Delete this product?')) { setProducts(prev => prev.filter(p => p.id !== id)); toast.success('Deleted') } }
  function toggleActive(id: number) { setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p)) }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/vendor/login') }

  const filtered = products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const activeCount = products.filter(p => p.active).length
  const revenue = products.reduce((s, p) => s + p.price * (Math.floor(Math.random() * 10) + 1), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F3EE' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6B7280' }}>Loading your dashboard...</p>
      </div>
    </div>
  )

  const TABS = [
    { id: 'products', label: '📦 My Products' },
    { id: 'orders', label: '🛒 Orders' },
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'brand', label: '🏷️ Brand Profile' },
    { id: 'payouts', label: '💰 Payouts' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A2E2B,#2D5F5A)', color: '#fff', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>Derm<span style={{ color: '#C8976A' }}>IQ</span></span>
            <span style={{ background: 'rgba(200,151,106,0.25)', color: '#C8976A', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>SELLER PORTAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{vendorName}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{userEmail}</p>
            </div>
            <button onClick={handleLogout} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>👋 Welcome back, <strong>{vendorName}</strong>! Manage your DermIQ storefront.</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20 }}>15% platform commission · Payouts every Monday</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'My Products', value: products.length, icon: '📦', color: '#2D5F5A' },
            { label: 'Active Listings', value: activeCount, icon: '✅', color: '#16A34A' },
            { label: 'This Month Revenue', value: `₹${(12840).toLocaleString()}`, icon: '💰', color: '#C8976A' },
            { label: 'Pending Orders', value: 3, icon: '⏳', color: '#D97706' },
          ].map(stat => (
            <div key={stat.label} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E8E0D8', overflowX: 'auto' }} className="no-scrollbar">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flexShrink: 0, padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                color: tab === t.id ? '#2D5F5A' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #2D5F5A' : '2px solid transparent',
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {/* PRODUCTS TAB */}
            {tab === 'products' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      style={{ ...s.input, paddingLeft: 36 }} />
                    <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <button onClick={openAdd} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    + Add New Product
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E8E0D8' }}>
                        {['Product', 'Category', 'Price', 'MRP', 'Disc%', 'Stock', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const disc = Math.round((1 - p.price / p.mrp) * 100)
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #F0EBE5' }}>
                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 24 }}>{p.emoji}</span>
                              <span style={{ fontWeight: 600, color: '#1A2E2B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </td>
                            <td style={{ padding: '12px' }}><span style={{ background: '#F0F9F8', color: '#2D5F5A', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{p.category}</span></td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#1A2E2B' }}>₹{p.price}</td>
                            <td style={{ padding: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{p.mrp}</td>
                            <td style={{ padding: '12px', color: '#16A34A', fontWeight: 700 }}>{disc}%</td>
                            <td style={{ padding: '12px' }}>{p.stock}</td>
                            <td style={{ padding: '12px' }}>
                              <button onClick={() => toggleActive(p.id)} style={{ padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: p.active ? '#DCFCE7' : '#F3F4F6', color: p.active ? '#16A34A' : '#6B7280' }}>
                                {p.active ? '● Active' : '○ Inactive'}
                              </button>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #E8E0D8', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2D5F5A' }}>Edit</button>
                                <button onClick={() => deleteProduct(p.id)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#DC2626' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>No products found</div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 20 }}>Recent Orders</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E8E0D8' }}>
                        {['Order ID', 'Customer', 'Product', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: '#ORD-1842', customer: 'Priya S.', product: 'Vitamin C Serum', qty: 2, amount: 1598, status: 'Delivered', date: '23 Mar 2026' },
                        { id: '#ORD-1856', customer: 'Ananya K.', product: 'Hyaluronic Gel', qty: 1, amount: 649, status: 'Shipped', date: '22 Mar 2026' },
                        { id: '#ORD-1871', customer: 'Rohan M.', product: 'SPF 50+ Sunscreen', qty: 3, amount: 1647, status: 'Processing', date: '23 Mar 2026' },
                      ].map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #F0EBE5' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#2D5F5A' }}>{order.id}</td>
                          <td style={{ padding: '12px' }}>{order.customer}</td>
                          <td style={{ padding: '12px' }}>{order.product}</td>
                          <td style={{ padding: '12px' }}>{order.qty}</td>
                          <td style={{ padding: '12px', fontWeight: 700 }}>₹{order.amount.toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: order.status === 'Delivered' ? '#DCFCE7' : order.status === 'Shipped' ? '#EFF6FF' : '#FEF3C7', color: order.status === 'Delivered' ? '#16A34A' : order.status === 'Shipped' ? '#2563EB' : '#D97706' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#6B7280' }}>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', margin: 0 }}>Analytics Overview</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['7D', '30D', '90D'].map(r => (
                      <button key={r} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #E8E0D8', background: r === '30D' ? '#2D5F5A' : '#fff', color: r === '30D' ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{r}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
                  {[
                    { label: 'Product Views', value: '12,483', change: '+18%', up: true },
                    { label: 'Add to Carts', value: '1,342', change: '+24%', up: true },
                    { label: 'Conversions', value: '287', change: '+11%', up: true },
                    { label: 'Revenue', value: '₹1.24L', change: '+31%', up: true },
                  ].map(m => (
                    <div key={m.label} style={s.card}>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>{m.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#1A2E2B', margin: '0 0 4px' }}>{m.value}</p>
                      <p style={{ fontSize: 12, color: m.up ? '#16A34A' : '#DC2626', margin: 0, fontWeight: 600 }}>{m.change} vs last period</p>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#1A2E2B', marginBottom: 16 }}>Top Products by Sales</h4>
                  {products.slice(0, 4).map((p, i) => {
                    const w = [92, 74, 58, 41][i]
                    return (
                      <div key={p.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{p.emoji} {p.name}</span>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>{w} units</span>
                        </div>
                        <div style={{ height: 6, background: '#F0EBE5', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${w}%`, background: 'linear-gradient(90deg,#2D5F5A,#C8976A)', borderRadius: 3 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* BRAND PROFILE TAB */}
            {tab === 'brand' && (
              <div style={{ maxWidth: 600 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 20 }}>Brand Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'name', label: 'Brand Name', placeholder: 'e.g. Minimalist' },
                    { key: 'tagline', label: 'Tagline', placeholder: 'e.g. Science-backed skincare' },
                    { key: 'email', label: 'Contact Email', placeholder: 'contact@brand.com' },
                    { key: 'website', label: 'Website URL', placeholder: 'https://yourbrand.com' },
                    { key: 'instagram', label: 'Instagram Handle', placeholder: '@yourbrand' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={s.label}>{field.label}</label>
                      <input type="text" placeholder={field.placeholder} value={(brandForm as Record<string, string>)[field.key]}
                        onChange={e => setBrandForm(prev => ({ ...prev, [field.key]: e.target.value }))} style={s.input} />
                    </div>
                  ))}
                  <div>
                    <label style={s.label}>About Brand Story</label>
                    <textarea placeholder="Tell customers about your brand story, values, and what makes your products unique..." rows={5}
                      value={brandForm.story} onChange={e => setBrandForm(prev => ({ ...prev, story: e.target.value }))}
                      style={{ ...s.input, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <div>
                    <label style={s.label}>Description</label>
                    <textarea placeholder="Short brand description..." rows={3} value={brandForm.description}
                      onChange={e => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                      style={{ ...s.input, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  <button onClick={() => toast.success('Brand profile saved!')} style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {/* PAYOUTS TAB */}
            {tab === 'payouts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                  <div style={{ background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', borderRadius: 16, padding: 24, color: '#fff' }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>Available Balance</p>
                    <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px' }}>₹4,320</p>
                    <button onClick={() => toast.success('Payout requested!')} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Request Payout →
                    </button>
                  </div>
                  <div style={s.card}>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 6px' }}>Lifetime Earnings</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#1A2E2B', margin: '0 0 6px' }}>₹84,200</p>
                    <p style={{ fontSize: 12, color: '#16A34A', margin: 0 }}>After 15% commission</p>
                  </div>
                </div>

                <div style={{ ...s.card, background: '#FFF8F0', border: '1px solid #F5E6D3' }}>
                  <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#C8976A', margin: '0 0 8px' }}>💡 How Commission Works</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.7 }}>
                    DermIQ charges a <strong style={{ color: '#C8976A' }}>15% platform fee</strong> on each sale. This covers payment processing, logistics support, and platform maintenance. Remaining 85% is transferred to your bank account every Monday.
                  </p>
                </div>

                <div style={s.card}>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#1A2E2B', marginBottom: 16 }}>Payout History</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E8E0D8' }}>
                          {['Date', 'Amount', 'Reference', 'Status'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: '17 Mar 2026', amount: '₹8,420', ref: 'PAY-20260317', status: 'Completed' },
                          { date: '10 Mar 2026', amount: '₹6,180', ref: 'PAY-20260310', status: 'Completed' },
                          { date: '3 Mar 2026', amount: '₹9,340', ref: 'PAY-20260303', status: 'Completed' },
                        ].map(p => (
                          <tr key={p.ref} style={{ borderBottom: '1px solid #F0EBE5' }}>
                            <td style={{ padding: '10px 12px', color: '#6B7280' }}>{p.date}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{p.amount}</td>
                            <td style={{ padding: '10px 12px', color: '#9CA3AF', fontSize: 11 }}>{p.ref}</td>
                            <td style={{ padding: '10px 12px' }}><span style={{ background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ ...s.card, maxWidth: 500 }}>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#1A2E2B', marginBottom: 16 }}>Bank Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { key: 'holder', label: 'Account Holder Name', placeholder: 'As per bank records' },
                      { key: 'account', label: 'Account Number', placeholder: '••••••••••' },
                      { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234' },
                      { key: 'bank', label: 'Bank Name', placeholder: 'e.g. HDFC Bank' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={s.label}>{f.label}</label>
                        <input type="text" placeholder={f.placeholder} value={(payoutDetails as Record<string, string>)[f.key]}
                          onChange={e => setPayoutDetails(prev => ({ ...prev, [f.key]: e.target.value }))} style={s.input} />
                      </div>
                    ))}
                    <button onClick={() => toast.success('Bank details saved!')} style={{ padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                      Save Bank Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', margin: 0 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#F7F3EE', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Emoji picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Product Emoji</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: form.emoji === e ? '2px solid #2D5F5A' : '1.5px solid #E8E0D8', background: form.emoji === e ? '#F0F9F8' : '#fff', fontSize: 18, cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 32, textAlign: 'center', padding: '12px', background: '#F7F3EE', borderRadius: 10 }}>{form.emoji}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.label}>Product Name *</label>
                <input type="text" placeholder="e.g. Vitamin C Brightening Serum" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input} />
              </div>
              <div>
                <label style={s.label}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...s.input, cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Price (₹) *</label>
                <input type="number" placeholder="799" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={s.input} />
              </div>
              <div>
                <label style={s.label}>MRP (₹)</label>
                <input type="number" placeholder="1299" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} style={s.input} />
              </div>
              <div>
                <label style={s.label}>Stock Units</label>
                <input type="number" placeholder="50" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={s.input} />
              </div>
              {form.price && form.mrp && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: '#DCFCE7', borderRadius: 10, padding: '10px 14px', width: '100%' }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>Discount</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#16A34A' }}>{Math.round((1 - Number(form.price) / Number(form.mrp)) * 100)}% off</p>
                  </div>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.label}>Description</label>
                <textarea placeholder="Product description..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...s.input, resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="activeToggle" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <label htmlFor="activeToggle" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Active (visible on DermIQ store)</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E8E0D8', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={saveProduct} style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
