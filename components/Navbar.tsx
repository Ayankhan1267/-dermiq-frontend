'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface CartItem {
  id: number
  qty: number
}

export default function Navbar({ activePage }: { activePage?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const updateCart = () => {
      if (typeof window !== 'undefined') {
        try {
          const cart: CartItem[] = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
          setCartCount(cart.reduce((sum, item) => sum + item.qty, 0))
        } catch {
          setCartCount(0)
        }
      }
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    window.addEventListener('dermiq_cart_updated', updateCart)
    return () => {
      window.removeEventListener('storage', updateCart)
      window.removeEventListener('dermiq_cart_updated', updateCart)
    }
  }, [])

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Routine', href: '/routine' },
    { label: 'AI System', href: '/ai-system' },
    { label: 'About', href: '/about' },
    { label: 'Reviews', href: '/reviews' },
  ]

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 70,
          transition: 'all 0.3s',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #E8E0D8' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#1A2E2B', letterSpacing: '-0.5px' }}>
              Derm<span style={{ color: '#C8976A' }}>IQ</span>
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex" style={{ gap: 4 }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: activePage === link.label.toLowerCase() ? '#2D5F5A' : '#1A1A1A',
                  textDecoration: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                  background: activePage === link.label.toLowerCase() ? 'rgba(45,95,90,0.08)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (activePage !== link.label.toLowerCase()) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (activePage !== link.label.toLowerCase()) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Cart button */}
            <button
              onClick={() => {
                const event = new CustomEvent('dermiq_open_cart')
                window.dispatchEvent(event)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: '1.5px solid #E8E0D8',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: '#1A2E2B',
                position: 'relative',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>Bag</span>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: '#D4856A',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Shop Now button - hidden on mobile */}
            <Link
              href="/shop"
              className="hidden md:flex"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s',
                boxShadow: '0 2px 12px rgba(45,95,90,0.25)',
              }}
            >
              Shop Now
            </Link>

            {/* Hamburger on mobile */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#1A2E2B',
              }}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: 70,
            left: 0,
            right: 0,
            background: '#fff',
            borderBottom: '1px solid #E8E0D8',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            padding: '12px 20px 20px',
          }}
          className="md:hidden"
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 0',
                  borderBottom: '1px solid #F0EBE5',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1A2E2B',
                  textDecoration: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                marginTop: 16,
                padding: '14px 24px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                textAlign: 'center',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Shop Now
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}
