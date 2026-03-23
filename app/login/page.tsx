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

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: '', color: C.border, width: '0%' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Weak', color: C.red, width: '30%' }
  if (score <= 2) return { label: 'Good', color: C.gold, width: '60%' }
  return { label: 'Strong', color: C.green, width: '100%' }
}

export default function LoginPage() {
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [tab, setTab] = useState<'signin' | 'register'>('signin')
  const [loading, setLoading] = useState(false)
  const [showSignInPw, setShowSignInPw] = useState(false)
  const [showRegPw, setShowRegPw] = useState(false)
  const [signInDone, setSignInDone] = useState(false)
  const [registerDone, setRegisterDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Sign in fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')

  const pwStrength = getPasswordStrength(regPassword)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!siEmail || !siPassword) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPassword })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Welcome back!')
    router.push('/account')
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    })
    setLoading(false)
    if (error) toast.error(error.message)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword) { toast.error('Please fill in all fields'); return }
    if (regPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: { name: regName, phone: regPhone },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setRegisterDone(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`,
    borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-dm)', background: C.bg,
    color: C.dark, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }
  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '13px', background: C.teal, color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
    fontFamily: 'var(--font-dm)', cursor: 'pointer', transition: 'background 0.2s',
  }

  const trustPoints = [
    { icon: '🤖', title: 'AI Skin Analysis', desc: 'Personalised insights from 32+ data points' },
    { icon: '👩‍⚕️', title: 'Expert Specialists', desc: 'Certified dermatologists at your fingertips' },
    { icon: '🧬', title: 'Science-Backed Products', desc: 'Clinically proven formulations only' },
  ]

  return (
    <>
      <Navbar activePage="login" />

      <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, fontFamily: 'var(--font-dm)' }}>
        <div style={{
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
          minHeight: 'calc(100vh - 64px)',
        }}>
          {/* LEFT HERO PANEL */}
          {!isMobile && (
            <div style={{
              background: `linear-gradient(145deg, ${C.dark} 0%, ${C.teal} 50%, ${C.teal2} 100%)`,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              alignItems: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', top: -80, right: -80, width: 280, height: 280,
                borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
              }} />
              <div style={{
                position: 'absolute', bottom: -60, left: -60, width: 220, height: 220,
                borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
              }} />

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
                {/* Logo */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255,255,255,0.1)', borderRadius: 12,
                    padding: '10px 20px', backdropFilter: 'blur(10px)',
                  }}>
                    <span style={{ fontSize: 28 }}>🧬</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-playfair)' }}>DermIQ</span>
                  </div>
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: 34, fontWeight: 700,
                  color: '#fff', lineHeight: 1.3, marginBottom: 16,
                }}>
                  Your skin journey<br />
                  <span style={{ color: '#A8D5B5', fontStyle: 'italic' }}>starts here.</span>
                </h1>

                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginBottom: 48 }}>
                  Join 50,000+ people who trust DermIQ for science-backed skincare tailored to their unique skin.
                </p>

                {/* Trust points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {trustPoints.map((tp, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      background: 'rgba(255,255,255,0.08)', borderRadius: 12,
                      padding: '14px 18px', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.12)', textAlign: 'left',
                    }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{tp.icon}</span>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{tp.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{tp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RIGHT FORM PANEL */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '32px 20px 100px' : '48px 40px',
            background: '#fff',
          }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
              {isMobile && (
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>🧬</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: C.teal, fontFamily: 'var(--font-playfair)' }}>DermIQ</span>
                  </div>
                  <p style={{ color: C.mu, fontSize: 13 }}>Your skin journey starts here</p>
                </div>
              )}

              {/* Tab switcher */}
              <div style={{
                display: 'flex', background: C.cream, borderRadius: 12, padding: 4, marginBottom: 32,
              }}>
                {(['signin', 'register'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? C.teal : C.mu,
                    fontWeight: tab === t ? 700 : 500, fontSize: 14,
                    fontFamily: 'var(--font-dm)',
                    boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* SIGN IN FORM */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Email Address</label>
                    <input
                      type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle} required
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Password</label>
                      <Link href="/forgot-password" style={{ fontSize: 12, color: C.teal, textDecoration: 'none' }}>
                        Forgot Password?
                      </Link>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSignInPw ? 'text' : 'password'} value={siPassword}
                        onChange={e => setSiPassword(e.target.value)}
                        placeholder="Your password" style={{ ...inputStyle, paddingRight: 44 }} required
                      />
                      <button type="button" onClick={() => setShowSignInPw(!showSignInPw)} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: C.mu, fontSize: 16,
                      }}>
                        {showSignInPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    ...btnPrimary, opacity: loading ? 0.7 : 1, marginTop: 4,
                  }}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                  </button>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 12, color: C.mu }}>or continue with</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>

                  {/* Google */}
                  <button type="button" onClick={handleGoogleSignIn} disabled={loading} style={{
                    width: '100%', padding: '12px', background: '#fff',
                    border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600,
                    fontFamily: 'var(--font-dm)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                    color: C.dark, transition: 'border-color 0.2s',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13, color: C.mu, marginTop: 8 }}>
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => setTab('register')} style={{
                      background: 'none', border: 'none', color: C.teal, fontWeight: 600,
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-dm)',
                    }}>Create one →</button>
                  </p>
                </form>
              )}

              {/* CREATE ACCOUNT FORM */}
              {tab === 'register' && !registerDone && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Full Name</label>
                    <input
                      type="text" value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="Dr. Priya Mehta" style={inputStyle} required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Email Address</label>
                    <input
                      type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle} required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegPw ? 'text' : 'password'} value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 44 }} required minLength={8}
                      />
                      <button type="button" onClick={() => setShowRegPw(!showRegPw)} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: C.mu, fontSize: 16,
                      }}>
                        {showRegPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Password strength */}
                    {regPassword && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            background: pwStrength.color, width: pwStrength.width,
                            transition: 'width 0.3s, background 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: pwStrength.color, fontWeight: 600, marginTop: 4, display: 'block' }}>
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Phone Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{
                        padding: '12px 14px', background: C.cream, border: `1.5px solid ${C.border}`,
                        borderRadius: 10, fontSize: 14, color: C.dark, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>+91</div>
                      <input
                        type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                        placeholder="98765 43210" style={{ ...inputStyle, flex: 1 }}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    ...btnPrimary, opacity: loading ? 0.7 : 1, marginTop: 4,
                  }}>
                    {loading ? 'Creating account…' : 'Create Account →'}
                  </button>

                  <p style={{ fontSize: 11, color: C.mu, textAlign: 'center' }}>
                    By signing up you agree to our{' '}
                    <Link href="/terms" style={{ color: C.teal }}>Terms</Link> &amp;{' '}
                    <Link href="/privacy" style={{ color: C.teal }}>Privacy Policy</Link>
                  </p>

                  <p style={{ textAlign: 'center', fontSize: 13, color: C.mu }}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('signin')} style={{
                      background: 'none', border: 'none', color: C.teal, fontWeight: 600,
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-dm)',
                    }}>Sign In →</button>
                  </p>
                </form>
              )}

              {/* SUCCESS SCREEN */}
              {tab === 'register' && registerDone && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: `${C.green}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', fontSize: 36,
                  }}>✉️</div>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, color: C.dark, marginBottom: 12 }}>
                    Check your email!
                  </h2>
                  <p style={{ color: C.mu, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    We&apos;ve sent a verification link to <strong style={{ color: C.dark }}>{regEmail}</strong>.
                    Click it to activate your account and start your skin journey.
                  </p>
                  <div style={{
                    background: `${C.green}10`, border: `1px solid ${C.green}30`,
                    borderRadius: 12, padding: '14px 20px', marginBottom: 24,
                  }}>
                    <p style={{ fontSize: 13, color: C.green, fontWeight: 600, margin: 0 }}>
                      Didn&apos;t receive it? Check your spam folder.
                    </p>
                  </div>
                  <button onClick={() => { setTab('signin'); setRegisterDone(false) }} style={{
                    ...btnPrimary, background: C.cream, color: C.teal,
                    border: `1.5px solid ${C.teal}`,
                  }}>
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileToolbar activePage="login" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
