'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'

interface SkinProfile {
  name?: string; age?: string; skinType?: string; score?: number
  problems?: string[]; routine?: { am: string[]; pm: string[] }
  createdAt?: string; consultation?: { type: string; specialist: string; date: string; slot: string }
}

export default function SkinProfilePage() {
  const [profile, setProfile] = useState<SkinProfile | null>(null)
  const [tab, setTab] = useState('analysis')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => window.removeEventListener('dermiq_open_cart', handler)
  }, [])

  useEffect(() => {
    try {
      const p = localStorage.getItem('ksProfile')
      if (p) setProfile(JSON.parse(p))
    } catch {}
  }, [])

  const tabs = [
    { id: 'analysis', label: '🔬 Analysis' },
    { id: 'routine', label: '📋 My Routine' },
    { id: 'consultations', label: '👨‍⚕️ Consultations' },
    { id: 'progress', label: '📈 Progress' },
  ]

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F3EE' }}>
        <Navbar activePage="profile" />
        <div style={{ paddingTop: 70 }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🧬</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 12 }}>
              No Skin Profile Yet
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 32 }}>
              Take the 2-minute AI skin quiz to get your personalized skin analysis, product recommendations, and expert consultation.
            </p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px',
              background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', borderRadius: 12,
              textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 16px rgba(45,95,90,0.3)',
            }}>
              🧠 Take Skin Quiz
            </Link>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF', marginTop: 20 }}>
              Free · Results in 30 seconds · No account needed
            </p>
          </div>
        </div>
        <MobileToolbar activePage="profile" />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    )
  }

  const score = profile.score ?? 72
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', paddingBottom: 100 }}>
      <Navbar activePage="profile" />

      <div style={{ paddingTop: 70 }}>
        {/* Hero card */}
        <div style={{ background: 'linear-gradient(135deg,#1A2E2B,#2D5F5A)', padding: '40px 24px 60px', color: '#fff' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#C8976A" strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  <text x="48" y="53" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="DM Sans, sans-serif">{score}</text>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Skin Profile</p>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, margin: '0 0 8px', color: '#fff' }}>
                  {profile.name ? `${profile.name}'s Skin` : 'Your Skin Profile'}
                </h1>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(200,151,106,0.3)', border: '1px solid rgba(200,151,106,0.5)', color: '#C8976A', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>
                    {profile.skinType || 'Combination'}
                  </span>
                  {profile.createdAt && (
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                      Updated {profile.createdAt}
                    </span>
                  )}
                </div>
              </div>
              <Link href="/" style={{
                padding: '10px 20px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}>
                Retake Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E8E0D8', position: 'sticky', top: 70, zIndex: 40 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0, overflowX: 'auto' }} className="no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
                color: tab === t.id ? '#2D5F5A' : '#6B7280',
                borderBottom: tab === t.id ? '2px solid #2D5F5A' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px' }}>

          {/* Analysis Tab */}
          {tab === 'analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Skin concerns */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 16 }}>Skin Concerns</h3>
                {(profile.problems && profile.problems.length > 0 ? profile.problems : ['Dryness', 'Uneven tone', 'Pores']).map((concern, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{concern}</span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280' }}>{70 - i * 10}%</span>
                    </div>
                    <div style={{ height: 6, background: '#F0EBE5', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${70 - i * 10}%`, background: i === 0 ? '#D4856A' : i === 1 ? '#C8976A' : '#2D5F5A', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div style={{ background: 'linear-gradient(135deg,#F0F9F8,#E8F5F4)', borderRadius: 16, padding: 24, border: '1px solid #C8E6E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 6 }}>AI Recommendations</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Based on your skin profile</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                  {['Vitamin C Serum', 'SPF 50+ Sunscreen', 'Gentle Cleanser', 'Hyaluronic Moisturiser'].map((rec, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #E8E0D8' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A2E2B' }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Routine Tab */}
          {tab === 'routine' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {(['AM', 'PM'] as const).map(period => {
                const steps = period === 'AM'
                  ? (profile.routine?.am ?? ['Gentle Cleanser', 'Vitamin C Serum', 'Moisturiser', 'SPF 50+ Sunscreen'])
                  : (profile.routine?.pm ?? ['Oil Cleanser', 'Gentle Cleanser', 'Retinol Serum', 'Ceramide Moisturiser'])
                return (
                  <div key={period} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: period === 'AM' ? 'linear-gradient(135deg,#FFF3E0,#FFD9A8)' : 'linear-gradient(135deg,#E8EDF5,#C5CFE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {period === 'AM' ? '☀️' : '🌙'}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A2E2B', margin: 0 }}>{period === 'AM' ? 'Morning' : 'Night'} Routine</h3>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', margin: 0 }}>{steps.length} steps</p>
                      </div>
                    </div>
                    {steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid #F0EBE5' : 'none' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2D5F5A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {/* Consultations Tab */}
          {tab === 'consultations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profile.consultation ? (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👨‍⚕️</div>
                    <div>
                      <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A2E2B', margin: 0 }}>{profile.consultation.specialist || 'Specialist'}</h3>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', margin: 0 }}>Dermatologist</p>
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#F0F9F8', color: '#2D5F5A', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                      {profile.consultation.type === 'instant' ? '⚡ Instant' : '📅 Scheduled'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                    {[
                      ['Date', profile.consultation.date || 'Today'],
                      ['Slot', profile.consultation.slot || 'Right Now'],
                      ['Type', profile.consultation.type === 'instant' ? 'Instant Chat/Call' : 'Scheduled'],
                      ['Status', 'Confirmed ✓'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: '#FAFAF8', borderRadius: 10, padding: '12px 14px' }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6B7280', margin: '0 0 3px' }}>{k}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A2E2B', margin: 0 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍⚕️</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 8 }}>No consultations yet</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Book a session with a dermatologist through the skin quiz.</p>
                  <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                    Book Consultation
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {tab === 'progress' && (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📈</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 8 }}>Progress Tracking Coming Soon</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280', maxWidth: 360, margin: '0 auto' }}>
                Track your skin improvement over time with weekly check-ins and before/after comparisons.
              </p>
            </div>
          )}
        </div>
      </div>

      <MobileToolbar activePage="profile" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
