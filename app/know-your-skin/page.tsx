'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  teal: '#2D5F5A',
  teal2: '#3D7A74',
  dark: '#1A2E2B',
  mu: '#6B7280',
  border: '#E8E0D8',
  cream: '#F7F3EE',
  bg: '#FAFAF8',
  accent: '#C8976A',
  green: '#10B981',
  red: '#EF4444',
  gold: '#D4A853',
  purple: '#8B5CF6',
  chatBg: '#0F1F1E',
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface UserInfo {
  name: string
  age: string
  gender: string
  location: string
}

interface QuizAnswers {
  skinFeel: string
  concerns: string[]
  spf: string
  sleep: string
  water: string
  sensitivities: string[]
  routine: string
}

interface Report {
  hydrationScore: number
  oilinessScore: number
  sensitivityScore: number
  overallScore: number
  skinType: string
  concerns: string[]
  userInfo: UserInfo
  quizAnswers: QuizAnswers
  generatedAt: string
}

// ─── PRODUCT CATALOG (concern → products) ────────────────────────────────────
const PRODUCT_MAP: Record<string, { am: { step: number; type: string; name: string; brand: string; price: string }[]; pm: { step: number; type: string; name: string; brand: string; price: string }[] }> = {
  default: {
    am: [
      { step: 1, type: 'Gentle Cleanser', name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', price: '₹699' },
      { step: 2, type: 'Vitamin C Serum', name: '10% Vitamin C Face Serum', brand: 'Minimalist', price: '₹599' },
      { step: 3, type: 'Moisturiser SPF 50', name: 'Ultra Light Daily UV Defense SPF 50', brand: 'La Roche-Posay', price: '₹1,299' },
    ],
    pm: [
      { step: 1, type: 'Cleanser', name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', price: '₹699' },
      { step: 2, type: 'Repair Serum', name: 'Peptide Repair Night Serum', brand: 'The Ordinary', price: '₹799' },
      { step: 3, type: 'Night Cream', name: 'Moisture Surge Overnight Mask', brand: 'Clinique', price: '₹1,899' },
    ],
  },
  acne: {
    am: [
      { step: 1, type: 'Salicylic Cleanser', name: '2% Salicylic Acid Face Wash', brand: 'Minimalist', price: '₹349' },
      { step: 2, type: 'Niacinamide Serum', name: '10% Niacinamide + Zinc Serum', brand: 'Minimalist', price: '₹599' },
      { step: 3, type: 'Oil-free SPF', name: 'Anthelios Invisible Fluid SPF 50+', brand: 'La Roche-Posay', price: '₹1,499' },
    ],
    pm: [
      { step: 1, type: 'Clarifying Cleanser', name: 'Effaclar Purifying Foaming Gel', brand: "L'Oréal", price: '₹599' },
      { step: 2, type: 'BHA Treatment', name: '0.5% Retinol Serum', brand: 'The Ordinary', price: '₹749' },
      { step: 3, type: 'Lightweight Night Cream', name: 'Effaclar Mat Night Cream', brand: "L'Oréal", price: '₹799' },
    ],
  },
  pigmentation: {
    am: [
      { step: 1, type: 'Gentle Cleanser', name: 'Simple Refreshing Facial Wash', brand: 'Simple', price: '₹399' },
      { step: 2, type: 'Alpha Arbutin Serum', name: '2% Alpha Arbutin + HA Serum', brand: 'Minimalist', price: '₹599' },
      { step: 3, type: 'SPF 50+ PA++++', name: 'Sun Protect Dry Touch SPF 50+', brand: 'Kaya', price: '₹999' },
    ],
    pm: [
      { step: 1, type: 'Cleanser', name: 'Lotus Herbals WhiteGlow Cleanser', brand: 'Lotus', price: '₹299' },
      { step: 2, type: 'Tranexamic Acid Serum', name: '3% Tranexamic Acid Serum', brand: 'Minimalist', price: '₹699' },
      { step: 3, type: 'Brightening Night Cream', name: 'Olay Regenerist Night Cream', brand: 'Olay', price: '₹1,199' },
    ],
  },
}

// ─── REPORT GENERATOR ────────────────────────────────────────────────────────
function generateReport(answers: QuizAnswers, userInfo: UserInfo): Report {
  const hydrationScore =
    answers.skinFeel === 'tight' ? 28
    : answers.skinFeel === 'oily' ? 52
    : answers.skinFeel === 'moisturized' ? 82
    : 68

  const oilinessScore =
    answers.skinFeel === 'oily' ? 82
    : answers.skinFeel === 'comfortable' ? 45
    : answers.skinFeel === 'tight' ? 20
    : 35

  const sensitivityScore = answers.sensitivities.includes('None') ? 15 : answers.sensitivities.length * 20

  const spfBonus = answers.spf === 'Daily' ? 10 : answers.spf === 'Sometimes' ? 5 : 0
  const sleepBonus = answers.sleep === '8+' ? 10 : answers.sleep === '6-7' ? 5 : 0
  const waterBonus = answers.water === '2L+' ? 10 : answers.water === '1-2L' ? 5 : 0

  const overallScore = Math.min(
    100,
    Math.round((hydrationScore + (100 - oilinessScore) + (100 - sensitivityScore)) / 3 + spfBonus + sleepBonus + waterBonus)
  )

  const skinType =
    oilinessScore > 70 ? 'Oily'
    : oilinessScore > 50 && hydrationScore < 60 ? 'Combination-Oily'
    : hydrationScore < 40 ? 'Dry'
    : oilinessScore < 30 && hydrationScore > 75 ? 'Normal'
    : 'Combination'

  return {
    hydrationScore,
    oilinessScore,
    sensitivityScore: Math.min(100, sensitivityScore),
    overallScore,
    skinType,
    concerns: answers.concerns,
    userInfo,
    quizAnswers: answers,
    generatedAt: new Date().toISOString(),
  }
}

// ─── KEYFRAMES injection ──────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeInLeft { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
@keyframes fadeInRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.08); opacity:0.8; } }
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes dot1 { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
@keyframes dot2 { 0%,100% { transform:scale(0.6); opacity:0.4; } 20%,60% { transform:scale(1); opacity:1; } }
@keyframes dot3 { 0%,40%,100% { transform:scale(0.6); opacity:0.4; } 60% { transform:scale(1); opacity:1; } }
@keyframes glow { 0%,100% { box-shadow:0 0 12px #10B98155; } 50% { box-shadow:0 0 28px #10B981aa; } }
@keyframes flash { 0% { opacity:1; } 100% { opacity:0; } }
@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes slideOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-40px); } }
@keyframes countDown { from { stroke-dashoffset:0; } to { stroke-dashoffset:251; } }
@keyframes particleFloat { 0% { transform:translateY(0) translateX(0); opacity:0.3; } 50% { opacity:0.7; } 100% { transform:translateY(-80px) translateX(20px); opacity:0; } }
@keyframes progressRing { from { stroke-dashoffset:251; } to { stroke-dashoffset:0; } }
@keyframes checkmark { from { stroke-dashoffset:100; } to { stroke-dashoffset:0; } }
@keyframes arrowPulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.2); } }
`

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', background:'#2D5F5A33', borderRadius:16, width:'fit-content', marginBottom:8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:8, height:8, borderRadius:'50%', background:C.teal2,
          animation:`${i===0?'dot1':i===1?'dot2':'dot3'} 1.2s infinite`
        }} />
      ))}
    </div>
  )
}

// ─── PROGRESS DOTS ────────────────────────────────────────────────────────────
function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:100 }}>
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} style={{
          width: i === step ? 20 : 8,
          height:8, borderRadius:4,
          background: i === step ? C.teal : i < step ? C.teal2 : 'rgba(255,255,255,0.25)',
          transition:'all 0.3s ease'
        }} />
      ))}
    </div>
  )
}

// ─── EXIT BUTTON ──────────────────────────────────────────────────────────────
function ExitButton() {
  const router = useRouter()
  return (
    <button onClick={() => router.push('/')} style={{ position:'fixed', top:20, right:20, zIndex:200, width:36, height:36, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.3)', background:'rgba(0,0,0,0.3)', color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>✕</button>
  )
}

// ─── STEP 0 — HERO ────────────────────────────────────────────────────────────
function Step0({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg, ${C.dark} 0%, ${C.teal} 50%, #1A3D38 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(61,122,116,0.2)', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(200,151,106,0.15)', filter:'blur(50px)' }} />

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:480, width:'100%', animation:'fadeIn 0.8s ease' }}>
        {/* Logo */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-playfair)', fontSize:42, fontWeight:700, color:'white', letterSpacing:'-0.5px' }}>
            Derm<span style={{ color:C.gold, fontStyle:'italic' }}>IQ</span>
          </div>
          <div style={{ width:60, height:2, background:`linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin:'8px auto 0' }} />
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(36px,8vw,52px)', fontWeight:700, color:'white', margin:'0 0 16px', lineHeight:1.15 }}>
          Know Your<br /><span style={{ color:C.gold, fontStyle:'italic' }}>Skin</span>
        </h1>
        <p style={{ fontSize:17, color:'rgba(255,255,255,0.75)', margin:'0 0 36px', lineHeight:1.6 }}>
          AI-powered 32-point skin analysis.<br /><strong style={{ color:'white' }}>Free.</strong> Takes 3 minutes.
        </p>

        {/* Trust badges */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:40 }}>
          {['🤖 AI Analysis', '👨‍⚕️ Free Consultation', '🔬 32 Data Points'].map(b => (
            <div key={b} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:100, padding:'7px 14px', fontSize:13, color:'white', backdropFilter:'blur(8px)' }}>{b}</div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onNext} style={{ width:'100%', maxWidth:360, padding:'18px 32px', borderRadius:14, border:'none', background:`linear-gradient(135deg, ${C.accent}, #B8835A)`, color:'white', fontSize:18, fontWeight:700, cursor:'pointer', letterSpacing:0.3, boxShadow:'0 8px 32px rgba(200,151,106,0.4)', transition:'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform='translateY(-2px)'; (e.target as HTMLButtonElement).style.boxShadow='0 12px 40px rgba(200,151,106,0.5)' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform='translateY(0)'; (e.target as HTMLButtonElement).style.boxShadow='0 8px 32px rgba(200,151,106,0.4)' }}>
          Start Your Analysis →
        </button>

        <p style={{ marginTop:20, fontSize:13, color:'rgba(255,255,255,0.5)' }}>
          10,000+ people analyzed this week
        </p>
      </div>
    </div>
  )
}

// ─── STEP 1 — AI CHAT ─────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (info: UserInfo) => void }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([])
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(0) // 0=intro, 1=name, 2=age, 3=gender, 4=location, 5=ready
  const [nameInput, setNameInput] = useState('')
  const [info, setInfo] = useState<UserInfo>({ name: '', age: '', gender: '', location: '' })
  const scrollRef = useRef<HTMLDivElement>(null)

  const addAI = useCallback((text: string, delay = 0) => {
    setTimeout(() => {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMessages(m => [...m, { role: 'ai', text }])
        setPhase(p => p + 1)
      }, 900)
    }, delay)
  }, [])

  const addUser = (text: string) => setMessages(m => [...m, { role: 'user', text }])

  useEffect(() => { addAI('Namaste! 🙏 I\'m DermIQ AI. I\'ll analyze your skin in just 3 minutes.', 400) }, [])
  useEffect(() => { if (phase === 1) addAI('First, what\'s your name?', 300) }, [phase, addAI])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  const submitName = () => {
    if (!nameInput.trim()) return
    addUser(nameInput)
    setInfo(i => ({ ...i, name: nameInput }))
    setTimeout(() => addAI(`Nice to meet you, ${nameInput}! 😊 How old are you?`, 300), 200)
  }

  const selectAge = (age: string) => {
    addUser(age)
    setInfo(i => ({ ...i, age }))
    setTimeout(() => addAI('And your gender? (This helps with hormonal skin factors)', 300), 200)
  }

  const selectGender = (gender: string) => {
    addUser(gender)
    setInfo(i => ({ ...i, gender }))
    setTimeout(() => addAI('Perfect! One last thing — where are you located? This helps us factor in UV index and climate.', 300), 200)
  }

  const selectLocation = (location: string) => {
    addUser(location)
    const updatedInfo = { ...info, location }
    setInfo(updatedInfo)
    setTimeout(() => {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMessages(m => [...m, { role: 'ai', text: `Great, ${info.name}! 🎯 Now I'll ask you 6 quick questions about your skin, then we'll do a quick camera scan. Ready?` }])
        setPhase(5)
      }, 900)
    }, 300)
  }

  const bubbleStyle = (role: 'ai' | 'user') => ({
    padding:'10px 14px',
    borderRadius: role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
    background: role === 'ai' ? 'rgba(45,95,90,0.4)' : `linear-gradient(135deg, ${C.teal}, ${C.teal2})`,
    border: role === 'ai' ? '1px solid rgba(45,95,90,0.5)' : 'none',
    color:'white', fontSize:14, lineHeight:1.5, maxWidth:'75%',
    animation: role === 'ai' ? 'fadeInLeft 0.4s ease' : 'fadeInRight 0.4s ease',
  })

  const chipBtn = (label: string, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding:'10px 18px', borderRadius:100, border:`1.5px solid ${C.teal2}`, background:'transparent', color:C.teal2, fontSize:14, cursor:'pointer', transition:'all 0.2s', fontWeight:500 }}
      onMouseEnter={e => { const b = e.target as HTMLButtonElement; b.style.background=C.teal2; b.style.color='white' }}
      onMouseLeave={e => { const b = e.target as HTMLButtonElement; b.style.background='transparent'; b.style.color=C.teal2 }}>
      {label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.chatBg, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'20px 20px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>AI</div>
        <div>
          <div style={{ color:'white', fontWeight:600, fontSize:15 }}>DermIQ AI</div>
          <div style={{ color:C.green, fontSize:12, display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block' }} />Online</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-start', gap:8, marginBottom:8 }}>
            {m.role === 'ai' && <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0, marginTop:2 }}>AI</div>}
            <div style={bubbleStyle(m.role)}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0 }}>AI</div>
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Input Area */}
      {!typing && (
        <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {phase === 2 && (
            <div style={{ display:'flex', gap:8, animation:'fadeIn 0.3s ease' }}>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key==='Enter' && submitName()} placeholder="Type your name..." style={{ flex:1, padding:'12px 16px', borderRadius:12, border:`1px solid rgba(45,95,90,0.4)`, background:'rgba(255,255,255,0.06)', color:'white', fontSize:15, outline:'none' }} />
              <button onClick={submitName} style={{ padding:'12px 20px', borderRadius:12, border:'none', background:C.teal, color:'white', fontSize:15, cursor:'pointer', fontWeight:600 }}>→</button>
            </div>
          )}
          {phase === 3 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, animation:'fadeIn 0.3s ease' }}>
              {['Under 18', '18–24', '25–34', '35–44', '45+'].map(a => chipBtn(a, () => selectAge(a)))}
            </div>
          )}
          {phase === 4 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, animation:'fadeIn 0.3s ease' }}>
              {['Male', 'Female', 'Prefer not to say'].map(g => chipBtn(g, () => selectGender(g)))}
            </div>
          )}
          {phase === 5 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, animation:'fadeIn 0.3s ease' }}>
              {['Metro (Delhi/Mumbai/Bangalore)', 'Coastal (Chennai/Kolkata)', 'Dry region', 'Hilly region'].map(l =>
                chipBtn(l, () => selectLocation(l))
              )}
            </div>
          )}
          {phase === 6 && (
            <button onClick={() => onNext(info)} style={{ width:'100%', padding:'16px', borderRadius:14, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:16, fontWeight:700, cursor:'pointer', animation:'fadeIn 0.3s ease' }}>
              Yes, Let's Go! 🚀
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── STEP 2 — QUIZ ────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'skinFeel',
    q: 'How does your skin feel 2 hours after washing?',
    type: 'single',
    options: [{ v:'tight', label:'Tight & dry', emoji:'🫧' }, { v:'comfortable', label:'Comfortable', emoji:'✨' }, { v:'moisturized', label:'Still moisturized', emoji:'💧' }, { v:'oily', label:'Oily/shiny', emoji:'🌊' }],
  },
  {
    id: 'concerns',
    q: "What's your biggest skin concern right now?",
    type: 'multi2',
    options: [{ v:'acne', label:'Acne & Breakouts', emoji:'😤' }, { v:'pigmentation', label:'Dark spots & Pigmentation', emoji:'🌑' }, { v:'dryness', label:'Dryness & Dehydration', emoji:'💧' }, { v:'aging', label:'Aging & Fine Lines', emoji:'⏰' }, { v:'dull', label:'Dull & Uneven Tone', emoji:'😶' }, { v:'redness', label:'Redness & Sensitivity', emoji:'🔴' }],
  },
  {
    id: 'spf',
    q: 'How often do you use SPF?',
    type: 'single',
    options: [{ v:'Daily', label:'Daily', emoji:'☀️' }, { v:'Sometimes', label:'Sometimes', emoji:'🌤️' }, { v:'Rarely', label:'Rarely', emoji:'☁️' }, { v:'Never', label:'Never', emoji:'🚫' }],
  },
  { id: 'sleepWater', q: "How's your sleep and water intake?", type: 'sliders' },
  {
    id: 'sensitivities',
    q: 'Do you have any known sensitivities?',
    type: 'multi',
    options: [{ v:'Fragrance', label:'Fragrance', emoji:'🌸' }, { v:'Retinol/Acids', label:'Retinol/Acids', emoji:'⚗️' }, { v:'Nickel/Metal', label:'Nickel/Metal', emoji:'🔩' }, { v:'None', label:'None', emoji:'✅' }, { v:'Not sure', label:'Not sure', emoji:'🤷' }],
  },
  {
    id: 'routine',
    q: "What's your current skincare routine?",
    type: 'single',
    options: [{ v:'minimal', label:'Minimal (just water/soap)', emoji:'😴' }, { v:'basic', label:'Basic (cleanser + moisturiser)', emoji:'🌿' }, { v:'standard', label:'Standard (cleanser + toner + serum + moisturiser)', emoji:'🧴' }, { v:'advanced', label:'Advanced (full routine + treatments)', emoji:'💊' }],
  },
]

function Step2({ onNext }: { onNext: (answers: QuizAnswers) => void }) {
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({ skinFeel:'', concerns:[], spf:'', sleep:'6-7', water:'1-2L', sensitivities:[], routine:'' })
  const [selected, setSelected] = useState<string[]>([])
  const [sleep, setSleep] = useState(1)
  const [water, setWater] = useState(1)
  const [exiting, setExiting] = useState(false)

  const q = QUESTIONS[qIdx]

  const advance = (newAnswers: QuizAnswers) => {
    setExiting(true)
    setTimeout(() => {
      setExiting(false)
      setSelected([])
      if (qIdx < QUESTIONS.length - 1) {
        setQIdx(i => i + 1)
      } else {
        onNext(newAnswers)
      }
    }, 300)
  }

  const handleSingle = (v: string) => {
    const updated = { ...answers, [q.id]: v }
    setAnswers(updated)
    advance(updated)
  }

  const handleMulti = (v: string) => {
    setSelected(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  }

  const handleMulti2 = (v: string) => {
    setSelected(s => {
      if (s.includes(v)) return s.filter(x => x !== v)
      if (s.length >= 2) return s
      return [...s, v]
    })
  }

  const confirmMulti = () => {
    const field = q.id === 'concerns' ? 'concerns' : 'sensitivities'
    const updated = { ...answers, [field]: selected }
    setAnswers(updated)
    advance(updated)
  }

  const confirmSliders = () => {
    const sleepVals = ['4-5 hrs', '6-7 hrs', '8+ hrs']
    const waterVals = ['<1L', '1-2L', '2L+']
    const updated = { ...answers, sleep: sleepVals[sleep], water: waterVals[water] }
    setAnswers(updated)
    advance(updated)
  }

  const cardStyle = (active: boolean) => ({
    padding:'16px', borderRadius:14,
    border:`2px solid ${active ? C.teal : C.border}`,
    background: active ? `${C.teal}18` : 'white',
    cursor:'pointer', textAlign:'center' as const,
    transition:'all 0.2s', display:'flex', alignItems:'center', gap:12,
  })

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column' }}>
      {/* Progress */}
      <div style={{ padding:'20px 24px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, color:C.mu, fontWeight:500 }}>Question {qIdx + 1} of 6</span>
          <span style={{ fontSize:13, color:C.teal, fontWeight:600 }}>{Math.round(((qIdx + 1) / 6) * 100)}%</span>
        </div>
        <div style={{ height:4, background:C.border, borderRadius:4 }}>
          <div style={{ height:'100%', background:`linear-gradient(90deg, ${C.teal}, ${C.teal2})`, borderRadius:4, width:`${((qIdx + 1) / 6) * 100}%`, transition:'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'32px 24px 80px', animation: exiting ? 'slideOut 0.3s ease' : 'slideIn 0.4s ease' }}>
        <h2 style={{ fontSize:'clamp(18px,4vw,24px)', fontWeight:700, color:C.dark, marginBottom:28, lineHeight:1.35, fontFamily:'var(--font-playfair)' }}>{q.q}</h2>

        {(q.type === 'single') && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {q.options!.map(o => (
              <button key={o.v} onClick={() => handleSingle(o.v)} style={cardStyle(false)}>
                <span style={{ fontSize:24 }}>{o.emoji}</span>
                <span style={{ fontSize:14, fontWeight:500, color:C.dark, textAlign:'left' }}>{o.label}</span>
              </button>
            ))}
          </div>
        )}

        {(q.type === 'multi' || q.type === 'multi2') && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {q.options!.map(o => (
                <button key={o.v} onClick={() => q.type === 'multi2' ? handleMulti2(o.v) : handleMulti(o.v)} style={cardStyle(selected.includes(o.v))}>
                  <span style={{ fontSize:22 }}>{o.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:C.dark, textAlign:'left' }}>{o.label}</span>
                </button>
              ))}
            </div>
            {q.type === 'multi2' && <p style={{ fontSize:12, color:C.mu, textAlign:'center', marginBottom:12 }}>Select up to 2</p>}
            <button onClick={confirmMulti} disabled={selected.length === 0} style={{ width:'100%', padding:'15px', borderRadius:12, border:'none', background: selected.length > 0 ? `linear-gradient(135deg, ${C.teal}, ${C.teal2})` : C.border, color: selected.length > 0 ? 'white' : C.mu, fontSize:16, fontWeight:600, cursor: selected.length > 0 ? 'pointer' : 'default', transition:'all 0.2s' }}>
              Continue →
            </button>
          </>
        )}

        {q.type === 'sliders' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:15, fontWeight:600, color:C.dark }}>😴 Sleep</span>
                <span style={{ fontSize:14, color:C.teal, fontWeight:600 }}>{['4-5 hrs', '6-7 hrs', '8+ hrs'][sleep]}</span>
              </div>
              <input type="range" min={0} max={2} value={sleep} onChange={e => setSleep(Number(e.target.value))} style={{ width:'100%', accentColor:C.teal }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.mu, marginTop:4 }}>
                <span>4-5 hrs</span><span>6-7 hrs</span><span>8+ hrs</span>
              </div>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:15, fontWeight:600, color:C.dark }}>💧 Water</span>
                <span style={{ fontSize:14, color:C.teal, fontWeight:600 }}>{['<1L', '1-2L', '2L+'][water]}</span>
              </div>
              <input type="range" min={0} max={2} value={water} onChange={e => setWater(Number(e.target.value))} style={{ width:'100%', accentColor:C.teal }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.mu, marginTop:4 }}>
                <span>&lt;1L</span><span>1-2L</span><span>2L+</span>
              </div>
            </div>
            <button onClick={confirmSliders} style={{ padding:'15px', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:16, fontWeight:600, cursor:'pointer' }}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STEP 3 — CAMERA SCAN ─────────────────────────────────────────────────────
const SCAN_POSITIONS = [
  { label:'Front View', instruction:'Look straight at the camera, keep your face inside the oval', arrow:null, emoji:'📸' },
  { label:'Left Side', instruction:'Slowly turn your head to the left', arrow:'←', emoji:'↩️' },
  { label:'Right Side', instruction:'Now turn your head to the right', arrow:'→', emoji:'↪️' },
  { label:'T-Zone', instruction:'Tilt your chin down slightly to capture your forehead & nose', arrow:'↓', emoji:'🔍' },
  { label:'Neck Area', instruction:'Now show your neck area by tilting your chin up', arrow:'↑', emoji:'📷' },
]

function Step3({ onNext }: { onNext: (photos: string[], skipped: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [scanIdx, setScanIdx] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [camDenied, setCamDenied] = useState(false)
  const [camReady, setCamReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:640, height:480 } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCamReady(true)
    } catch { setCamDenied(true) }
  }

  function captureFrame(): string | null {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return null
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  function startCapture() {
    if (capturing) return
    setCapturing(true)
    setCountdown(3)
    let c = 3
    const t = setInterval(() => {
      c--
      if (c > 0) { setCountdown(c) }
      else {
        clearInterval(t)
        setCountdown(null)
        const frame = captureFrame()
        setFlash(true)
        setTimeout(() => setFlash(false), 300)
        const newPhotos = frame ? [...photos, frame] : photos
        setPhotos(newPhotos)
        setCapturing(false)
        if (scanIdx < SCAN_POSITIONS.length - 1) {
          setTimeout(() => setScanIdx(i => i + 1), 600)
        } else {
          streamRef.current?.getTracks().forEach(t => t.stop())
          setTimeout(() => onNext(newPhotos, false), 800)
        }
      }
    }, 1000)
  }

  if (camDenied) {
    return (
      <div style={{ minHeight:'100vh', background:C.dark, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:20 }}>📵</div>
        <h2 style={{ color:'white', fontFamily:'var(--font-playfair)', fontSize:28, marginBottom:12 }}>Camera Access Needed</h2>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:16, lineHeight:1.6, marginBottom:32, maxWidth:320 }}>No worries! We'll analyze your skin based on your detailed quiz answers. Our AI still gives you a 32-point analysis.</p>
        <button onClick={() => onNext([], true)} style={{ padding:'16px 32px', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:16, fontWeight:600, cursor:'pointer' }}>
          Continue with Quiz Analysis →
        </button>
      </div>
    )
  }

  const pos = SCAN_POSITIONS[scanIdx]

  return (
    <div style={{ minHeight:'100vh', background:'#050D0C', display:'flex', flexDirection:'column' }}>
      {/* Flash overlay */}
      {flash && <div style={{ position:'fixed', inset:0, background:'white', zIndex:500, animation:'flash 0.3s ease forwards', pointerEvents:'none' }} />}

      {/* Header */}
      <div style={{ padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:2 }}>SCAN PROGRESS</div>
          <div style={{ color:'white', fontWeight:700, fontSize:16 }}>Scan {scanIdx + 1} of {SCAN_POSITIONS.length}</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {SCAN_POSITIONS.map((_, i) => (
            <div key={i} style={{ width:28, height:4, borderRadius:2, background: i < scanIdx ? C.green : i === scanIdx ? C.teal2 : 'rgba(255,255,255,0.15)', transition:'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Camera view */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
        <div style={{ position:'relative', width:'100%', maxWidth:360 }}>
          {/* Video */}
          <div style={{ borderRadius:24, overflow:'hidden', position:'relative', aspectRatio:'3/4', background:'#111' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }} />
            {!camReady && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', fontSize:14 }}>Starting camera...</div>}

            {/* Oval guide */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 360 480">
              <ellipse cx="180" cy="220" rx="120" ry="160" fill="none" stroke={C.green} strokeWidth="2.5" strokeDasharray="10 6" style={{ animation:'glow 2s infinite' }} />
              {/* Corner brackets */}
              {[[-10,-10],[1,0],[-1,0],[0,-10],[0,1]].length && <>
                <path d="M 40 40 L 40 70 M 40 40 L 70 40" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
                <path d="M 320 40 L 320 70 M 320 40 L 290 40" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
                <path d="M 40 440 L 40 410 M 40 440 L 70 440" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
                <path d="M 320 440 L 320 410 M 320 440 L 290 440" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
              </>}
            </svg>

            {/* Arrow indicator */}
            {pos.arrow && (
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:48, color:C.green, animation:'arrowPulse 1s infinite', pointerEvents:'none' }}>
                {pos.arrow}
              </div>
            )}

            {/* Countdown */}
            {countdown !== null && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize:96, fontWeight:900, color:'white', textShadow:'0 4px 20px rgba(0,0,0,0.5)', animation:'pulse 1s ease' }}>{countdown}</div>
              </div>
            )}
          </div>

          {/* Arrow key for direction */}
          <canvas ref={canvasRef} style={{ display:'none' }} />
        </div>

        {/* Instruction */}
        <div style={{ marginTop:20, textAlign:'center', animation:'fadeIn 0.4s ease' }}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, letterSpacing:1, marginBottom:6 }}>{pos.label.toUpperCase()}</div>
          <p style={{ color:'white', fontSize:15, lineHeight:1.5, maxWidth:300 }}>{pos.instruction}</p>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 0 && (
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            {photos.map((p, i) => (
              <div key={i} style={{ width:44, height:44, borderRadius:8, overflow:'hidden', border:`2px solid ${C.green}`, flexShrink:0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(1px)' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ padding:'20px 24px 80px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <button onClick={startCapture} disabled={!camReady || countdown !== null || capturing} style={{ width:'100%', maxWidth:320, padding:'16px', borderRadius:14, border:'none', background: camReady ? `linear-gradient(135deg, ${C.teal}, ${C.teal2})` : 'rgba(255,255,255,0.1)', color:'white', fontSize:16, fontWeight:700, cursor: camReady ? 'pointer' : 'default', transition:'all 0.2s', boxShadow: camReady ? `0 8px 24px ${C.teal}55` : 'none' }}>
          {countdown !== null ? `Capturing in ${countdown}...` : capturing ? 'Ready...' : `📸 Capture ${pos.label}`}
        </button>
        <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onNext(photos, true) }} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', textDecoration:'underline' }}>
          Skip camera scan
        </button>
      </div>
    </div>
  )
}

// ─── STEP 4 — LOADING ─────────────────────────────────────────────────────────
const LOADING_TEXTS = [
  'Analyzing skin texture...',
  'Detecting pore size...',
  'Measuring hydration levels...',
  'Checking pigmentation patterns...',
  'Identifying concern zones...',
  'Analyzing T-zone vs U-zone...',
  'Processing 32 data points...',
  'Generating personalized profile...',
  'Almost done...',
  '✓ Analysis complete!',
]

function Step4({ photos, onNext }: { photos: string[]; onNext: () => void }) {
  const [textIdx, setTextIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 4000
    const start = Date.now()
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / total) * 100))
      setProgress(pct)
      if (pct >= 100) clearInterval(progTimer)
    }, 40)

    const textTimer = setInterval(() => {
      setTextIdx(i => Math.min(i + 1, LOADING_TEXTS.length - 1))
    }, 420)

    const done = setTimeout(() => { onNext() }, total + 400)

    return () => { clearInterval(progTimer); clearInterval(textTimer); clearTimeout(done) }
  }, [onNext])

  const circumference = 2 * Math.PI * 70
  const offset = circumference - (progress / 100) * circumference

  return (
    <div style={{ minHeight:'100vh', background:C.chatBg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, position:'relative', overflow:'hidden' }}>
      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position:'absolute',
          width: 3 + Math.random() * 4,
          height: 3 + Math.random() * 4,
          borderRadius:'50%',
          background: i % 3 === 0 ? C.teal2 : i % 3 === 1 ? C.accent : 'rgba(255,255,255,0.3)',
          left:`${Math.random() * 100}%`,
          top:`${60 + Math.random() * 40}%`,
          animation:`particleFloat ${2 + Math.random() * 3}s ease-in ${Math.random() * 2}s infinite`,
          pointerEvents:'none',
        }} />
      ))}

      {/* Content */}
      <div style={{ textAlign:'center', position:'relative', zIndex:1, maxWidth:360, width:'100%' }}>
        {/* Logo */}
        <div style={{ marginBottom:32, animation:'pulse 2s infinite' }}>
          <div style={{ fontFamily:'var(--font-playfair)', fontSize:32, fontWeight:700, color:'white' }}>
            Derm<span style={{ color:C.gold, fontStyle:'italic' }}>IQ</span>
          </div>
          <div style={{ fontSize:12, color:C.teal2, letterSpacing:2, marginTop:4 }}>AI ANALYSIS</div>
        </div>

        {/* Circular progress */}
        <div style={{ position:'relative', width:160, height:160, margin:'0 auto 28px' }}>
          <svg width="160" height="160" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="80" cy="80" r="70" fill="none" stroke={`url(#pg)`} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 0.1s linear' }} />
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={C.teal} />
                <stop offset="100%" stopColor={C.teal2} />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:38, fontWeight:800, color:'white' }}>{progress}%</div>
          </div>
        </div>

        {/* Animated text */}
        <div style={{ height:24, overflow:'hidden', marginBottom:28 }}>
          <p key={textIdx} style={{ color:C.teal2, fontSize:15, fontWeight:500, animation:'fadeIn 0.4s ease' }}>
            {LOADING_TEXTS[textIdx]}
          </p>
        </div>

        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ width:48, height:48, borderRadius:10, overflow:'hidden', border:'2px solid rgba(45,95,90,0.5)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(2px) brightness(0.7)' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STEP 5 — REPORT ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const c = 2 * Math.PI * 54
  const color = score >= 70 ? C.green : score >= 50 ? C.gold : C.red
  return (
    <div style={{ position:'relative', width:130, height:130 }}>
      <svg width="130" height="130" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r="54" fill="none" stroke={C.border} strokeWidth="10" />
        <circle cx="65" cy="65" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} style={{ transition:'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:32, fontWeight:800, color }}>{score}</div>
        <div style={{ fontSize:11, color:C.mu, fontWeight:500 }}>/100</div>
      </div>
    </div>
  )
}

const CONCERN_INFO: Record<string, { why: string; ingredient: string; severity: string }> = {
  acne: { why:'Excess sebum, bacteria & clogged pores cause breakouts', ingredient:'Niacinamide, Salicylic Acid', severity:'High' },
  pigmentation: { why:'UV damage & inflammation trigger excess melanin production', ingredient:'Vitamin C, Alpha Arbutin, Kojic Acid', severity:'Medium' },
  dryness: { why:'Damaged skin barrier leads to transepidermal water loss', ingredient:'Hyaluronic Acid, Ceramides, Glycerin', severity:'Medium' },
  aging: { why:'Collagen decline & UV exposure accelerate skin aging', ingredient:'Retinol, Peptides, Vitamin C', severity:'Low' },
  dull: { why:'Dead skin cell buildup reduces skin luminosity', ingredient:'AHAs (Glycolic/Lactic Acid), Vitamin C', severity:'Medium' },
  redness: { why:'Impaired skin barrier triggers inflammatory response', ingredient:'Centella Asiatica, Azelaic Acid, Aloe Vera', severity:'Medium' },
}

const CONCERN_LABELS: Record<string, string> = {
  acne:'Acne & Breakouts', pigmentation:'Dark Spots & Pigmentation', dryness:'Dryness & Dehydration',
  aging:'Aging & Fine Lines', dull:'Dull & Uneven Tone', redness:'Redness & Sensitivity',
}

function Step5({ report, onNext }: { report: Report; onNext: () => void }) {
  const products = report.concerns.includes('acne') ? PRODUCT_MAP.acne
    : report.concerns.includes('pigmentation') ? PRODUCT_MAP.pigmentation
    : PRODUCT_MAP.default

  const aiInsights = [
    `Your ${report.userInfo.age} skin benefits most from ${report.concerns.includes('aging') ? 'Retinol & Peptides' : report.concerns.includes('pigmentation') ? 'Vitamin C & Alpha Arbutin' : 'Niacinamide & Hyaluronic Acid'} — the gold-standard ingredients for your age group.`,
    `Your ${report.userInfo.location} climate means ${report.userInfo.location.includes('Coastal') ? 'high humidity may worsen oiliness — opt for gel textures & mattifying products' : report.userInfo.location.includes('Dry') ? 'dry air accelerates TEWL — double up on occlusive moisturisers' : 'high UV index — daily SPF 50+ is non-negotiable, even indoors'}.`,
    `${report.concerns[0] ? CONCERN_LABELS[report.concerns[0]] : 'Skin concerns'} in ${report.userInfo.gender === 'Male' ? 'men' : report.userInfo.gender === 'Female' ? 'women' : 'individuals'} are often linked to ${report.concerns.includes('acne') ? 'hormonal fluctuations & dietary triggers like dairy & high-GI foods' : 'inadequate hydration & barrier damage from harsh products'}.`,
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, overflowY:'auto', paddingBottom:100 }}>
      {/* Report Header */}
      <div style={{ background:`linear-gradient(160deg, ${C.dark}, ${C.teal})`, padding:'40px 24px 32px', textAlign:'center' }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', letterSpacing:1, marginBottom:8 }}>DERMIQ AI · 32-POINT ANALYSIS</div>
        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(24px,5vw,32px)', color:'white', margin:'0 0 4px' }}>
          {report.userInfo.name}&apos;s Skin Report
        </h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:'0 0 28px' }}>
          {new Date(report.generatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
        </p>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24 }}>
          <ScoreRing score={report.overallScore} />
          <div style={{ textAlign:'left' }}>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginBottom:6 }}>Overall Skin Score</div>
            <div style={{ display:'inline-block', background:`${C.teal2}44`, border:`1px solid ${C.teal2}`, borderRadius:100, padding:'5px 14px', fontSize:14, fontWeight:600, color:'white' }}>
              {report.skinType}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px' }}>
        {/* Section 1 — Skin Identity */}
        <div style={{ marginTop:28 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:'var(--font-playfair)', marginBottom:14 }}>Your Skin Identity</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { icon:'🧬', label:'Skin Type', value:report.skinType, desc:'Based on oiliness & hydration' },
              { icon:'💦', label:'Hydration', value:`${report.hydrationScore}%`, desc: report.hydrationScore < 50 ? 'Below optimal — boost moisture' : 'Good hydration levels' },
              { icon:'🫙', label:'Oil Level', value:`${report.oilinessScore}%`, desc: report.oilinessScore > 60 ? 'High — use oil-control products' : 'Balanced sebum production' },
              { icon:'🌡️', label:'Sensitivity', value:report.sensitivityScore > 40 ? 'High' : report.sensitivityScore > 20 ? 'Moderate' : 'Low', desc:'Based on your sensitivities' },
            ].map(c => (
              <div key={c.label} style={{ background:'white', borderRadius:14, border:`1px solid ${C.border}`, padding:'14px' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
                <div style={{ fontSize:12, color:C.mu, marginBottom:2 }}>{c.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.dark }}>{c.value}</div>
                <div style={{ fontSize:11, color:C.mu, marginTop:2 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — Concerns */}
        {report.concerns.length > 0 && (
          <div style={{ marginTop:28 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:'var(--font-playfair)', marginBottom:14 }}>Detected Concerns</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {report.concerns.map(c => {
                const info = CONCERN_INFO[c]
                if (!info) return null
                const sevColor = info.severity === 'High' ? C.red : info.severity === 'Medium' ? C.gold : C.green
                return (
                  <div key={c} style={{ background:'white', borderRadius:14, border:`1px solid ${C.border}`, padding:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ fontWeight:700, color:C.dark, fontSize:15 }}>{CONCERN_LABELS[c]}</div>
                      <div style={{ padding:'3px 10px', borderRadius:100, background:`${sevColor}20`, color:sevColor, fontSize:12, fontWeight:600 }}>{info.severity}</div>
                    </div>
                    <div style={{ height:4, background:C.border, borderRadius:4, marginBottom:10 }}>
                      <div style={{ height:'100%', width: info.severity === 'High' ? '80%' : info.severity === 'Medium' ? '50%' : '25%', background:sevColor, borderRadius:4 }} />
                    </div>
                    <p style={{ fontSize:13, color:C.mu, margin:'0 0 6px' }}>💡 {info.why}</p>
                    <p style={{ fontSize:13, color:C.teal, margin:0, fontWeight:500 }}>✦ Key ingredients: {info.ingredient}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 3 — Routine */}
        <div style={{ marginTop:28 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:'var(--font-playfair)', marginBottom:14 }}>Your Personalized Routine</h2>
          {[{ label:'☀️ AM Routine', steps: products.am }, { label:'🌙 PM Routine', steps: products.pm }].map(r => (
            <div key={r.label} style={{ background:'white', borderRadius:14, border:`1px solid ${C.border}`, padding:'16px', marginBottom:12 }}>
              <div style={{ fontWeight:700, color:C.dark, fontSize:15, marginBottom:14 }}>{r.label}</div>
              {r.steps.map(s => (
                <div key={s.step} style={{ display:'flex', gap:12, alignItems:'center', paddingBottom:12, borderBottom:`1px solid ${C.border}`, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:`${C.teal}18`, border:`1.5px solid ${C.teal}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.teal, flexShrink:0 }}>{s.step}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:C.mu, marginBottom:1 }}>{s.type}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:C.dark }}>{s.name}</div>
                    <div style={{ fontSize:12, color:C.mu }}>{s.brand} · {s.price}</div>
                  </div>
                  <button style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${C.teal}`, background:'transparent', color:C.teal, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>Add</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Section 4 — Diet & Lifestyle */}
        <div style={{ marginTop:28 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:'var(--font-playfair)', marginBottom:14 }}>Diet & Lifestyle Plan</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:'white', borderRadius:14, border:`1px solid ${C.border}`, padding:'16px' }}>
              <div style={{ fontWeight:700, color:C.dark, fontSize:14, marginBottom:12 }}>🥗 Diet</div>
              <div style={{ fontSize:12, color:C.green, fontWeight:600, marginBottom:6 }}>Eat More</div>
              {['Omega-3 rich foods', 'Antioxidants', 'Vitamin C foods', 'Leafy greens'].map(f => (
                <div key={f} style={{ fontSize:12, color:C.mu, paddingBottom:4 }}>✓ {f}</div>
              ))}
              <div style={{ fontSize:12, color:C.red, fontWeight:600, margin:'10px 0 6px' }}>Avoid</div>
              {(report.concerns.includes('acne') ? ['Dairy products', 'High-GI foods', 'Excess sugar', 'Processed foods'] : ['Excess alcohol', 'Salty snacks', 'Crash diets']).map(f => (
                <div key={f} style={{ fontSize:12, color:C.mu, paddingBottom:4 }}>✗ {f}</div>
              ))}
              <div style={{ fontSize:12, color:C.teal, fontWeight:600, marginTop:10 }}>💧 Drink 2.5L water daily</div>
            </div>
            <div style={{ background:'white', borderRadius:14, border:`1px solid ${C.border}`, padding:'16px' }}>
              <div style={{ fontWeight:700, color:C.dark, fontSize:14, marginBottom:12 }}>🌿 Lifestyle</div>
              {[
                { e:'😴', t:'Sleep', d:'7-8 hrs, silk pillowcase recommended' },
                { e:'🧘', t:'Stress', d:'Cortisol → acne. 10min meditation helps' },
                { e:'☀️', t:'SPF', d:'Never skip, even indoors (UVA through glass)' },
                { e:'🏃', t:'Exercise', d:'30min cardio 3x/week improves circulation' },
              ].map(tip => (
                <div key={tip.t} style={{ paddingBottom:10, borderBottom:`1px solid ${C.border}`, marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.dark }}>{tip.e} {tip.t}</div>
                  <div style={{ fontSize:11, color:C.mu, marginTop:2 }}>{tip.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5 — AI Insights */}
        <div style={{ marginTop:28, marginBottom:32 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:'var(--font-playfair)', marginBottom:14 }}>AI Insights For You</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {aiInsights.map((insight, i) => (
              <div key={i} style={{ background:`linear-gradient(135deg, ${C.teal}10, ${C.teal2}08)`, border:`1px solid ${C.teal}30`, borderRadius:14, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:`${C.teal}20`, border:`1px solid ${C.teal}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.teal, flexShrink:0 }}>{i + 1}</div>
                <p style={{ fontSize:13, color:C.dark, lineHeight:1.6, margin:0 }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer + CTA */}
        <div style={{ textAlign:'center', padding:'0 0 20px' }}>
          <p style={{ fontSize:13, color:C.mu, marginBottom:20 }}>
            🔬 This report has been sent to a DermIQ specialist for review
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={onNext} style={{ width:'100%', padding:'16px', borderRadius:14, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:`0 8px 24px ${C.teal}44` }}>
              ⚡ Book Instant Consultation — FREE
            </button>
            <button onClick={onNext} style={{ width:'100%', padding:'16px', borderRadius:14, border:`2px solid ${C.teal}`, background:'transparent', color:C.teal, fontSize:16, fontWeight:700, cursor:'pointer' }}>
              📅 Schedule Consultation — FREE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 6 — BOOK CONSULTATION ───────────────────────────────────────────────
const DOCTORS = [
  { name:'Dr. Priya Mehta', spec:'MD Dermatology, 8 yrs exp', rating:4.9, available:true },
  { name:'Dr. Kavya Iyer', spec:'MBBS, Skincare Specialist, 5 yrs exp', rating:4.8, available:true },
  { name:'Dr. Arjun Shah', spec:'MD, Anti-aging Expert, 10 yrs exp', rating:4.7, available:false },
]

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']
const UNAVAILABLE = ['12:00 PM', '3:00 PM', '6:00 PM']

function Step6({ report }: { report: Report }) {
  const router = useRouter()
  const [tab, setTab] = useState<'instant' | 'scheduled'>('instant')
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0].name)
  const [selectedMode, setSelectedMode] = useState<'video' | 'voice' | 'chat'>('video')
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booked, setBooked] = useState<{ doctor: string; slot: string; mode: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const handleBook = async () => {
    if (tab === 'scheduled' && !selectedSlot) { toast.error('Please select a time slot'); return }
    setLoading(true)
    try {
      await supabase.from('dermiq_consultations').insert({
        patient_name: report.userInfo.name,
        type: tab,
        mode: selectedMode,
        doctor: selectedDoctor,
        slot: tab === 'instant' ? 'Immediate' : `${dates[selectedDate].toDateString()} ${selectedSlot}`,
        skin_type: report.skinType,
        overall_score: report.overallScore,
        concerns: report.concerns,
        created_at: new Date().toISOString(),
      })
    } catch { /* fail silently */ }
    setLoading(false)
    setBooked({ doctor: selectedDoctor, slot: tab === 'instant' ? 'immediately' : `${dates[selectedDate].toLocaleDateString('en-IN', { day:'numeric', month:'short' })} at ${selectedSlot}`, mode: selectedMode })
    toast.success('Consultation booked!')
  }

  if (booked) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', textAlign:'center' }}>
        {/* Success checkmark */}
        <div style={{ width:88, height:88, borderRadius:'50%', background:`${C.green}18`, border:`3px solid ${C.green}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, animation:'pulse 1s ease 3' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M8 22 L18 32 L36 12" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="0" style={{ animation:'checkmark 0.6s ease' }} />
          </svg>
        </div>

        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:28, fontWeight:700, color:C.dark, margin:'0 0 8px' }}>Consultation Confirmed! 🎉</h1>
        <p style={{ fontSize:15, color:C.mu, lineHeight:1.6, margin:'0 0 6px' }}>{booked.doctor} will review your skin report and contact you <strong>{booked.slot}</strong>.</p>
        <p style={{ fontSize:14, color:C.mu, margin:'0 0 6px' }}>Mode: {booked.mode.charAt(0).toUpperCase() + booked.mode.slice(1)} Call</p>
        <p style={{ fontSize:13, color:C.teal, fontWeight:500, margin:'0 0 8px' }}>Your complete report has been shared automatically.</p>
        <p style={{ fontSize:13, color:C.mu, margin:'0 0 32px' }}>📲 You&apos;ll receive a WhatsApp confirmation shortly.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:320 }}>
          <button onClick={() => router.push('/know-your-skin')} style={{ padding:'14px', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:15, fontWeight:600, cursor:'pointer' }}>
            View My Report
          </button>
          <button onClick={() => router.push('/')} style={{ padding:'14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:'white', color:C.dark, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            Go to Home
          </button>
          <button style={{ padding:'14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:'transparent', color:C.mu, fontSize:14, cursor:'not-allowed' }}>
            📄 Download PDF (coming soon)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, overflowY:'auto', paddingBottom:100 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(160deg, ${C.dark}, ${C.teal})`, padding:'32px 24px 24px' }}>
        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:26, color:'white', margin:'0 0 6px' }}>Book Consultation</h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, margin:0 }}>FREE · Your report shared automatically with specialist</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, background:'white', borderBottom:`1px solid ${C.border}` }}>
        {[{ k:'instant', l:'⚡ Instant' }, { k:'scheduled', l:'📅 Schedule' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as 'instant' | 'scheduled')} style={{ flex:1, padding:'14px', border:'none', borderBottom: tab === t.k ? `3px solid ${C.teal}` : '3px solid transparent', background:'transparent', color: tab === t.k ? C.teal : C.mu, fontSize:15, fontWeight: tab === t.k ? 700 : 500, cursor:'pointer', transition:'all 0.2s' }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px' }}>
        {tab === 'instant' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <div style={{ background:`${C.green}10`, border:`1px solid ${C.green}30`, borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:C.green, animation:'pulse 1.5s infinite' }} />
              <span style={{ fontSize:14, color:C.dark, fontWeight:500 }}>Connect with a specialist in under 5 minutes</span>
            </div>

            {/* Doctor selection */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Choose Specialist</div>
              {DOCTORS.map(d => (
                <div key={d.name} onClick={() => d.available && setSelectedDoctor(d.name)} style={{ background:'white', border:`2px solid ${selectedDoctor === d.name ? C.teal : C.border}`, borderRadius:12, padding:'14px', marginBottom:8, cursor: d.available ? 'pointer' : 'default', opacity: d.available ? 1 : 0.5, display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.2s' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white' }}>{d.name.split(' ')[1][0]}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:C.dark }}>{d.name}</div>
                      <div style={{ fontSize:12, color:C.mu }}>{d.spec}</div>
                      <div style={{ fontSize:12, color:C.gold }}>★ {d.rating}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: d.available ? C.green : C.red, marginLeft:'auto', marginBottom:4 }} />
                    <div style={{ fontSize:11, color: d.available ? C.green : C.red }}>{d.available ? 'Available' : 'Busy'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mode */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Consultation Mode</div>
              <div style={{ display:'flex', gap:8 }}>
                {[{ k:'video', l:'📹 Video', }, { k:'voice', l:'📞 Voice' }, { k:'chat', l:'💬 Chat' }].map(m => (
                  <button key={m.k} onClick={() => setSelectedMode(m.k as 'video' | 'voice' | 'chat')} style={{ flex:1, padding:'10px', borderRadius:10, border:`2px solid ${selectedMode === m.k ? C.teal : C.border}`, background: selectedMode === m.k ? `${C.teal}15` : 'white', color: selectedMode === m.k ? C.teal : C.mu, fontSize:13, fontWeight: selectedMode === m.k ? 600 : 400, cursor:'pointer', transition:'all 0.2s' }}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBook} disabled={loading} style={{ width:'100%', padding:'16px', borderRadius:14, border:'none', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color:'white', fontSize:16, fontWeight:700, cursor: loading ? 'wait' : 'pointer', boxShadow:`0 8px 24px ${C.teal}44`, opacity: loading ? 0.8 : 1 }}>
              {loading ? 'Confirming...' : 'Book Instant — FREE ⚡'}
            </button>
          </div>
        )}

        {tab === 'scheduled' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            {/* Doctor */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Choose Specialist</div>
              {DOCTORS.filter(d => d.available).map(d => (
                <div key={d.name} onClick={() => setSelectedDoctor(d.name)} style={{ background:'white', border:`2px solid ${selectedDoctor === d.name ? C.teal : C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:8, cursor:'pointer', display:'flex', gap:10, alignItems:'center', transition:'all 0.2s' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>{d.name.split(' ')[1][0]}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:C.dark }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.mu }}>{d.spec}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Date picker */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Select Date</div>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                {dates.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDate(i)} style={{ flexShrink:0, width:54, padding:'10px 6px', borderRadius:12, border:`2px solid ${selectedDate === i ? C.teal : C.border}`, background: selectedDate === i ? `${C.teal}18` : 'white', cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}>
                    <div style={{ fontSize:11, color:C.mu, marginBottom:2 }}>{d.toLocaleDateString('en-IN', { weekday:'short' })}</div>
                    <div style={{ fontSize:18, fontWeight:700, color: selectedDate === i ? C.teal : C.dark }}>{d.getDate()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Select Time</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                {TIME_SLOTS.map(slot => {
                  const unavail = UNAVAILABLE.includes(slot)
                  return (
                    <button key={slot} disabled={unavail} onClick={() => !unavail && setSelectedSlot(slot)} style={{ padding:'10px 6px', borderRadius:10, border:`2px solid ${selectedSlot === slot ? C.teal : unavail ? C.border : C.border}`, background: selectedSlot === slot ? `${C.teal}18` : unavail ? '#F5F5F5' : 'white', color: selectedSlot === slot ? C.teal : unavail ? '#D1D5DB' : C.dark, fontSize:13, fontWeight: selectedSlot === slot ? 700 : 400, cursor: unavail ? 'not-allowed' : 'pointer', transition:'all 0.2s', textDecoration: unavail ? 'line-through' : 'none' }}>
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mode */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:10 }}>Mode</div>
              <div style={{ display:'flex', gap:8 }}>
                {[{ k:'video', l:'📹 Video' }, { k:'voice', l:'📞 Voice' }, { k:'chat', l:'💬 Chat' }].map(m => (
                  <button key={m.k} onClick={() => setSelectedMode(m.k as 'video' | 'voice' | 'chat')} style={{ flex:1, padding:'10px', borderRadius:10, border:`2px solid ${selectedMode === m.k ? C.teal : C.border}`, background: selectedMode === m.k ? `${C.teal}15` : 'white', color: selectedMode === m.k ? C.teal : C.mu, fontSize:13, fontWeight: selectedMode === m.k ? 600 : 400, cursor:'pointer', transition:'all 0.2s' }}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBook} disabled={loading || !selectedSlot} style={{ width:'100%', padding:'16px', borderRadius:14, border:'none', background: selectedSlot ? `linear-gradient(135deg, ${C.teal}, ${C.teal2})` : C.border, color: selectedSlot ? 'white' : C.mu, fontSize:16, fontWeight:700, cursor: selectedSlot && !loading ? 'pointer' : 'default', transition:'all 0.2s' }}>
              {loading ? 'Confirming...' : 'Confirm Slot — FREE 📅'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KnowYourSkinPage() {
  const [step, setStep] = useState(0)
  const [userInfo, setUserInfo] = useState<UserInfo>({ name:'', age:'', gender:'', location:'' })
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({ skinFeel:'', concerns:[], spf:'', sleep:'6-7', water:'1-2L', sensitivities:[], routine:'' })
  const [photos, setPhotos] = useState<string[]>([])
  const [report, setReport] = useState<Report | null>(null)

  const goTo = (s: number) => setStep(s)

  const handleStep1Done = (info: UserInfo) => {
    setUserInfo(info)
    goTo(2)
  }

  const handleStep2Done = (answers: QuizAnswers) => {
    setQuizAnswers(answers)
    goTo(3)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStep3Done = (capturedPhotos: string[], _skipped: boolean) => {
    setPhotos(capturedPhotos)
    goTo(4)
  }

  const handleStep4Done = async () => {
    const r = generateReport(quizAnswers, userInfo)
    setReport(r)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ksProfile', JSON.stringify(r))
    }
    // Save to Supabase
    try {
      await supabase.from('skin_profiles').insert({
        name: userInfo.name,
        age: userInfo.age,
        gender: userInfo.gender,
        location: userInfo.location,
        skin_type: r.skinType,
        overall_score: r.overallScore,
        hydration_score: r.hydrationScore,
        oiliness_score: r.oilinessScore,
        sensitivity_score: r.sensitivityScore,
        concerns: r.concerns,
        quiz_answers: quizAnswers,
        photos_count: photos.length,
        created_at: r.generatedAt,
      })
    } catch { /* fail silently — offline OK */ }
    goTo(5)
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <ExitButton />
      {step < 6 && <ProgressDots step={step} />}

      <div style={{ position:'relative' }}>
        {step === 0 && <Step0 onNext={() => goTo(1)} />}
        {step === 1 && <Step1 onNext={handleStep1Done} />}
        {step === 2 && <Step2 onNext={handleStep2Done} />}
        {step === 3 && <Step3 onNext={handleStep3Done} />}
        {step === 4 && <Step4 photos={photos} onNext={handleStep4Done} />}
        {step === 5 && report && <Step5 report={report} onNext={() => goTo(6)} />}
        {step === 6 && report && <Step6 report={report} />}
      </div>
    </>
  )
}
