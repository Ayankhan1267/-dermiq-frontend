'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const C = {
  teal: '#2D5F5A', dark: '#1A2E2B', teal2: '#3D7A74',
  border: '#E8E0D8', cream: '#F7F3EE', green: '#10B981',
  red: '#EF4444', gold: '#D4A853', mu: '#6B7280',
  white: '#FFFFFF', bg: '#FAFAF8',
}

interface Influencer {
  id: number; name: string; email: string; category: string; tier: string;
  referral_slug: string; coupon_code: string; coupon_discount: number;
  commission_per_lead: number; commission_per_consultation: number; commission_percent: number;
  status: string; total_clicks: number; total_signups: number; total_analyses: number;
  total_consultations: number; total_sales: number; total_revenue: number;
  total_earnings: number; pending_payout: number; paid_out: number;
}

interface ReferralEvent {
  id: number; event_type: string; user_email?: string; user_name?: string;
  product_name?: string; order_amount: number; commission_earned: number; created_at: string;
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent?: string }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || C.dark }}>{value}</div>
      <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: C.green + '20', color: C.green },
    pending: { bg: C.gold + '20', color: C.gold },
    paused: { bg: C.mu + '20', color: C.mu },
    rejected: { bg: C.red + '20', color: C.red },
  }
  const s = map[status] || { bg: C.mu + '20', color: C.mu }
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: s.bg, color: s.color, textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}

export default function InfluencerDashboard() {
  const router = useRouter()
  const [inf, setInf] = useState<Influencer | null>(null)
  const [events, setEvents] = useState<ReferralEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutUpi, setPayoutUpi] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const loadData = useCallback(async (email: string) => {
    const [{ data: infData }, { data: evData }] = await Promise.all([
      supabase.from('dermiq_influencers').select('*').eq('email', email).single(),
      supabase.from('dermiq_referral_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (!infData) {
      localStorage.removeItem('dermiq_influencer_email')
      router.push('/influencer/login')
      return
    }

    setInf(infData)

    // Only fetch events for this influencer
    const { data: myEvents } = await supabase.from('dermiq_referral_events')
      .select('*').eq('influencer_id', infData.id).order('created_at', { ascending: false }).limit(20)
    setEvents(myEvents || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('dermiq_influencer_email') : null
    if (!email) {
      router.push('/influencer/login')
      return
    }
    loadData(email)
  }, [loadData, router])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const logout = () => {
    localStorage.removeItem('dermiq_influencer_email')
    router.push('/influencer/login')
  }

  const submitPayout = async () => {
    if (!payoutUpi.trim()) { toast.error('Please enter your UPI ID'); return }
    const amt = Number(payoutAmount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (inf && amt > Number(inf.pending_payout)) { toast.error(`Max available: ₹${inf.pending_payout}`); return }
    setPayoutLoading(true)
    const { error } = await supabase.from('dermiq_influencer_payouts').insert({
      influencer_id: inf?.id, amount: amt, upi_id: payoutUpi, status: 'pending',
    })
    setPayoutLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Payout request submitted! We\'ll process within 2-3 business days.')
    setShowPayoutModal(false)
    setPayoutUpi(''); setPayoutAmount('')
  }

  const shareWhatsApp = () => {
    if (!inf) return
    const link = `https://dermiq.com/ref/${inf.referral_slug}`
    const msg = encodeURIComponent(`Hey! 🌿 I've been using DermIQ for my skin and it's amazing!\n\nGet your FREE AI Skin Analysis + Expert Consultation here:\n${link}\n\nUse my code *${inf.coupon_code}* for ${inf.coupon_discount}% off your first order! ✨`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const copyTemplate = () => {
    if (!inf) return
    const text = `Hey! 🌿 I've been using DermIQ for my skin and it's amazing!\n\nGet your FREE AI Skin Analysis + Expert Consultation:\nhttps://dermiq.com/ref/${inf.referral_slug}\n\nUse my code ${inf.coupon_code} for ${inf.coupon_discount}% off your first order! ✨`
    copy(text, 'Share template')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: C.white }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Derm<span style={{ color: C.gold, fontStyle: 'italic' }}>IQ</span></div>
          <div style={{ color: C.mu }}>Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!inf) return null

  const refLink = `https://dermiq.com/ref/${inf.referral_slug}`
  const earningsFromLeads = inf.total_analyses * inf.commission_per_lead
  const earningsFromConsults = inf.total_consultations * inf.commission_per_consultation
  const earningsFromSales = inf.total_revenue * inf.commission_percent / 100

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.teal})`, padding: '24px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>DermIQ Partner Dashboard</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0 }}>Welcome back, {inf.name.split(' ')[0]} 👋</h1>
              <StatusBadge status={inf.status} />
            </div>
          </div>
          <button onClick={logout} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: C.white, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total Clicks" value={inf.total_clicks.toLocaleString()} icon="👆" />
          <StatCard label="Signups" value={inf.total_signups.toLocaleString()} icon="✍️" />
          <StatCard label="Analyses" value={inf.total_analyses.toLocaleString()} icon="🔬" />
          <StatCard label="Consultations" value={inf.total_consultations.toLocaleString()} icon="👨‍⚕️" />
          <StatCard label="Sales" value={inf.total_sales.toLocaleString()} icon="🛍️" />
          <StatCard label="Total Earnings" value={`₹${Number(inf.total_earnings).toLocaleString()}`} icon="💰" accent={C.teal} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Earnings breakdown */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 16 }}>Earnings Breakdown</h2>
            {[
              { label: 'From Leads (analyses)', value: `₹${earningsFromLeads.toLocaleString()}`, color: C.teal },
              { label: 'From Consultations', value: `₹${earningsFromConsults.toLocaleString()}`, color: C.teal },
              { label: 'From Sales', value: `₹${earningsFromSales.toLocaleString()}`, color: C.teal },
              { label: 'Total Earned', value: `₹${Number(inf.total_earnings).toLocaleString()}`, color: C.dark, bold: true },
              { label: 'Pending Payout', value: `₹${Number(inf.pending_payout).toLocaleString()}`, color: C.red },
              { label: 'Paid Out', value: `₹${Number(inf.paid_out).toLocaleString()}`, color: C.green },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, color: C.mu }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: r.bold ? 800 : 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
            {Number(inf.pending_payout) > 0 && (
              <button onClick={() => setShowPayoutModal(true)} style={{ marginTop: 14, width: '100%', padding: '10px', background: C.teal, color: C.white, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Request Payout (₹{Number(inf.pending_payout).toLocaleString()})
              </button>
            )}
          </div>

          {/* Referral tools */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 16 }}>Your Referral Tools</h2>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Referral Link</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input readOnly value={refLink} style={{ ...inputStyle, flex: 1, background: C.cream, fontSize: 13 }} />
                <button onClick={() => copy(refLink, 'Link')} style={{ padding: '10px 14px', background: copied === 'Link' ? C.green : C.teal, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0, transition: 'background 0.2s' }}>
                  {copied === 'Link' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Coupon Code</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, background: C.gold + '15', border: `1px solid ${C.gold}40`, borderRadius: 8, padding: '10px 14px', fontWeight: 800, fontSize: 18, color: C.gold, letterSpacing: 2, textAlign: 'center' }}>
                  {inf.coupon_code}
                </div>
                <div style={{ fontSize: 13, color: C.mu, flexShrink: 0 }}>{inf.coupon_discount}% off</div>
                <button onClick={() => copy(inf.coupon_code, 'Code')} style={{ padding: '10px 14px', background: copied === 'Code' ? C.green : C.gold, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0, transition: 'background 0.2s' }}>
                  {copied === 'Code' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={shareWhatsApp} style={{ flex: 1, padding: '10px', background: '#25D366', color: C.white, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                WhatsApp Share 📲
              </button>
              <button onClick={copyTemplate} style={{ flex: 1, padding: '10px', background: C.cream, color: C.dark, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                Copy Template 📋
              </button>
            </div>
          </div>
        </div>

        {/* Recent events */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.dark }}>Recent Activity</h2>
            <span style={{ fontSize: 12, color: C.mu }}>Last 20 events</span>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: C.mu }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div>No activity yet. Share your referral link to start tracking conversions!</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Event', 'User', 'Product', 'Order', 'Commission', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.mu, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={ev.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream + '50' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: ev.event_type === 'click' ? C.mu + '20' : ev.event_type === 'analysis' ? C.teal + '20' : ev.event_type === 'consultation' ? C.gold + '20' : C.green + '20', color: ev.event_type === 'click' ? C.mu : ev.event_type === 'analysis' ? C.teal : ev.event_type === 'consultation' ? C.gold : C.green, textTransform: 'capitalize' }}>{ev.event_type}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: C.dark }}>{ev.user_name || ev.user_email || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: C.mu }}>{ev.product_name || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: C.dark }}>{ev.order_amount > 0 ? `₹${ev.order_amount}` : '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: ev.commission_earned > 0 ? C.green : C.mu }}>{ev.commission_earned > 0 ? `+₹${ev.commission_earned}` : '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: C.mu }}>{new Date(ev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.dark }}>Request Payout</h2>
              <button onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.mu }}>✕</button>
            </div>
            <div style={{ background: C.cream, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: C.mu }}>Available balance</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.teal }}>₹{Number(inf.pending_payout).toLocaleString()}</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mu, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>UPI ID</label>
              <input value={payoutUpi} onChange={e => setPayoutUpi(e.target.value)} style={inputStyle} placeholder="yourname@upi" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.mu, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount (₹)</label>
              <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} style={inputStyle} placeholder={`Max ₹${inf.pending_payout}`} max={inf.pending_payout} min={1} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowPayoutModal(false)} style={{ flex: 1, padding: '12px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: C.dark }}>Cancel</button>
              <button onClick={submitPayout} disabled={payoutLoading} style={{ flex: 2, padding: '12px', background: C.teal, color: C.white, border: 'none', borderRadius: 8, fontWeight: 700, cursor: payoutLoading ? 'default' : 'pointer', opacity: payoutLoading ? 0.7 : 1, fontSize: 15 }}>
                {payoutLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: C.mu, textAlign: 'center', marginTop: 12 }}>Payouts processed within 2-3 business days</p>
          </div>
        </div>
      )}
    </div>
  )
}
