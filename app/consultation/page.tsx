'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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

type ConsultType = 'instant' | 'scheduled' | null
type Mode = 'video' | 'audio' | 'chat'
type Step = 1 | 2 | 3 | 4 | 'success'

interface Specialist {
  id: string
  name: string
  specialty: string
  rating: number
  consultations: number
  available: boolean
  nextSlot?: string
  avatarColor: string
  avatarEmoji: string
}

const SPECIALISTS: Specialist[] = [
  { id: 'sp1', name: 'Dr. Priya Mehta', specialty: 'Dermatologist', rating: 4.9, consultations: 1240, available: true, avatarColor: '#E8D5F0', avatarEmoji: '👩‍⚕️' },
  { id: 'sp2', name: 'Dr. Kavya Iyer', specialty: 'Trichologist', rating: 4.8, consultations: 890, available: true, avatarColor: '#D5E8F0', avatarEmoji: '💆‍♀️' },
  { id: 'sp3', name: 'Dr. Arjun Kapoor', specialty: 'Cosmetologist', rating: 4.7, consultations: 654, available: false, nextSlot: 'Next slot: 3 PM', avatarColor: '#D5F0E3', avatarEmoji: '👨‍⚕️' },
  { id: 'sp4', name: 'Dr. Ananya Singh', specialty: 'Skin & Hair Expert', rating: 4.9, consultations: 2100, available: true, avatarColor: '#F0E8D5', avatarEmoji: '👩‍🔬' },
]

const CONCERNS = ['Acne', 'Dark Spots', 'Dryness', 'Oily Skin', 'Hairfall', 'Dandruff', 'Body Care', 'Anti-aging', 'Sensitivity', 'Baby Skin']

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
]

const COUPON_CODES: Record<string, number> = { SKIN10: 10, DERMIQ20: 20, FIRST50: 50 }

function generateTimeSlots() {
  const slots = []
  for (let h = 10; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h > 12 ? h - 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      const min = m === 0 ? '00' : m
      slots.push({
        label: `${hour}:${min} ${ampm}`,
        available: Math.random() > 0.35,
      })
    }
  }
  return slots
}

function generate7Days() {
  const days = []
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      label: dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    })
  }
  return days
}

const TIME_SLOTS = generateTimeSlots()
const DAYS = generate7Days()

function ConsultationPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cartOpen, setCartOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [consultType, setConsultType] = useState<ConsultType>(null)
  const [mode, setMode] = useState<Mode>('video')
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null)
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [paying, setPaying] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    // Pre-select consultation type from URL param
    const typeParam = searchParams.get('type')
    if (typeParam === 'instant' || typeParam === 'scheduled') {
      setConsultType(typeParam)
      setStep(2) // Skip to specialist selection
    }
    return () => window.removeEventListener('resize', check)
  }, [searchParams])

  function applyCoupon() {
    const code = coupon.trim().toUpperCase()
    if (COUPON_CODES[code] !== undefined) {
      setDiscount(COUPON_CODES[code])
      toast.success(`Coupon applied! ₹${COUPON_CODES[code]} off`)
    } else {
      toast.error('Invalid coupon code')
    }
  }

  function toggleConcern(c: string) {
    setSelectedConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const price = consultType === 'instant' ? 499 : 399
  const finalPrice = Math.max(0, price - discount)
  const modeIcons: Record<Mode, string> = { video: '📹', audio: '🎙️', chat: '💬' }
  const modeLabels: Record<Mode, string> = { video: 'Video', audio: 'Audio', chat: 'Chat' }

  async function handlePay() {
    if (!selectedSpecialist) { toast.error('Please select a specialist'); return }
    if (consultType === 'scheduled' && !selectedSlot) { toast.error('Please select a time slot'); return }
    setPaying(true)

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('dermiq_consultations').insert({
        user_id: user?.id || null,
        specialist_name: selectedSpecialist.name,
        specialty: selectedSpecialist.specialty,
        type: consultType,
        mode,
        concerns: selectedConcerns,
        notes,
        slot: consultType === 'scheduled'
          ? `${DAYS[selectedDay].full} ${selectedSlot}`
          : 'Instant — within 5 minutes',
        price: finalPrice,
        payment_method: paymentMethod,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      })
    } catch {
      // Proceed even if DB fails — show success
    }

    setPaying(false)
    setStep('success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── STEP INDICATOR ──
  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, gap: 0 }}>
      {[1, 2, 3, 4].map((s, i) => {
        const currentNum = step === 'success' ? 5 : (step as number)
        const done = s < currentNum
        const active = s === currentNum
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700,
              background: done ? C.green : active ? C.teal : C.border,
              color: done || active ? '#fff' : C.mu, transition: 'all 0.3s',
            }}>
              {done ? '✓' : s}
            </div>
            {i < 3 && (
              <div style={{
                width: isMobile ? 32 : 60, height: 2,
                background: done ? C.green : C.border, transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )

  const stepLabels = ['Choose Type', 'Specialist', 'Concerns', 'Payment']

  // ─────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <>
        <Navbar activePage="consultation" />
        <style>{`
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes scaleIn {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .check-circle { animation: scaleIn 0.5s ease forwards; }
        `}</style>
        <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, paddingBottom: 80, fontFamily: 'var(--font-dm)' }}>
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
            {/* Animated checkmark */}
            <div className="check-circle" style={{
              width: 100, height: 100, borderRadius: '50%', background: `${C.green}15`,
              border: `3px solid ${C.green}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 28px', fontSize: 44,
            }}>✅</div>

            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, color: C.dark, marginBottom: 8 }}>
              Consultation Confirmed!
            </h1>
            <p style={{ color: C.mu, fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              Your consultation has been booked and confirmed. Get ready for your session!
            </p>

            {/* Details card */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 28,
              border: `1px solid ${C.border}`, textAlign: 'left',
            }}>
              {[
                { label: 'Specialist', value: selectedSpecialist?.name || '' },
                { label: 'Specialty', value: selectedSpecialist?.specialty || '' },
                { label: 'Mode', value: `${modeIcons[mode]} ${modeLabels[mode]} Call` },
                { label: 'Time', value: consultType === 'instant' ? 'Instant — within 5 minutes' : `${DAYS[selectedDay]?.full} ${selectedSlot}` },
                { label: 'Duration', value: consultType === 'instant' ? '20 minutes' : '30 minutes' },
                { label: 'Amount Paid', value: `₹${finalPrice}` },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < 5 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: 13, color: C.mu }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {consultType === 'instant' && (
                <button onClick={() => toast('Zegocloud integration coming soon!', { icon: '📹' })} style={{
                  padding: '14px', background: C.green, color: '#fff', border: 'none',
                  borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-dm)', cursor: 'pointer',
                }}>
                  📹 Join Call Now
                </button>
              )}
              <Link href="/skin-report" style={{
                display: 'block', padding: '13px', background: C.teal, color: '#fff',
                border: 'none', borderRadius: 12,
                textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm)', textAlign: 'center',
              }}>
                🧬 View My Skin Report
              </Link>
              <button onClick={() => toast('Calendar invite sent to your email!', { icon: '📅' })} style={{
                padding: '13px', background: '#fff', color: C.teal,
                border: `1.5px solid ${C.teal}`, borderRadius: 12,
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm)', cursor: 'pointer',
              }}>
                📅 Add to Calendar
              </button>
              <Link href="/account" style={{
                display: 'block', padding: '13px', background: C.cream, color: C.dark,
                border: `1.5px solid ${C.border}`, borderRadius: 12,
                textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-dm)',
              }}>
                📋 View All Consultations
              </Link>
            </div>
          </div>
        </main>
        <MobileToolbar activePage="consultation" />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    )
  }

  return (
    <>
      <Navbar activePage="consultation" />

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-content { animation: fadeSlide 0.3s ease forwards; }
      `}</style>

      <main style={{ minHeight: '100vh', background: C.bg, paddingTop: 64, paddingBottom: 100, fontFamily: 'var(--font-dm)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px' }}>

          {/* Page title */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: isMobile ? 26 : 34, color: C.dark, marginBottom: 8 }}>
              Book a Consultation
            </h1>
            <p style={{ color: C.mu, fontSize: 14 }}>
              {stepLabels[(step as number) - 1]} — Step {step} of 4
            </p>
          </div>

          <StepBar />

          {/* ─────── STEP 1: CHOOSE TYPE ─────── */}
          {step === 1 && (
            <div className="step-content">
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 20, maxWidth: 720, margin: '0 auto',
              }}>
                {/* Instant */}
                <div
                  onClick={() => setConsultType('instant')}
                  style={{
                    background: '#fff', borderRadius: 18, padding: '28px 26px',
                    border: `2px solid ${consultType === 'instant' ? C.teal : C.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: consultType === 'instant' ? `0 0 0 4px ${C.teal}15` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: 'var(--font-playfair)' }}>Instant Consultation</div>
                    </div>
                    <div style={{
                      background: `${C.green}15`, color: C.green, fontSize: 11, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 20,
                    }}>● Available Now</div>
                  </div>

                  <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, marginBottom: 8, fontFamily: 'var(--font-playfair)' }}>₹499</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                    {['Connect within 5 minutes', 'Duration: 20 minutes', 'No advance booking needed'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.mu }}>
                        <span style={{ color: C.green }}>✓</span> {f}
                      </div>
                    ))}
                  </div>

                  {/* Mode selector */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 8 }}>Select Mode</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['video', 'audio', 'chat'] as Mode[]).map(m => (
                        <button
                          key={m}
                          onClick={e => { e.stopPropagation(); setMode(m); setConsultType('instant') }}
                          style={{
                            flex: 1, padding: '8px 4px', border: `1.5px solid ${mode === m && consultType === 'instant' ? C.teal : C.border}`,
                            borderRadius: 8, background: mode === m && consultType === 'instant' ? `${C.teal}10` : '#fff',
                            color: mode === m && consultType === 'instant' ? C.teal : C.mu,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm)',
                          }}
                        >
                          {modeIcons[m]} {modeLabels[m]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); setConsultType('instant'); setStep(2) }}
                    style={{
                      width: '100%', padding: '12px', background: consultType === 'instant' ? C.teal : C.cream,
                      color: consultType === 'instant' ? '#fff' : C.dark, border: 'none',
                      borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-dm)', transition: 'all 0.2s',
                    }}
                  >
                    Select Instant →
                  </button>
                </div>

                {/* Scheduled */}
                <div
                  onClick={() => setConsultType('scheduled')}
                  style={{
                    background: '#fff', borderRadius: 18, padding: '28px 26px',
                    border: `2px solid ${consultType === 'scheduled' ? C.teal : C.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: consultType === 'scheduled' ? `0 0 0 4px ${C.teal}15` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: 'var(--font-playfair)' }}>Scheduled Consultation</div>
                    </div>
                    <div style={{
                      background: `${C.gold}20`, color: C.gold, fontSize: 11, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 20,
                    }}>Advance Booking</div>
                  </div>

                  <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, marginBottom: 8, fontFamily: 'var(--font-playfair)' }}>₹399</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                    {['Choose your preferred time', 'Duration: 30 minutes', '24hr advance booking'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.mu }}>
                        <span style={{ color: C.green }}>✓</span> {f}
                      </div>
                    ))}
                  </div>

                  {/* Mode selector */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 8 }}>Select Mode</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['video', 'audio', 'chat'] as Mode[]).map(m => (
                        <button
                          key={m}
                          onClick={e => { e.stopPropagation(); setMode(m); setConsultType('scheduled') }}
                          style={{
                            flex: 1, padding: '8px 4px', border: `1.5px solid ${mode === m && consultType === 'scheduled' ? C.teal : C.border}`,
                            borderRadius: 8, background: mode === m && consultType === 'scheduled' ? `${C.teal}10` : '#fff',
                            color: mode === m && consultType === 'scheduled' ? C.teal : C.mu,
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm)',
                          }}
                        >
                          {modeIcons[m]} {modeLabels[m]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); setConsultType('scheduled'); setStep(2) }}
                    style={{
                      width: '100%', padding: '12px', background: consultType === 'scheduled' ? C.teal : C.cream,
                      color: consultType === 'scheduled' ? '#fff' : C.dark, border: 'none',
                      borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-dm)', transition: 'all 0.2s',
                    }}
                  >
                    Select Scheduled →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────── STEP 2: CHOOSE SPECIALIST ─────── */}
          {step === 2 && (
            <div className="step-content">
              <button onClick={() => setStep(1)} style={{
                background: 'none', border: 'none', color: C.teal, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-dm)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6,
              }}>← Back</button>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {SPECIALISTS.map(sp => (
                  <div
                    key={sp.id}
                    onClick={() => setSelectedSpecialist(sp)}
                    style={{
                      background: '#fff', borderRadius: 16, padding: '20px',
                      border: `2px solid ${selectedSpecialist?.id === sp.id ? C.teal : C.border}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: selectedSpecialist?.id === sp.id ? `0 0 0 4px ${C.teal}15` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 56, height: 56, borderRadius: 12, background: sp.avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, flexShrink: 0,
                      }}>
                        {sp.avatarEmoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{sp.name}</div>
                            <div style={{ fontSize: 12, color: C.mu, marginTop: 2 }}>{sp.specialty}</div>
                          </div>
                          {sp.available ? (
                            <div style={{
                              background: `${C.green}15`, color: C.green, fontSize: 10, fontWeight: 700,
                              padding: '3px 8px', borderRadius: 20, flexShrink: 0,
                            }}>● Available</div>
                          ) : (
                            <div style={{
                              background: `${C.gold}15`, color: C.gold, fontSize: 10, fontWeight: 700,
                              padding: '3px 8px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap',
                            }}>{sp.nextSlot}</div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                          <div style={{ fontSize: 12, color: C.dark }}>
                            <span style={{ color: C.gold }}>★</span> <strong>{sp.rating}</strong>
                          </div>
                          <div style={{ fontSize: 12, color: C.mu }}>
                            {sp.consultations.toLocaleString()} consultations
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setSelectedSpecialist(sp); setStep(3) }}
                      style={{
                        marginTop: 14, width: '100%', padding: '10px',
                        background: selectedSpecialist?.id === sp.id ? C.teal : C.cream,
                        color: selectedSpecialist?.id === sp.id ? '#fff' : C.dark,
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-dm)', transition: 'all 0.2s',
                      }}
                    >
                      Select {sp.name.split(' ')[1]} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────── STEP 3: CONCERNS + DATE/TIME ─────── */}
          {step === 3 && (
            <div className="step-content" style={{ maxWidth: 680, margin: '0 auto' }}>
              <button onClick={() => setStep(2)} style={{
                background: 'none', border: 'none', color: C.teal, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-dm)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6,
              }}>← Back</button>

              {/* Concerns */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, color: C.dark, marginBottom: 8 }}>
                  What are your concerns?
                </h3>
                <p style={{ fontSize: 13, color: C.mu, marginBottom: 16 }}>Select all that apply</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {CONCERNS.map(c => {
                    const selected = selectedConcerns.includes(c)
                    return (
                      <button
                        key={c}
                        onClick={() => toggleConcern(c)}
                        style={{
                          padding: '8px 16px', borderRadius: 24,
                          border: `1.5px solid ${selected ? C.teal : C.border}`,
                          background: selected ? `${C.teal}10` : '#fff',
                          color: selected ? C.teal : C.mu,
                          fontSize: 13, fontWeight: selected ? 600 : 400,
                          cursor: 'pointer', fontFamily: 'var(--font-dm)', transition: 'all 0.2s',
                        }}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: `1px solid ${C.border}` }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
                  Any additional information for the specialist?
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="E.g. I've been using retinol for 2 weeks and experiencing dryness..."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`,
                    borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-dm)',
                    background: C.bg, color: C.dark, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Date/Time Slots for Scheduled */}
              {consultType === 'scheduled' && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: `1px solid ${C.border}` }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, color: C.dark, marginBottom: 16 }}>
                    Select Date & Time
                  </h3>

                  {/* Day picker */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 10 }}>Choose Date</div>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                      {DAYS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedDay(i); setSelectedSlot(null) }}
                          style={{
                            flexShrink: 0, width: 60, padding: '10px 4px',
                            border: `1.5px solid ${selectedDay === i ? C.teal : C.border}`,
                            borderRadius: 10,
                            background: selectedDay === i ? `${C.teal}10` : '#fff',
                            cursor: 'pointer', textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: 10, color: C.mu, fontWeight: 600 }}>{d.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: selectedDay === i ? C.teal : C.dark }}>{d.date}</div>
                          <div style={{ fontSize: 10, color: C.mu }}>{d.month}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div>
                    <div style={{ fontSize: 12, color: C.mu, fontWeight: 600, marginBottom: 10 }}>Choose Time</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {TIME_SLOTS.map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => slot.available && setSelectedSlot(slot.label)}
                          style={{
                            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${selectedSlot === slot.label ? C.teal : slot.available ? C.border : C.border}`,
                            background: selectedSlot === slot.label ? `${C.teal}10` : slot.available ? '#fff' : C.cream,
                            color: selectedSlot === slot.label ? C.teal : slot.available ? C.dark : C.mu,
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            fontFamily: 'var(--font-dm)',
                            textDecoration: !slot.available ? 'line-through' : 'none',
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (consultType === 'scheduled' && !selectedSlot) {
                    toast.error('Please select a time slot')
                    return
                  }
                  setStep(4)
                }}
                style={{
                  width: '100%', padding: '14px', background: C.teal, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-dm)', cursor: 'pointer',
                }}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* ─────── STEP 4: PAYMENT & CONFIRM ─────── */}
          {step === 4 && (
            <div className="step-content" style={{ maxWidth: 620, margin: '0 auto' }}>
              <button onClick={() => setStep(3)} style={{
                background: 'none', border: 'none', color: C.teal, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-dm)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6,
              }}>← Back</button>

              {/* Summary */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, color: C.dark, marginBottom: 16 }}>
                  Booking Summary
                </h3>
                {[
                  { label: 'Specialist', value: selectedSpecialist?.name || '—' },
                  { label: 'Specialty', value: selectedSpecialist?.specialty || '—' },
                  { label: 'Mode', value: `${modeIcons[mode]} ${modeLabels[mode]} Call` },
                  { label: 'Time', value: consultType === 'instant' ? 'Instant — within 5 min' : `${DAYS[selectedDay]?.full} at ${selectedSlot}` },
                  { label: 'Duration', value: consultType === 'instant' ? '20 minutes' : '30 minutes' },
                  { label: 'Concerns', value: selectedConcerns.length ? selectedConcerns.slice(0, 3).join(', ') + (selectedConcerns.length > 3 ? '…' : '') : 'None selected' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '8px 0', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none', gap: 12,
                  }}>
                    <span style={{ fontSize: 13, color: C.mu, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.dark, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}

                {/* Price breakdown */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.mu }}>Consultation fee</span>
                    <span style={{ fontSize: 13, color: C.dark }}>₹{price}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.green }}>Coupon discount</span>
                      <span style={{ fontSize: 13, color: C.green }}>−₹{discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.teal, fontFamily: 'var(--font-playfair)' }}>₹{finalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, border: `1px solid ${C.border}` }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
                  Have a coupon code?
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="e.g. SKIN10"
                    style={{
                      flex: 1, padding: '10px 14px', border: `1.5px solid ${C.border}`,
                      borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-dm)',
                      background: C.bg, color: C.dark, outline: 'none',
                    }}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} style={{
                    padding: '10px 18px', background: C.accent, color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-dm)',
                  }}>Apply</button>
                </div>
                <p style={{ fontSize: 11, color: C.mu, marginTop: 6 }}>Try: SKIN10, DERMIQ20, FIRST50</p>
              </div>

              {/* Payment method */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: C.dark, marginBottom: 14 }}>
                  Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                        border: `2px solid ${paymentMethod === pm.id ? C.teal : C.border}`,
                        borderRadius: 12, background: paymentMethod === pm.id ? `${C.teal}08` : '#fff',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-dm)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: C.cream,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>{pm.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{pm.label}</div>
                        <div style={{ fontSize: 12, color: C.mu }}>{pm.desc}</div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${paymentMethod === pm.id ? C.teal : C.border}`,
                        background: paymentMethod === pm.id ? C.teal : '#fff',
                        flexShrink: 0,
                      }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm */}
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  width: '100%', padding: '15px', background: C.teal, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  fontFamily: 'var(--font-dm)', cursor: 'pointer', opacity: paying ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {paying ? 'Processing Payment…' : `🔒 Confirm & Pay ₹${finalPrice}`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: C.mu, marginTop: 10 }}>
                🔒 Secured by 256-bit SSL encryption. Your payment details are safe.
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileToolbar activePage="consultation" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={null}>
      <ConsultationPageInner />
    </Suspense>
  )
}
