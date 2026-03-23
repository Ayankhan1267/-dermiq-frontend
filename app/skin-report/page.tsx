'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'

const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280',
  border: '#E8E0D8', cream: '#F7F3EE', bg: '#FAFAF8', accent: '#C8976A',
  green: '#10B981', red: '#EF4444', gold: '#D4A853',
}

interface KsProfile {
  name?: string
  skinType?: string
  concerns?: string[]
  fitzpatrick?: number
  sensitivity?: string
  barrierHealth?: string
  diet?: number
  hydration?: number
  sleep?: number
  stress?: number
  score?: number
  createdAt?: string
}

const CONCERN_META: Record<string, { icon: string; severity: number; cause: string; ingredients: string[] }> = {
  'Acne': { icon: '🔴', severity: 72, cause: 'Excess sebum, bacteria, hormonal changes', ingredients: ['Salicylic Acid', 'Niacinamide'] },
  'Dark Spots': { icon: '🟤', severity: 58, cause: 'UV exposure, post-inflammation hyperpigmentation', ingredients: ['Vitamin C', 'Alpha Arbutin'] },
  'Dryness': { icon: '💧', severity: 65, cause: 'Impaired skin barrier, low humidity, harsh cleansers', ingredients: ['Hyaluronic Acid', 'Ceramides'] },
  'Oily Skin': { icon: '✨', severity: 70, cause: 'Overactive sebaceous glands, genetics', ingredients: ['Niacinamide', 'Zinc'] },
  'Hairfall': { icon: '💇', severity: 55, cause: 'Nutritional deficiency, stress, hormonal imbalance', ingredients: ['Biotin', 'Minoxidil'] },
  'Dandruff': { icon: '❄️', severity: 48, cause: 'Malassezia yeast overgrowth, dry scalp', ingredients: ['Ketoconazole', 'Zinc Pyrithione'] },
  'Anti-aging': { icon: '⏳', severity: 40, cause: 'UV damage, collagen loss, oxidative stress', ingredients: ['Retinol', 'Peptides'] },
  'Sensitivity': { icon: '🌸', severity: 62, cause: 'Compromised barrier, over-exfoliation, fragrances', ingredients: ['Centella Asiatica', 'Allantoin'] },
  'Body Care': { icon: '🧴', severity: 35, cause: 'Dryness, sun exposure, uneven texture', ingredients: ['Urea', 'Lactic Acid'] },
  'Baby Skin': { icon: '👶', severity: 30, cause: 'Immature skin barrier, sensitivity to irritants', ingredients: ['Aloe Vera', 'Calendula'] },
}

const SKIN_TYPE_ICONS: Record<string, string> = {
  'Oily': '💦', 'Dry': '🏜️', 'Combination': '⚖️', 'Normal': '✨', 'Sensitive': '🌸',
}

const MORNING_STEPS = [
  { step: 1, type: 'Cleanser', product: 'DermIQ Gentle Foaming Cleanser', concern: 'All skin types', href: '/shop?q=cleanser' },
  { step: 2, type: 'Vitamin C Serum', product: 'DermIQ 15% Vitamin C Serum', concern: 'Brightening + Antioxidant protection', href: '/shop?q=vitamin-c' },
  { step: 3, type: 'Moisturiser', product: 'DermIQ Barrier Repair Moisturiser', concern: 'Hydration + Barrier support', href: '/shop?q=moisturiser' },
  { step: 4, type: 'SPF 50', product: 'DermIQ Invisible Sunscreen SPF 50+', concern: 'UV protection', href: '/shop?q=sunscreen' },
]

const NIGHT_STEPS = [
  { step: 1, type: 'Cleanser', product: 'DermIQ Oil-Balancing Cleanser', concern: 'Remove makeup + impurities', href: '/shop?q=cleanser' },
  { step: 2, type: 'Treatment', product: 'DermIQ Retinol 0.3% Night Serum', concern: 'Cell turnover + Anti-aging', href: '/shop?q=retinol' },
  { step: 3, type: 'Moisturiser', product: 'DermIQ Ceramide Night Cream', concern: 'Deep hydration + Repair', href: '/shop?q=night-cream' },
  { step: 4, type: 'Eye Cream', product: 'DermIQ Peptide Eye Complex', concern: 'Dark circles + Fine lines', href: '/shop?q=eye-cream' },
]

function ScoreCircle({ score }: { score: number }) {
  const color = score < 40 ? C.red : score < 70 ? C.gold : C.green
  const circumference = 2 * Math.PI * 46
  const progress = (score / 100) * circumference
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="46" fill="none" stroke={C.border} strokeWidth="8" />
        <circle
          cx="60" cy="60" r="46" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-playfair)', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: C.mu, fontWeight: 600 }}>/100</div>
      </div>
    </div>
  )
}

function LifestoreBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const color = value >= 70 ? C.green : value >= 40 ? C.gold : C.red
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{label}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 6, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

export default function SkinReportPage() {
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [profile, setProfile] = useState<KsProfile | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    try {
      const raw = localStorage.getItem('ksProfile')
      if (raw) setProfile(JSON.parse(raw))
    } catch {}
    setLoaded(true)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!loaded) return null

  /* ── EMPTY STATE ── */
  if (!profile) {
    return (
      <>
        <Navbar activePage="skin-report" />
        <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, paddingBottom: 80, fontFamily: 'var(--font-dm)' }}>
          <div style={{
            maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🧬</div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, color: C.dark, marginBottom: 12 }}>
              No Skin Report Yet
            </h1>
            <p style={{ color: C.mu, fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
              Take the DermIQ Skin Quiz to get your personalised AI skin analysis report with a full routine, concern breakdown, and lifestyle scores.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <Link href="/skin-quiz" style={{
                display: 'inline-block', padding: '14px 36px', background: C.teal, color: '#fff',
                borderRadius: 12, textDecoration: 'none', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-dm)',
              }}>
                🧪 Take Skin Quiz — Free
              </Link>
              <p style={{ fontSize: 12, color: C.mu }}>Takes just 2 minutes · 32 data points</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48 }}>
              {['🤖 AI Analysis', '🧬 32 data points', '👩‍⚕️ Expert-backed'].map((t, i) => (
                <div key={i} style={{ fontSize: 12, color: C.mu, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </main>
        <MobileToolbar activePage="skin-report" />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    )
  }

  const name = profile.name || 'Your'
  const score = profile.score || 68
  const concerns = profile.concerns?.length ? profile.concerns : ['Acne', 'Dark Spots', 'Dryness']
  const reportDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const scoreColor = score < 40 ? C.red : score < 70 ? C.gold : C.green
  const scoreLabel = score < 40 ? 'Needs Attention' : score < 70 ? 'Fair' : 'Excellent'

  return (
    <>
      <Navbar activePage="skin-report" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .report-section { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, paddingBottom: 100, fontFamily: 'var(--font-dm)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

          {/* ── HEADER ── */}
          <div className="report-section" style={{
            background: `linear-gradient(135deg, ${C.dark} 0%, ${C.teal} 60%, ${C.teal2} 100%)`,
            borderRadius: 20, padding: isMobile ? '28px 24px' : '40px 48px',
            marginBottom: 24, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 200, height: 200,
              borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 28,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  AI Skin Report · {reportDate}
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: isMobile ? 24 : 32,
                  color: '#fff', marginBottom: 8, lineHeight: 1.3,
                }}>
                  {name === 'Your' ? 'Your' : `${name}'s`} Skin Report
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>🤖 Analysed by DermIQ AI</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>32 data points</span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.12)', borderRadius: 24, padding: '6px 16px',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor }} />
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{scoreLabel} skin health</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <ScoreCircle score={score} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  Overall Skin Score
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 1: SKIN IDENTITY ── */}
          <div className="report-section" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: C.dark, marginBottom: 16 }}>
              🪞 Skin Identity
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: 12,
            }}>
              {[
                {
                  icon: SKIN_TYPE_ICONS[profile.skinType || ''] || '🌿',
                  label: 'Skin Type',
                  value: profile.skinType || 'Combination',
                  desc: 'T-zone oily, cheeks normal',
                },
                {
                  icon: '🎨',
                  label: 'Fitzpatrick Scale',
                  value: `Type ${profile.fitzpatrick || 'III'}`,
                  desc: 'Medium skin tone, moderate UV sensitivity',
                },
                {
                  icon: '🌡️',
                  label: 'Sensitivity Level',
                  value: profile.sensitivity || 'Moderate',
                  desc: 'Reacts to strong actives and fragrance',
                },
                {
                  icon: '🛡️',
                  label: 'Barrier Health',
                  value: profile.barrierHealth || 'Compromised',
                  desc: 'Needs gentle, barrier-supportive actives',
                },
              ].map((card, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 14, padding: '18px 16px',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                  <div style={{ fontSize: 11, color: C.mu, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{card.value}</div>
                  <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.5 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 2: CONCERN BREAKDOWN ── */}
          <div className="report-section" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: C.dark, marginBottom: 16 }}>
              🔍 Concern Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {concerns.map((concern, i) => {
                const meta = CONCERN_META[concern] || { icon: '⚠️', severity: 50, cause: 'Multiple factors', ingredients: ['Consult specialist'] }
                const sevColor = meta.severity >= 70 ? C.red : meta.severity >= 45 ? C.gold : C.green
                return (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 14, padding: '20px 22px',
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, background: `${sevColor}10`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                      }}>
                        {meta.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{concern}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: sevColor }}>{meta.severity}%</div>
                        </div>
                        {/* Severity bar */}
                        <div style={{ height: 6, background: C.border, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                          <div style={{ height: '100%', width: `${meta.severity}%`, background: sevColor, borderRadius: 6 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                          <div style={{ background: C.bg, borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, color: C.mu, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>What causes this</div>
                            <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.5 }}>{meta.cause}</div>
                          </div>
                          <div style={{ background: `${C.teal}08`, borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, color: C.mu, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>What helps</div>
                            <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, lineHeight: 1.5 }}>{meta.ingredients.join(' · ')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SECTION 3: AI ROUTINE ── */}
          <div className="report-section" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: C.dark, marginBottom: 16 }}>
              🌅 Your AI Routine
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              {/* Morning */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${C.gold}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>☀️</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Morning Routine</div>
                    <div style={{ fontSize: 11, color: C.mu }}>4 steps · ~5 minutes</div>
                  </div>
                </div>
                {MORNING_STEPS.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    paddingBottom: i < MORNING_STEPS.length - 1 ? 14 : 0,
                    marginBottom: i < MORNING_STEPS.length - 1 ? 14 : 0,
                    borderBottom: i < MORNING_STEPS.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: C.teal,
                      color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>{s.step}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.mu, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.type}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginTop: 1 }}>{s.product}</div>
                      <div style={{ fontSize: 11, color: C.mu, marginTop: 2 }}>{s.concern}</div>
                    </div>
                    <Link href={s.href} style={{ fontSize: 12, color: C.teal, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 2 }}>
                      Shop →
                    </Link>
                  </div>
                ))}
              </div>

              {/* Night */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${C.teal}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>🌙</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Night Routine</div>
                    <div style={{ fontSize: 11, color: C.mu }}>4 steps · ~7 minutes</div>
                  </div>
                </div>
                {NIGHT_STEPS.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    paddingBottom: i < NIGHT_STEPS.length - 1 ? 14 : 0,
                    marginBottom: i < NIGHT_STEPS.length - 1 ? 14 : 0,
                    borderBottom: i < NIGHT_STEPS.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: C.dark,
                      color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>{s.step}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.mu, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.type}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginTop: 1 }}>{s.product}</div>
                      <div style={{ fontSize: 11, color: C.mu, marginTop: 2 }}>{s.concern}</div>
                    </div>
                    <Link href={s.href} style={{ fontSize: 12, color: C.teal, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 2 }}>
                      Shop →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 4: LIFESTYLE FACTORS ── */}
          <div className="report-section" style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: C.dark, marginBottom: 16 }}>
              🌿 Lifestyle Factors
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <LifestoreBar label="Diet Quality" value={profile.diet || 62} icon="🥗" />
              <LifestoreBar label="Hydration" value={profile.hydration || 55} icon="💧" />
              <LifestoreBar label="Sleep Quality" value={profile.sleep || 70} icon="😴" />
              <LifestoreBar label="Stress Level" value={profile.stress ? 100 - profile.stress : 45} icon="🧘" />
            </div>
            <p style={{ fontSize: 12, color: C.mu, marginTop: 10, lineHeight: 1.6 }}>
              * Lifestyle factors significantly impact skin health. Improving these can enhance your overall skin score.
            </p>
          </div>

          {/* ── FOOTER CTA ── */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: isMobile ? '28px 20px' : '36px 40px',
            border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, color: C.dark, marginBottom: 8 }}>
              Ready to transform your skin?
            </h3>
            <p style={{ color: C.mu, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Book a specialist consultation or shop your personalised product recommendations.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/specialists" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', background: C.teal, color: '#fff',
                borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-dm)',
              }}>
                👩‍⚕️ Book Specialist Consultation
              </Link>
              <Link href="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', background: C.accent, color: '#fff',
                borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-dm)',
              }}>
                🛒 Shop Recommended Products
              </Link>
              <Link href="/skin-quiz" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', background: C.cream, color: C.teal,
                border: `1.5px solid ${C.teal}`, borderRadius: 10,
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-dm)',
              }}>
                🔄 Retake Quiz
              </Link>
              <button onClick={() => toast('PDF download coming soon', { icon: '📄' })} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', background: '#fff', color: C.mu,
                border: `1.5px solid ${C.border}`, borderRadius: 10,
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm)', cursor: 'pointer',
              }}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      <MobileToolbar activePage="skin-report" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
