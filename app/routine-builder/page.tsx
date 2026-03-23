'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { ALL_PRODUCTS, type Product } from '@/lib/products'

const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280',
  border: '#E8E0D8', cream: '#F7F3EE', bg: '#FAFAF8', accent: '#C8976A',
  green: '#10B981', red: '#EF4444', gold: '#D4A853',
}

// ── Types ────────────────────────────────────────────────────────────────────
type RoutineSlot = {
  id: string
  step: number
  name: string
  category: string
  description: string
}

type BuiltRoutine = {
  am: Record<string, Product | null>
  pm: Record<string, Product | null>
}

// ── Routine Steps ────────────────────────────────────────────────────────────
const AM_STEPS: RoutineSlot[] = [
  { id: 'am_cleanser', step: 1, name: 'Cleanser', category: 'Cleanser', description: 'Start clean' },
  { id: 'am_toner', step: 2, name: 'Toner', category: 'Toner', description: 'Balance & prep' },
  { id: 'am_serum', step: 3, name: 'Serum', category: 'Serum', description: 'Targeted treatment' },
  { id: 'am_moisturiser', step: 4, name: 'Moisturiser', category: 'Moisturiser', description: 'Lock in hydration' },
  { id: 'am_spf', step: 5, name: 'SPF', category: 'Sunscreen', description: 'Essential protection' },
]

const PM_STEPS: RoutineSlot[] = [
  { id: 'pm_cleanser', step: 1, name: 'Cleanser', category: 'Cleanser', description: 'Remove the day' },
  { id: 'pm_toner', step: 2, name: 'Toner', category: 'Toner', description: 'Balance & hydrate' },
  { id: 'pm_serum', step: 3, name: 'Serum', category: 'Serum', description: 'Repair & nourish' },
  { id: 'pm_moisturiser', step: 4, name: 'Moisturiser', category: 'Moisturiser', description: 'Night nourishment' },
  { id: 'pm_treatment', step: 5, name: 'Treatment', category: 'Treatment', description: 'Active treatment' },
]

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive']

// ── Pre-built routines ───────────────────────────────────────────────────────
const PRESET_ROUTINES = [
  {
    id: 'minimal',
    title: 'Minimal 3-Step Routine',
    emoji: '🌱',
    desc: 'Perfect for beginners or low-maintenance routines',
    suitedFor: 'All skin types, especially beginners',
    steps: { am: ['Cleanser', 'Moisturiser', 'Sunscreen'], pm: ['Cleanser', 'Moisturiser'] },
  },
  {
    id: 'acne',
    title: 'Acne-Fighter Routine',
    emoji: '⚡',
    desc: 'Targets breakouts, controls oil, clears congestion',
    suitedFor: 'Oily, acne-prone skin',
    steps: { am: ['Cleanser', 'Toner', 'Serum', 'Moisturiser', 'Sunscreen'], pm: ['Cleanser', 'Toner', 'Serum', 'Treatment'] },
  },
  {
    id: 'antiaging',
    title: 'Anti-Aging Routine',
    emoji: '✨',
    desc: 'Targets fine lines, firmness, and radiance for 30+ skin',
    suitedFor: 'Mature skin, 30+ age group',
    steps: { am: ['Cleanser', 'Serum', 'Moisturiser', 'Sunscreen'], pm: ['Cleanser', 'Serum', 'Moisturiser', 'Treatment'] },
  },
]

// ── Product Picker Modal ─────────────────────────────────────────────────────
function ProductPickerModal({
  slot,
  skinType,
  onSelect,
  onClose,
}: {
  slot: RoutineSlot
  skinType: string
  onSelect: (product: Product) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const categoryFiltered = showAll
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === slot.category)

  const skinFiltered = skinType !== 'All'
    ? categoryFiltered.filter(p => p.skinTypes?.some(s => s.toLowerCase().includes(skinType.toLowerCase())) || true)
    : categoryFiltered

  const searched = search.trim()
    ? skinFiltered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    : skinFiltered

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 700, color: C.dark, margin: 0 }}>Add {slot.name}</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, margin: '3px 0 0' }}>Step {slot.step}: {slot.description}</p>
            </div>
            <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: 'none', background: C.cream, cursor: 'pointer', color: C.dark }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${slot.category.toLowerCase()}s...`}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', color: C.dark, boxSizing: 'border-box' }}
          />
          {!showAll && (
            <button onClick={() => setShowAll(true)} style={{ marginTop: 8, background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.teal, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              Or search all products →
            </button>
          )}
        </div>

        {/* Product list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 24px' }}>
          {searched.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.mu, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
              No products found. <button onClick={() => setShowAll(true)} style={{ background: 'none', border: 'none', color: C.teal, cursor: 'pointer', fontWeight: 600 }}>Show all products</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searched.map(product => (
                <button
                  key={product.id}
                  onClick={() => { onSelect(product); onClose() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.cream)}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: C.cream, flexShrink: 0 }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '0 0 2px' }}>{product.brand}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, margin: '2px 0 0' }}>⭐ {product.rating} · {product.size}</p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.dark }}>₹{product.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Tap-outside to close */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} onClick={onClose} />
    </div>
  )
}

// ── Slot Card ─────────────────────────────────────────────────────────────────
function SlotCard({
  slot,
  product,
  onAdd,
  onRemove,
}: {
  slot: RoutineSlot
  product: Product | null
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${product ? C.teal + '40' : C.border}` }}>
      {/* Step number */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: product ? `linear-gradient(135deg, ${C.teal}, ${C.teal2})` : C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: product ? '#fff' : C.mu }}>{slot.step}</span>
      </div>

      {product ? (
        /* Product added */
        <>
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: C.cream, flexShrink: 0 }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.mu, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{slot.name}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '1px 0 0' }}>{product.brand} · ₹{product.price}</p>
          </div>
          <button
            onClick={onRemove}
            style={{ padding: 6, borderRadius: 6, border: 'none', background: '#FEF2F2', cursor: 'pointer', color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </>
      ) : (
        /* Empty slot */
        <>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.mu, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step {slot.step}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{slot.name}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '1px 0 0' }}>{slot.description}</p>
          </div>
          <button
            onClick={onAdd}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px dashed ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.teal, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
        </>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RoutineBuilderPage() {
  const [cartCount, setCartCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [skinType, setSkinType] = useState('All')
  const [routine, setRoutine] = useState<BuiltRoutine>({ am: {}, pm: {} })
  const [activeModal, setActiveModal] = useState<{ period: 'am' | 'pm'; slot: RoutineSlot } | null>(null)
  const [showSummaryMobile, setShowSummaryMobile] = useState(false)

  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => window.removeEventListener('dermiq_open_cart', handler)
  }, [])

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
        setCartCount(cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0))
      } catch { setCartCount(0) }
    }
    update()
    window.addEventListener('dermiq_cart_updated', update)
    return () => window.removeEventListener('dermiq_cart_updated', update)
  }, [])

  // Load saved routine from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dermiq_routine')
      if (saved) {
        const parsed = JSON.parse(saved)
        setRoutine(parsed)
      }
    } catch {}
  }, [])

  const setProduct = (period: 'am' | 'pm', slotId: string, product: Product | null) => {
    setRoutine(prev => ({
      ...prev,
      [period]: { ...prev[period], [slotId]: product },
    }))
  }

  const allProducts = [
    ...Object.values(routine.am).filter(Boolean),
    ...Object.values(routine.pm).filter(Boolean),
  ] as Product[]

  const totalPrice = allProducts.reduce((s, p) => s + p.price, 0)

  const saveRoutine = () => {
    localStorage.setItem('dermiq_routine', JSON.stringify(routine))
    toast.success('Routine saved!', { icon: '💾' })
  }

  const shareRoutine = () => {
    const productNames = allProducts.map(p => p.name).join(', ')
    const text = `My DermIQ skincare routine: ${productNames || 'Just getting started!'} 🧴`
    navigator.clipboard.writeText(text).then(() => toast.success('Routine summary copied!', { icon: '🔗' }))
  }

  const buyAll = () => {
    if (allProducts.length === 0) { toast.error('Add products to your routine first'); return }
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    allProducts.forEach(product => {
      const idx = cart.findIndex((i: { id: number }) => i.id === product.id)
      if (idx >= 0) { cart[idx].qty += 1 } else {
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, qty: 1 })
      }
    })
    localStorage.setItem('dermiq_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
    toast.success(`${allProducts.length} products added to bag!`, { icon: '🛍️' })
  }

  const applyPreset = (preset: typeof PRESET_ROUTINES[0]) => {
    const newRoutine: BuiltRoutine = { am: {}, pm: {} }

    const mapStepToSlot = (period: 'am' | 'pm', stepName: string, idx: number): void => {
      const steps = period === 'am' ? AM_STEPS : PM_STEPS
      const slot = steps.find(s => s.name.toLowerCase() === stepName.toLowerCase())
      if (!slot) return
      const products = ALL_PRODUCTS.filter(p => p.category === slot.category)
      if (products.length > 0) {
        newRoutine[period][slot.id] = products[idx % products.length]
      }
    }

    preset.steps.am.forEach((step, i) => mapStepToSlot('am', step, i))
    preset.steps.pm.forEach((step, i) => mapStepToSlot('pm', step, i))

    setRoutine(newRoutine)
    toast.success(`"${preset.title}" loaded!`, { icon: '✨' })
  }

  const clearRoutine = () => {
    setRoutine({ am: {}, pm: {} })
    toast('Routine cleared', { icon: '🗑️' })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Announcement Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: C.dark, color: '#fff', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500 }}>🌅 Build your perfect AM/PM skincare routine</span>
      </div>

      <Navbar />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Product Picker Modal */}
      {activeModal && (
        <ProductPickerModal
          slot={activeModal.slot}
          skinType={skinType}
          onSelect={product => setProduct(activeModal.period, activeModal.slot.id, product)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Mobile Summary Bottom Sheet */}
      {showSummaryMobile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 250, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={() => setShowSummaryMobile(false)} style={{ position: 'absolute', inset: 0 }} />
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '24px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Routine Summary</h3>
            {allProducts.length === 0 ? (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, textAlign: 'center', padding: '20px 0' }}>No products added yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {allProducts.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.dark, margin: 0, flex: 1, marginRight: 12 }}>{p.name}</p>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.dark }}>₹{p.price}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu }}>Total</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 700, color: C.dark }}>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
            <button onClick={() => { buyAll(); setShowSummaryMobile(false) }} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
              Buy All — ₹{totalPrice.toLocaleString()}
            </button>
            <button onClick={() => { saveRoutine(); setShowSummaryMobile(false) }} style={{ width: '100%', padding: '14px', background: C.cream, color: C.dark, borderRadius: 12, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
              Save Routine
            </button>
          </div>
        </div>
      )}

      <div style={{ paddingTop: 106, paddingBottom: 100 }}>

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, #243D3A)`, padding: '40px 24px 36px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                  Build Your Skincare Routine 🌅
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Curate your perfect AM & PM routine, step by step
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={clearRoutine} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  🗑️ Clear
                </button>
                <button onClick={shareRoutine} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  📤 Share
                </button>
                <button onClick={saveRoutine} style={{ padding: '10px 22px', background: `linear-gradient(135deg, ${C.accent}, #D4A574)`, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
                  💾 Save Routine
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

          {/* ── Skin Type Selector ──────────────────────────────────────── */}
          <section style={{ padding: '24px 0 0' }}>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Your Skin Type</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All', ...SKIN_TYPES].map(type => (
                <button
                  key={type}
                  onClick={() => setSkinType(type)}
                  style={{
                    padding: '9px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    border: skinType === type ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                    background: skinType === type ? C.teal : '#fff',
                    color: skinType === type ? '#fff' : C.dark,
                    boxShadow: skinType === type ? `0 2px 10px ${C.teal}30` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {type === 'Oily' ? '💧' : type === 'Dry' ? '🌵' : type === 'Combination' ? '☯️' : type === 'Normal' ? '🌿' : type === 'Sensitive' ? '🌸' : '✨'} {type}
                </button>
              ))}
            </div>
          </section>

          {/* ── Builder Columns ──────────────────────────────────────────── */}
          <section style={{ padding: '28px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 24, alignItems: 'start' }} className="routine-grid">

              {/* AM Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>☀️</div>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.dark, margin: 0, lineHeight: 1 }}>AM Routine</h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, margin: '3px 0 0' }}>Morning skincare steps</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {AM_STEPS.map(slot => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      product={routine.am[slot.id] || null}
                      onAdd={() => setActiveModal({ period: 'am', slot })}
                      onRemove={() => setProduct('am', slot.id, null)}
                    />
                  ))}
                </div>
              </div>

              {/* PM Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌙</div>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.dark, margin: 0, lineHeight: 1 }}>PM Routine</h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, margin: '3px 0 0' }}>Evening skincare steps</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PM_STEPS.map(slot => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      product={routine.pm[slot.id] || null}
                      onAdd={() => setActiveModal({ period: 'pm', slot })}
                      onRemove={() => setProduct('pm', slot.id, null)}
                    />
                  ))}
                </div>
              </div>

              {/* Summary Sidebar (desktop) */}
              <div className="routine-sidebar" style={{ position: 'sticky', top: 110 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '18px 20px', background: `linear-gradient(135deg, ${C.dark}, #243D3A)` }}>
                    <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Routine Summary</h3>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '3px 0 0' }}>{allProducts.length} product{allProducts.length !== 1 ? 's' : ''} selected</p>
                  </div>

                  {/* Products list */}
                  <div style={{ padding: '16px 20px', maxHeight: 260, overflowY: 'auto' }}>
                    {allProducts.length === 0 ? (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, textAlign: 'center', padding: '20px 0' }}>Add products to see summary</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {allProducts.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: C.cream, flexShrink: 0 }}>
                              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.dark, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{p.name}</p>
                              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '1px 0 0' }}>₹{p.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  {allProducts.length > 0 && (
                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu }}>Total</span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: C.dark }}>₹{totalPrice.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={buyAll} style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', boxShadow: `0 2px 12px ${C.teal}30` }}>
                      🛍️ Buy All{allProducts.length > 0 ? ` — ₹${totalPrice.toLocaleString()}` : ''}
                    </button>
                    <button onClick={saveRoutine} style={{ width: '100%', padding: '10px', background: C.cream, color: C.dark, borderRadius: 10, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                      💾 Save Routine
                    </button>
                    <button onClick={shareRoutine} style={{ width: '100%', padding: '10px', background: 'transparent', color: C.teal, borderRadius: 10, border: `1px solid ${C.teal}40`, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                      📤 Share Routine
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Mobile floating summary button ──────────────────────────── */}
          <div className="routine-float-btn" style={{ display: 'none' }}>
            <button
              onClick={() => setShowSummaryMobile(true)}
              style={{ position: 'fixed', bottom: 84, right: 20, zIndex: 200, padding: '14px 20px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 28, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', boxShadow: `0 4px 20px ${C.teal}50`, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              🛍️ View Summary {allProducts.length > 0 && `(${allProducts.length})`}
            </button>
          </div>

          {/* ── Pre-built Routines ───────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 6 }}>⚡ Starter Routines</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu }}>Not sure where to start? Try one of our curated routines.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {PRESET_ROUTINES.map(preset => (
                <div key={preset.id} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>{preset.emoji}</div>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{preset.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, lineHeight: 1.6, marginBottom: 6 }}>{preset.desc}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.teal, fontWeight: 600, marginBottom: 16 }}>✓ {preset.suitedFor}</p>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>☀️ AM</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {preset.steps.am.map((s, i) => (
                          <span key={i} style={{ background: '#FFF7ED', color: '#92400E', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🌙 PM</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {preset.steps.pm.map((s, i) => (
                          <span key={i} style={{ background: '#EEF2FF', color: '#3730A3', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => applyPreset(preset)}
                    style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Use This Routine →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tips Section ─────────────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ background: `linear-gradient(135deg, ${C.cream}, #F0EBE0)`, borderRadius: 16, padding: '32px 28px', border: `1px solid ${C.border}` }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.dark, marginBottom: 20 }}>💡 Routine Building Tips</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { emoji: '💧', tip: 'Apply products thinnest to thickest — serums before moisturisers' },
                  { emoji: '☀️', tip: 'SPF is always the final step in your AM routine' },
                  { emoji: '⏱️', tip: 'Give actives 20–30 minutes to absorb before layering' },
                  { emoji: '🌿', tip: 'Start with one active at a time to track what works' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.dark, lineHeight: 1.6, margin: 0 }}>{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .routine-grid { grid-template-columns: 1fr !important; }
          .routine-sidebar { display: none !important; }
          .routine-float-btn { display: block !important; }
          .routine-grid > *:nth-child(3) { display: none; }
        }
        @media (max-width: 900px) {
          .routine-grid { grid-template-columns: 1fr 1fr !important; }
          .routine-sidebar { display: none !important; }
          .routine-float-btn { display: block !important; }
          .routine-grid > *:nth-child(3) { display: none; }
        }
      `}</style>

      <MobileToolbar />
    </div>
  )
}
