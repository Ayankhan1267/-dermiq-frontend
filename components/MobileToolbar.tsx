'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MobileToolbar({ activePage }: { activePage?: string }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const router = useRouter()

  const teal = '#2D5F5A'
  const mu = '#6B7280'

  const moreLinks = [
    { label: 'Ingredients', href: '/ingredients', emoji: '🔬' },
    { label: 'About', href: '/about', emoji: '💚' },
    { label: 'Reviews', href: '/reviews', emoji: '⭐' },
    { label: 'Track Order', href: '/track-order', emoji: '🚚' },
    { label: 'Skin Quiz', href: '/skin-quiz', emoji: '🧪' },
    { label: 'Help', href: '/help', emoji: '❓' },
  ]

  return (
    <>
      <div className="mobile-toolbar md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 60, position: 'relative' }}>
          {/* Home */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: activePage === 'home' ? teal : mu, flex: 1, paddingBottom: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={activePage === 'home' ? teal : 'none'} stroke={activePage === 'home' ? teal : mu} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Home</span>
          </Link>

          {/* Shop */}
          <Link href="/shop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: activePage === 'shop' ? teal : mu, flex: 1, paddingBottom: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activePage === 'shop' ? teal : mu} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Shop</span>
          </Link>

          {/* Center Know Skin button */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <button
              onClick={() => router.push('/skin-quiz')}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)',
                color: '#fff',
                border: '3px solid #fff',
                boxShadow: '0 4px 20px rgba(45,95,90,0.4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 8,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                gap: 1,
              }}
            >
              <span style={{ fontSize: 20 }}>🧠</span>
              <span style={{ fontSize: 8, lineHeight: 1 }}>Know</span>
            </button>
          </div>

          {/* Profile */}
          <Link href="/skin-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: activePage === 'profile' ? teal : mu, flex: 1, paddingBottom: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activePage === 'profile' ? teal : mu} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Profile</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setMoreOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', color: mu, cursor: 'pointer', flex: 1, paddingBottom: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={mu} stroke="none">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', color: mu }}>More</span>
          </button>
        </div>
      </div>

      {/* Bottom sheet overlay */}
      {moreOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px 40px',
            }}
          >
            <div style={{ width: 40, height: 4, background: '#E8E0D8', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1A2E2B' }}>More</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {moreLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#F7F3EE',
                    textDecoration: 'none',
                    color: '#1A2E2B',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{link.emoji}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
