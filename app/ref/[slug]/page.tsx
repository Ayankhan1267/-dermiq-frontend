'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const C = {
  teal: '#2D5F5A', dark: '#1A2E2B', teal2: '#3D7A74',
  border: '#E8E0D8', cream: '#F7F3EE', green: '#10B981',
  red: '#EF4444', gold: '#D4A853', mu: '#6B7280',
  white: '#FFFFFF', chatBg: '#0F1F1E',
}

interface Influencer {
  id: number; name: string; category: string; tier: string;
  referral_slug: string; coupon_code: string; coupon_discount: number;
  custom_headline?: string; custom_message?: string; profile_image?: string;
}

export default function RefPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('dermiq_influencers')
        .select('id, name, category, tier, referral_slug, coupon_code, coupon_discount, custom_headline, custom_message, profile_image')
        .eq('referral_slug', slug)
        .eq('status', 'active')
        .single()

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setInfluencer(data)

      // Store slug for later tracking
      if (typeof window !== 'undefined') {
        localStorage.setItem('dermiq_ref_slug', slug)
      }

      // Log click event
      try {
        await supabase.from('dermiq_referral_events').insert({
          influencer_id: data.id,
          influencer_slug: slug,
          event_type: 'click',
          meta: {
            referrer: typeof window !== 'undefined' ? document.referrer : '',
            ua: typeof window !== 'undefined' ? navigator.userAgent.slice(0, 100) : '',
          },
        })
        // Increment click count
        await supabase.rpc('increment_influencer_stats', { p_id: data.id, p_clicks: 1 }).catch(() => {
          supabase.from('dermiq_influencers').update({ total_clicks: (data as unknown as { total_clicks: number }).total_clicks + 1 }).eq('id', data.id)
        })
      } catch { /* silent */ }

      setLoading(false)
    }

    init()
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'serif', fontSize: 32, fontWeight: 700, color: C.white, marginBottom: 12 }}>
            Derm<span style={{ color: C.gold, fontStyle: 'italic' }}>IQ</span>
          </div>
          <div style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Invalid Referral Link</h1>
        <p style={{ color: C.mu, marginBottom: 24, maxWidth: 360 }}>This referral link doesn't exist or is no longer active. Explore DermIQ directly!</p>
        <Link href="/" style={{ padding: '12px 28px', background: C.teal, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
          Go to DermIQ →
        </Link>
      </div>
    )
  }

  const headline = influencer?.custom_headline || 'Get Your FREE AI Skin Analysis + Expert Consultation'
  const message = influencer?.custom_message || 'Discover your exact skin type, understand what your skin truly needs, and get a personalised routine built by AI and reviewed by certified dermatology specialists — completely free.'

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.04) } }
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        * { box-sizing: border-box; margin: 0; padding: 0 }
      `}</style>

      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

        {/* ── HERO ── */}
        <div style={{ background: `linear-gradient(160deg, ${C.chatBg} 0%, ${C.dark} 60%, ${C.teal} 100%)`, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle bg pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(45,95,90,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,168,83,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

          {/* Brand */}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginBottom: 32, textTransform: 'uppercase', animation: 'fadeUp 0.5s ease both' }}>dermiq.com</div>

          {/* Profile */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.1s both', marginBottom: 20 }}>
            {influencer?.profile_image ? (
              <img src={influencer.profile_image} alt={influencer.name} style={{ width: 88, height: 88, borderRadius: '50%', border: `3px solid ${C.gold}`, objectFit: 'cover', boxShadow: `0 0 0 6px ${C.gold}20` }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, border: `3px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto', boxShadow: `0 0 0 6px ${C.gold}20` }}>
                🌟
              </div>
            )}
          </div>

          <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 16, animation: 'fadeUp 0.5s ease 0.15s both', textTransform: 'uppercase' }}>
            Recommended by {influencer?.name}
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, color: C.white, lineHeight: 1.15, maxWidth: 700, marginBottom: 20, animation: 'fadeUp 0.5s ease 0.2s both' }}>
            {headline}
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', maxWidth: 540, lineHeight: 1.7, marginBottom: 32, animation: 'fadeUp 0.5s ease 0.25s both' }}>
            {message}
          </p>

          {/* Coupon badge */}
          {influencer?.coupon_code && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${C.gold}20`, border: `1px solid ${C.gold}60`, borderRadius: 99, padding: '8px 20px', marginBottom: 28, animation: 'fadeUp 0.5s ease 0.3s both' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Exclusive offer:</span>
              <code style={{ fontSize: 15, fontWeight: 800, color: C.gold, letterSpacing: 1.5 }}>{influencer.coupon_code}</code>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>for {influencer.coupon_discount}% off your first order</span>
            </div>
          )}

          {/* CTA Button */}
          <Link href="/know-your-skin" style={{ display: 'inline-block', padding: '18px 40px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: C.white, borderRadius: 14, fontWeight: 800, fontSize: 18, textDecoration: 'none', boxShadow: `0 12px 40px ${C.teal}60`, animation: 'fadeUp 0.5s ease 0.35s both', letterSpacing: 0.3, transition: 'transform 0.2s' }}>
            Start Free Analysis →
          </Link>

          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', animation: 'fadeUp 0.5s ease 0.4s both' }}>Takes 60 seconds · No credit card required</div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'pulse 2s infinite' }}>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
          </div>
        </div>

        {/* ── TRUST SECTION ── */}
        <div style={{ background: C.white, padding: '64px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>What You Get — Free</p>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: C.dark }}>A complete skin health system, for free</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { icon: '🔬', title: '32-Point AI Analysis', sub: 'Free', desc: 'Our AI maps your skin across 32 parameters — hydration, texture, pore size, pigmentation, and more.' },
                { icon: '👨‍⚕️', title: 'Expert Consultation', sub: 'Free', desc: 'A certified dermatology specialist reviews your results and recommends your personalised routine.' },
                { icon: '🛍️', title: 'Personalised Products', sub: 'Science-backed', desc: 'Curated product recommendations based on your unique skin profile, concerns, and lifestyle.' },
              ].map(card => (
                <div key={card.title} style={{ background: C.cream, borderRadius: 16, padding: '28px 24px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.sub}</div>
                  <p style={{ fontSize: 14, color: C.mu, lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ background: C.cream, padding: '64px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Simple process</p>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: C.dark, marginBottom: 40 }}>How it works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { num: '1', title: 'Take AI Skin Analysis', desc: 'Answer 6 quick questions and optionally scan your face with our AI camera — takes 60 seconds.' },
                { num: '2', title: 'Get Expert Specialist Review', desc: 'A certified skin specialist reviews your AI report and adds personalised notes and recommendations.' },
                { num: '3', title: 'Shop Your Personalised Routine', desc: 'Receive your curated AM/PM routine with exact products chosen for your unique skin profile.' },
              ].map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', textAlign: 'left', position: 'relative', paddingBottom: i < 2 ? 32 : 0 }}>
                  {i < 2 && <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 12px)', background: `linear-gradient(to bottom, ${C.teal}40, transparent)` }} />}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.teal, color: C.white, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.num}</div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 6 }}>{step.title}</div>
                    <p style={{ fontSize: 14, color: C.mu, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SOCIAL PROOF ── */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.teal})`, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.white, marginBottom: 8 }}>10,000+</div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 4 }}>people have trusted DermIQ this month</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Join them and discover your skin's true potential</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
            {[{ n: '32', l: 'Skin Parameters' }, { n: '4.9★', l: 'Average Rating' }, { n: '100%', l: 'Free to Start' }].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.gold }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ background: C.white, padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: C.dark, marginBottom: 12 }}>
              Ready to know your skin?
            </h2>
            <p style={{ fontSize: 16, color: C.mu, marginBottom: 32, lineHeight: 1.6 }}>
              {influencer?.name ? `${influencer.name} recommends DermIQ because it works. Start your free analysis today.` : 'Start your free AI skin analysis and get expert-backed recommendations in minutes.'}
            </p>
            {influencer?.coupon_code && (
              <div style={{ display: 'inline-block', background: C.gold + '15', border: `1px solid ${C.gold}50`, borderRadius: 8, padding: '10px 20px', marginBottom: 24, fontSize: 14, color: C.dark }}>
                Remember to use <strong style={{ color: C.gold, letterSpacing: 1 }}>{influencer.coupon_code}</strong> for {influencer.coupon_discount}% off your first order
              </div>
            )}
            <div>
              <Link href="/know-your-skin" style={{ display: 'inline-block', padding: '18px 48px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: C.white, borderRadius: 14, fontWeight: 800, fontSize: 18, textDecoration: 'none', boxShadow: `0 12px 40px ${C.teal}40`, letterSpacing: 0.3 }}>
                Get My Free Skin Analysis →
              </Link>
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: C.mu }}>Free · No credit card · 60 seconds</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.dark, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 4 }}>
            Derm<span style={{ color: C.gold, fontStyle: 'italic' }}>IQ</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            AI-powered skincare · Specialist-reviewed · Personalised for you
          </div>
        </div>
      </div>
    </>
  )
}
