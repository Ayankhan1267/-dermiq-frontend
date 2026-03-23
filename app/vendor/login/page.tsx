'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function VendorLogin() {
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [brandName, setBrandName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      if (data.session) router.push('/vendor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!brandName.trim()) { setError('Brand name is required'); return }
    setLoading(true); setError('')
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { brand_name: brandName } } })
      if (authError) throw authError
      // Save vendor record
      if (data.user) {
        await supabase.from('dermiq_vendors').upsert({ email, brand_name: brandName, created_at: new Date().toISOString() })
      }
      setSuccess('Account created! Check your email to confirm, then sign in.')
      setMode('login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed. Try again.')
    } finally { setLoading(false) }
  }

  const inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E8E0D8', fontFamily:'DM Sans,sans-serif', fontSize:14, outline:'none', color:'#1A1A1A' } as React.CSSProperties

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#F7F3EE,#E8F0EF)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:'Playfair Display,serif', fontSize:32, fontWeight:700, color:'#1A2E2B' }}>
              Derm<span style={{ color:'#C8976A' }}>IQ</span>
            </span>
          </Link>
          <div style={{ marginTop:8 }}>
            <span style={{ background:'linear-gradient(135deg,#2D5F5A,#3D7A74)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, fontFamily:'DM Sans,sans-serif', letterSpacing:'0.1em' }}>
              SELLER PORTAL
            </span>
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:32, boxShadow:'0 8px 40px rgba(0,0,0,0.1)', border:'1px solid #E8E0D8' }}>

          {/* Toggle tabs */}
          <div style={{ display:'flex', background:'#F7F3EE', borderRadius:12, padding:4, marginBottom:24 }}>
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={()=>{ setMode(m); setError(''); setSuccess('') }} style={{
                flex:1, padding:'10px', borderRadius:10, border:'none', cursor:'pointer',
                fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14,
                background: mode===m ? '#fff' : 'transparent',
                color: mode===m ? '#1A2E2B' : '#6B7280',
                boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition:'all 0.2s',
              }}>{m==='login' ? 'Sign In' : 'Register Brand'}</button>
            ))}
          </div>

          {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#DC2626', fontFamily:'DM Sans,sans-serif' }}>{error}</div>}
          {success && <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#16A34A', fontFamily:'DM Sans,sans-serif' }}>✓ {success}</div>}

          {/* LOGIN FORM */}
          {mode==='login' && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Brand Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="brand@example.com" required style={inp} onFocus={e=>(e.target.style.borderColor='#2D5F5A')} onBlur={e=>(e.target.style.borderColor='#E8E0D8')} />
              </div>
              <div>
                <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required style={inp} onFocus={e=>(e.target.style.borderColor='#2D5F5A')} onBlur={e=>(e.target.style.borderColor='#E8E0D8')} />
              </div>
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:loading?'#9CA3AF':'linear-gradient(135deg,#2D5F5A,#3D7A74)', color:'#fff', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:loading?'none':'0 4px 16px rgba(45,95,90,0.3)', marginTop:4 }}>
                {loading ? 'Signing in...' : 'Sign In to Dashboard →'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode==='signup' && (
            <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Brand Name *</label>
                <input value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="e.g. The Minimalist" required style={inp} onFocus={e=>(e.target.style.borderColor='#2D5F5A')} onBlur={e=>(e.target.style.borderColor='#E8E0D8')} />
              </div>
              <div>
                <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Brand Email *</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="brand@example.com" required style={inp} onFocus={e=>(e.target.style.borderColor='#2D5F5A')} onBlur={e=>(e.target.style.borderColor='#E8E0D8')} />
              </div>
              <div>
                <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Password * <span style={{ fontWeight:400, color:'#9CA3AF' }}>(min 6 characters)</span></label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a strong password" required minLength={6} style={inp} onFocus={e=>(e.target.style.borderColor='#2D5F5A')} onBlur={e=>(e.target.style.borderColor='#E8E0D8')} />
              </div>
              <div style={{ padding:'12px 14px', background:'#F0F9F8', borderRadius:10, border:'1px solid #C8E6E4' }}>
                <p style={{ fontSize:12, color:'#2D5F5A', margin:0, fontFamily:'DM Sans,sans-serif', lineHeight:1.6 }}>
                  ✓ Free to join · 15% platform commission · Monthly payouts · AI-powered recommendations
                </p>
              </div>
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:loading?'#9CA3AF':'linear-gradient(135deg,#2D5F5A,#3D7A74)', color:'#fff', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:loading?'none':'0 4px 16px rgba(45,95,90,0.3)', marginTop:4 }}>
                {loading ? 'Creating account...' : 'Create Vendor Account →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#9CA3AF', marginTop:20 }}>
          <Link href="/" style={{ color:'#9CA3AF', textDecoration:'none' }}>← Back to DermIQ Store</Link>
        </p>
      </div>
    </div>
  )
}
