'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function VendorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      if (data.session) router.push('/vendor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#F7F3EE,#E8F0EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: '#1A2E2B' }}>
              Derm<span style={{ color: '#C8976A' }}>IQ</span>
            </span>
          </Link>
          <div style={{ marginTop: 8 }}>
            <span style={{ background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em' }}>
              SELLER PORTAL
            </span>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280', marginTop: 12 }}>
            Sign in to manage your brand on DermIQ
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #E8E0D8' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 24 }}>Welcome back</h2>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Brand Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="brand@example.com"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', color: '#1A1A1A', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#2D5F5A')}
                onBlur={e => (e.target.style.borderColor = '#E8E0D8')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', color: '#1A1A1A', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#2D5F5A')}
                onBlur={e => (e.target.style.borderColor = '#E8E0D8')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#2D5F5A,#3D7A74)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif', boxShadow: loading ? 'none' : '0 4px 16px rgba(45,95,90,0.3)',
                transition: 'all 0.2s', marginTop: 4,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginTop: 24, lineHeight: 1.6 }}>
          New vendor? <a href="mailto:vendors@dermiq.in" style={{ color: '#2D5F5A', fontWeight: 600 }}>Contact the DermIQ team</a> to get started.
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', textDecoration: 'none' }}>
            ← Back to DermIQ Store
          </Link>
        </p>
      </div>
    </div>
  )
}
