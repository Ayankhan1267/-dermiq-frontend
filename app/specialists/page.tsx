'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────
interface Specialist {
  id: string
  name: string
  title: string
  speciality: string[]
  experience: number
  rating: number
  reviews: number
  consultations: number
  price: number
  languages: string[]
  available: boolean
  nextSlot: string
  avatar?: string
  emoji: string
  bio: string
  education: string
  verified: boolean
  tags: string[]
}

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED_SPECIALISTS: Specialist[] = [
  {
    id: '1', name: 'Dr. Priya Sharma', title: 'MD Dermatology', speciality: ['Acne & Scars', 'Pigmentation', 'Anti-aging'],
    experience: 9, rating: 4.9, reviews: 412, consultations: 1840, price: 599,
    languages: ['English', 'Hindi'], available: true, nextSlot: 'Today, 4:00 PM',
    emoji: '👩‍⚕️', verified: true,
    bio: 'Board-certified dermatologist with 9 years of experience treating complex skin conditions. Specialises in science-backed protocols for acne, pigmentation, and premature aging.',
    education: 'MBBS, MD Dermatology — AIIMS New Delhi',
    tags: ['Acne', 'Dark Spots', 'Aging', 'Chemical Peels'],
  },
  {
    id: '2', name: 'Dr. Arjun Mehta', title: 'Cosmetic Dermatologist', speciality: ['Sensitive Skin', 'Eczema', 'Rosacea'],
    experience: 7, rating: 4.8, reviews: 289, consultations: 1230, price: 499,
    languages: ['English', 'Hindi', 'Marathi'], available: true, nextSlot: 'Today, 6:30 PM',
    emoji: '👨‍⚕️', verified: true,
    bio: 'Expert in managing sensitive and reactive skin conditions. Known for gentle, evidence-based approaches that minimise side effects while delivering visible results.',
    education: 'MBBS, MD Dermatology — KEM Hospital Mumbai',
    tags: ['Sensitive Skin', 'Eczema', 'Rosacea', 'Barrier Repair'],
  },
  {
    id: '3', name: 'Dr. Sneha Kapoor', title: 'Aesthetic Dermatologist', speciality: ['Anti-aging', 'Skin Brightening', 'Hydration'],
    experience: 11, rating: 4.9, reviews: 534, consultations: 2640, price: 799,
    languages: ['English', 'Hindi'], available: false, nextSlot: 'Tomorrow, 10:00 AM',
    emoji: '👩‍⚕️', verified: true,
    bio: 'Renowned aesthetic dermatologist with over a decade of experience. Pioneer of the "skin minimalism" approach — fewer, targeted ingredients for maximum results.',
    education: 'MBBS, MD — CMC Vellore · Fellowship Aesthetic Dermatology',
    tags: ['Anti-aging', 'Brightening', 'Fillers', 'Laser'],
  },
  {
    id: '4', name: 'Dr. Rahul Nair', title: 'Clinical Dermatologist', speciality: ['Hair & Scalp', 'Alopecia', 'Dandruff'],
    experience: 6, rating: 4.7, reviews: 198, consultations: 890, price: 449,
    languages: ['English', 'Malayalam', 'Hindi'], available: true, nextSlot: 'Today, 7:00 PM',
    emoji: '👨‍⚕️', verified: true,
    bio: 'Focused on trichology — the science of hair and scalp health. Treats hair thinning, alopecia areata, scalp psoriasis, and chronic dandruff with evidence-based protocols.',
    education: 'MBBS, MD Dermatology · Diploma in Trichology — IADVL',
    tags: ['Hair Loss', 'Dandruff', 'Scalp Health', 'PRP'],
  },
  {
    id: '5', name: 'Dr. Kavya Iyer', title: 'Holistic Skin Specialist', speciality: ['Holistic Skincare', 'Diet & Skin', 'Hormonal Acne'],
    experience: 8, rating: 4.8, reviews: 321, consultations: 1460, price: 549,
    languages: ['English', 'Tamil', 'Kannada'], available: true, nextSlot: 'Tomorrow, 9:00 AM',
    emoji: '👩‍⚕️', verified: true,
    bio: 'Bridges the gap between clinical dermatology and lifestyle medicine. Unique approach integrating gut health, nutrition, and hormonal balance for lasting skin results.',
    education: 'MBBS, MD Dermatology — JIPMER Puducherry · Certified Nutritionist',
    tags: ['Hormonal Acne', 'Diet & Skin', 'PCOS Skin', 'Holistic'],
  },
  {
    id: '6', name: 'Dr. Vikram Singh', title: 'Paediatric Dermatologist', speciality: ['Kids Skin', 'Eczema', 'Vitiligo'],
    experience: 12, rating: 4.9, reviews: 478, consultations: 2100, price: 649,
    languages: ['English', 'Hindi', 'Punjabi'], available: false, nextSlot: 'Thu, 11:00 AM',
    emoji: '👨‍⚕️', verified: true,
    bio: 'Specialises in paediatric and adolescent dermatology. One of India\'s leading experts in vitiligo management and childhood eczema treatment protocols.',
    education: 'MBBS, MD, DNB Dermatology — PGI Chandigarh',
    tags: ['Kids Skin', 'Vitiligo', 'Eczema', 'Adolescent Skin'],
  },
]

const SPECIALITIES = ['All', 'Acne & Scars', 'Pigmentation', 'Anti-aging', 'Sensitive Skin', 'Hair & Scalp', 'Holistic', 'Eczema']
const ANN = ['👩‍⚕️ 50+ verified skin specialists','📅 Book in under 2 minutes','💬 Video · Audio · Chat consultations','⭐ 4.8 avg specialist rating','🔒 100% confidential','🌍 Hindi · English · 8 regional languages']
const ANN_DOUBLED = [...ANN, ...ANN]

export default function SpecialistsPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [specialists, setSpecialists] = useState<Specialist[]>(SEED_SPECIALISTS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('specialists')
  const [bookModal, setBookModal] = useState<Specialist | null>(null)
  const [bookForm, setBookForm] = useState({ name: '', email: '', phone: '', date: '', concern: '', mode: 'video' })
  const [bookingDone, setBookingDone] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'experience'>('rating')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('dermiq_open_cart', handler)
    }
  }, [])

  // Try to load from Supabase
  useEffect(() => {
    async function loadSpecialists() {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'specialist')
        if (data && data.length > 0) {
          setSpecialists(data.map(sp => ({
            id: sp.id, name: sp.full_name || sp.name || 'Dr. Specialist',
            title: sp.title || 'Dermatologist', speciality: sp.speciality || [],
            experience: sp.experience || 5, rating: sp.rating || 4.8, reviews: sp.reviews || 0,
            consultations: sp.consultations || 0, price: sp.price || 499,
            languages: sp.languages || ['English'], available: sp.available ?? true,
            nextSlot: sp.next_slot || 'Today', emoji: sp.emoji || '👩‍⚕️',
            bio: sp.bio || '', education: sp.education || '', verified: sp.verified ?? true,
            tags: sp.tags || [],
          })))
        }
      } catch { /* use seed data */ }
    }
    loadSpecialists()
  }, [])

  const filtered = specialists
    .filter(sp => filter === 'All' || sp.speciality.some(s => s.includes(filter) || filter.includes(s.split(' ')[0])))
    .filter(sp => !search || sp.name.toLowerCase().includes(search.toLowerCase()) || sp.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price_low') return a.price - b.price
      if (sortBy === 'price_high') return b.price - a.price
      if (sortBy === 'experience') return b.experience - a.experience
      return 0
    })

  function submitBooking() {
    if (!bookForm.name || !bookForm.email || !bookForm.phone) { toast.error('Please fill all required fields'); return }
    setBookingDone(true)
    toast.success('Consultation booked! You\'ll receive a confirmation email shortly.', { duration: 4000 })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', paddingBottom: 80 }}>
      {/* Announcement */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#1A2E2B', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ann-track">
          {ANN_DOUBLED.map((a, i) => <span key={i} style={{ padding: '0 36px', fontSize: 12, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>{a} <span style={{ color: '#C8976A', marginLeft: 32 }}>·</span></span>)}
        </div>
      </div>

      <Navbar activePage="marketplace" />
      <div style={{ height: 106 }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#1A2E2B,#2D5F5A)', padding: '56px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(200,151,106,0.2)', color: '#C8976A', fontSize: 12, fontWeight: 700, padding: '5px 16px', borderRadius: 20, fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.1em', marginBottom: 16 }}>
            DERMIQ SPECIALISTS
          </span>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(28px,5vw,48px)', color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            Talk to a Certified<br />
            <span style={{ color: '#C8976A' }}>Skin Specialist</span> Today
          </h1>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            All DermIQ specialists are board-certified dermatologists with verified credentials. Get personalised skincare advice via video, audio, or chat.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['50+', 'Verified Specialists'], ['4.8★', 'Average Rating'], ['₹449', 'Starting From'], ['24hrs', 'Avg Response']].map(([v, l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', minWidth: 100 }}>
                <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{v}</p>
                <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '3px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E0D8', position: 'sticky', top: 106, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0, overflowX: 'auto' }} className="no-scrollbar">
          {[['specialists', '👩‍⚕️ Find Specialists'], ['how', '❓ How It Works'], ['reviews', '⭐ Reviews'], ['join', '🎓 Join as Specialist']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '16px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', color: tab === t ? '#2D5F5A' : '#6B7280', borderBottom: tab === t ? '3px solid #2D5F5A' : '3px solid transparent', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ══ TAB: SPECIALISTS ══════════════════════════════════════ */}
        {tab === 'specialists' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or concern..." style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none' }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans,sans-serif', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                <option value="rating">Sort: Top Rated</option>
                <option value="price_low">Sort: Price Low–High</option>
                <option value="price_high">Sort: Price High–Low</option>
                <option value="experience">Sort: Most Experienced</option>
              </select>
            </div>

            {/* Speciality pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 4 : 0 }}>
              {SPECIALITIES.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${filter === s ? '#2D5F5A' : '#E8E0D8'}`, background: filter === s ? 'rgba(45,95,90,0.08)' : '#fff', color: filter === s ? '#2D5F5A' : '#6B7280', fontSize: 13, fontWeight: filter === s ? 700 : 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>

            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 20 }}>{filtered.length} specialist{filtered.length !== 1 ? 's' : ''} found</p>

            {/* Specialist cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(sp => (
                <div key={sp.id} style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)')}
                >
                  <div style={{ display: 'flex', gap: 20, padding: '24px', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#F7F3EE,#E8F0EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, border: '3px solid #E8E0D8' }}>
                        {sp.emoji}
                      </div>
                      {sp.verified && (
                        <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: '#2D5F5A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #fff' }}>✓</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: '#1A2E2B', margin: 0 }}>{sp.name}</h3>
                            {sp.verified && <span style={{ fontSize: 11, background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 10, fontFamily: 'DM Sans,sans-serif', fontWeight: 700 }}>✓ Verified</span>}
                          </div>
                          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#2D5F5A', fontWeight: 600, margin: '2px 0 0' }}>{sp.title}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 700, color: '#1A2E2B', margin: 0 }}>₹{sp.price}</p>
                          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#6B7280', margin: '1px 0 0' }}>per consultation</p>
                        </div>
                      </div>

                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>{sp.bio}</p>

                      {/* Stats row */}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                        {[
                          { icon: '★', val: `${sp.rating} (${sp.reviews})`, label: 'Rating' },
                          { icon: '💬', val: sp.consultations.toLocaleString(), label: 'Consultations' },
                          { icon: '🏥', val: `${sp.experience} yrs`, label: 'Experience' },
                          { icon: '🌐', val: sp.languages.join(', '), label: 'Languages' },
                        ].map(stat => (
                          <div key={stat.label} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                            <span style={{ fontSize: 13 }}>{stat.icon}</span>
                            <div>
                              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#1A2E2B', margin: 0 }}>{stat.val}</p>
                              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: '#9CA3AF', margin: 0 }}>{stat.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#6B7280', margin: '0 0 10px' }}>🎓 {sp.education}</p>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                        {sp.tags.map(t => <span key={t} style={{ background: '#F0F9F8', color: '#2D5F5A', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', border: '1px solid #C8E6E4' }}>{t}</span>)}
                      </div>

                      {/* Availability + Book */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: sp.available ? '#22C55E' : '#F59E0B', display: 'inline-block' }} />
                          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: sp.available ? '#16A34A' : '#D97706', fontWeight: 600 }}>
                            {sp.available ? 'Available Now' : 'Next Available'}
                          </span>
                          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#6B7280' }}>· {sp.nextSlot}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => toast.success('Chat feature coming soon!')} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #E8E0D8', background: '#fff', color: '#1A2E2B', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            💬 Message
                          </button>
                          <button onClick={() => { setBookModal(sp); setBookingDone(false); setBookForm({ name: '', email: '', phone: '', date: '', concern: '', mode: 'video' }) }} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(45,95,90,0.25)' }}>
                            📅 Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ TAB: HOW IT WORKS ════════════════════════════════════ */}
        {tab === 'how' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, color: '#1A2E2B', textAlign: 'center', marginBottom: 8 }}>How DermIQ Consultations Work</h2>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 1.7 }}>Expert skin advice in 4 simple steps. No clinic visit. No waiting room.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
              {[
                { step: '01', icon: '🧬', title: 'Take the AI Skin Analysis', desc: 'Complete the 60-second DermIQ skin quiz. Our AI analyses 47 skin parameters and prepares a detailed report for your specialist.' },
                { step: '02', icon: '🔍', title: 'Choose Your Specialist', desc: 'Browse verified dermatologists filtered by speciality, language, availability, and price. All specialists have verified credentials.' },
                { step: '03', icon: '📅', title: 'Book a Time Slot', desc: 'Pick a time that works for you — early morning to late evening, 7 days a week. Pay securely online.' },
                { step: '04', icon: '💬', title: 'Consult via Video / Chat', desc: 'Join your consultation from any device. Your specialist has your AI skin report ready. Get a personalised prescription and product list.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 20, padding: '24px', background: '#fff', borderRadius: 18, border: '1px solid #E8E0D8', alignItems: 'flex-start' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 800, color: '#2D5F5A', letterSpacing: '0.1em' }}>STEP {s.step}</span>
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: '#1A2E2B', margin: '4px 0 8px' }}>{s.title}</h3>
                    <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div style={{ background: 'linear-gradient(135deg,#1A2E2B,#2D5F5A)', borderRadius: 20, padding: '32px', marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#fff', marginBottom: 20, textAlign: 'center' }}>Every Consultation Includes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[
                  ['📋', 'Personalised Skin Assessment'],
                  ['💊', 'Product & Ingredient Recommendations'],
                  ['🗓️', 'Custom AM/PM Routine Plan'],
                  ['📱', 'Follow-up Chat for 48 hours'],
                  ['📄', 'Digital Prescription (if needed)'],
                  ['🔒', '100% Private & Confidential'],
                ].map(([icon, label]) => (
                  <div key={label as string} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#fff', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setTab('specialists')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(45,95,90,0.3)' }}>
                Find My Specialist →
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB: REVIEWS ═════════════════════════════════════════ */}
        {tab === 'reviews' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, color: '#1A2E2B', marginBottom: 8 }}>What Clients Say</h2>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Real experiences from verified DermIQ consultation clients.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Anjali R.', spec: 'Dr. Priya Sharma', rating: 5, date: 'Mar 20, 2026', text: 'Dr. Sharma reviewed my AI skin report before the call and already had a plan ready. In 30 minutes she sorted out 6 months of breakouts. Worth every rupee!' },
                { name: 'Kartik M.', spec: 'Dr. Arjun Mehta', rating: 5, date: 'Mar 15, 2026', text: 'Finally a dermatologist who understood sensitive skin. No harsh prescriptions — just a simple, gentle routine that actually works. My skin is the calmest it\'s been in years.' },
                { name: 'Divya S.', spec: 'Dr. Kavya Iyer', rating: 5, date: 'Mar 10, 2026', text: 'Dr. Iyer connected my hormonal acne to my diet and sleep patterns. She suggested both skincare and lifestyle changes. 3 weeks in and the difference is incredible.' },
                { name: 'Rohan P.', spec: 'Dr. Rahul Nair', rating: 4, date: 'Feb 28, 2026', text: 'Consulted for hair thinning. Dr. Nair ordered specific tests and had a proper protocol ready. Follow-up via chat was also super responsive. Highly recommend.' },
              ].map((r, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E8E0D8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: 'DM Sans,sans-serif' }}>{r.name[0]}</div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1A2E2B', margin: 0, fontFamily: 'DM Sans,sans-serif' }}>{r.name}</p>
                        <p style={{ fontSize: 12, color: '#2D5F5A', margin: '2px 0 0', fontFamily: 'DM Sans,sans-serif' }}>Consulted {r.spec}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#2D5F5A', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, fontFamily: 'DM Sans,sans-serif' }}>★ {r.rating}</span>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'DM Sans,sans-serif' }}>{r.date}</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: JOIN ════════════════════════════════════════════ */}
        {tab === 'join' && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, color: '#1A2E2B', marginBottom: 8 }}>Join as a DermIQ Specialist</h2>
              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>Help thousands of people understand and improve their skin — on your schedule, from anywhere.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
              {[
                { icon: '💰', title: '₹400–700/consultation', desc: 'You set your own rates. Withdraw anytime.' },
                { icon: '🕐', title: 'Flexible Hours', desc: 'Work when you want. Morning, evening, weekends.' },
                { icon: '🤖', title: 'AI-Assisted', desc: 'Client skin reports ready before every call.' },
                { icon: '📈', title: 'Grow Your Practice', desc: 'DermIQ brings qualified clients to you.' },
              ].map(b => (
                <div key={b.title} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E8E0D8', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{b.icon}</div>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B', margin: '0 0 6px' }}>{b.title}</p>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#6B7280', margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #E8E0D8' }}>
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, color: '#1A2E2B', marginBottom: 20 }}>Apply to Join</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Full Name', 'text', 'Dr. Your Name'], ['Email', 'email', 'you@hospital.com'], ['Medical Registration No.', 'text', 'MCI/State Council number'], ['Speciality', 'text', 'e.g. Dermatology, Trichology'], ['Years of Experience', 'number', '5']].map(([label, type, placeholder]) => (
                  <div key={label as string}>
                    <label style={{ display: 'block', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                    <input type={type as string} placeholder={placeholder as string} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => toast.success('Application submitted! We\'ll review and reach out within 48 hours.')} style={{ padding: '14px', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                  Submit Application →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Modal ─────────────────────────────────────────── */}
      {bookModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20 }}>
          <div style={{ background: '#fff', borderRadius: isMobile ? '20px 20px 0 0' : 24, padding: isMobile ? '28px 20px' : 32, width: '100%', maxWidth: isMobile ? '100%' : 500, maxHeight: isMobile ? '95vh' : '90vh', overflowY: 'auto' }}>
            {!bookingDone ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, color: '#1A2E2B', margin: 0 }}>Book Consultation</h2>
                    <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#2D5F5A', fontWeight: 600, margin: '4px 0 0' }}>{bookModal.name} · ₹{bookModal.price}</p>
                  </div>
                  <button onClick={() => setBookModal(null)} style={{ border: 'none', background: '#F7F3EE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>

                {/* Mode selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                  {[['video', '📹 Video'], ['audio', '📞 Audio'], ['chat', '💬 Chat']].map(([m, l]) => (
                    <button key={m} onClick={() => setBookForm(f => ({ ...f, mode: m }))} style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${bookForm.mode === m ? '#2D5F5A' : '#E8E0D8'}`, background: bookForm.mode === m ? 'rgba(45,95,90,0.08)' : '#fff', color: bookForm.mode === m ? '#2D5F5A' : '#6B7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>{l}</button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['name', 'Your Full Name *', 'text', 'Priya Sharma'], ['email', 'Email *', 'email', 'you@example.com'], ['phone', 'Phone *', 'tel', '+91 98765 43210'], ['date', 'Preferred Date & Time', 'datetime-local', '']].map(([key, label, type, placeholder]) => (
                    <div key={key as string}>
                      <label style={{ display: 'block', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                      <input type={type as string} value={(bookForm as Record<string, string>)[key as string]} onChange={e => setBookForm(f => ({ ...f, [key as string]: e.target.value }))} placeholder={placeholder as string} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Main Skin Concern</label>
                    <textarea value={bookForm.concern} onChange={e => setBookForm(f => ({ ...f, concern: e.target.value }))} rows={3} placeholder="Describe your main skin concern..." style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E0D8', fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical' } as React.CSSProperties} />
                  </div>
                </div>

                <div style={{ marginTop: 20, padding: '12px 14px', background: '#FFF8F0', borderRadius: 10, border: '1px solid #F5E6D3', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#92400E', margin: 0 }}>💳 Payment of <strong>₹{bookModal.price}</strong> will be collected at time of booking confirmation. Refundable if cancelled 2+ hrs before.</p>
                </div>

                <button onClick={submitBooking} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(45,95,90,0.3)' }}>
                  Confirm Booking — ₹{bookModal.price}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#1A2E2B', marginBottom: 8 }}>Booking Confirmed!</h2>
                <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 8 }}>
                  Your consultation with <strong>{bookModal.name}</strong> is confirmed.<br />A confirmation will be sent to <strong>{bookForm.email}</strong>.
                </p>
                <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#2D5F5A', fontWeight: 600, marginBottom: 24 }}>📅 {bookModal.nextSlot}</p>
                <button onClick={() => setBookModal(null)} style={{ padding: '12px 32px', background: 'linear-gradient(135deg,#2D5F5A,#3D7A74)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <MobileToolbar activePage="marketplace" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
