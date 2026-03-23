'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface CartItem { id: number; qty: number }

const C = { teal: '#2D5F5A', teal2: '#3D7A74', accent: '#C8976A', dark: '#1A2E2B', border: '#E8E0D8', cream: '#F7F3EE' }

// ── Marketplace mega-menu data ─────────────────────────────────────────────
const MARKETPLACE_SECTIONS = [
  {
    heading: '🛍️ Shop',
    links: [
      { label: 'All Products', sub: 'Browse 200+ skincare products', href: '/shop', icon: '📦' },
      { label: 'New Launches', sub: 'Latest arrivals this month', href: '/shop?filter=new', icon: '✨' },
      { label: 'Bestsellers', sub: 'Top-rated by the community', href: '/shop?filter=best', icon: '🏆' },
      { label: 'Brand Stores', sub: 'Shop by your favourite brand', href: '/shop?filter=brands', icon: '🏷️' },
    ],
  },
  {
    heading: '👩‍⚕️ Specialists',
    links: [
      { label: 'Find Specialists', sub: 'Certified skin & hair experts', href: '/specialists', icon: '🔍' },
      { label: 'Book Consultation', sub: 'Video call from ₹499', href: '/specialists?book=1', icon: '📅' },
      { label: 'Specialist Reviews', sub: 'Real client experiences', href: '/specialists?tab=reviews', icon: '⭐' },
      { label: 'Become a Specialist', sub: 'Join the DermIQ expert network', href: '/specialists/join', icon: '🎓' },
    ],
  },
  {
    heading: '🧬 AI & Tools',
    links: [
      { label: 'AI Skin Analysis', sub: 'Get your skin score in 60s', href: '/ai-system', icon: '🤖' },
      { label: 'Build My Routine', sub: 'Personalised AM/PM routine', href: '/routine', icon: '🌅' },
      { label: 'Ingredients Lab', sub: 'Decode every ingredient', href: '/ingredients', icon: '🔬' },
      { label: 'Skin Progress', sub: 'Track your skin over time', href: '/skin-profile', icon: '📊' },
    ],
  },
  {
    heading: '🌿 Learn',
    links: [
      { label: 'Community Reviews', sub: '50k+ verified reviews', href: '/reviews', icon: '💬' },
      { label: 'Skin Education', sub: 'Expert-written guides', href: '/about', icon: '📚' },
      { label: 'About DermIQ', sub: 'Our science-first mission', href: '/about', icon: '⚗️' },
      { label: 'Sell on DermIQ', sub: 'Brand founders — join us', href: '/vendor/login', icon: '🚀' },
    ],
  },
]

export default function Navbar({ activePage }: { activePage?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [mktMobileOpen, setMktMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart: CartItem[] = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
        setCartCount(cart.reduce((s, i) => s + i.qty, 0))
      } catch { setCartCount(0) }
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    window.addEventListener('dermiq_cart_updated', updateCart)
    return () => { window.removeEventListener('storage', updateCart); window.removeEventListener('dermiq_cart_updated', updateCart) }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function openDrop() { if (timeoutRef.current) clearTimeout(timeoutRef.current); setDropOpen(true) }
  function closeDrop() { timeoutRef.current = setTimeout(() => setDropOpen(false), 120) }

  const plainLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Routine', href: '/routine' },
    { label: 'AI System', href: '/ai-system' },
    { label: 'Reviews', href: '/reviews' },
  ]

  const linkStyle = (active: boolean) => ({
    padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: active ? C.teal : '#1A1A1A', textDecoration: 'none',
    fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
    background: active ? 'rgba(45,95,90,0.08)' : 'transparent',
    display: 'inline-block',
  })

  return (
    <>
      <nav style={{
        position: 'fixed', top: 36, left: 0, right: 0, zIndex: 999, height: 70,
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, fontWeight: 700, color: C.dark, letterSpacing: '-0.5px' }}>
              Derm<span style={{ color: C.accent }}>IQ</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>

            {/* ── Marketplace dropdown ───────────────── */}
            <div ref={dropRef} style={{ position: 'relative' }} onMouseEnter={openDrop} onMouseLeave={closeDrop}>
              <button
                onClick={() => setDropOpen(v => !v)}
                style={{
                  ...linkStyle(activePage === 'marketplace'),
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  background: dropOpen ? 'rgba(45,95,90,0.08)' : activePage === 'marketplace' ? 'rgba(45,95,90,0.08)' : 'transparent',
                  color: dropOpen || activePage === 'marketplace' ? C.teal : '#1A1A1A',
                }}
              >
                Marketplace
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Mega dropdown */}
              {dropOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 8, width: 760, background: '#fff',
                  borderRadius: 20, border: `1px solid ${C.border}`,
                  boxShadow: '0 16px 60px rgba(0,0,0,0.12)', zIndex: 1000,
                  padding: '8px 0 16px',
                }}>
                  {/* Top accent bar */}
                  <div style={{ height: 3, background: `linear-gradient(90deg,${C.teal},${C.teal2},${C.accent})`, borderRadius: '20px 20px 0 0', marginBottom: 8 }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
                    {MARKETPLACE_SECTIONS.map((sec, si) => (
                      <div key={si} style={{ padding: '12px 18px', borderRight: si < 3 ? `1px solid ${C.border}` : 'none' }}>
                        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 800, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>{sec.heading}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {sec.links.map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s', background: 'transparent' }}
                              onMouseEnter={e => (e.currentTarget.style.background = C.cream)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{l.icon}</span>
                              <div>
                                <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{l.label}</p>
                                <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#9CA3AF', margin: '1px 0 0', lineHeight: 1.4 }}>{l.sub}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom CTA strip */}
                  <div style={{ margin: '10px 18px 0', padding: '12px 16px', background: `linear-gradient(135deg,${C.dark},#243D3A)`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>🧬 Free AI Skin Analysis</p>
                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '2px 0 0' }}>Know your skin in 60 seconds</p>
                    </div>
                    <Link href="/ai-system" onClick={() => setDropOpen(false)} style={{ padding: '8px 18px', background: `linear-gradient(135deg,${C.accent},#D4A574)`, color: '#fff', borderRadius: 8, textDecoration: 'none', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                      Start Free →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Plain links */}
            {plainLinks.map(link => (
              <Link key={link.href} href={link.href}
                style={linkStyle(activePage === link.label.toLowerCase())}
                onMouseEnter={e => { if (activePage !== link.label.toLowerCase()) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.04)' }}
                onMouseLeave={e => { if (activePage !== link.label.toLowerCase()) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >{link.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Cart */}
            <button onClick={() => window.dispatchEvent(new CustomEvent('dermiq_open_cart'))}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.dark, position: 'relative', fontFamily: 'DM Sans,sans-serif' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>Bag</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#D4856A', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <Link href="/shop" className="hidden md:flex" style={{ padding: '10px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.teal},${C.teal2})`, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 2px 12px rgba(45,95,90,0.25)' }}>
              Shop Now
            </Link>

            {/* Hamburger */}
            <button className="md:hidden" onClick={() => setMenuOpen(v => !v)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.dark }}>
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* ── Mobile menu ──────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden" style={{ position: 'absolute', top: 70, left: 0, right: 0, background: '#fff', borderBottom: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 20px 20px', maxHeight: '80vh', overflowY: 'auto' }}>

            {/* Marketplace accordion */}
            <button
              onClick={() => setMktMobileOpen(v => !v)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', fontSize: 15, fontWeight: 600, color: C.teal, background: 'none', border: 'none', borderBottom: `1px solid #F0EBE5`, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
            >
              <span>🛍️ Marketplace</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: 'transform 0.2s', transform: mktMobileOpen ? 'rotate(180deg)' : 'none' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {mktMobileOpen && (
              <div style={{ padding: '8px 0 8px 16px', borderBottom: `1px solid #F0EBE5` }}>
                {MARKETPLACE_SECTIONS.flatMap(s => s.links).map(l => (
                  <Link key={l.href + l.label} href={l.href} onClick={() => { setMenuOpen(false); setMktMobileOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', textDecoration: 'none' }}>
                    <span style={{ fontSize: 15 }}>{l.icon}</span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 500, color: C.dark }}>{l.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Plain links */}
            {plainLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '13px 0', borderBottom: `1px solid #F0EBE5`, fontSize: 15, fontWeight: 500, color: C.dark, textDecoration: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                {link.label}
              </Link>
            ))}

            <Link href="/shop" onClick={() => setMenuOpen(false)} style={{ display: 'block', marginTop: 16, padding: '14px 24px', borderRadius: 10, background: `linear-gradient(135deg,${C.teal},${C.teal2})`, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, textAlign: 'center', fontFamily: 'DM Sans,sans-serif' }}>
              Shop Now
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}
