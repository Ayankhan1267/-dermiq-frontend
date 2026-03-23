'use client'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'

const STATS = [
  { number: '50K+', label: 'Happy Customers' },
  { number: '100+', label: 'Curated Brands' },
  { number: '500+', label: 'Products Listed' },
  { number: '4.8★', label: 'Average Rating' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🤖',
    title: 'AI Skin Analysis',
    desc: 'Take our 2-minute quiz. Our AI analyses your skin type, concerns, and goals to create a personalised profile.',
    color: '#E8F5E9',
    accent: '#2D5F5A',
  },
  {
    step: '02',
    icon: '🎯',
    title: 'Personalised Picks',
    desc: 'Get a curated routine of 3–5 products matched exactly to your skin — no guesswork, no overwhelm.',
    color: '#FFF8E1',
    accent: '#D4A853',
  },
  {
    step: '03',
    icon: '👩‍⚕️',
    title: 'Expert Guidance',
    desc: 'Book a video consultation with a certified dermatologist or skin expert from ₹499. Real experts, real results.',
    color: '#FCE4EC',
    accent: '#C2185B',
  },
]

const PROMISES = [
  { icon: '🌿', title: 'Clean Ingredients', desc: 'We screen every product against 1000+ harmful ingredients. If it\'s on our list, it\'s not on our platform.' },
  { icon: '🧪', title: 'Clinically Tested', desc: 'Every product listed on DermIQ has clinical backing — either through brand testing or third-party studies.' },
  { icon: '👩‍⚕️', title: 'Dermatologist Approved', desc: 'Our product curation board includes certified dermatologists who review every brand before listing.' },
  { icon: '🐰', title: 'Cruelty Free', desc: 'We exclusively list cruelty-free brands. Zero tolerance for animal testing at any stage of production.' },
  { icon: '♻️', title: 'Sustainable', desc: 'We prioritise brands with sustainable packaging, responsible sourcing, and minimal environmental footprint.' },
  { icon: '🇮🇳', title: 'Made for India', desc: 'Formulations designed for Indian skin tones, climate, and water quality — not just imported from the West.' },
]

const TEAM = [
  {
    name: 'Dr. Aisha Kapoor',
    role: 'Co-founder & Chief Dermatologist',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=300&fit=crop&q=80',
    bio: 'MBBS, MD Dermatology from AIIMS. 12 years clinical experience. Former consultant at Hinduja Hospital.',
  },
  {
    name: 'Rajan Mehta',
    role: 'Co-founder & CEO',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&q=80',
    bio: 'IIT Bombay, ex-McKinsey. Built two consumer brands before DermIQ. Passionate about democratising expert skincare.',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Product Science',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&q=80',
    bio: 'M.Sc. Cosmetic Science, Pune. Formerly at L\'Oreal R&D. Reviews every ingredient claim on the platform.',
  },
]

const PRESS = [
  { name: 'YourStory', logo: '📰' },
  { name: 'Inc42', logo: '📊' },
  { name: 'Femina', logo: '💄' },
  { name: 'Vogue India', logo: '👑' },
  { name: 'TechCrunch', logo: '⚡' },
  { name: 'Economic Times', logo: '📈' },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', minHeight: 500, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 64 }}>
        <Image
          src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1600&h=800&fit=crop&q=80"
          alt="DermIQ About"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,46,43,0.92) 0%, rgba(45,95,90,0.8) 50%, rgba(45,95,90,0.4) 100%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 700 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 18px', marginBottom: 20 }}>
            <span style={{ color: '#C8976A', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>ABOUT DERMIQ</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 54, fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Where Science Meets Skincare
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 32 }}>
            Democratising dermatology-grade skincare for every Indian — backed by science, guided by experts.
          </p>
          <Link href="/skin-quiz" style={{ background: '#C8976A', color: '#fff', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Take Free Skin Quiz →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#2D5F5A', padding: '40px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map(stat => (
            <div key={stat.number} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: '#C8976A', marginBottom: 4 }}>{stat.number}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C8976A', letterSpacing: 1.5, textTransform: 'uppercase' }}>Our Mission</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, color: '#1A2E2B', lineHeight: 1.25, margin: '12px 0 20px' }}>
              Skincare shouldn't require a medical degree
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 16 }}>
              We started DermIQ because we were tired of the confusion — thousands of products, conflicting advice, and one-size-fits-all routines that simply don't work for Indian skin.
            </p>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 24 }}>
              Our platform uses AI to understand your unique skin profile and matches you with the exact products and experts you need. We vet every product, every brand, and every claim — so you can shop with confidence.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Ingredient Transparency', 'Science-Backed', 'India-First'].map(tag => (
                <span key={tag} style={{ background: '#E8F5E9', color: '#2D5F5A', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 400, borderRadius: 24, overflow: 'hidden' }}>
            <Image
              src="https://images.unsplash.com/photo-1617897903246-719242758050?w=700&h=700&fit=crop&q=80"
              alt="DermIQ Mission"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C8976A', letterSpacing: 1.5, textTransform: 'uppercase' }}>The DermIQ Way</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, color: '#1A2E2B', marginTop: 12 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} style={{ background: step.color, borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 48, opacity: 0.15, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: step.accent }}>
                  {step.step}
                </div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{step.desc}</p>
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 4, color: step.accent, fontSize: 13, fontWeight: 700 }}>
                  Step {step.step}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#C8976A', letterSpacing: 1.5, textTransform: 'uppercase' }}>Meet The Team</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, color: '#1A2E2B', marginTop: 12 }}>The People Behind DermIQ</h2>
          <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 540, margin: '12px auto 0' }}>
            A blend of dermatology, tech, and brand-building expertise — all united by one mission.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {TEAM.map(member => (
            <div key={member.name} style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 28, textAlign: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', position: 'relative', border: '3px solid #E8E0D8' }}>
                <Image src={member.image} alt={member.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1A2E2B', marginBottom: 4 }}>{member.name}</h3>
              <p style={{ fontSize: 13, color: '#2D5F5A', fontWeight: 700, marginBottom: 12 }}>{member.role}</p>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Promise */}
      <div style={{ background: '#F7F3EE', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C8976A', letterSpacing: 1.5, textTransform: 'uppercase' }}>Our Promise</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, color: '#1A2E2B', marginTop: 12 }}>The DermIQ Standard</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PROMISES.map(promise => (
              <div key={promise.title} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{promise.icon}</div>
                <div>
                  <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A2E2B', marginBottom: 6 }}>{promise.title}</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{promise.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 28 }}>Featured In</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {PRESS.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '1px solid #E8E0D8', background: '#fff' }}>
              <span style={{ fontSize: 20 }}>{p.logo}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #2D5F5A, #1A2E2B)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, color: '#fff', marginBottom: 16, lineHeight: 1.25 }}>
            Ready to Transform Your Skin?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 32 }}>
            Join 50,000+ Indians who've discovered their perfect skincare routine with DermIQ.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/skin-quiz" style={{ background: '#C8976A', color: '#fff', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
              Take Free Skin Quiz →
            </Link>
            <Link href="/shop" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              Shop Products
            </Link>
          </div>
        </div>
      </div>

      <MobileToolbar />
    </div>
  )
}
