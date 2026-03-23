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

type User = {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, color: C.dark, flex: 1, marginRight: 12 }}>{question}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mu} strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 0 18px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, lineHeight: 1.7 }}>{answer}</div>
      )}
    </div>
  )
}

export default function ReferPage() {
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

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

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user as User | null)
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user as User | null ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const referralCode = user ? `DERMIQ-${user.id.slice(0, 6).toUpperCase()}` : 'DERMIQ-XXXXXX'
  const referralLink = user ? `https://dermiq.in/join?ref=${referralCode}` : ''

  const copyCode = () => {
    if (!user) { setShowLoginModal(true); return }
    navigator.clipboard.writeText(referralCode).then(() => toast.success('Referral code copied!', { icon: '🔗' }))
  }

  const copyLink = () => {
    if (!user) { setShowLoginModal(true); return }
    navigator.clipboard.writeText(referralLink).then(() => toast.success('Referral link copied!', { icon: '🔗' }))
  }

  const shareWhatsApp = () => {
    if (!user) { setShowLoginModal(true); return }
    const msg = `Hey! I have been loving DermIQ for science-backed skincare. Use my referral link to get ₹200 off your first order of ₹500+! 🎁\n\n${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleMagicLink = async () => {
    if (!loginEmail.trim()) { toast.error('Please enter your email'); return }
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email: loginEmail.trim() })
    setLoginLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Magic link sent! Check your email.', { duration: 5000 })
      setShowLoginModal(false)
    }
  }

  const steps = [
    { emoji: '📤', step: '1', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends via WhatsApp, social media, or directly.' },
    { emoji: '🛒', step: '2', title: 'Friend Makes a Purchase', desc: 'Your friend signs up and places their first order of ₹500 or more on DermIQ.' },
    { emoji: '💰', step: '3', title: 'Both Get ₹200', desc: 'Your friend gets ₹200 off instantly. You earn ₹200 credited to your DermIQ wallet.' },
  ]

  const stats = [
    { label: 'Total Referred', value: '0', icon: '👥', color: C.teal },
    { label: 'Pending', value: '0', icon: '⏳', color: C.gold },
    { label: 'Total Earned', value: '₹0', icon: '💰', color: C.green },
    { label: 'Available Balance', value: '₹0', icon: '🎁', color: C.accent },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Announcement Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: C.dark, color: '#fff', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500 }}>🎁 Refer a friend and both of you get ₹200 off!</span>
      </div>

      <Navbar />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.dark, marginBottom: 8 }}>Login to Refer</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu }}>Enter your email to get your unique referral code and start earning rewards.</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                placeholder="your@email.com"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box', color: C.dark }}
              />
            </div>
            <button
              onClick={handleMagicLink}
              disabled={loginLoading}
              style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 10, border: 'none', cursor: loginLoading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: 12, opacity: loginLoading ? 0.7 : 1 }}
            >
              {loginLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu }}>Or </span>
              <Link href="/login" onClick={() => setShowLoginModal(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.teal, fontWeight: 600 }}>sign in with password →</Link>
            </div>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{ width: '100%', padding: '12px', background: C.cream, color: C.dark, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}
            >Cancel</button>
          </div>
        </div>
      )}

      <div style={{ paddingTop: 106, paddingBottom: 100 }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2D5A4A 60%, ${C.teal} 100%)`, padding: '70px 24px 60px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,106,0.2)', border: '1px solid rgba(200,151,106,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>🎁</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refer & Earn Program</span>
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
              Refer Friends,<br />Earn Rewards 🎁
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 32, lineHeight: 1.6 }}>
              Give ₹200 off your first order. Get ₹200 in wallet credit when they buy.
            </p>

            {/* Reward visual */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '16px 0 0 16px', padding: '20px 28px', border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: '#fff' }}>₹200</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Your friend gets</div>
              </div>
              <div style={{ background: C.accent, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>↔️</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '0 16px 16px 0', padding: '20px 28px', border: '1px solid rgba(255,255,255,0.2)', borderLeft: 'none' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: C.accent }}>₹200</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>You earn</div>
              </div>
            </div>

            <button
              onClick={() => !user && setShowLoginModal(true)}
              style={{ padding: '16px 40px', background: `linear-gradient(135deg, ${C.accent}, #D4A574)`, color: '#fff', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 24px rgba(200,151,106,0.4)' }}
            >
              {user ? '🎉 You\'re In! See Your Code Below' : 'Get Your Referral Link →'}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

          {/* ── How It Works ────────────────────────────────────────────── */}
          <section style={{ padding: '56px 0' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, textAlign: 'center', marginBottom: 36 }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="refer-steps">
              <style>{`@media(max-width:768px){.refer-steps{grid-template-columns:1fr!important}}`}</style>
              {steps.map((step, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '32px 24px', border: `1px solid ${C.border}`, textAlign: 'center', position: 'relative' }}>
                  {/* Step connector */}
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', top: '40%', right: -20, width: 16, height: 2, background: C.border, zIndex: 1 }} />
                  )}
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, boxShadow: `0 4px 16px ${C.teal}40` }}>
                    {step.step}
                  </div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{step.emoji}</div>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Referral Dashboard ──────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>
              {user ? '📊 Your Dashboard' : '🔐 Log In to See Your Dashboard'}
            </h2>

            {!user ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: 40, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎁</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.dark, marginBottom: 8 }}>Unlock Your Referral Code</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Log in to get your unique referral code, track your referrals, and manage your earnings.
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  style={{ padding: '14px 36px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginRight: 12, boxShadow: `0 4px 16px ${C.teal}40` }}
                >
                  Log In / Sign Up
                </button>
                <Link href="/login" style={{ padding: '14px 28px', background: C.cream, color: C.dark, borderRadius: 12, border: `1px solid ${C.border}`, textDecoration: 'none', fontSize: 15, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', display: 'inline-block' }}>
                  Sign In →
                </Link>
              </div>
            ) : (
              <>
                {/* Code & Link sharing */}
                <div style={{ background: `linear-gradient(135deg, ${C.dark}, #243D3A)`, borderRadius: 16, padding: 32, marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Your Referral Code</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: 12, padding: '16px 24px', flex: 1, minWidth: 200 }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>{referralCode}</span>
                    </div>
                    <button onClick={copyCode} style={{ padding: '14px 22px', background: C.accent, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Copy Code
                    </button>
                  </div>

                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Your Referral Link</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 200, overflow: 'hidden' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{referralLink}</span>
                    </div>
                    <button onClick={copyLink} style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Copy
                    </button>
                    <button onClick={shareWhatsApp} style={{ padding: '12px 18px', background: '#25D366', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💬</span> WhatsApp
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="refer-stats">
                  <style>{`@media(max-width:768px){.refer-stats{grid-template-columns:repeat(2,1fr)!important}}`}</style>
                  {stats.map((stat, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '22px 18px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Referral history table */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, color: C.dark, margin: 0 }}>Referral History</h3>
                  </div>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 24px', background: C.cream, borderBottom: `1px solid ${C.border}` }}>
                    {['Friend', 'Status', 'Reward', 'Date'].map(h => (
                      <span key={h} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: C.mu, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                    ))}
                  </div>
                  {/* Empty state */}
                  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🕐</div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, margin: 0 }}>No referrals yet. Share your link and start earning!</p>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* ── Terms & Conditions ──────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <button
                onClick={() => setShowTerms(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: showTerms ? `1px solid ${C.border}` : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📜</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, color: C.dark }}>Terms & Conditions</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mu} strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: showTerms ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showTerms && (
                <div style={{ padding: '24px' }}>
                  <ul style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                    <li>Referral discount is valid only on the referred friend's <strong>first purchase</strong>.</li>
                    <li>Minimum order value of <strong>₹500</strong> required to qualify for the referral reward.</li>
                    <li>Referral credits are valid for <strong>90 days</strong> from the date of credit and cannot be extended.</li>
                    <li>Maximum earnings of <strong>₹2,000</strong> per calendar month through the referral program.</li>
                    <li>Referral credits cannot be converted to cash and are non-transferable.</li>
                    <li>DermIQ reserves the right to cancel fraudulent referrals or accounts involved in gaming the system.</li>
                    <li>Credits are applied automatically at checkout when the eligible threshold is met.</li>
                    <li>Program terms are subject to change — active credits will be honoured under terms at time of issue.</li>
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* ── FAQ Section ─────────────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>❓ Frequently Asked Questions</h2>
            <div style={{ background: '#fff', borderRadius: 16, padding: '0 24px', border: `1px solid ${C.border}` }}>
              <AccordionItem
                question="When do I receive my ₹200 referral reward?"
                answer="Your ₹200 wallet credit is added automatically within 24 hours of your referred friend completing their first qualifying purchase of ₹500 or more. You will receive an email notification when it is credited."
              />
              <AccordionItem
                question="Can I refer multiple friends?"
                answer="Yes! There is no limit to how many friends you can refer. However, you can earn a maximum of ₹2,000 per calendar month through the program. Each friend can only be referred once."
              />
              <AccordionItem
                question="What happens if my friend returns their order?"
                answer="If your referred friend's first order is fully returned and refunded, the referral reward will be reversed from both accounts. Partial returns do not affect the referral credit."
              />
              <AccordionItem
                question="Can I use my referral code on my own second account?"
                answer="No — self-referrals are not allowed and will be automatically detected and disqualified. Accounts found gaming the system may be permanently banned from the referral program."
              />
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .refer-steps { grid-template-columns: 1fr !important; }
          .refer-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .refer-table-header { display: none !important; }
        }
      `}</style>

      <MobileToolbar />
    </div>
  )
}
