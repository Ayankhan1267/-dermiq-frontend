'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { getProductById, ALL_PRODUCTS, type Product } from '@/lib/products'
import toast from 'react-hot-toast'

// ── Helpers ────────────────────────────────────────────────────────────────
const C = { teal:'#2D5F5A', teal2:'#3D7A74', accent:'#C8976A', dark:'#1A2E2B', mu:'#6B7280', border:'#E8E0D8', cream:'#F7F3EE' }

function Stars({ n, size=14 }: { n:number; size?:number }) {
  return <span>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<Math.round(n)?'#F59E0B':'#E5E7EB',fontSize:size}}>★</span>)}</span>
}

const ANN = ['✨ FREE shipping on orders above ₹799','Use code DERMIQ15 for 15% off','🧠 Free AI Skin Analysis','👨‍⚕️ Expert Consultations from ₹499','🌿 100% Clean Ingredients','🚚 Same-day dispatch before 2 PM']
const ANN_DOUBLED = [...ANN, ...ANN]

// ── Review data ────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { name:'Priya S.', rating:5, date:'Mar 18, 2026', skin:'Oily + Acne-prone', verified:true, comment:'This serum genuinely changed my skin in 3 weeks. My acne marks have faded significantly and my pores look smaller. Highly recommend for oily skin!', helpful:42 },
  { name:'Rahul M.', rating:4, date:'Mar 12, 2026', skin:'Combination', verified:true, comment:'Good product, noticeable results after 2 weeks of consistent use. Texture is lightweight and absorbs quickly. Only wish it was a larger bottle.', helpful:18 },
  { name:'Sneha K.', rating:5, date:'Mar 5, 2026', skin:'Sensitive', verified:true, comment:'I was skeptical because I have sensitive skin but this is so gentle. No irritation at all and my skin tone has evened out beautifully.', helpful:35 },
  { name:'Arjun P.', rating:4, date:'Feb 28, 2026', skin:'Normal', verified:false, comment:'Decent product for the price. Skin feels cleaner and brighter. The DermIQ AI actually recommended this based on my skin scan and it was spot on!', helpful:11 },
]

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('overview')
  const [wishlist, setWishlist] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [aiScore, setAiScore] = useState<number|null>(null)
  const [showSticky, setShowSticky] = useState(false)
  const [reviewFilter, setReviewFilter] = useState(0)
  const [helpfulVoted, setHelpfulVoted] = useState<number[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const product = getProductById(Number(id))

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('dermiq_open_cart', handler)
    }
  }, [])

  // Simulate AI match score from skin profile
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('ksProfile') || 'null')
      if (profile) setAiScore(Math.floor(Math.random() * 20) + 80) // 80-99%
      else setAiScore(null)
    } catch { setAiScore(null) }
  }, [])

  // Sticky buy bar on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) setShowSticky(heroRef.current.getBoundingClientRect().bottom < 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!product) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:64 }}>🔍</div>
      <h2 style={{ fontFamily:'Playfair Display,serif', color:C.dark }}>Product not found</h2>
      <Link href="/shop" style={{ padding:'12px 28px', background:C.teal, color:'#fff', borderRadius:10, textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>Back to Shop</Link>
    </div>
  )

  const disc = Math.round((1 - product.price / product.mrp) * 100)
  const related = ALL_PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand)).slice(0, 4)
  const ratingDist = [5,4,3,2,1].map(r => ({ stars:r, count: MOCK_REVIEWS.filter(rv=>rv.rating===r).length + (r===5?2:r===4?1:0) }))
  const totalRatings = ratingDist.reduce((s,d)=>s+d.count,0)

  // Thumbnail images (use same image for demo, real app would have multiple)
  const imgs = [product.image, product.image, product.image]

  function addToCart(openDrawer=true) {
    if (!product) return
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const idx = cart.findIndex((i: { id:number }) => i.id === product.id)
    if (idx >= 0) { cart[idx].qty += qty }
    else cart.push({ id:product.id, name:product.name, brand:product.brand, price:product.price, image:product.image, qty })
    localStorage.setItem('dermiq_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
    toast.success(`${qty} item${qty>1?'s':''} added to bag!`, { icon:'🛍️' })
    if (openDrawer) setCartOpen(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', paddingBottom:100 }}>

      {/* ── Announcement bar ─────────────────────────────────────── */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, background:C.dark, height:36, overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div className="ann-track">
          {ANN_DOUBLED.map((item,i) => <span key={i} style={{ padding:'0 36px', fontSize:12, fontWeight:500, color:'#fff', whiteSpace:'nowrap' }}>{item} <span style={{ color:C.accent, marginLeft:32 }}>·</span></span>)}
        </div>
      </div>

      <Navbar activePage="shop" />
      <div style={{ height:106 }} />

      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'12px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:C.mu, fontFamily:'DM Sans,sans-serif', flexWrap:'wrap' }}>
          <Link href="/" style={{ color:C.mu, textDecoration:'none' }}>Home</Link>
          <span>›</span>
          <Link href="/shop" style={{ color:C.mu, textDecoration:'none' }}>Shop</Link>
          <span>›</span>
          <Link href="/shop" style={{ color:C.mu, textDecoration:'none' }}>{product.category}</Link>
          <span>›</span>
          <span style={{ color:C.dark, fontWeight:600 }}>{product.name}</span>
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <div ref={heroRef} style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 60px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'start' }} className="product-layout">
        <style>{`
          @media(max-width:768px){.product-layout{grid-template-columns:1fr!important;gap:28px!important}}
          @media(max-width:768px){.hide-mob{display:none!important}}
          .img-thumb:hover{border-color:#2D5F5A!important;transform:scale(1.04)}
          .add-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(45,95,90,0.4)!important}
          .rel-card:hover{transform:translateY(-6px);box-shadow:0 12px 32px rgba(0,0,0,0.1)!important}
        `}</style>

        {/* ── Left: Images ──────────────────────────────────────── */}
        <div>
          {/* Main image */}
          <div style={{ position:'relative', borderRadius:24, overflow:'hidden', background:'linear-gradient(135deg,#F7F3EE,#E8F0EF)', aspectRatio:'1' }}>
            <Image src={imgs[activeImg]} alt={product.name} fill priority style={{ objectFit:'cover' }} sizes="(max-width:768px) 100vw, 50vw" />

            {/* Badge */}
            {product.badge && <span style={{ position:'absolute', top:16, left:16, background:product.badgeBg, color:'#fff', fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, fontFamily:'DM Sans,sans-serif' }}>{product.badge}</span>}

            {/* Wishlist */}
            <button onClick={()=>setWishlist(v=>!v)} style={{ position:'absolute', top:16, right:16, width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 2px 12px rgba(0,0,0,0.12)', transition:'transform 0.2s' }}>
              {wishlist ? '❤️' : '🤍'}
            </button>

            {/* AI Match badge */}
            {aiScore && (
              <div style={{ position:'absolute', bottom:16, left:16, background:'rgba(26,46,43,0.92)', backdropFilter:'blur(8px)', borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>🧬</span>
                <div>
                  <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.7)', fontFamily:'DM Sans,sans-serif' }}>AI Skin Match</p>
                  <p style={{ margin:0, fontSize:16, fontWeight:800, color:'#4ADE80', fontFamily:'DM Sans,sans-serif' }}>{aiScore}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div style={{ display:'flex', gap:10, marginTop:12 }}>
            {imgs.map((img,i) => (
              <button key={i} className="img-thumb" onClick={()=>setActiveImg(i)} style={{ flex:1, aspectRatio:'1', borderRadius:14, overflow:'hidden', border:`2px solid ${i===activeImg?C.teal:C.border}`, cursor:'pointer', padding:0, transition:'all 0.2s', position:'relative' }}>
                <Image src={img} alt="" fill style={{ objectFit:'cover' }} sizes="100px" />
              </button>
            ))}
          </div>

          {/* Trust row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:16 }}>
            {[['🧪','Clinically\nTested'],['🌿','Clean\nFormula'],['🐰','Cruelty\nFree'],['🏆','Derm\nApproved']].map(([icon,label])=>(
              <div key={label as string} style={{ textAlign:'center', padding:'12px 6px', background:C.cream, borderRadius:12, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:10, fontWeight:700, color:'#374151', fontFamily:'DM Sans,sans-serif', lineHeight:1.3, whiteSpace:'pre-line' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ───────────────────────────────── */}
        <div>
          {/* Brand + Category */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, color:C.teal, letterSpacing:'0.1em', textTransform:'uppercase' }}>{product.brand}</span>
            <span style={{ color:C.border }}>·</span>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.mu }}>{product.category}</span>
            {product.size && <span style={{ background:C.cream, color:C.mu, fontSize:11, padding:'2px 8px', borderRadius:6, border:`1px solid ${C.border}` }}>{product.size}</span>}
          </div>

          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(22px,3vw,34px)', fontWeight:700, color:C.dark, lineHeight:1.2, marginBottom:12 }}>
            {product.name}
          </h1>

          {/* Rating row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:C.teal, color:'#fff', padding:'5px 12px', borderRadius:8 }}>
              <span style={{ fontSize:13, fontWeight:800 }}>★</span>
              <span style={{ fontSize:13, fontWeight:700, fontFamily:'DM Sans,sans-serif' }}>{product.rating}</span>
            </div>
            <button onClick={()=>setTab('reviews')} style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.mu, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', padding:0 }}>
              {product.reviews.toLocaleString()} verified reviews
            </button>
            <span style={{ background:'#DCFCE7', color:'#16A34A', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, fontFamily:'DM Sans,sans-serif' }}>
              {product.inStock ? '✓ In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Short description */}
          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:15, color:'#374151', lineHeight:1.8, marginBottom:18 }}>
            {product.shortDesc}
          </p>

          {/* Key ingredients pills */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {product.keyIngredients.map(ki => (
              <div key={ki.name} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F9F8', border:`1px solid #C8E6E4`, borderRadius:20, padding:'5px 12px' }}>
                <span style={{ fontSize:14 }}>{ki.icon}</span>
                <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, color:C.teal }}>{ki.name}</span>
              </div>
            ))}
          </div>

          {/* Price block */}
          <div style={{ padding:'16px 18px', background:'linear-gradient(135deg,#F7F3EE,#FFF8F4)', borderRadius:16, border:`1px solid ${C.border}`, marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:4 }}>
              <span style={{ fontFamily:'Playfair Display,serif', fontSize:38, fontWeight:700, color:C.dark }}>₹{product.price}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:18, color:'#9CA3AF', textDecoration:'line-through' }}>₹{product.mrp}</span>
              <span style={{ background:'#FEF3C7', color:'#D97706', fontSize:14, fontWeight:800, padding:'4px 12px', borderRadius:20, fontFamily:'DM Sans,sans-serif' }}>
                {disc}% OFF
              </span>
            </div>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.mu, margin:0 }}>
              Inclusive of all taxes · Save ₹{product.mrp - product.price}
            </p>
          </div>

          {/* AI Match score (if profile exists) */}
          {aiScore && (
            <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,rgba(45,95,90,0.06),rgba(61,122,116,0.04))', border:`1.5px solid ${C.teal}`, borderRadius:14, marginBottom:18, display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:`conic-gradient(${C.teal} ${aiScore*3.6}deg, #E8E0D8 0)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:C.teal }}>{aiScore}%</div>
              </div>
              <div>
                <p style={{ fontWeight:700, color:C.teal, margin:0, fontSize:14 }}>🧬 {aiScore}% Match for Your Skin</p>
                <p style={{ fontSize:12, color:C.mu, margin:'4px 0 0', lineHeight:1.5 }}>Based on your DermIQ skin analysis, this product is highly compatible with your skin profile.</p>
              </div>
            </div>
          )}

          {/* Qty + Add to bag */}
          <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${C.border}`, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:44, height:52, border:'none', background:C.cream, cursor:'pointer', fontSize:22, fontWeight:700, color:C.dark }}>−</button>
              <span style={{ width:44, textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:700 }}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{ width:44, height:52, border:'none', background:C.cream, cursor:'pointer', fontSize:22, fontWeight:700, color:C.dark }}>+</button>
            </div>
            <button className="add-btn" onClick={()=>addToCart()} style={{ flex:1, height:52, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:`0 4px 16px rgba(45,95,90,0.3)`, transition:'all 0.2s' }}>
              🛍️ Add to Bag — ₹{(product.price*qty).toLocaleString()}
            </button>
          </div>

          <button onClick={()=>{ addToCart(false); toast.success('Proceeding to checkout...') }} style={{ width:'100%', height:48, background:'transparent', color:C.teal, border:`2px solid ${C.teal}`, borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginBottom:18, transition:'all 0.2s' }}>
            Buy Now →
          </button>

          {/* Shipping notice */}
          {product.price >= 799
            ? <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'11px 16px', marginBottom:18, fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#16A34A', fontWeight:600 }}>🚚 Qualifies for FREE shipping!</div>
            : <div style={{ background:'#FFF8F0', border:`1px solid #F5E6D3`, borderRadius:10, padding:'11px 16px', marginBottom:18, fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.accent, fontWeight:500 }}>Add ₹{(799-product.price).toLocaleString()} more for FREE shipping 🚚</div>
          }

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
            {[['🚚','Free delivery','Orders ₹799+'],['↩️','7-day returns','No questions asked'],['✅','100% Authentic','Direct from brand'],['💳','Secure checkout','6+ payment options']].map(([icon,title,sub])=>(
              <div key={title as string} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 12px', background:'#FAFAF8', borderRadius:10, border:`1px solid #F0EBE5` }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <div>
                  <p style={{ margin:0, fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, color:C.dark }}>{title}</p>
                  <p style={{ margin:0, fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.mu }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Skin type tags */}
          <div style={{ marginBottom:18 }}>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Works Best For</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {product.skinTypes.map(st => <span key={st} style={{ background:'#F0F9F8', color:C.teal, padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, fontFamily:'DM Sans,sans-serif', border:'1px solid #C8E6E4' }}>{st}</span>)}
              {product.concerns.map(c => <span key={c} style={{ background:'#FFF8F0', color:C.accent, padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, fontFamily:'DM Sans,sans-serif', border:'1px solid #F5E6D3' }}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── UNIQUE FEATURE: DermIQ Advantage strip ───────────────────── */}
      <div style={{ background:`linear-gradient(135deg,${C.dark},#243D3A)`, padding:'36px 24px', marginBottom:60 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'0.15em', color:'rgba(200,151,106,0.9)', textAlign:'center', textTransform:'uppercase', marginBottom:8 }}>Why Buy from DermIQ</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(20px,3vw,28px)', color:'#fff', textAlign:'center', marginBottom:32 }}>The Science-Backed Skincare Difference</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>
            {[
              { icon:'🧬', title:'AI Skin Matching', desc:'Our AI analyses 47 skin parameters and matches products to your exact skin profile — not generic recommendations.' },
              { icon:'👩‍⚕️', title:'Dermatologist Curated', desc:'Every product is reviewed by certified dermatologists before listing. No greenwashing, no false claims.' },
              { icon:'🔬', title:'Ingredient Transparency', desc:'Full ingredient breakdown with scientific explanations. Know exactly what goes on your skin and why.' },
              { icon:'📊', title:'Real Results Tracking', desc:'Track your skin progress over time with our AI skin analysis tool. See actual improvement data.' },
              { icon:'💬', title:'Expert Consultations', desc:'Chat with certified skin specialists for personalised advice. First consultation from just ₹499.' },
            ].map(f => (
              <div key={f.title} style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, padding:20, border:'1px solid rgba(255,255,255,0.1)', transition:'background 0.2s' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
                <p style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, color:'#fff', fontSize:14, margin:'0 0 8px' }}>{f.title}</p>
                <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ─────────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 60px' }}>

        {/* Tab nav */}
        <div style={{ display:'flex', gap:0, borderBottom:`2px solid ${C.border}`, overflowX:'auto', marginBottom:36 }} className="no-scrollbar">
          {[
            ['overview','📋 Overview'],
            ['ingredients','🔬 Ingredients'],
            ['howto','✋ How to Use'],
            ['routine','🌅 Routine Fit'],
            ['reviews','⭐ Reviews'],
          ].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flexShrink:0, padding:'14px 22px', border:'none', background:'transparent', cursor:'pointer',
              fontSize:14, fontWeight:600, fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap',
              color: tab===t ? C.teal : C.mu,
              borderBottom: tab===t ? `3px solid ${C.teal}` : '3px solid transparent',
              transition:'all 0.15s', marginBottom:-2,
            }}>{label}</button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ──────────────────────────────────────── */}
        {tab==='overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:32 }}>
            {/* About */}
            <div>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:16 }}>About This Product</h3>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:15, color:'#374151', lineHeight:1.9, marginBottom:20 }}>{product.description}</p>

              {/* Benefits checklist */}
              <h4 style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#374151', marginBottom:12 }}>What It Does</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {product.benefits.map((b,i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 14px', background:'#F0F9F8', borderRadius:10, border:'1px solid #C8E6E4' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:C.teal, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0, marginTop:1 }}>✓</div>
                    <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.dark, margin:0, fontWeight:500, lineHeight:1.5 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats + Skin Match */}
            <div>
              {/* Skin compatibility */}
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:16 }}>Skin Compatibility</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {[
                  { type:'Oily Skin', pct:95, match:product.skinTypes.includes('Oily') },
                  { type:'Dry Skin', pct:70, match:product.skinTypes.includes('Dry') },
                  { type:'Combination', pct:88, match:product.skinTypes.includes('Combination') },
                  { type:'Sensitive Skin', pct:82, match:product.skinTypes.includes('Sensitive') },
                  { type:'Normal Skin', pct:90, match:true },
                ].map(s => (
                  <div key={s.type}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color: s.match ? C.dark : C.mu }}>{s.type} {s.match && '✓'}</span>
                      <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color: s.pct>85 ? '#16A34A' : s.pct>70 ? '#D97706' : C.mu }}>{s.pct}%</span>
                    </div>
                    <div style={{ height:7, background:'#F3F4F6', borderRadius:4 }}>
                      <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:4, background:`linear-gradient(90deg,${C.teal},${C.teal2})`, transition:'width 0.6s' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Product specs */}
              <h4 style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#374151', marginBottom:12 }}>Product Details</h4>
              <div style={{ background:C.cream, borderRadius:14, overflow:'hidden', border:`1px solid ${C.border}` }}>
                {[
                  ['Brand', product.brand],
                  ['Category', product.category],
                  ['Size', product.size],
                  ['Skin Type', product.skinTypes.join(', ')],
                  ['Concerns', product.concerns.join(', ')],
                ].map(([k,v],i) => (
                  <div key={k as string} style={{ display:'flex', padding:'11px 16px', background: i%2===0 ? C.cream : '#fff', borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ width:120, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color:'#374151', flexShrink:0 }}>{k}</span>
                    <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.dark }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: INGREDIENTS ───────────────────────────────────── */}
        {tab==='ingredients' && (
          <div>
            {/* Hero: key ingredients cards */}
            <div style={{ marginBottom:36 }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:6 }}>Star Ingredients</h3>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.mu, marginBottom:20 }}>Science-backed actives, explained in plain language.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {product.keyIngredients.map(ki => (
                  <div key={ki.name} style={{ background:'#fff', borderRadius:18, padding:20, border:`1px solid ${C.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'transform 0.2s' }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:14 }}>{ki.icon}</div>
                    <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:800, color:C.dark, margin:'0 0 8px' }}>{ki.name}</p>
                    <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#374151', lineHeight:1.7, margin:'0 0 14px' }}>{ki.benefit}</p>
                    {/* Efficacy bar */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:C.mu, fontFamily:'DM Sans,sans-serif' }}>EFFICACY</span>
                        <span style={{ fontSize:11, fontWeight:700, color:C.teal, fontFamily:'DM Sans,sans-serif' }}>HIGH</span>
                      </div>
                      <div style={{ height:6, background:'#F3F4F6', borderRadius:3 }}>
                        <div style={{ height:'100%', width:'85%', borderRadius:3, background:`linear-gradient(90deg,${C.teal},${C.teal2})` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredient safety */}
            <div style={{ padding:24, background:'#F0FDF4', borderRadius:16, border:'1px solid #BBF7D0', marginBottom:28, display:'flex', gap:16, alignItems:'flex-start' }}>
              <span style={{ fontSize:32, flexShrink:0 }}>🛡️</span>
              <div>
                <p style={{ fontWeight:700, color:'#14532D', fontSize:15, margin:'0 0 6px' }}>Ingredient Safety Score: Excellent</p>
                <p style={{ fontSize:13, color:'#166534', margin:0, lineHeight:1.7 }}>This formulation has been screened against 1,300+ known irritants and allergens. No parabens, sulfates, synthetic fragrances, or harmful preservatives detected. EWG Score: 1–2 (Low Hazard).</p>
              </div>
            </div>

            {/* Full list */}
            <div>
              <h4 style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:C.dark, marginBottom:12 }}>Full Ingredient List</h4>
              <div style={{ background:C.cream, borderRadius:14, padding:20, border:`1px solid ${C.border}` }}>
                <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#374151', lineHeight:2, margin:0 }}>
                  {product.ingredients.map((ing,i) => (
                    <span key={i}>
                      {product.keyIngredients.some(ki=>ki.name.toLowerCase()===ing.toLowerCase())
                        ? <strong style={{ color:C.teal }}>{ing}</strong>
                        : ing
                      }
                      {i<product.ingredients.length-1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </div>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.mu, marginTop:8 }}>★ <strong style={{ color:C.teal }}>Bold</strong> = Key active ingredients</p>
            </div>
          </div>
        )}

        {/* ── TAB: HOW TO USE ────────────────────────────────────── */}
        {tab==='howto' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:32 }}>
            <div>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:16 }}>How to Use</h3>
              <div style={{ background:C.cream, borderRadius:16, padding:24, border:`1px solid ${C.border}`, fontFamily:'DM Sans,sans-serif', fontSize:15, color:'#374151', lineHeight:2, marginBottom:16 }}>
                {product.howToUse}
              </div>
              <div style={{ padding:'14px 18px', background:'#FEF3C7', borderRadius:12, border:'1px solid #FDE68A' }}>
                <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#92400E', margin:0, fontWeight:500 }}>⚠️ Always patch test before use. If irritation occurs, discontinue use and consult a dermatologist.</p>
              </div>
            </div>

            {/* Pro tips */}
            <div>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:16 }}>Pro Tips</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { icon:'🌙', tip:'Best used at night when skin repair cycles are active', label:'Timing' },
                  { icon:'💧', tip:'Apply on damp skin for better absorption of actives', label:'Application' },
                  { icon:'🧴', tip:'Follow with a hydrating moisturiser to lock in actives', label:'Layering' },
                  { icon:'☀️', tip:'Always apply SPF 30+ in the morning when using actives', label:'Sun Protection' },
                  { icon:'📅', tip:'Consistent use for 4–6 weeks gives visible results', label:'Results' },
                ].map(t => (
                  <div key={t.label} style={{ display:'flex', gap:12, padding:'14px 16px', background:'#fff', borderRadius:12, border:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px' }}>{t.label}</p>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#374151', margin:0, lineHeight:1.6 }}>{t.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ROUTINE FIT ───────────────────────────────────── */}
        {tab==='routine' && (
          <div>
            <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:C.dark, marginBottom:6 }}>Where This Fits in Your Routine</h3>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.mu, marginBottom:28 }}>The DermIQ AI has placed this product in the optimal position in a science-backed skincare routine.</p>

            {/* AM / PM routines */}
            {[
              { time:'PM', label:'Evening Routine', emoji:'🌙', steps:[
                { step:1, name:'Cleanser', note:'Double cleanse to remove SPF + makeup', product:'Not this one', active:false },
                { step:2, name:'Toner', note:'Balance pH before actives', product:'Not this one', active:false },
                { step:3, name:product.category, note:'← Apply this product here', product:product.name, active:true },
                { step:4, name:'Moisturiser', note:'Lock in actives with hydration', product:'Complete the routine', active:false },
                { step:5, name:'Face Oil (optional)', note:'Seal everything in', product:'Optional', active:false },
              ]},
            ].map(r => (
              <div key={r.time} style={{ ...({} as React.CSSProperties), marginBottom:32 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <span style={{ fontSize:22 }}>{r.emoji}</span>
                  <h4 style={{ fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:700, color:C.dark, margin:0 }}>{r.label}</h4>
                </div>
                <div style={{ position:'relative', paddingLeft:24 }}>
                  {/* Vertical line */}
                  <div style={{ position:'absolute', left:10, top:16, bottom:16, width:2, background:`linear-gradient(180deg,${C.teal},${C.border})`, borderRadius:2 }} />
                  {r.steps.map((s,i) => (
                    <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:16, position:'relative' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background: s.active ? C.teal : '#fff', border:`2px solid ${s.active ? C.teal : C.border}`, flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:800, zIndex:1 }}>
                        {s.active ? '★' : s.step}
                      </div>
                      <div style={{ flex:1, padding:'12px 16px', borderRadius:12, border:`${s.active ? '2px' : '1px'} solid ${s.active ? C.teal : C.border}`, background: s.active ? 'rgba(45,95,90,0.04)' : '#fff' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color: s.active ? C.teal : C.dark, margin:0 }}>{s.step}. {s.name}</p>
                          {s.active && <span style={{ fontSize:11, background:C.teal, color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>YOU ARE HERE</span>}
                        </div>
                        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.mu, margin:'4px 0 0' }}>{s.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Complete routine CTA */}
            <div style={{ padding:24, background:`linear-gradient(135deg,${C.dark},#243D3A)`, borderRadius:20, textAlign:'center' }}>
              <p style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#fff', margin:'0 0 8px' }}>Get Your Full Personalized Routine</p>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'rgba(255,255,255,0.7)', margin:'0 0 20px' }}>Take the 60-second DermIQ skin analysis and get a complete AM/PM routine tailored to your exact skin profile.</p>
              <Link href="/routine" style={{ display:'inline-block', padding:'13px 32px', background:'linear-gradient(135deg,#C8976A,#D4A574)', color:'#fff', borderRadius:12, textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15 }}>
                Build My Routine →
              </Link>
            </div>
          </div>
        )}

        {/* ── TAB: REVIEWS ───────────────────────────────────────── */}
        {tab==='reviews' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:32, marginBottom:32, alignItems:'start' }} className="product-layout">
              {/* Rating summary */}
              <div style={{ background:C.cream, borderRadius:20, padding:24, border:`1px solid ${C.border}` }}>
                <div style={{ textAlign:'center', marginBottom:20 }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:56, fontWeight:700, color:C.dark, lineHeight:1 }}>{product.rating}</div>
                  <Stars n={product.rating} size={20} />
                  <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.mu, marginTop:6 }}>{product.reviews.toLocaleString()} reviews</p>
                </div>
                {ratingDist.map(d => (
                  <div key={d.stars} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.mu, width:12 }}>{d.stars}</span>
                    <span style={{ fontSize:12, color:'#F59E0B' }}>★</span>
                    <div style={{ flex:1, height:8, background:'#E5E7EB', borderRadius:4 }}>
                      <div style={{ height:'100%', width:`${(d.count/totalRatings)*100}%`, background:`linear-gradient(90deg,#F59E0B,#FCD34D)`, borderRadius:4, transition:'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize:12, color:C.mu, width:16, textAlign:'right' }}>{d.count}</span>
                  </div>
                ))}
              </div>

              {/* Reviews list */}
              <div>
                {/* Filter */}
                <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                  <button onClick={()=>setReviewFilter(0)} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${reviewFilter===0?C.teal:C.border}`, background:reviewFilter===0?'rgba(45,95,90,0.08)':'#fff', color:reviewFilter===0?C.teal:C.mu, fontSize:12, fontWeight:600, cursor:'pointer' }}>All</button>
                  {[5,4,3].map(r => <button key={r} onClick={()=>setReviewFilter(r)} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${reviewFilter===r?C.teal:C.border}`, background:reviewFilter===r?'rgba(45,95,90,0.08)':'#fff', color:reviewFilter===r?C.teal:C.mu, fontSize:12, fontWeight:600, cursor:'pointer' }}>{r}★</button>)}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {MOCK_REVIEWS.filter(r=>reviewFilter===0||r.rating===reviewFilter).map((r,i) => (
                    <div key={i} style={{ padding:20, background:'#fff', borderRadius:16, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <div style={{ width:38, height:38, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontFamily:'DM Sans,sans-serif', flexShrink:0 }}>
                            {r.name[0]}
                          </div>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, color:C.dark, fontSize:14 }}>{r.name}</span>
                              {r.verified && <span style={{ fontSize:10, background:'#EFF6FF', color:'#2563EB', padding:'2px 7px', borderRadius:10, fontWeight:700 }}>✓ Verified</span>}
                            </div>
                            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.mu, margin:'2px 0 0' }}>Skin: {r.skin} · {r.date}</p>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, background:`${C.teal}`, color:'#fff', padding:'3px 10px', borderRadius:8, flexShrink:0 }}>
                          <span style={{ fontSize:12, fontWeight:800 }}>★</span>
                          <span style={{ fontSize:12, fontWeight:700, fontFamily:'DM Sans,sans-serif' }}>{r.rating}</span>
                        </div>
                      </div>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'#374151', lineHeight:1.7, margin:'0 0 12px' }}>"{r.comment}"</p>
                      <button onClick={()=>{ if(!helpfulVoted.includes(i)) setHelpfulVoted(v=>[...v,i]) }} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, color: helpfulVoted.includes(i) ? C.teal : C.mu, fontWeight: helpfulVoted.includes(i) ? 700 : 400 }}>
                        👍 Helpful ({r.helpful + (helpfulVoted.includes(i)?1:0)})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write review CTA */}
            <div style={{ padding:24, background:C.cream, borderRadius:16, border:`1px solid ${C.border}`, textAlign:'center' }}>
              <p style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:C.dark, margin:'0 0 8px' }}>Have used this product?</p>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.mu, margin:'0 0 16px' }}>Share your experience and help others make better skincare decisions.</p>
              <button onClick={()=>toast.success('Review form coming soon!')} style={{ padding:'12px 28px', background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', borderRadius:10, border:'none', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Write a Review ✍️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FREE AI CONSULTATION BANNER ──────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#FFF8F0,#FFF3E8)', borderTop:`1px solid #F5E6D3`, borderBottom:`1px solid #F5E6D3`, padding:'40px 24px', marginBottom:60 }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }} className="product-layout">
          <div>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, color:C.accent, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 6px' }}>DermIQ Exclusive</p>
            <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(18px,2.5vw,26px)', color:C.dark, margin:'0 0 10px' }}>Not Sure If This Is Right for You?</h3>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'#374151', margin:0, lineHeight:1.7, maxWidth:500 }}>
              Take our free 60-second AI skin analysis. Our algorithm will tell you exactly how well this product matches your skin concerns, type, and goals — before you spend a rupee.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
            <Link href="/routine" style={{ padding:'13px 24px', background:`linear-gradient(135deg,${C.accent},#D4A574)`, color:'#fff', borderRadius:12, textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, textAlign:'center', whiteSpace:'nowrap' }}>
              🧬 Free Skin Analysis
            </Link>
            <Link href="/ai-system" style={{ padding:'11px 24px', background:'transparent', color:C.accent, border:`2px solid ${C.accent}`, borderRadius:12, textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, textAlign:'center', whiteSpace:'nowrap' }}>
              👩‍⚕️ Book Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 60px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:24, color:C.dark }}>Complete Your Routine</h2>
            <Link href="/shop" style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.teal, fontWeight:700, textDecoration:'none' }}>View All →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
            {related.map(p => {
              const d = Math.round((1-p.price/p.mrp)*100)
              return (
                <div key={p.id} className="rel-card" onClick={()=>router.push(`/product/${p.id}`)} style={{ border:`1px solid ${C.border}`, borderRadius:18, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ height:190, position:'relative', background:C.cream }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit:'cover' }} sizes="250px" />
                    {p.badge && <span style={{ position:'absolute', top:10, left:10, background:p.badgeBg, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:14, fontFamily:'DM Sans,sans-serif' }}>{p.badge}</span>}
                  </div>
                  <div style={{ padding:'14px 16px' }}>
                    <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.mu, margin:'0 0 3px', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }}>{p.brand}</p>
                    <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color:'#1A1A1A', margin:'0 0 8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.4 } as React.CSSProperties}>{p.name}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:15, fontWeight:800, color:C.dark }}>₹{p.price}</span>
                        {d>0 && <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:'#16A34A', fontWeight:700, marginLeft:6 }}>{d}% off</span>}
                      </div>
                      <span style={{ background:C.teal, color:'#fff', padding:'3px 8px', borderRadius:7, fontSize:11, fontWeight:700 }}>★ {p.rating}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STICKY BUY BAR ───────────────────────────────────────────── */}
      {showSticky && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(12px)', borderTop:`1px solid ${C.border}`, padding:'12px 24px', boxShadow:'0 -4px 24px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.mu, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.brand}</p>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:700, color:C.dark, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</p>
          </div>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:700, color:C.dark, flexShrink:0 }}>₹{product.price}</div>
          <button onClick={()=>addToCart()} style={{ padding:'12px 24px', background:`linear-gradient(135deg,${C.teal},${C.teal2})`, color:'#fff', border:'none', borderRadius:12, fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer', flexShrink:0, boxShadow:`0 4px 16px rgba(45,95,90,0.3)` }}>
            Add to Bag
          </button>
        </div>
      )}

      <MobileToolbar activePage="shop" />
      <CartDrawer isOpen={cartOpen} onClose={()=>setCartOpen(false)} />
    </div>
  )
}
