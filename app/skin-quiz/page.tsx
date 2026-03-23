'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, type Product } from '@/lib/products'

interface QuizAnswers {
  skinType: string
  concerns: string[]
  routine: string
  ageGroup: string
  skinTone: string
  allergies: string[]
  budget: string
  goal: string
}

const QUESTIONS = [
  {
    id: 1,
    question: "What's your skin type?",
    subtitle: 'How does your skin feel by midday without any products?',
    type: 'single',
    key: 'skinType',
    options: [
      { value: 'Oily', emoji: '💧', label: 'Oily', desc: 'Shiny T-zone and cheeks by noon' },
      { value: 'Dry', emoji: '🏜️', label: 'Dry', desc: 'Tight, flaky patches throughout the day' },
      { value: 'Combination', emoji: '⚖️', label: 'Combination', desc: 'Oily T-zone, dry or normal cheeks' },
      { value: 'Normal', emoji: '✨', label: 'Normal', desc: 'Balanced — not too oily or dry' },
      { value: 'Sensitive', emoji: '🌸', label: 'Sensitive', desc: 'Reacts easily — redness or irritation' },
    ],
  },
  {
    id: 2,
    question: 'What are your main skin concerns?',
    subtitle: 'Select all that apply to you',
    type: 'multi',
    key: 'concerns',
    options: [
      { value: 'Acne', emoji: '😣', label: 'Acne & Pimples', desc: 'Active breakouts or clogged pores' },
      { value: 'Dark Spots', emoji: '🌑', label: 'Dark Spots', desc: 'Post-acne marks, sun spots, melasma' },
      { value: 'Aging', emoji: '🕰️', label: 'Anti-Aging', desc: 'Fine lines, wrinkles, sagging' },
      { value: 'Dryness', emoji: '🏜️', label: 'Dryness', desc: 'Dehydration, tight, flaky skin' },
      { value: 'Dullness', emoji: '🌥️', label: 'Dullness', desc: 'Tired, no glow, uneven tone' },
      { value: 'Pores', emoji: '🔬', label: 'Large Pores', desc: 'Visible, enlarged pores' },
      { value: 'Redness', emoji: '🌹', label: 'Redness', desc: 'Sensitive, reactive, rosacea-prone' },
    ],
  },
  {
    id: 3,
    question: "What's your current skincare routine?",
    subtitle: 'Be honest — we\'ll build on what you already do',
    type: 'single',
    key: 'routine',
    options: [
      { value: 'Minimal', emoji: '🫧', label: 'Minimal', desc: 'Just wash my face' },
      { value: 'Basic', emoji: '💧', label: 'Basic', desc: 'Cleanser + moisturiser + SPF' },
      { value: 'Advanced', emoji: '🧪', label: 'Advanced', desc: 'Full routine with serums and treatments' },
    ],
  },
  {
    id: 4,
    question: 'What age group are you in?',
    subtitle: 'Skin needs change dramatically with age',
    type: 'single',
    key: 'ageGroup',
    options: [
      { value: 'Under 25', emoji: '🌱', label: 'Under 25', desc: 'Focus on prevention and acne' },
      { value: '25-35', emoji: '🌿', label: '25–35', desc: 'Balance and brightening' },
      { value: '35-45', emoji: '🌳', label: '35–45', desc: 'Anti-aging and firmness' },
      { value: '45+', emoji: '🌻', label: '45+', desc: 'Intensive repair and rejuvenation' },
    ],
  },
  {
    id: 5,
    question: "What's your skin tone?",
    subtitle: 'Helps us recommend right shades and treatments',
    type: 'single',
    key: 'skinTone',
    options: [
      { value: 'Fair', emoji: '🤍', label: 'Fair', desc: 'Light, cool or warm undertones' },
      { value: 'Medium', emoji: '🧡', label: 'Medium', desc: 'Medium — burns sometimes' },
      { value: 'Wheatish', emoji: '🌾', label: 'Wheatish', desc: 'Golden-brown, rarely burns' },
      { value: 'Deep', emoji: '🍫', label: 'Deep', desc: 'Deep brown, almost never burns' },
    ],
  },
  {
    id: 6,
    question: 'Any skin allergies or sensitivities?',
    subtitle: 'We\'ll make sure to avoid these ingredients',
    type: 'multi',
    key: 'allergies',
    options: [
      { value: 'Fragrance', emoji: '🌹', label: 'Fragrance / Perfume', desc: '' },
      { value: 'Retinol', emoji: '🌙', label: 'Retinol', desc: 'Causes irritation or peeling' },
      { value: 'AHA/BHA', emoji: '⚗️', label: 'AHA / BHA Acids', desc: 'Chemical exfoliants' },
      { value: 'Essential Oils', emoji: '🫙', label: 'Essential Oils', desc: 'Lavender, tea tree, etc.' },
      { value: 'None', emoji: '✅', label: 'None', desc: 'No known allergies' },
    ],
  },
  {
    id: 7,
    question: "What's your skincare budget per month?",
    subtitle: 'Great skincare exists at every price point',
    type: 'single',
    key: 'budget',
    options: [
      { value: 'Under ₹500', emoji: '💰', label: 'Under ₹500', desc: 'Budget-friendly essentials' },
      { value: '₹500-1500', emoji: '💳', label: '₹500 – ₹1500', desc: 'Mid-range with actives' },
      { value: '₹1500+', emoji: '💎', label: '₹1500+', desc: 'Premium formulations' },
    ],
  },
  {
    id: 8,
    question: 'What\'s your primary skin goal?',
    subtitle: 'We\'ll build your routine around this',
    type: 'single',
    key: 'goal',
    options: [
      { value: 'Glow', emoji: '✨', label: 'Glass Skin Glow', desc: 'Luminous, dewy, lit-from-within' },
      { value: 'Clear Skin', emoji: '🌿', label: 'Clear Skin', desc: 'Acne-free, smooth, even' },
      { value: 'Anti-aging', emoji: '🕰️', label: 'Anti-Aging', desc: 'Firm, youthful, wrinkle-free' },
      { value: 'Hydration', emoji: '💧', label: 'Deep Hydration', desc: 'Plump, soft, never dry' },
    ],
  },
]

function getRecommendations(answers: QuizAnswers): Product[] {
  const { skinType, concerns, goal, budget } = answers
  let filtered = [...ALL_PRODUCTS]

  // Filter by budget
  if (budget === 'Under ₹500') filtered = filtered.filter(p => p.price < 500)
  else if (budget === '₹500-1500') filtered = filtered.filter(p => p.price <= 1500)

  // Score products
  const scored = filtered.map(p => {
    let score = 0
    if (p.skinTypes.includes(skinType) || p.skinTypes.includes('All skin types') || p.skinTypes.includes('All')) score += 3
    concerns.forEach(c => { if (p.concerns.includes(c)) score += 2 })
    if (goal === 'Glow' && p.tags.some(t => ['brightening', 'vitamin-c', 'glow'].includes(t))) score += 2
    if (goal === 'Clear Skin' && p.tags.some(t => ['acne', 'niacinamide', 'salicylic-acid'].includes(t))) score += 2
    if (goal === 'Anti-aging' && p.tags.some(t => ['retinol', 'anti-aging', 'peptides'].includes(t))) score += 2
    if (goal === 'Hydration' && p.tags.some(t => ['hydration', 'hyaluronic-acid', 'ceramide'].includes(t))) score += 2
    score += p.rating / 2
    return { product: p, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 4).map(s => s.product)
}

export default function SkinQuizPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [completed, setCompleted] = useState(false)
  const [recommendations, setRecommendations] = useState<Product[]>([])

  function handleSingle(key: string, value: string) {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1)
      } else {
        finishQuiz(updated)
      }
    }, 300)
  }

  function handleMulti(key: string, value: string) {
    const current = (answers[key as keyof QuizAnswers] as string[]) || []
    if (value === 'None') {
      setAnswers({ ...answers, [key]: current.includes('None') ? [] : ['None'] })
      return
    }
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current.filter(v => v !== 'None'), value]
    setAnswers({ ...answers, [key]: updated })
  }

  function finishQuiz(finalAnswers: Partial<QuizAnswers>) {
    const complete = finalAnswers as QuizAnswers
    const recs = getRecommendations(complete)
    setRecommendations(recs)
    localStorage.setItem('ksProfile', JSON.stringify(complete))
    setCompleted(true)
    toast.success('Skin profile saved!')
  }

  function nextQuestion() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      finishQuiz(answers)
    }
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
  }

  const progress = completed ? 100 : ((currentQ) / QUESTIONS.length) * 100
  const question = QUESTIONS[currentQ]
  const currentAnswer = answers[question?.key as keyof QuizAnswers]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F7F3EE 0%, #E8F5E9 100%)', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 20px 80px' }}>
        {!completed ? (
          <>
            {/* Progress */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Question {currentQ + 1} of {QUESTIONS.length}</p>
                <p style={{ fontSize: 13, color: '#2D5F5A', fontWeight: 700 }}>{Math.round(progress)}% Complete</p>
              </div>
              <div style={{ height: 6, background: '#E8E0D8', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #2D5F5A, #C8976A)', borderRadius: 3, width: `${progress}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {QUESTIONS.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < currentQ ? '#2D5F5A' : i === currentQ ? '#C8976A' : '#E8E0D8', transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E8E0D8', padding: '36px 32px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 6, lineHeight: 1.3 }}>
                {question.question}
              </h2>
              <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 28 }}>{question.subtitle}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {question.options.map(option => {
                  const isSelected = question.type === 'single'
                    ? currentAnswer === option.value
                    : Array.isArray(currentAnswer) && currentAnswer.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      onClick={() => question.type === 'single' ? handleSingle(question.key, option.value) : handleMulti(question.key, option.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14,
                        border: `2px solid ${isSelected ? '#2D5F5A' : '#E8E0D8'}`,
                        background: isSelected ? '#F0FAF0' : '#fff', cursor: 'pointer',
                        transition: 'all 0.15s', textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
                        boxShadow: isSelected ? '0 0 0 1px #2D5F5A' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{option.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#2D5F5A' : '#1A2E2B', marginBottom: option.desc ? 2 : 0 }}>{option.label}</p>
                        {option.desc && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{option.desc}</p>}
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: question.type === 'multi' ? 6 : '50%', border: `2px solid ${isSelected ? '#2D5F5A' : '#E8E0D8'}`, background: isSelected ? '#2D5F5A' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Multi-select next button */}
              {question.type === 'multi' && (
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {Array.isArray(currentAnswer) ? currentAnswer.length : 0} selected
                  </p>
                  <button
                    onClick={nextQuestion}
                    disabled={!Array.isArray(currentAnswer) || currentAnswer.length === 0}
                    style={{ background: Array.isArray(currentAnswer) && currentAnswer.length > 0 ? '#2D5F5A' : '#E8E0D8', color: Array.isArray(currentAnswer) && currentAnswer.length > 0 ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: Array.isArray(currentAnswer) && currentAnswer.length > 0 ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>

            {/* Back button */}
            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ(currentQ - 1)}
                style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ← Back
              </button>
            )}
          </>
        ) : (
          /* Results */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: '#1A2E2B', marginBottom: 8 }}>
                Your Personalised Routine
              </h1>
              <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Based on your {answers.skinType} skin, {answers.goal} goal, and {answers.budget} budget
              </p>
            </div>

            {/* Profile summary */}
            <div style={{ background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', borderRadius: 20, padding: 24, marginBottom: 32, color: '#fff' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 16 }}>Your Skin Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Skin Type', value: answers.skinType },
                  { label: 'Age Group', value: answers.ageGroup },
                  { label: 'Tone', value: answers.skinTone },
                  { label: 'Goal', value: answers.goal },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 8px' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {answers.concerns && answers.concerns.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Concerns addressed</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {answers.concerns.map(c => (
                      <span key={c} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommended products */}
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginBottom: 8 }}>
              Your Recommended Products
            </h2>
            <p style={{ color: '#6B7280', marginBottom: 20, fontSize: 14 }}>
              Curated specifically for your skin by our AI — start with these 4 essentials
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
              {recommendations.map((product, i) => {
                const steps = ['Step 1: Cleanse', 'Step 2: Treat', 'Step 3: Moisturise', 'Step 4: Protect']
                return (
                  <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E0D8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: 180, position: 'relative', background: '#F7F3EE', cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
                      <Image src={product.image} alt={product.name} fill sizes="300px" style={{ objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#2D5F5A', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                        {steps[i]}
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>{product.brand}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#2D5F5A' }}>₹{product.price}</span>
                        <button onClick={() => addToCart(product)} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <button
                onClick={() => {
                  recommendations.forEach(p => addToCart(p))
                  toast.success('Full routine added to cart!')
                  router.push('/cart')
                }}
                style={{ background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Add Full Routine to Cart →
              </button>
              <Link href="/specialists" style={{ background: '#F7F3EE', color: '#2D5F5A', border: '1px solid #E8E0D8', borderRadius: 14, padding: '16px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Book Expert Consultation
              </Link>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
              Your profile has been saved. <button onClick={() => { setCompleted(false); setCurrentQ(0); setAnswers({}) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D5F5A', fontWeight: 600, fontSize: 13 }}>Retake Quiz</button>
            </p>
          </div>
        )}
      </div>

      <MobileToolbar />
    </div>
  )
}
