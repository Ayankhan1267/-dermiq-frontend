'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────
interface Product {
  id: number; name: string; category: string; price: number; mrp: number
  stock: number; rating: number; active: boolean; emoji: string
  description?: string; image?: string; size?: string; concerns: string[]
}
interface Order {
  id: string; product: string; customer: string; qty: number; amount: number
  status: 'new'|'processing'|'shipped'|'delivered'|'cancelled'; date: string; address: string
}
interface Review { id: number; product: string; customer: string; rating: number; comment: string; date: string; reply?: string }
interface Notification { id: number; type: 'order'|'stock'|'review'|'payment'; message: string; time: string; read: boolean }
interface Coupon { id: number; code: string; type: 'percent'|'flat'; value: number; minOrder: number; uses: number; active: boolean }

// ── Constants ──────────────────────────────────────────────────────────────
const SKIN_CONCERNS = ['Acne & Breakouts','Dryness & Dehydration','Pigmentation & Dark Spots','Aging & Fine Lines','Oily Skin','Sensitive Skin','Dullness','Dark Circles','Pores','Uneven Texture']
const CATEGORIES = ['Serum','Moisturiser','Sunscreen','Cleanser','Treatment','Toner','Eye Cream','Mask','Kit','Gel','Oil','Mist']
const EMOJIS = ['✨','💧','☀️','🫧','🔬','🎁','🌙','🏺','🍉','🌿','⚗️','🧬','🍊','🌹','🌟','👁️','💨','🍵','🌤️','🫐']

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: '10% Niacinamide + Zinc Serum', category: 'Serum', price: 399, mrp: 699, stock: 142, rating: 4.6, active: true, emoji: '✨', description: 'Controls sebum, reduces pores and pigmentation.', size: '30ml', concerns: ['Acne & Breakouts','Oily Skin','Pigmentation & Dark Spots'] },
  { id: 2, name: 'Moisturizing Face Cream SPF 50', category: 'Moisturiser', price: 549, mrp: 849, stock: 8, rating: 4.4, active: true, emoji: '☀️', description: 'Hydrates and protects with broad-spectrum SPF.', size: '50g', concerns: ['Dryness & Dehydration','Aging & Fine Lines'] },
  { id: 3, name: 'AHA BHA 25% Peeling Solution', category: 'Treatment', price: 649, mrp: 999, stock: 56, rating: 4.7, active: true, emoji: '🔬', description: 'Exfoliates dead skin for brighter, smoother texture.', size: '30ml', concerns: ['Dullness','Uneven Texture','Pores'] },
]
const SEED_ORDERS: Order[] = [
  { id: 'ORD-2841', product: '10% Niacinamide Serum', customer: 'Priya S.', qty: 2, amount: 798, status: 'new', date: '2026-03-23', address: 'Mumbai, MH' },
  { id: 'ORD-2839', product: 'AHA BHA Peeling Solution', customer: 'Rahul M.', qty: 1, amount: 649, status: 'processing', date: '2026-03-22', address: 'Delhi, DL' },
  { id: 'ORD-2835', product: 'Moisturizing Cream SPF 50', customer: 'Sneha K.', qty: 3, amount: 1647, status: 'shipped', date: '2026-03-21', address: 'Bengaluru, KA' },
  { id: 'ORD-2820', product: '10% Niacinamide Serum', customer: 'Ankit J.', qty: 1, amount: 399, status: 'delivered', date: '2026-03-18', address: 'Pune, MH' },
]
const SEED_REVIEWS: Review[] = [
  { id: 1, product: '10% Niacinamide Serum', customer: 'Divya R.', rating: 5, comment: 'Reduced my acne marks in 2 weeks! Amazing product.', date: '2026-03-20' },
  { id: 2, product: 'AHA BHA Peeling Solution', customer: 'Mohit A.', rating: 4, comment: 'Good exfoliant. Skin feels smooth after use.', date: '2026-03-18' },
  { id: 3, product: 'Moisturizing Cream SPF 50', customer: 'Kavya S.', rating: 3, comment: 'Good SPF but feels a bit greasy.', date: '2026-03-15', reply: 'Thank you for the feedback! We recommend using a pea-sized amount for best results.' },
]
const SEED_NOTIFS: Notification[] = [
  { id: 1, type: 'order', message: 'New order ORD-2841 received — ₹798', time: '10 min ago', read: false },
  { id: 2, type: 'stock', message: 'Low stock alert: Moisturizing Cream SPF 50 (8 units left)', time: '2 hrs ago', read: false },
  { id: 3, type: 'review', message: 'New 5-star review on Niacinamide Serum', time: '5 hrs ago', read: true },
  { id: 4, type: 'payment', message: 'Payout of ₹12,430 processed to your account', time: '2 days ago', read: true },
]
const SEED_COUPONS: Coupon[] = [
  { id: 1, code: 'SKIN20', type: 'percent', value: 20, minOrder: 499, uses: 34, active: true },
  { id: 2, code: 'FLAT100', type: 'flat', value: 100, minOrder: 799, uses: 12, active: true },
]

// ── Styles ─────────────────────────────────────────────────────────────────
const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', accent: '#C8976A', rose: '#D4856A',
  dark: '#1A2E2B', mu: '#6B7280', border: '#E8E0D8', cream: '#F7F3EE',
}
const sx = {
  card: { background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' } as React.CSSProperties,
  label: { fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none', color: '#1A1A1A', background: '#fff' } as React.CSSProperties,
  btn: { padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 14 } as React.CSSProperties,
}

// ── Helpers ────────────────────────────────────────────────────────────────
const statusColors: Record<string,{bg:string;color:string}> = {
  new: { bg: '#EFF6FF', color: '#2563EB' },
  processing: { bg: '#FFF7ED', color: '#D97706' },
  shipped: { bg: '#F0F9F8', color: C.teal },
  delivered: { bg: '#F0FDF4', color: '#16A34A' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626' },
}
const notifIcons: Record<string,string> = { order: '📦', stock: '⚠️', review: '⭐', payment: '💰' }
const Stars = ({ n }: { n: number }) => <span>{Array.from({length:5},(_,i) => <span key={i} style={{color: i<n ? '#F59E0B':'#D1D5DB',fontSize:14}}>★</span>)}</span>

// ── Main Component ─────────────────────────────────────────────────────────
export default function VendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vendorName, setVendorName] = useState('The Minimalist')
  const [userEmail, setUserEmail] = useState('vendor@minimalist.in')
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Data state
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS)
  const [notifs, setNotifs] = useState<Notification[]>(SEED_NOTIFS)
  const [coupons, setCoupons] = useState<Coupon[]>(SEED_COUPONS)

  // Modals
  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product|null>(null)
  const [couponModal, setCouponModal] = useState(false)
  const [replyModal, setReplyModal] = useState<Review|null>(null)
  const [replyText, setReplyText] = useState('')
  const [kycModal, setKycModal] = useState(false)

  // Forms
  const [pForm, setPForm] = useState({ name:'', category:'Serum', price:'', mrp:'', stock:'', description:'', emoji:'✨', size:'', concerns:[] as string[], active:true })
  const [bankForm, setBankForm] = useState({ holder:'', account:'', ifsc:'', bank:'', upi:'' })
  const [brandForm, setBrandForm] = useState({ name: vendorName, tagline:'Science-backed skincare for everyone', story:'', website:'', instagram:'', founded:'' })
  const [couponForm, setCouponForm] = useState({ code:'', type:'percent' as 'percent'|'flat', value:'', minOrder:'', active:true })
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [kycForm, setKycForm] = useState({ gst:'', pan:'', trademark:'', fssai:'', bankDoc:'' })
  const [searchQ, setSearchQ] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/vendor/login'); return }
        setUserEmail(user.email || '')
        const { data } = await supabase.from('dermiq_vendors').select('*').eq('email', user.email).single()
        if (data) { setVendorName(data.brand_name || 'My Brand'); setBrandForm(f => ({ ...f, name: data.brand_name || '' })) }
        const { data: pData } = await supabase.from('dermiq_products').select('*').eq('vendor_email', user.email)
        if (pData && pData.length > 0) setProducts(pData)
      } catch { /* use seed data */ }
      finally { setLoading(false) }
    }
    checkAuth()
  }, [router])

  // ── Product helpers ────────────────────────────────────────────────────
  function openAddProduct() {
    setEditingProduct(null)
    setPForm({ name:'', category:'Serum', price:'', mrp:'', stock:'', description:'', emoji:'✨', size:'', concerns:[], active:true })
    setProductModal(true)
  }
  function openEditProduct(p: Product) {
    setEditingProduct(p)
    setPForm({ name:p.name, category:p.category, price:String(p.price), mrp:String(p.mrp), stock:String(p.stock), description:p.description||'', emoji:p.emoji, size:p.size||'', concerns:p.concerns||[], active:p.active })
    setProductModal(true)
  }
  function saveProduct() {
    if (!pForm.name || !pForm.price) { toast.error('Name and price required'); return }
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...pForm, price:+pForm.price, mrp:+(pForm.mrp||pForm.price), stock:+pForm.stock } : p))
      toast.success('Product updated!')
    } else {
      setProducts(prev => [{ id:Date.now(), ...pForm, price:+pForm.price, mrp:+(pForm.mrp||pForm.price), stock:+pForm.stock, rating:0 }, ...prev])
      toast.success('Product added!')
    }
    setProductModal(false)
  }
  function deleteProduct(id:number) { if(confirm('Delete this product?')) { setProducts(p=>p.filter(x=>x.id!==id)); toast.success('Deleted') } }
  function toggleConcern(c:string) { setPForm(f => ({ ...f, concerns: f.concerns.includes(c) ? f.concerns.filter(x=>x!==c) : [...f.concerns, c] })) }

  // ── Order helpers ──────────────────────────────────────────────────────
  function updateOrderStatus(id:string, status:Order['status']) {
    setOrders(prev => prev.map(o => o.id===id ? { ...o, status } : o))
    toast.success(`Order ${id} → ${status}`)
  }

  // ── Review helpers ─────────────────────────────────────────────────────
  function submitReply() {
    if (!replyText.trim()) return
    setReviews(prev => prev.map(r => r.id===replyModal?.id ? { ...r, reply:replyText } : r))
    toast.success('Reply posted!')
    setReplyModal(null); setReplyText('')
  }

  // ── Coupon helpers ─────────────────────────────────────────────────────
  function saveCoupon() {
    if (!couponForm.code || !couponForm.value) { toast.error('Code and value required'); return }
    setCoupons(prev => [{ id:Date.now(), ...couponForm, value:+couponForm.value, minOrder:+couponForm.minOrder||0, uses:0 }, ...prev])
    toast.success('Coupon created!'); setCouponModal(false)
  }

  // ── Computed ───────────────────────────────────────────────────────────
  const unreadCount = notifs.filter(n=>!n.read).length
  const filteredProducts = products.filter(p => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()))
  const filteredOrders = orders.filter(o => orderFilter==='all' || o.status===orderFilter)
  const totalRevenue = 48320; const monthRevenue = 12430; const pendingPayout = 8750
  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '0'

  // ── Sidebar nav ────────────────────────────────────────────────────────
  const NAV = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'products', icon:'📦', label:'Products' },
    { id:'ai-mapping', icon:'🧬', label:'AI Mapping' },
    { id:'orders', icon:'🛒', label:'Orders', badge: orders.filter(o=>o.status==='new').length },
    { id:'payments', icon:'💰', label:'Payments' },
    { id:'inventory', icon:'🏪', label:'Inventory' },
    { id:'offers', icon:'🎁', label:'Offers & Discounts' },
    { id:'reviews', icon:'⭐', label:'Reviews' },
    { id:'analytics', icon:'📈', label:'Analytics' },
    { id:'specialist', icon:'👩‍⚕️', label:'Specialist Integration' },
    { id:'ai-system', icon:'🤖', label:'AI System' },
    { id:'notifications', icon:'🔔', label:'Notifications', badge: unreadCount },
    { id:'kyc', icon:'✅', label:'Verification & KYC' },
    { id:'brand', icon:'🏷️', label:'Brand Profile' },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.cream }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>⚗️</div>
        <p style={{ fontFamily:'DM Sans,sans-serif', color:C.teal, fontWeight:600 }}>Loading vendor panel...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F8F7F5', fontFamily:'DM Sans,sans-serif' }}>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink:0,
        background:'#fff', borderRight:`1px solid ${C.border}`,
        display:'flex', flexDirection:'column',
        transition:'width 0.25s', overflow:'hidden', position:'sticky', top:0, height:'100vh',
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>⚗️</span>
          {sidebarOpen && <span style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:C.dark, whiteSpace:'nowrap' }}>Vendor Panel</span>}
        </div>

        {/* Brand badge */}
        {sidebarOpen && (
          <div style={{ margin:'12px 12px 0', padding:'10px 12px', borderRadius:10, background:C.cream, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, color:C.mu, margin:0 }}>Logged in as</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.dark, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{vendorName}</p>
            <p style={{ fontSize:11, color:C.mu, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</p>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex:1, overflowY:'auto', padding:'12px 8px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'10px 10px', borderRadius:10, border:'none', cursor:'pointer',
              background: tab===n.id ? 'rgba(45,95,90,0.08)' : 'transparent',
              color: tab===n.id ? C.teal : '#374151',
              fontWeight: tab===n.id ? 700 : 500, fontSize:13,
              marginBottom:2, textAlign:'left', position:'relative',
              transition:'all 0.15s',
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{n.label}</span>}
              {n.badge ? <span style={{ marginLeft:'auto', background:C.rose, color:'#fff', borderRadius:99, fontSize:10, fontWeight:700, padding:'1px 6px', flexShrink:0 }}>{n.badge}</span> : null}
            </button>
          ))}
        </nav>

        {/* Collapse toggle + logout */}
        <div style={{ padding:'12px 8px', borderTop:`1px solid ${C.border}` }}>
          <button onClick={()=>setSidebarOpen(v=>!v)} style={{ ...sx.btn, width:'100%', background:C.cream, color:C.dark, fontSize:12, padding:'8px 10px' }}>
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>
          {sidebarOpen && (
            <button onClick={async()=>{ await supabase.auth.signOut(); router.push('/vendor/login') }} style={{ ...sx.btn, width:'100%', background:'#FEF2F2', color:'#DC2626', fontSize:12, padding:'8px 10px', marginTop:6 }}>
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main style={{ flex:1, overflowY:'auto', padding:'28px 32px', minWidth:0 }}>

        {/* ════════════════════════════════════════════════════════════
            TAB: DASHBOARD
        ════════════════════════════════════════════════════════════ */}
        {tab==='dashboard' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, color:C.dark, marginBottom:4 }}>Welcome back, {vendorName} 👋</h1>
            <p style={{ color:C.mu, fontSize:14, marginBottom:24 }}>Here's what's happening with your store today.</p>

            {/* KPI cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { label:'Total Revenue', value:`₹${totalRevenue.toLocaleString()}`, sub:'All time', icon:'💰', color:'#ECFDF5', border:'#A7F3D0', text:'#065F46' },
                { label:'This Month', value:`₹${monthRevenue.toLocaleString()}`, sub:'March 2026', icon:'📈', color:'#EFF6FF', border:'#BFDBFE', text:'#1D4ED8' },
                { label:'Pending Payout', value:`₹${pendingPayout.toLocaleString()}`, sub:'Next: Apr 1', icon:'⏳', color:'#FFF7ED', border:'#FED7AA', text:'#C2410C' },
                { label:'Active Products', value:String(products.filter(p=>p.active).length), sub:`${products.length} total`, icon:'📦', color:'#F5F3FF', border:'#DDD6FE', text:'#5B21B6' },
                { label:'New Orders', value:String(orders.filter(o=>o.status==='new').length), sub:'Needs action', icon:'🛒', color:'#FFF1F2', border:'#FECDD3', text:'#BE123C' },
                { label:'Avg Rating', value:`${avgRating}★`, sub:`${reviews.length} reviews`, icon:'⭐', color:'#FFFBEB', border:'#FDE68A', text:'#92400E' },
              ].map(k => (
                <div key={k.label} style={{ ...sx.card, background:k.color, border:`1px solid ${k.border}`, padding:18 }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{k.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:k.text, fontFamily:'DM Sans,sans-serif' }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:k.text, marginTop:2 }}>{k.label}</div>
                  <div style={{ fontSize:11, color:C.mu, marginTop:2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
              {/* Revenue chart */}
              <div style={sx.card}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Revenue — Last 7 Days</h3>
                <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
                  {[
                    { day:'Mon', val:3200 },{ day:'Tue', val:4100 },{ day:'Wed', val:2800 },
                    { day:'Thu', val:5600 },{ day:'Fri', val:4900 },{ day:'Sat', val:7200 },{ day:'Sun', val:6100 },
                  ].map(d => (
                    <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:10, color:C.mu }}>₹{(d.val/1000).toFixed(1)}k</span>
                      <div style={{ width:'100%', background:`linear-gradient(180deg,${C.teal2},${C.teal})`, borderRadius:'4px 4px 0 0', height:`${(d.val/7200)*100}%`, minHeight:4 }} />
                      <span style={{ fontSize:11, color:C.mu, fontWeight:600 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders by status */}
              <div style={sx.card}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Orders by Status</h3>
                {(['new','processing','shipped','delivered'] as const).map(s => {
                  const cnt = orders.filter(o=>o.status===s).length
                  return (
                    <div key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <span style={{ fontSize:12, fontWeight:600, width:80, textTransform:'capitalize', color: statusColors[s].color }}>{s}</span>
                      <div style={{ flex:1, height:8, background:'#F3F4F6', borderRadius:4 }}>
                        <div style={{ height:'100%', width:`${(cnt/orders.length)*100}%`, background:statusColors[s].color, borderRadius:4, transition:'width 0.4s' }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:C.dark, width:16, textAlign:'right' }}>{cnt}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent orders */}
            <div style={sx.card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark }}>Recent Orders</h3>
                <button onClick={()=>setTab('orders')} style={{ ...sx.btn, background:C.cream, color:C.teal, fontSize:12, padding:'6px 14px' }}>View All →</button>
              </div>
              {orders.slice(0,3).map(o => (
                <div key={o.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div>
                    <p style={{ fontWeight:700, color:C.dark, fontSize:14, margin:0 }}>{o.id}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>{o.product} · {o.customer}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ ...statusColors[o.status], borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, display:'inline-block', marginBottom:2 }}>{o.status}</span>
                    <p style={{ fontSize:13, fontWeight:700, color:C.dark, margin:'2px 0 0' }}>₹{o.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: PRODUCTS
        ════════════════════════════════════════════════════════════ */}
        {tab==='products' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Product Management</h1>
                <p style={{ color:C.mu, fontSize:13 }}>{products.length} products · {products.filter(p=>p.active).length} active</p>
              </div>
              <button onClick={openAddProduct} style={{ ...sx.btn, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', padding:'12px 22px' }}>+ Add Product</button>
            </div>
            <div style={{ ...sx.card, padding:'14px 16px', marginBottom:16 }}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search products..." style={{ ...sx.input, maxWidth:360 }} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filteredProducts.map(p => {
                const disc = p.mrp > p.price ? Math.round((1-p.price/p.mrp)*100) : 0
                return (
                  <div key={p.id} style={{ ...sx.card, display:'flex', alignItems:'center', gap:16, padding:16 }}>
                    <div style={{ width:56, height:56, borderRadius:12, background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{p.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <p style={{ fontWeight:700, color:C.dark, fontSize:15, margin:0 }}>{p.name}</p>
                        <span style={{ fontSize:11, background:'#F3F4F6', color:C.mu, borderRadius:6, padding:'2px 8px' }}>{p.category}</span>
                        {p.concerns.length > 0 && p.concerns.slice(0,2).map(c => <span key={c} style={{ fontSize:10, background:'rgba(45,95,90,0.08)', color:C.teal, borderRadius:6, padding:'2px 7px', fontWeight:600 }}>{c}</span>)}
                      </div>
                      <div style={{ display:'flex', gap:16, fontSize:13 }}>
                        <span style={{ fontWeight:700, color:C.dark }}>₹{p.price}</span>
                        {disc > 0 && <span style={{ color:C.mu, textDecoration:'line-through' }}>₹{p.mrp}</span>}
                        {disc > 0 && <span style={{ color:'#16A34A', fontWeight:700 }}>{disc}% off</span>}
                        <span style={{ color: p.stock < 10 ? '#DC2626' : C.mu }}>Stock: {p.stock}</span>
                        <span style={{ color:C.mu }}>★ {p.rating}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={()=>{ const u=products.map(x=>x.id===p.id?{...x,active:!x.active}:x); setProducts(u) }} style={{ ...sx.btn, padding:'6px 14px', background: p.active ? '#F0FDF4' : '#FEF2F2', color: p.active ? '#16A34A' : '#DC2626', fontSize:12 }}>{p.active ? 'Active':'Inactive'}</button>
                      <button onClick={()=>openEditProduct(p)} style={{ ...sx.btn, padding:'6px 14px', background:C.cream, color:C.dark, fontSize:12 }}>Edit</button>
                      <button onClick={()=>deleteProduct(p.id)} style={{ ...sx.btn, padding:'6px 14px', background:'#FEF2F2', color:'#DC2626', fontSize:12 }}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: AI MAPPING
        ════════════════════════════════════════════════════════════ */}
        {tab==='ai-mapping' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>AI Mapping Control 🧬</h1>
            <p style={{ color:C.mu, fontSize:14, marginBottom:20 }}>Map your products to skin concerns. The DermIQ AI will automatically suggest your products when users have these concerns.</p>

            <div style={{ ...sx.card, marginBottom:16, padding:18, background:'rgba(45,95,90,0.04)', border:`1.5px solid ${C.teal}` }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:28 }}>🤖</span>
                <div>
                  <p style={{ fontWeight:700, color:C.teal, fontSize:15, margin:0 }}>How AI Mapping Works</p>
                  <p style={{ color:C.mu, fontSize:13, margin:'6px 0 0', lineHeight:1.6 }}>
                    When a DermIQ user completes their skin analysis, our AI generates a personalised report. Products you've mapped to matching concerns will appear as recommendations — driving qualified traffic directly to your listings.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {products.map(p => (
                <div key={p.id} style={sx.card}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:24 }}>{p.emoji}</span>
                    <div>
                      <p style={{ fontWeight:700, color:C.dark, fontSize:15, margin:0 }}>{p.name}</p>
                      <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>{p.category} · ₹{p.price}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Mapped Skin Concerns</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {SKIN_CONCERNS.map(c => {
                      const active = p.concerns.includes(c)
                      return (
                        <button key={c} onClick={() => {
                          setProducts(prev => prev.map(x => x.id===p.id ? { ...x, concerns: active ? x.concerns.filter(cc=>cc!==c) : [...x.concerns, c] } : x))
                        }} style={{
                          padding:'6px 14px', borderRadius:20, border:`1.5px solid ${active ? C.teal : C.border}`,
                          background: active ? 'rgba(45,95,90,0.08)' : '#fff',
                          color: active ? C.teal : C.mu,
                          fontSize:12, fontWeight: active ? 700 : 500, cursor:'pointer', transition:'all 0.15s'
                        }}>{active ? '✓ ':''}{c}</button>
                      )
                    })}
                  </div>
                  {p.concerns.length > 0 && (
                    <div style={{ marginTop:12, padding:'8px 12px', background:'#F0FDF4', borderRadius:8, fontSize:12, color:'#16A34A', fontWeight:600 }}>
                      ✓ This product will be suggested for {p.concerns.length} concern{p.concerns.length!==1?'s':''}: {p.concerns.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: ORDERS
        ════════════════════════════════════════════════════════════ */}
        {tab==='orders' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Order Management</h1>
            <p style={{ color:C.mu, fontSize:13, marginBottom:20 }}>{orders.length} total orders</p>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['all','new','processing','shipped','delivered','cancelled'].map(f => (
                <button key={f} onClick={()=>setOrderFilter(f)} style={{
                  ...sx.btn, padding:'8px 16px', fontSize:12, textTransform:'capitalize',
                  background: orderFilter===f ? C.teal : C.cream,
                  color: orderFilter===f ? '#fff' : C.dark,
                }}>{f} {f!=='all' && `(${orders.filter(o=>o.status===f).length})`}</button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filteredOrders.map(o => (
                <div key={o.id} style={sx.card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                        <span style={{ fontWeight:800, color:C.dark, fontSize:16 }}>{o.id}</span>
                        <span style={{ ...statusColors[o.status], borderRadius:8, padding:'3px 12px', fontSize:12, fontWeight:700 }}>{o.status}</span>
                      </div>
                      <p style={{ fontSize:13, color:C.mu, margin:0 }}>{o.product} × {o.qty} · {o.customer} · {o.address}</p>
                      <p style={{ fontSize:12, color:C.mu, margin:'4px 0 0' }}>📅 {o.date}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:20, fontWeight:800, color:C.dark, margin:0 }}>₹{o.amount}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {o.status==='new' && <>
                      <button onClick={()=>updateOrderStatus(o.id,'processing')} style={{ ...sx.btn, background:'#EFF6FF', color:'#2563EB', fontSize:12, padding:'7px 16px' }}>Accept & Process</button>
                      <button onClick={()=>updateOrderStatus(o.id,'cancelled')} style={{ ...sx.btn, background:'#FEF2F2', color:'#DC2626', fontSize:12, padding:'7px 16px' }}>Reject</button>
                    </>}
                    {o.status==='processing' && <button onClick={()=>updateOrderStatus(o.id,'shipped')} style={{ ...sx.btn, background:C.cream, color:C.teal, fontSize:12, padding:'7px 16px' }}>Mark Shipped 🚚</button>}
                    {o.status==='shipped' && <button onClick={()=>updateOrderStatus(o.id,'delivered')} style={{ ...sx.btn, background:'#F0FDF4', color:'#16A34A', fontSize:12, padding:'7px 16px' }}>Mark Delivered ✓</button>}
                    <button onClick={()=>toast.success('Invoice downloaded!')} style={{ ...sx.btn, background:C.cream, color:C.mu, fontSize:12, padding:'7px 16px' }}>Invoice 📄</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: PAYMENTS
        ════════════════════════════════════════════════════════════ */}
        {tab==='payments' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:20 }}>Payments & Earnings</h1>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { label:'Total Earned', value:'₹48,320', icon:'💰', color:'#ECFDF5', text:'#065F46' },
                { label:'This Month', value:'₹12,430', icon:'📅', color:'#EFF6FF', text:'#1D4ED8' },
                { label:'Pending Payout', value:'₹8,750', icon:'⏳', color:'#FFF7ED', text:'#C2410C' },
                { label:'DermIQ Commission (15%)', value:'₹1,864', icon:'🏪', color:'#F5F3FF', text:'#5B21B6' },
              ].map(k => (
                <div key={k.label} style={{ ...sx.card, background:k.color, padding:18 }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{k.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:k.text }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:k.text, marginTop:4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Commission explanation */}
            <div style={{ ...sx.card, background:'#FFFBEB', border:'1px solid #FDE68A', marginBottom:20, padding:18 }}>
              <p style={{ fontWeight:700, color:'#92400E', margin:'0 0 6px' }}>📋 Commission Structure</p>
              <p style={{ color:'#78350F', fontSize:13, margin:0 }}>DermIQ charges a <strong>15% platform fee</strong> on each sale. You receive <strong>85%</strong> of the sale price. Payouts are processed on the 1st of every month to your registered bank account.</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Withdraw */}
              <div style={sx.card}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Request Withdrawal</h3>
                <p style={{ fontSize:13, color:C.mu, marginBottom:12 }}>Available: <strong style={{ color:'#16A34A' }}>₹8,750</strong></p>
                <label style={sx.label}>Amount (₹)</label>
                <input value={withdrawAmt} onChange={e=>setWithdrawAmt(e.target.value)} placeholder="Enter amount" type="number" style={{ ...sx.input, marginBottom:14 }} />
                <button onClick={()=>{ if(!withdrawAmt) return; toast.success(`Withdrawal of ₹${withdrawAmt} requested!`); setWithdrawAmt('') }} style={{ ...sx.btn, width:'100%', background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', padding:12 }}>
                  Request Withdrawal
                </button>
              </div>

              {/* Bank details */}
              <div style={sx.card}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Bank Account Details</h3>
                {['holder','account','ifsc','bank','upi'].map(f => (
                  <div key={f} style={{ marginBottom:12 }}>
                    <label style={sx.label}>{f==='upi' ? 'UPI ID' : f==='ifsc' ? 'IFSC Code' : f==='holder' ? 'Account Holder' : f==='account' ? 'Account Number' : 'Bank Name'}</label>
                    <input value={(bankForm as Record<string,string>)[f]} onChange={e=>setBankForm(prev=>({...prev,[f]:e.target.value}))} style={sx.input} placeholder={f==='upi' ? 'yourname@upi' : '...'} />
                  </div>
                ))}
                <button onClick={()=>toast.success('Bank details saved!')} style={{ ...sx.btn, width:'100%', background:C.teal, color:'#fff', padding:10, marginTop:4 }}>Save Bank Details</button>
              </div>
            </div>

            {/* Transaction history */}
            <div style={{ ...sx.card, marginTop:16 }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Recent Transactions</h3>
              {[
                { date:'Mar 1, 2026', desc:'Monthly payout', amount:'+₹12,430', color:'#16A34A' },
                { date:'Feb 1, 2026', desc:'Monthly payout', amount:'+₹9,870', color:'#16A34A' },
                { date:'Jan 1, 2026', desc:'Monthly payout', amount:'+₹11,240', color:'#16A34A' },
                { date:'Mar 20, 2026', desc:'Commission deducted', amount:'-₹1,864', color:'#DC2626' },
              ].map((t,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:C.dark, margin:0 }}>{t.desc}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>{t.date}</p>
                  </div>
                  <span style={{ fontWeight:800, color:t.color, fontSize:16 }}>{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: INVENTORY
        ════════════════════════════════════════════════════════════ */}
        {tab==='inventory' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:20 }}>Inventory Management</h1>

            {/* Low stock alerts */}
            {products.filter(p=>p.stock<20).length > 0 && (
              <div style={{ ...sx.card, background:'#FEF2F2', border:'1px solid #FECACA', marginBottom:20, padding:16 }}>
                <p style={{ fontWeight:700, color:'#DC2626', margin:'0 0 10px', fontSize:14 }}>⚠️ Low Stock Alerts</p>
                {products.filter(p=>p.stock<20).map(p => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #FECACA' }}>
                    <span style={{ fontSize:13, color:'#7F1D1D', fontWeight:600 }}>{p.emoji} {p.name}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:'#DC2626' }}>{p.stock} units left</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {products.map(p => (
                <div key={p.id} style={{ ...sx.card, display:'flex', alignItems:'center', gap:16 }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{p.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:C.dark, margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>{p.category} {p.size && `· ${p.size}`}</p>
                  </div>
                  {/* Stock bar */}
                  <div style={{ flex:1, maxWidth:200 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:C.mu }}>Stock</span>
                      <span style={{ fontSize:12, fontWeight:700, color: p.stock<10 ? '#DC2626' : p.stock<30 ? '#D97706' : '#16A34A' }}>{p.stock} units</span>
                    </div>
                    <div style={{ height:8, background:'#F3F4F6', borderRadius:4 }}>
                      <div style={{ height:'100%', borderRadius:4, width:`${Math.min(100,(p.stock/200)*100)}%`, background: p.stock<10 ? '#DC2626' : p.stock<30 ? '#F59E0B' : '#16A34A', transition:'width 0.4s' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input
                      type="number"
                      defaultValue={p.stock}
                      style={{ ...sx.input, width:80, textAlign:'center' }}
                      onBlur={e => { const v=+e.target.value; if(!isNaN(v)) { setProducts(prev=>prev.map(x=>x.id===p.id?{...x,stock:v}:x)); toast.success('Stock updated') } }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: OFFERS
        ════════════════════════════════════════════════════════════ */}
        {tab==='offers' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark }}>Offers & Discounts</h1>
              <button onClick={()=>{ setCouponForm({code:'',type:'percent',value:'',minOrder:'',active:true}); setCouponModal(true) }} style={{ ...sx.btn, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', padding:'12px 22px' }}>+ Create Coupon</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {coupons.map(c => (
                <div key={c.id} style={{ ...sx.card, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ padding:'12px 18px', borderRadius:12, background:C.cream, border:`2px dashed ${C.border}`, textAlign:'center', flexShrink:0 }}>
                    <p style={{ fontWeight:800, fontSize:16, color:C.dark, margin:0, fontFamily:'monospace', letterSpacing:2 }}>{c.code}</p>
                    <p style={{ fontSize:12, color:C.teal, fontWeight:700, margin:'2px 0 0' }}>{c.type==='percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}</p>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, color:C.dark, margin:0 }}>Min order: ₹{c.minOrder}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'4px 0 0' }}>Used {c.uses} times</p>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>{ setCoupons(prev=>prev.map(x=>x.id===c.id?{...x,active:!x.active}:x)) }} style={{ ...sx.btn, padding:'6px 14px', fontSize:12, background: c.active?'#F0FDF4':'#FEF2F2', color: c.active?'#16A34A':'#DC2626' }}>{c.active?'Active':'Paused'}</button>
                    <button onClick={()=>{ setCoupons(prev=>prev.filter(x=>x.id!==c.id)); toast.success('Coupon deleted') }} style={{ ...sx.btn, padding:'6px 14px', fontSize:12, background:'#FEF2F2', color:'#DC2626' }}>Delete</button>
                  </div>
                </div>
              ))}
              {coupons.length===0 && <div style={{ textAlign:'center', padding:40, color:C.mu }}>No coupons yet. Create your first offer!</div>}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: REVIEWS
        ════════════════════════════════════════════════════════════ */}
        {tab==='reviews' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Reviews & Ratings</h1>
            <p style={{ color:C.mu, fontSize:13, marginBottom:20 }}>{reviews.length} reviews · Average {avgRating}★</p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {reviews.map(r => (
                <div key={r.id} style={sx.card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:700, color:C.dark }}>{r.customer}</span>
                        <Stars n={r.rating} />
                        <span style={{ fontSize:11, color:C.mu }}>{r.date}</span>
                      </div>
                      <p style={{ fontSize:12, color:C.teal, margin:0, fontWeight:600 }}>on {r.product}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:14, color:'#374151', margin:'0 0 12px', lineHeight:1.6 }}>"{r.comment}"</p>
                  {r.reply ? (
                    <div style={{ padding:'10px 14px', background:C.cream, borderRadius:10, borderLeft:`3px solid ${C.teal}` }}>
                      <p style={{ fontSize:11, fontWeight:700, color:C.teal, margin:'0 0 4px' }}>Your Reply</p>
                      <p style={{ fontSize:13, color:'#374151', margin:0 }}>{r.reply}</p>
                    </div>
                  ) : (
                    <button onClick={()=>{ setReplyModal(r); setReplyText('') }} style={{ ...sx.btn, background:C.cream, color:C.teal, fontSize:12, padding:'7px 16px' }}>Reply to Review</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════════════════════════ */}
        {tab==='analytics' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:20 }}>Analytics & Insights</h1>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { label:'Conversion Rate', value:'4.2%', icon:'🎯', sub:'From AI recommendations', color:'#EFF6FF', text:'#1D4ED8' },
                { label:'AI-Driven Sales', value:'68%', icon:'🤖', sub:'Of total revenue', color:'#F5F3FF', text:'#5B21B6' },
                { label:'Page Views', value:'12.4k', icon:'👁️', sub:'This month', color:'#F0FDF4', text:'#16A34A' },
                { label:'Return Customers', value:'38%', icon:'❤️', sub:'Repeat purchase rate', color:'#FFF1F2', text:'#BE123C' },
              ].map(k => (
                <div key={k.label} style={{ ...sx.card, background:k.color, padding:18 }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{k.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:k.text }}>{k.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:k.text, marginTop:2 }}>{k.label}</div>
                  <div style={{ fontSize:11, color:C.mu, marginTop:4 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div style={{ ...sx.card, marginBottom:16 }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>🤖 AI Performance Insights</h3>
              {[
                { text:'Your Niacinamide Serum performs 40% better than category average in Acne recommendations', icon:'📈', color:'#F0FDF4', border:'#BBF7D0', textColor:'#14532D' },
                { text:'Users with Dryness concern are 3x more likely to purchase your Moisturizer after AI recommendation', icon:'💡', color:'#EFF6FF', border:'#BFDBFE', textColor:'#1E3A5F' },
                { text:'Pigmentation products in your catalogue have low competition — consider adding more to dominate this segment', icon:'🎯', color:'#FFFBEB', border:'#FDE68A', textColor:'#78350F' },
                { text:'Friday evenings see peak AI recommendation conversions — consider scheduling promotions then', icon:'⏰', color:'#F5F3FF', border:'#DDD6FE', textColor:'#3B0764' },
              ].map((ins,i) => (
                <div key={i} style={{ padding:'12px 14px', borderRadius:10, background:ins.color, border:`1px solid ${ins.border}`, marginBottom:10, display:'flex', gap:10 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{ins.icon}</span>
                  <p style={{ fontSize:13, color:ins.textColor, margin:0, lineHeight:1.6 }}>{ins.text}</p>
                </div>
              ))}
            </div>

            {/* Top products */}
            <div style={sx.card}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Top Performing Products</h3>
              {[
                { name:'10% Niacinamide Serum', sales:234, revenue:93366, conversion:5.1 },
                { name:'AHA BHA Peeling Solution', sales:156, revenue:101244, conversion:4.8 },
                { name:'Moisturizing Cream SPF 50', sales:128, revenue:70272, conversion:3.9 },
              ].map((p,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:16, fontWeight:800, color:C.mu, width:20 }}>#{i+1}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:C.dark, margin:0, fontSize:14 }}>{p.name}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>{p.sales} sales</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:700, color:C.dark, margin:0 }}>₹{p.revenue.toLocaleString()}</p>
                    <p style={{ fontSize:12, color:C.teal, margin:'2px 0 0', fontWeight:600 }}>{p.conversion}% conv.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: SPECIALIST INTEGRATION
        ════════════════════════════════════════════════════════════ */}
        {tab==='specialist' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Specialist Integration 👩‍⚕️</h1>
            <p style={{ color:C.mu, fontSize:14, marginBottom:20 }}>Your products are visible to DermIQ-certified skin specialists. They can recommend your products directly to their clients.</p>

            <div style={{ ...sx.card, background:'rgba(45,95,90,0.04)', border:`1.5px solid ${C.teal}`, marginBottom:20, padding:18 }}>
              <p style={{ fontWeight:700, color:C.teal, margin:'0 0 8px' }}>How it works</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['Specialists see your active, mapped products in their recommendation panel','When they recommend your product, client gets a direct purchase link','You earn full credit + the sale appears in your analytics','You can optionally offer specialists a referral incentive'].map((s,i) => (
                  <div key={i} style={{ display:'flex', gap:10 }}>
                    <span style={{ color:C.teal, fontWeight:700, flexShrink:0 }}>{i+1}.</span>
                    <p style={{ fontSize:13, color:'#374151', margin:0 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={sx.card}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>Products Visible to Specialists</h3>
              {products.filter(p=>p.active && p.concerns.length>0).map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:22 }}>{p.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:C.dark, margin:0, fontSize:14 }}>{p.name}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'2px 0 0' }}>Visible for: {p.concerns.join(' · ')}</p>
                  </div>
                  <span style={{ fontSize:12, background:'#F0FDF4', color:'#16A34A', borderRadius:8, padding:'4px 10px', fontWeight:700 }}>✓ Visible</span>
                </div>
              ))}
              {products.filter(p=>p.active && p.concerns.length>0).length===0 && (
                <p style={{ color:C.mu, fontSize:13, textAlign:'center', padding:20 }}>No products mapped to skin concerns yet. Go to AI Mapping tab to set this up.</p>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: AI SYSTEM
        ════════════════════════════════════════════════════════════ */}
        {tab==='ai-system' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>AI System Integration 🤖</h1>
            <p style={{ color:C.mu, fontSize:14, marginBottom:20 }}>Control how your products appear in DermIQ's AI-powered skin analysis flow.</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { title:'AI Recommendation Engine', desc:'Your mapped products are automatically suggested based on user skin analysis scores', status:'Active', icon:'🧬', color:'#F0FDF4', border:'#BBF7D0', statusColor:'#16A34A' },
                { title:'Routine Builder Integration', desc:'Products can appear in AI-generated skincare routines (AM/PM)', status:'Active', icon:'🌅', color:'#EFF6FF', border:'#BFDBFE', statusColor:'#2563EB' },
                { title:'Smart Product Matching', desc:'AI matches product ingredients to user skin concerns for accuracy', status:'Active', icon:'🎯', color:'#F5F3FF', border:'#DDD6FE', statusColor:'#7C3AED' },
                { title:'Real-time Stock Sync', desc:'AI will not recommend out-of-stock products automatically', status:'Active', icon:'🔄', color:'#FFFBEB', border:'#FDE68A', statusColor:'#D97706' },
              ].map(c => (
                <div key={c.title} style={{ ...sx.card, background:c.color, border:`1px solid ${c.border}`, padding:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <span style={{ fontSize:28 }}>{c.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:c.statusColor, background:'#fff', borderRadius:20, padding:'3px 10px' }}>{c.status}</span>
                  </div>
                  <p style={{ fontWeight:700, color:C.dark, margin:'0 0 6px', fontSize:14 }}>{c.title}</p>
                  <p style={{ fontSize:12, color:C.mu, margin:0, lineHeight:1.6 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            <div style={sx.card}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:16 }}>AI Recommendation Flow</h3>
              <div style={{ display:'flex', gap:0, overflowX:'auto' }}>
                {[
                  { step:'User takes\nSkin Quiz', icon:'📋' },
                  { step:'AI analyses\nskin data', icon:'🔬' },
                  { step:'Matches\nconcerns', icon:'🎯' },
                  { step:'Your products\nmapped to concerns', icon:'🧬' },
                  { step:'Product\nrecommended', icon:'📦' },
                  { step:'User\npurchases', icon:'💰' },
                ].map((s,i,arr) => (
                  <div key={i} style={{ display:'flex', alignItems:'center' }}>
                    <div style={{ textAlign:'center', minWidth:90 }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background: i===3?`linear-gradient(135deg,${C.teal},${C.teal2})`:C.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'0 auto 6px', boxShadow: i===3?'0 4px 14px rgba(45,95,90,0.3)':'none' }}>{s.icon}</div>
                      <p style={{ fontSize:11, color: i===3?C.teal:C.mu, fontWeight: i===3?700:400, margin:0, whiteSpace:'pre-line', textAlign:'center', lineHeight:1.4 }}>{s.step}</p>
                    </div>
                    {i<arr.length-1 && <div style={{ width:20, flexShrink:0, height:2, background:C.border, margin:'0 2px' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: NOTIFICATIONS
        ════════════════════════════════════════════════════════════ */}
        {tab==='notifications' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Notifications 🔔</h1>
                <p style={{ color:C.mu, fontSize:13 }}>{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && <button onClick={()=>setNotifs(prev=>prev.map(n=>({...n,read:true})))} style={{ ...sx.btn, background:C.cream, color:C.teal, fontSize:12, padding:'8px 16px' }}>Mark all read</button>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {notifs.map(n => (
                <div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} style={{ ...sx.card, display:'flex', gap:14, alignItems:'flex-start', cursor:'pointer', opacity: n.read ? 0.7 : 1, borderLeft:`3px solid ${n.read ? C.border : C.teal}` }}>
                  <span style={{ fontSize:24, flexShrink:0 }}>{notifIcons[n.type]}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight: n.read ? 500 : 700, color:C.dark, margin:0, fontSize:14 }}>{n.message}</p>
                    <p style={{ fontSize:12, color:C.mu, margin:'4px 0 0' }}>{n.time}</p>
                  </div>
                  {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:C.teal, flexShrink:0, marginTop:6 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: KYC / VERIFICATION
        ════════════════════════════════════════════════════════════ */}
        {tab==='kyc' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:4 }}>Vendor Verification & KYC ✅</h1>
            <p style={{ color:C.mu, fontSize:14, marginBottom:20 }}>Complete verification to unlock all features, higher payouts, and the Verified Seller badge on your products.</p>

            {/* Verification status */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'GST Verification', status:'Verified', icon:'🏛️', color:'#F0FDF4', text:'#16A34A' },
                { label:'PAN / Tax ID', status:'Verified', icon:'🪪', color:'#F0FDF4', text:'#16A34A' },
                { label:'Trademark', status:'Pending', icon:'™️', color:'#FFF7ED', text:'#D97706' },
                { label:'Bank Account', status:'Verified', icon:'🏦', color:'#F0FDF4', text:'#16A34A' },
                { label:'FSSAI (if applicable)', status:'Not Submitted', icon:'🍃', color:'#F9FAFB', text:C.mu },
              ].map(v => (
                <div key={v.label} style={{ ...sx.card, background:v.color, padding:16 }}>
                  <span style={{ fontSize:24 }}>{v.icon}</span>
                  <p style={{ fontWeight:700, color:'#1A1A1A', margin:'8px 0 4px', fontSize:13 }}>{v.label}</p>
                  <span style={{ fontSize:12, fontWeight:700, color:v.text }}>{v.status}</span>
                </div>
              ))}
            </div>

            <div style={sx.card}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:C.dark, marginBottom:20 }}>Submit / Update Documents</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { key:'gst', label:'GST Number', placeholder:'22AAAAA0000A1Z5' },
                  { key:'pan', label:'PAN Number', placeholder:'ABCDE1234F' },
                  { key:'trademark', label:'Trademark Registration No.', placeholder:'Optional' },
                  { key:'fssai', label:'FSSAI License No.', placeholder:'Optional for cosmetics' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={sx.label}>{f.label}</label>
                    <input value={(kycForm as Record<string,string>)[f.key]} onChange={e=>setKycForm(prev=>({...prev,[f.key]:e.target.value}))} placeholder={f.placeholder} style={sx.input} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16 }}>
                <label style={sx.label}>Upload Documents (PDF/Image)</label>
                <div style={{ border:`2px dashed ${C.border}`, borderRadius:12, padding:'24px', textAlign:'center', cursor:'pointer', background:C.cream }}>
                  <p style={{ fontSize:32, margin:'0 0 8px' }}>📎</p>
                  <p style={{ fontSize:14, color:C.mu, margin:0 }}>Click to upload or drag & drop documents here</p>
                  <p style={{ fontSize:12, color:C.mu, margin:'4px 0 0' }}>PDF, JPG, PNG up to 10MB each</p>
                </div>
              </div>
              <button onClick={()=>toast.success('Documents submitted for review!')} style={{ ...sx.btn, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', padding:'13px 28px', marginTop:16 }}>
                Submit for Verification
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: BRAND PROFILE
        ════════════════════════════════════════════════════════════ */}
        {tab==='brand' && (
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark, marginBottom:20 }}>Brand Profile 🏷️</h1>
            <div style={sx.card}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { key:'name', label:'Brand Name', placeholder:'e.g. The Minimalist' },
                  { key:'tagline', label:'Tagline', placeholder:'Your brand tagline' },
                  { key:'website', label:'Website', placeholder:'https://yourwebsite.com' },
                  { key:'instagram', label:'Instagram Handle', placeholder:'@yourbrand' },
                  { key:'founded', label:'Founded Year', placeholder:'e.g. 2020' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={sx.label}>{f.label}</label>
                    <input value={(brandForm as Record<string,string>)[f.key]} onChange={e=>setBrandForm(prev=>({...prev,[f.key]:e.target.value}))} placeholder={f.placeholder} style={sx.input} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16 }}>
                <label style={sx.label}>Brand Story</label>
                <textarea value={brandForm.story} onChange={e=>setBrandForm(prev=>({...prev,story:e.target.value}))} rows={4} placeholder="Tell customers about your brand, values, and mission..." style={{ ...sx.input, resize:'vertical' } as React.CSSProperties} />
              </div>
              <button onClick={()=>{ setVendorName(brandForm.name||vendorName); toast.success('Brand profile saved!') }} style={{ ...sx.btn, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', padding:'13px 28px', marginTop:16 }}>
                Save Brand Profile
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── Product Modal ───────────────────────────────────────────── */}
      {productModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:C.dark, margin:0 }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={()=>setProductModal(false)} style={{ border:'none', background:C.cream, borderRadius:8, padding:8, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={sx.label}>Product Name *</label>
                <input value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))} style={sx.input} placeholder="e.g. 10% Niacinamide Serum" />
              </div>
              <div>
                <label style={sx.label}>Category</label>
                <select value={pForm.category} onChange={e=>setPForm(f=>({...f,category:e.target.value}))} style={sx.input}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={sx.label}>Emoji</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {EMOJIS.map(e=><button key={e} onClick={()=>setPForm(f=>({...f,emoji:e}))} style={{ width:34, height:34, borderRadius:8, border:`2px solid ${pForm.emoji===e?C.teal:C.border}`, background:pForm.emoji===e?'rgba(45,95,90,0.08)':'#fff', cursor:'pointer', fontSize:16 }}>{e}</button>)}
                </div>
              </div>
              <div>
                <label style={sx.label}>Sale Price (₹) *</label>
                <input value={pForm.price} onChange={e=>setPForm(f=>({...f,price:e.target.value}))} type="number" style={sx.input} placeholder="399" />
              </div>
              <div>
                <label style={sx.label}>MRP (₹)</label>
                <input value={pForm.mrp} onChange={e=>setPForm(f=>({...f,mrp:e.target.value}))} type="number" style={sx.input} placeholder="699" />
              </div>
              <div>
                <label style={sx.label}>Stock Units</label>
                <input value={pForm.stock} onChange={e=>setPForm(f=>({...f,stock:e.target.value}))} type="number" style={sx.input} placeholder="100" />
              </div>
              <div>
                <label style={sx.label}>Size / Volume</label>
                <input value={pForm.size} onChange={e=>setPForm(f=>({...f,size:e.target.value}))} style={sx.input} placeholder="30ml" />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={sx.label}>Description</label>
                <textarea value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} rows={3} style={{ ...sx.input, resize:'vertical' } as React.CSSProperties} placeholder="Short product description..." />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={sx.label}>Skin Concerns (AI Mapping)</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {SKIN_CONCERNS.map(c=>{
                    const sel = pForm.concerns.includes(c)
                    return <button key={c} onClick={()=>toggleConcern(c)} style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${sel?C.teal:C.border}`, background:sel?'rgba(45,95,90,0.08)':'#fff', color:sel?C.teal:C.mu, fontSize:12, fontWeight:sel?700:500, cursor:'pointer' }}>{sel?'✓ ':''}{c}</button>
                  })}
                </div>
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="activeChk" checked={pForm.active} onChange={e=>setPForm(f=>({...f,active:e.target.checked}))} />
                <label htmlFor="activeChk" style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, cursor:'pointer' }}>List product as active</label>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>setProductModal(false)} style={{ ...sx.btn, flex:1, background:C.cream, color:C.dark }}>Cancel</button>
              <button onClick={saveProduct} style={{ ...sx.btn, flex:2, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff' }}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Coupon Modal ────────────────────────────────────────────── */}
      {couponModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:C.dark, margin:0 }}>Create Coupon</h2>
              <button onClick={()=>setCouponModal(false)} style={{ border:'none', background:C.cream, borderRadius:8, padding:8, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={sx.label}>Coupon Code</label><input value={couponForm.code} onChange={e=>setCouponForm(f=>({...f,code:e.target.value.toUpperCase()}))} style={sx.input} placeholder="SAVE20" /></div>
              <div><label style={sx.label}>Discount Type</label>
                <select value={couponForm.type} onChange={e=>setCouponForm(f=>({...f,type:e.target.value as 'percent'|'flat'}))} style={sx.input}>
                  <option value="percent">Percentage (%)</option><option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div><label style={sx.label}>Discount Value</label><input value={couponForm.value} onChange={e=>setCouponForm(f=>({...f,value:e.target.value}))} type="number" style={sx.input} placeholder={couponForm.type==='percent'?'20':'100'} /></div>
              <div><label style={sx.label}>Minimum Order (₹)</label><input value={couponForm.minOrder} onChange={e=>setCouponForm(f=>({...f,minOrder:e.target.value}))} type="number" style={sx.input} placeholder="499" /></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>setCouponModal(false)} style={{ ...sx.btn, flex:1, background:C.cream, color:C.dark }}>Cancel</button>
              <button onClick={saveCoupon} style={{ ...sx.btn, flex:2, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff' }}>Create Coupon</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reply Modal ─────────────────────────────────────────────── */}
      {replyModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:440 }}>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:C.dark, marginBottom:12 }}>Reply to Review</h2>
            <div style={{ padding:'10px 14px', background:C.cream, borderRadius:10, marginBottom:14 }}>
              <Stars n={replyModal.rating} />
              <p style={{ fontSize:13, color:'#374151', margin:'6px 0 0', fontStyle:'italic' }}>"{replyModal.comment}"</p>
              <p style={{ fontSize:11, color:C.mu, margin:'4px 0 0' }}>— {replyModal.customer}</p>
            </div>
            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={4} placeholder="Write a helpful, professional reply..." style={{ ...sx.input, resize:'vertical' } as React.CSSProperties} />
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button onClick={()=>setReplyModal(null)} style={{ ...sx.btn, flex:1, background:C.cream, color:C.dark }}>Cancel</button>
              <button onClick={submitReply} style={{ ...sx.btn, flex:2, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff' }}>Post Reply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
