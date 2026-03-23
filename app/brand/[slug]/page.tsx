'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { ALL_PRODUCTS, type Product } from '@/lib/products'

const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280',
  border: '#E8E0D8', cream: '#F7F3EE', bg: '#FAFAF8', accent: '#C8976A',
  green: '#10B981', red: '#EF4444', gold: '#D4A853',
}

// ── Brand Data ───────────────────────────────────────────────────────────────
type BrandData = {
  name: string; slug: string; tagline: string; description: string
  logoEmoji: string; heroImage: string; heroColor: string
  founded: string; origin: string; philosophy: string
  certifications: string[]; priceRange: string; skinFocus: string[]
  socialProof: { customers: number; rating: number; products: number }
  featured: boolean
  principles: { title: string; desc: string; icon: string }[]
  reviews: { name: string; rating: number; date: string; comment: string; skin: string }[]
}

const BRANDS_DATA: Record<string, BrandData> = {
  dermiq: {
    name: 'DermIQ', slug: 'dermiq', tagline: 'Science-first skincare, made for India',
    description: 'DermIQ was founded by dermatologists and formulation scientists with one mission: to bring pharmaceutical-grade skincare to everyday Indians without the pharmacy price tag. Every formula is clinically validated, every claim is evidence-backed, and every ingredient is chosen for efficacy — not marketing buzz.',
    logoEmoji: '🧬',
    heroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&h=400&fit=crop&q=80',
    heroColor: '#1A2E2B',
    founded: '2021', origin: 'India', philosophy: 'Evidence-based formulations at accessible price points',
    certifications: ['Dermatologist-Tested', 'Cruelty-Free', 'Non-Comedogenic', 'COSMOS Certified', 'Fragrance-Free'],
    priceRange: 'Mid-range',
    skinFocus: ['All skin types', 'Acne', 'Anti-aging', 'Brightening'],
    socialProof: { customers: 125000, rating: 4.8, products: 24 },
    featured: true,
    principles: [
      { title: 'Evidence-First Philosophy', desc: 'Every ingredient is chosen based on peer-reviewed clinical data, not trends or marketing.', icon: '🔬' },
      { title: 'Clean Formulations', desc: 'No parabens, sulphates, or synthetic fragrances — ingredients that work without compromising safety.', icon: '🌿' },
      { title: 'Independent Testing', desc: 'All products undergo third-party efficacy and safety testing before launch.', icon: '🧪' },
    ],
    reviews: [
      { name: 'Priya S.', rating: 5, date: 'Mar 2026', comment: 'DermIQ completely transformed my skincare routine. Their Vitamin C serum is the best I have used — results in 2 weeks!', skin: 'Oily' },
      { name: 'Rahul M.', rating: 5, date: 'Feb 2026', comment: 'Finally a brand that is transparent about ingredients and concentrations. No fluff, just great formulations.', skin: 'Combination' },
      { name: 'Sneha K.', rating: 4, date: 'Jan 2026', comment: 'Very impressed with the SPF. Zero white cast and my skin does not feel greasy even after application. Will reorder.', skin: 'Sensitive' },
    ],
  },
  minimalist: {
    name: 'Minimalist', slug: 'minimalist', tagline: 'Real ingredients. Real percentages. Real results.',
    description: 'Minimalist is an Indian skincare brand that disrupted the market by publishing exact active ingredient percentages on every product — a radical transparency move in an industry notorious for vague claims. They focus on single-active formulas that make it easy to build a targeted, non-conflicting routine.',
    logoEmoji: '📐',
    heroImage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&h=400&fit=crop&q=80',
    heroColor: '#2C3E50',
    founded: '2020', origin: 'India', philosophy: 'Ingredient transparency and minimal formulation philosophy',
    certifications: ['Cruelty-Free', 'Vegan', 'Dermatologist-Tested', 'Fragrance-Free'],
    priceRange: 'Budget',
    skinFocus: ['Oily skin', 'Acne', 'Hyperpigmentation', 'Anti-aging'],
    socialProof: { customers: 890000, rating: 4.6, products: 36 },
    featured: true,
    principles: [
      { title: 'Ingredient Transparency', desc: 'Every active ingredient is listed with its exact percentage — no proprietary blends or hidden formulas.', icon: '📋' },
      { title: 'Single-Active Focus', desc: 'Formulas designed around one hero active for targeted, stackable skincare without conflicts.', icon: '🎯' },
      { title: 'Affordable Access', desc: 'Clinical-grade ingredients at prices accessible to all — skincare should not be a luxury.', icon: '💰' },
    ],
    reviews: [
      { name: 'Aisha R.', rating: 5, date: 'Mar 2026', comment: 'Minimalist niacinamide serum changed my oily skin game. Pores are visibly smaller after 4 weeks.', skin: 'Oily' },
      { name: 'Dev P.', rating: 4, date: 'Feb 2026', comment: 'Love the transparency. Knowing exact percentages helps me avoid conflicts in my routine.', skin: 'Acne-prone' },
      { name: 'Nisha T.', rating: 5, date: 'Jan 2026', comment: 'Their retinoid serum is life-changing. I was nervous to start retinol but this was very gentle.', skin: 'Dry' },
    ],
  },
  plum: {
    name: 'Plum', slug: 'plum', tagline: 'Always goodness. Always vegan.',
    description: 'Plum is India\'s first vegan and cruelty-free beauty brand, founded on the belief that effective skincare should never come at the cost of animals or the environment. Their products are formulated without any animal-derived ingredients and backed by dermatologist expertise.',
    logoEmoji: '💜',
    heroImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&h=400&fit=crop&q=80',
    heroColor: '#6B3FA0',
    founded: '2013', origin: 'India', philosophy: '100% vegan, cruelty-free, and environmentally conscious beauty',
    certifications: ['100% Vegan', 'Cruelty-Free', 'PETA Certified', 'EWG Verified', 'Dermatologist-Tested'],
    priceRange: 'Mid-range',
    skinFocus: ['Oily skin', 'Acne', 'Brightening', 'Natural ingredients'],
    socialProof: { customers: 540000, rating: 4.5, products: 45 },
    featured: false,
    principles: [
      { title: 'Always Vegan', desc: 'Every Plum product is certified vegan — no animal-derived ingredients, ever, in any formula.', icon: '🌱' },
      { title: 'Cruelty-Free', desc: 'PETA-certified, never tested on animals at any stage of product development.', icon: '🐇' },
      { title: 'Good Science', desc: 'Natural and science-backed ingredients work together for visible, measurable results.', icon: '🔬' },
    ],
    reviews: [
      { name: 'Kavya M.', rating: 5, date: 'Mar 2026', comment: 'Finally vegan skincare that works as well as regular products. Their green tea range is perfect for my oily skin.', skin: 'Oily' },
      { name: 'Ritu S.', rating: 4, date: 'Feb 2026', comment: 'Love that I can feel good about what I am putting on my skin. Great for acne-prone skin.', skin: 'Acne-prone' },
      { name: 'Meera K.', rating: 5, date: 'Jan 2026', comment: 'Plum sunscreen is light, non-greasy, and zero white cast. Best vegan SPF I have found.', skin: 'Combination' },
    ],
  },
  pilgrim: {
    name: 'Pilgrim', slug: 'pilgrim', tagline: 'Korean beauty science, made for India',
    description: 'Pilgrim brings the best of Korean skincare innovation to Indian consumers — combining K-beauty formulation expertise with ingredient concentrations and textures specifically adapted for Indian climate and skin. Their products bridge the gap between Korean science and Indian skin needs.',
    logoEmoji: '🌸',
    heroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=400&fit=crop&q=80',
    heroColor: '#C44B6B',
    founded: '2019', origin: 'India (K-beauty inspired)', philosophy: 'Korean beauty science optimised for Indian skin and climate',
    certifications: ['Cruelty-Free', 'Dermatologist-Tested', 'Paraben-Free', 'Sulphate-Free'],
    priceRange: 'Mid-range',
    skinFocus: ['Anti-aging', 'Brightening', 'Hydration', 'K-beauty'],
    socialProof: { customers: 320000, rating: 4.4, products: 38 },
    featured: false,
    principles: [
      { title: 'K-Beauty Heritage', desc: 'Formulas inspired by Korean beauty rituals adapted for Indian skin tones and tropical climate.', icon: '🌸' },
      { title: 'Innovative Actives', desc: 'Cutting-edge Korean ingredients like snail filtrate, fermented extracts, and bakuchiol.', icon: '⚗️' },
      { title: 'Skin-barrier First', desc: 'Every formula prioritises barrier integrity — the foundation of healthy, glass skin.', icon: '🛡️' },
    ],
    reviews: [
      { name: 'Tanya B.', rating: 5, date: 'Mar 2026', comment: 'Their Vitamin C serum has a different, more stable formula. Great for Indian skin that struggles with sensitivity.', skin: 'Sensitive' },
      { name: 'Aryan J.', rating: 4, date: 'Feb 2026', comment: 'Love the Korean approach. Their 10-step routine products are all gentle and non-irritating.', skin: 'Normal' },
      { name: 'Pooja D.', rating: 4, date: 'Jan 2026', comment: 'Pilgrims anti-aging range is excellent. Visible firmness improvement after 6 weeks.', skin: 'Dry' },
    ],
  },
  'dot-and-key': {
    name: 'Dot & Key', slug: 'dot-and-key', tagline: 'Unlocking the best version of your skin',
    description: 'Dot & Key is a modern Indian skincare brand that combines vibrant formulations with effective actives. Known for their colourful, Instagram-worthy packaging and seriously effective ingredients, they have built a loyal following among Gen Z and millennial consumers who want both performance and aesthetics.',
    logoEmoji: '🔑',
    heroImage: 'https://images.unsplash.com/photo-1582657233954-5aca7f90db63?w=1200&h=400&fit=crop&q=80',
    heroColor: '#E84393',
    founded: '2018', origin: 'India', philosophy: 'Effective skincare with vibrant, joyful brand experience',
    certifications: ['Cruelty-Free', 'Dermatologist-Tested', 'Non-Comedogenic'],
    priceRange: 'Mid-range',
    skinFocus: ['Brightening', 'Hydration', 'Sun protection', 'All skin types'],
    socialProof: { customers: 280000, rating: 4.3, products: 52 },
    featured: false,
    principles: [
      { title: 'Joyful Formulations', desc: 'Vibrant, sensory formulas that make your skincare routine feel like self-care, not a chore.', icon: '🌈' },
      { title: 'Active Innovation', desc: 'Combining trending actives with skin-care science for targeted, visible results.', icon: '✨' },
      { title: 'Inclusive Beauty', desc: 'Products designed for diverse Indian skin tones, types, and concerns.', icon: '🌍' },
    ],
    reviews: [
      { name: 'Sana R.', rating: 5, date: 'Mar 2026', comment: 'Dot & Key cica serum is incredible for my sensitive skin. Redness reduced significantly.', skin: 'Sensitive' },
      { name: 'Isha P.', rating: 4, date: 'Feb 2026', comment: 'Love their watermelon range. Lightweight hydration perfect for summer.', skin: 'Oily' },
      { name: 'Kiran M.', rating: 4, date: 'Jan 2026', comment: 'Packaging is beautiful but more importantly the products actually work.', skin: 'Combination' },
    ],
  },
  mamaearth: {
    name: 'Mamaearth', slug: 'mamaearth', tagline: 'Toxin-free, nature-inspired goodness',
    description: 'Mamaearth is one of India\'s fastest-growing beauty brands, built around the concept of toxin-free, natural formulations. Started as a baby care brand, they have expanded to full skincare and haircare with a strong focus on natural ingredients and removing harmful chemicals from everyday products.',
    logoEmoji: '🌿',
    heroImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&h=400&fit=crop&q=80',
    heroColor: '#4A7C3F',
    founded: '2016', origin: 'India', philosophy: 'Toxin-free, natural and sustainable beauty for every family',
    certifications: ['Made Safe Certified', 'Cruelty-Free', 'Dermatologist-Tested', 'No Harmful Chemicals', 'GoodOnYou Rated'],
    priceRange: 'Budget',
    skinFocus: ['Natural ingredients', 'Sensitive skin', 'Brightening', 'Hair care'],
    socialProof: { customers: 1200000, rating: 4.2, products: 80 },
    featured: false,
    principles: [
      { title: 'Toxin-Free Promise', desc: 'No sulphates, parabens, SLS, mineral oil, petroleum, artificial colours, or artificial fragrances.', icon: '🚫' },
      { title: 'Nature-Inspired', desc: 'Plant-based actives and natural extracts at the heart of every formulation.', icon: '🌺' },
      { title: 'Sustainable Packaging', desc: 'Committed to 100% recyclable packaging and reducing plastic footprint.', icon: '♻️' },
    ],
    reviews: [
      { name: 'Anjali K.', rating: 4, date: 'Mar 2026', comment: 'Great for someone starting their skincare journey. Gentle, effective, and affordable.', skin: 'Normal' },
      { name: 'Rohan S.', rating: 4, date: 'Feb 2026', comment: 'Vitamin C face wash is brilliant for morning use. Skin looks brighter consistently.', skin: 'Oily' },
      { name: 'Divya M.', rating: 5, date: 'Jan 2026', comment: 'Onion oil has genuinely improved my hair fall. Give it 8 weeks consistently.', skin: 'Sensitive' },
    ],
  },
  cerave: {
    name: 'CeraVe', slug: 'cerave', tagline: 'Developed with dermatologists, for healthy skin',
    description: 'CeraVe is a dermatologist-developed skincare brand built around the science of ceramides and the skin barrier. Their patented MVE (Multivesicular Emulsion) technology delivers ceramides, hyaluronic acid, and essential lipids slowly and continuously throughout the day, providing long-lasting barrier repair.',
    logoEmoji: '🏥',
    heroImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&h=400&fit=crop&q=80',
    heroColor: '#0077B6',
    founded: '2005', origin: 'USA', philosophy: 'Dermatologist-developed barrier repair with essential ceramides',
    certifications: ['Developed with Dermatologists', 'National Eczema Association Accepted', 'Fragrance-Free', 'Non-Comedogenic', 'Allergy-Tested'],
    priceRange: 'Mid-range',
    skinFocus: ['Dry skin', 'Eczema', 'Sensitive skin', 'Barrier repair'],
    socialProof: { customers: 2500000, rating: 4.7, products: 28 },
    featured: true,
    principles: [
      { title: 'Ceramide Science', desc: 'Patented ceramide complex (1, 3, 6-II) that mimics skin\'s natural barrier lipids exactly.', icon: '🛡️' },
      { title: 'MVE Technology', desc: 'Multi-Vesicular Emulsion technology releases moisturising ingredients in a time-released manner.', icon: '⏱️' },
      { title: 'Dermatologist Partnership', desc: 'Every formula co-developed and tested with practising dermatologists before launch.', icon: '👩‍⚕️' },
    ],
    reviews: [
      { name: 'Lakshmi R.', rating: 5, date: 'Mar 2026', comment: 'CeraVe moisturising cream is the holy grail for my eczema-prone skin. Dermatologist recommended it.', skin: 'Dry/Eczema' },
      { name: 'Vikas M.', rating: 5, date: 'Feb 2026', comment: 'Foaming cleanser is the best I have used. Cleans well without stripping my barrier.', skin: 'Oily' },
      { name: 'Preet K.', rating: 5, date: 'Jan 2026', comment: 'SA cleanser has cleared my KP (keratosis pilaris) on my arms after years of trying products.', skin: 'Combination' },
    ],
  },
  neutrogena: {
    name: 'Neutrogena', slug: 'neutrogena', tagline: 'The dermatologist\'s choice for over 60 years',
    description: 'Neutrogena is one of the world\'s most trusted dermatologist-recommended skincare brands, with over six decades of clinical expertise. Their range spans acne treatment, anti-aging, hydration, and sun protection — all developed in collaboration with leading dermatologists and backed by extensive clinical testing.',
    logoEmoji: '💊',
    heroImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&h=400&fit=crop&q=80',
    heroColor: '#003087',
    founded: '1930', origin: 'USA', philosophy: 'Dermatologist-recommended solutions for every skin concern',
    certifications: ['#1 Dermatologist-Recommended Brand', 'Hypoallergenic', 'Non-Comedogenic', 'Clinically Proven'],
    priceRange: 'Mid-range',
    skinFocus: ['Acne', 'Anti-aging', 'Sun protection', 'All skin types'],
    socialProof: { customers: 5000000, rating: 4.5, products: 34 },
    featured: false,
    principles: [
      { title: 'Dermatologist Partnership', desc: 'The No.1 recommended skincare brand by dermatologists — built on decades of clinical collaboration.', icon: '🏆' },
      { title: 'Clinically Proven', desc: 'Every product undergoes rigorous clinical testing for efficacy and safety before launch.', icon: '📊' },
      { title: 'Inclusive Range', desc: 'Solutions for every skin type, concern, age group, and budget.', icon: '🌍' },
    ],
    reviews: [
      { name: 'Sunita P.', rating: 5, date: 'Mar 2026', comment: 'Neutrogena Hydro Boost is the best gel cream for hot weather. Non-greasy and long-lasting.', skin: 'Oily' },
      { name: 'Amit D.', rating: 4, date: 'Feb 2026', comment: 'Retinol serum from Neutrogena is the most gentle I have tried. Great for beginners.', skin: 'Sensitive' },
      { name: 'Rekha N.', rating: 5, date: 'Jan 2026', comment: 'Using their acne face wash for 10 years now. Consistent, reliable, and effective.', skin: 'Acne-prone' },
    ],
  },
  'the-ordinary': {
    name: 'The Ordinary', slug: 'the-ordinary', tagline: 'Clinical formulations with integrity',
    description: 'The Ordinary disrupted the global skincare industry by offering clinical-grade formulations at drastically lower prices than comparable products. Their philosophy is radical transparency — publishing exact ingredient percentages and using straightforward ingredient-as-product-name naming to cut through marketing noise.',
    logoEmoji: '⚗️',
    heroImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&h=400&fit=crop&q=80',
    heroColor: '#1C1C1C',
    founded: '2016', origin: 'Canada', philosophy: 'Radical transparency and clinical efficacy at accessible prices',
    certifications: ['Cruelty-Free', 'Vegan (most products)', 'Fragrance-Free', 'DECIEM Backed'],
    priceRange: 'Budget',
    skinFocus: ['All concerns', 'Anti-aging', 'Hyperpigmentation', 'Acne'],
    socialProof: { customers: 3200000, rating: 4.4, products: 42 },
    featured: true,
    principles: [
      { title: 'Integrity in Formulation', desc: 'Honest ingredients, honest prices, honest communication about what each product actually does.', icon: '🎯' },
      { title: 'Clinical Concentrations', desc: 'Actives at clinically relevant percentages, not token amounts just to appear on the label.', icon: '📏' },
      { title: 'Education First', desc: 'Empowering consumers with knowledge to make informed skincare decisions.', icon: '📚' },
    ],
    reviews: [
      { name: 'Anjali M.', rating: 5, date: 'Mar 2026', comment: 'The Ordinary AHA 30%+BHA 2% peel is the most transformative product I have ever used. Weekly peel changed my skin.', skin: 'Combination' },
      { name: 'Rohit S.', rating: 4, date: 'Feb 2026', comment: 'Slightly complex to figure out which products to combine but the results are undeniable.', skin: 'Acne-prone' },
      { name: 'Meena T.', rating: 5, date: 'Jan 2026', comment: 'Retinol 0.2% in squalane is perfect starter retinol. Minimal irritation, maximum results.', skin: 'Dry' },
    ],
  },
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(n) ? '#F59E0B' : '#E5E7EB', fontSize: 14 }}>★</span>
      ))}
    </span>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return n.toString()
}

export default function BrandStorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [cartCount, setCartCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('dermiq_open_cart', handler)
    return () => window.removeEventListener('dermiq_open_cart', handler)
  }, [])

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
        setCartCount(cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0))
      } catch { setCartCount(0) }
    }
    update()
    window.addEventListener('dermiq_cart_updated', update)
    return () => window.removeEventListener('dermiq_cart_updated', update)
  }, [])

  const brand = BRANDS_DATA[slug]

  if (!brand) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        <div style={{ fontSize: 64 }}>🏷️</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: C.dark }}>Brand not found</h2>
        <Link href="/shop" style={{ padding: '12px 28px', background: C.teal, color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Browse All Products</Link>
      </div>
    )
  }

  const brandProducts = ALL_PRODUCTS.filter(p => p.brand.toLowerCase() === brand.name.toLowerCase())
  const categories = ['All', ...Array.from(new Set(brandProducts.map(p => p.category)))]
  const filtered = activeCategory === 'All' ? brandProducts : brandProducts.filter(p => p.category === activeCategory)
  const bestsellers = [...brandProducts].sort((a, b) => b.rating - a.rating).slice(0, 3)

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
      const idx = cart.findIndex((i: { id: number }) => i.id === product.id)
      if (idx >= 0) { cart[idx].qty += 1 } else {
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, qty: 1 })
      }
      localStorage.setItem('dermiq_cart', JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
      toast.success('Added to bag!', { icon: '🛍️' })
    } catch { toast.error('Could not add to cart') }
  }

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: brand.reviews.filter(rv => rv.rating === r).length + (r === 5 ? 2 : r === 4 ? 1 : 0),
  }))
  const totalRatings = ratingCounts.reduce((s, r) => s + r.count, 0)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Announcement Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: C.dark, color: '#fff', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500 }}>🏷️ Brand Store — Free shipping on orders ₹799+</span>
      </div>

      <Navbar activePage="shop" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div style={{ paddingTop: 106, paddingBottom: 100 }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${brand.heroImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.25)',
          }} />
          {/* Overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${brand.heroColor}EE, ${brand.heroColor}99)` }} />

          <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '64px 24px 56px' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28 }}>
              <Link href="/shop" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Shop</Link>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Brand Store</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#fff', fontWeight: 600 }}>{brand.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '1px solid rgba(255,255,255,0.3)' }}>
                {brand.logoEmoji}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>{brand.name}</h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: '6px 0 0', fontStyle: 'italic' }}>{brand.tagline}</p>
              </div>
            </div>

            {/* Social proof stats */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 32, marginBottom: 32 }}>
              {[
                { label: 'Happy Customers', value: formatNumber(brand.socialProof.customers) },
                { label: 'Average Rating', value: `${brand.socialProof.rating}/5 ⭐` },
                { label: 'Products', value: brand.socialProof.products.toString() },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <Link href={`#products`} style={{ display: 'inline-block', padding: '14px 32px', background: `linear-gradient(135deg, ${C.accent}, #D4A574)`, color: '#fff', borderRadius: 12, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              Shop {brand.name} →
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

          {/* ── Section 1: Brand Story ──────────────────────────────────── */}
          <section style={{ padding: '48px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 16 }}>Brand Story</h2>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, lineHeight: 1.8, marginBottom: 20 }}>{brand.description}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, lineHeight: 1.8 }}>{brand.philosophy}</p>
              </div>
              <div>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Certifications & Standards</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {brand.certifications.map((cert, i) => (
                    <span key={i} style={{ background: `${C.teal}12`, color: C.teal, border: `1px solid ${C.teal}30`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                      ✓ {cert}
                    </span>
                  ))}
                </div>

                {/* Skin focus */}
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '24px 0 14px' }}>Skin Focus</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {brand.skinFocus.map((focus, i) => (
                    <span key={i} style={{ background: C.cream, color: C.dark, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Brand Stats ──────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { icon: '📅', label: 'Founded', value: brand.founded },
                { icon: '🌏', label: 'Origin', value: brand.origin },
                { icon: '💰', label: 'Price Range', value: brand.priceRange },
                { icon: '📦', label: 'Products on DermIQ', value: brandProducts.length > 0 ? `${brandProducts.length} products` : 'Coming Soon' },
              ].map((stat, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: All Products ─────────────────────────────────── */}
          <section id="products" style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 8 }}>All Products</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, marginBottom: 20 }}>{brandProducts.length} product{brandProducts.length !== 1 ? 's' : ''} from {brand.name}</p>

            {brandProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.dark, marginBottom: 8 }}>Coming Soon</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, maxWidth: 400, margin: '0 auto' }}>
                  We are adding {brand.name} products to DermIQ. Check back soon or browse similar products.
                </p>
                <Link href="/shop" style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', background: C.teal, color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Browse All Products</Link>
              </div>
            ) : (
              <>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                      padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      border: activeCategory === cat ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                      background: activeCategory === cat ? C.teal : '#fff',
                      color: activeCategory === cat ? '#fff' : C.dark,
                    }}>{cat}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {filtered.map(product => (
                    <div key={product.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{ aspectRatio: '1', overflow: 'hidden', background: C.cream }}>
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, marginBottom: 4 }}>{product.category}</p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, lineHeight: 1.3, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                            <Stars n={product.rating} />
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu }}>({product.reviews})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark }}>₹{product.price}</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, textDecoration: 'line-through' }}>₹{product.mrp}</span>
                          </div>
                        </div>
                      </Link>
                      <div style={{ padding: '0 16px 16px' }}>
                        <button onClick={() => addToCart(product)} style={{ width: '100%', padding: '10px', background: C.teal, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── Section 4: Bestsellers ──────────────────────────────────── */}
          {bestsellers.length > 0 && (
            <section style={{ padding: '0 0 48px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>🏆 Bestsellers</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {bestsellers.map(product => {
                  const disc = Math.round((1 - product.price / product.mrp) * 100)
                  return (
                    <div key={product.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: C.cream }}>
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {product.badge && (
                          <span style={{ position: 'absolute', top: 12, left: 12, background: product.badgeBg || C.dark, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{product.badge}</span>
                        )}
                        <span style={{ position: 'absolute', top: 12, right: 12, background: C.accent, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{disc}% OFF</span>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, marginBottom: 4 }}>{product.category}</p>
                        <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, color: C.dark, lineHeight: 1.4, marginBottom: 8 }}>{product.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <Stars n={product.rating} />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu }}>{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: C.dark }}>₹{product.price}</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, textDecoration: 'line-through' }}>₹{product.mrp}</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.green, fontWeight: 600 }}>Save ₹{product.mrp - product.price}</span>
                        </div>
                        <button onClick={() => addToCart(product)} style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 12px rgba(45,95,90,0.3)' }}>
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Section 5: Formulation Principles ──────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>🧪 About the Formulation</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {brand.principles.map((principle, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 22px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{principle.icon}</div>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 10 }}>{principle.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, lineHeight: 1.6, margin: 0 }}>{principle.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 6: Customer Reviews ─────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>💬 Customer Reviews</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start' }}>
              {/* Rating distribution */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: C.dark }}>{brand.socialProof.rating}</div>
                  <Stars n={brand.socialProof.rating} />
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, marginTop: 4 }}>{totalRatings} ratings</div>
                </div>
                {ratingCounts.map(r => (
                  <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, minWidth: 12, textAlign: 'right' }}>{r.stars}</span>
                    <span style={{ fontSize: 12 }}>★</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalRatings > 0 ? (r.count / totalRatings) * 100 : 0}%`, background: C.gold, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, minWidth: 16 }}>{r.count}</span>
                  </div>
                ))}
              </div>

              {/* Review cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {brand.reviews.map((review, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.teal2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700 }}>
                          {review.name[0]}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: C.dark, margin: 0 }}>{review.name}</p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '2px 0 0' }}>Skin type: {review.skin}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Stars n={review.rating} />
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, margin: '2px 0 0' }}>{review.date}</p>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .brand-story-grid { grid-template-columns: 1fr !important; }
          .brand-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .brand-principles-grid { grid-template-columns: 1fr !important; }
          .brand-reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <MobileToolbar activePage="shop" />
    </div>
  )
}
