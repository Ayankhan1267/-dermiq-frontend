'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const C = {
  teal: '#2D5F5A', dark: '#1A2E2B', teal2: '#3D7A74',
  border: '#E8E0D8', cream: '#F7F3EE', green: '#10B981',
  red: '#EF4444', gold: '#D4A853', mu: '#6B7280', white: '#FFFFFF',
}

export default function InfluencerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }

    setLoading(true)
    const { data, error } = await supabase
      .from('dermiq_influencers')
      .select('id, name, email, status')
      .eq('email', email.trim().toLowerCase())
      .single()

    setLoading(false)

    if (error || !data) {
      toast.error('No partner account found with this email. Please contact your DermIQ manager.')
      return
    }

    if (data.status === 'rejected') {
      toast.error('Your account has been rejected. Please contact support.')
      return
    }

    if (data.status === 'pending') {
      toast.error('Your account is pending approval. You will be notified once active.')
      return
    }

    // Store email for session
    localStorage.setItem('dermiq_influencer_email', data.email)
    toast.success(`Welcome back, ${data.name.split(' ')[0]}!`)
    setSent(true)
    setTimeout(() => router.push('/influencer/dashboard'), 800)
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box }
      `}</style>

      <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.dark} 0%, ${C.teal} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.5s ease' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontFamily: 'serif', fontSize: 36, fontWeight: 700, color: C.white, display: 'inline-block' }}>
                Derm<span style={{ color: C.gold, fontStyle: 'italic' }}>IQ</span>
              </div>
            </Link>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>
              Partner Portal
            </div>
          </div>

          {/* Card */}
          <div style={{ background: C.white, borderRadius: 20, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Logging you in...</h2>
                <p style={{ fontSize: 14, color: C.mu }}>Redirecting to your dashboard</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: '0 0 6px' }}>Partner Login</h1>
                  <p style={{ fontSize: 14, color: C.mu, margin: 0 }}>Enter your email to access your influencer dashboard</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.mu, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@email.com"
                      style={{ width: '100%', padding: '13px 16px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => (e.target.style.borderColor = C.teal)}
                      onBlur={e => (e.target.style.borderColor = C.border)}
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '14px', background: loading ? C.mu : `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: C.white, border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: loading ? 'default' : 'pointer', transition: 'all 0.2s', boxShadow: loading ? 'none' : `0 8px 24px ${C.teal}40` }}
                  >
                    {loading ? 'Checking...' : 'Access Dashboard →'}
                  </button>
                </form>

                <div style={{ marginTop: 24, padding: '16px', background: C.cream, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.mu, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Not a partner yet?</div>
                  <p style={{ fontSize: 13, color: C.mu, margin: 0, lineHeight: 1.5 }}>
                    Interested in becoming a DermIQ influencer partner? Reach out to us at{' '}
                    <a href="mailto:partners@dermiq.com" style={{ color: C.teal, fontWeight: 600, textDecoration: 'none' }}>partners@dermiq.com</a>
                  </p>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to DermIQ</Link>
          </div>
        </div>
      </div>
    </>
  )
}
