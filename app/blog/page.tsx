'use client'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'

export const BLOG_POSTS = [
  {
    slug: 'simple-3-step-skincare-routine',
    title: 'How to Build a Simple 3-Step Skincare Routine',
    category: 'Skincare Basics',
    categoryColor: '#2D5F5A',
    readTime: '4 min read',
    date: 'March 15, 2026',
    author: 'Dr. Aisha Kapoor',
    authorRole: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=500&fit=crop&q=80',
    excerpt: 'Overwhelmed by skincare? You don\'t need 12 steps. We break down the only 3 steps your skin truly needs — and the science behind them.',
    content: `If you've spent any time on skincare forums or TikTok, you've probably seen elaborate 10-step routines. But here's the truth that dermatologists know: the most effective routines are the ones you'll actually do consistently.

**The Golden Rule: Cleanse → Moisturise → Protect**

**Step 1: Cleanse (Morning & Night)**
The goal of cleansing is simple — remove what shouldn't be on your skin: pollution, excess oil, sunscreen, makeup, and dead skin cells. But the method matters enormously.

Reach for a gentle, pH-balanced cleanser. Your skin's natural pH is around 5.5 — a slightly acidic environment that keeps the microbiome healthy. Harsh alkaline soaps (most bar soaps have a pH of 9-10) strip away this acid mantle, causing dryness and making skin more reactive.

Look for amino acid-based surfactants or micellar cleansers. Avoid anything with sodium lauryl sulfate (SLS) if you have dry or sensitive skin.

**Step 2: Moisturise (Morning & Night)**
Moisturiser isn't just for dry skin. Even oily skin needs a moisturiser — the right one. Why? Because when skin is dehydrated, sebaceous glands overcompensate by producing more oil.

The key ingredients to look for:
- **Humectants** (draw water in): Hyaluronic Acid, Glycerin, Sodium PCA
- **Emollients** (smooth the surface): Squalane, Niacinamide, Ceramides
- **Occlusives** (lock moisture in): Dimethicone, Shea Butter

For oily skin: a lightweight gel-moisturiser with hyaluronic acid is ideal.
For dry skin: a cream with ceramides and shea butter.
For sensitive skin: fragrance-free with centella asiatica.

**Step 3: Protect — SPF Every Single Morning**
This is non-negotiable. UV radiation is responsible for up to 80% of visible skin aging — fine lines, dark spots, textural changes. And in India, where UV index regularly reaches 8-10, this matters even more.

SPF 50+ PA++++ provides adequate protection. Apply 1/4 teaspoon (about 2 finger lengths) to face alone. Reapply every 2-3 hours when outdoors.

Once you've mastered these 3 steps for 4-6 weeks, your skin will be in a better baseline state. Only then add actives like Vitamin C or Retinol.

**The Hardest Part**
The hardest part isn't choosing products — it's consistency. A simple routine done daily for 3 months will outperform an elaborate routine done occasionally. Start simple. Stay consistent. Your skin will thank you.`,
    tags: ['beginners', 'routine', 'cleansing', 'spf', 'moisturiser'],
    relatedProductIds: [4, 2, 3],
  },
  {
    slug: 'niacinamide-vs-vitamin-c',
    title: 'Niacinamide vs Vitamin C — Can You Mix Them?',
    category: 'Ingredients Guide',
    categoryColor: '#5C35D4',
    readTime: '5 min read',
    date: 'March 10, 2026',
    author: 'Priya Nair',
    authorRole: 'Product Scientist',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=500&fit=crop&q=80',
    excerpt: 'The internet is divided on this. Some say never combine them. Others use both together. We look at the actual science.',
    content: `Few skincare ingredient debates have been more hotly contested than Niacinamide vs Vitamin C. Can you use them together? Will they cancel each other out? Will they cause a reaction?

Let's look at the actual science and cut through the confusion.

**The Myth: They Neutralise Each Other**
The concern that Niacinamide and Vitamin C are incompatible comes from older chemistry research. In 1960, it was observed that niacin (a metabolite of niacinamide) and ascorbic acid (Vitamin C) can form a yellow compound called niacin-ascorbate, which is sometimes yellow or orange.

However, this reaction requires very specific conditions: high concentrations (above 5%), prolonged exposure, and typically heat. In typical skincare formulas applied briefly to skin, this reaction is negligible.

**The Reality in Modern Formulas**
Modern stabilised Vitamin C formulas — especially those using Ascorbyl Glucoside, MAP (Magnesium Ascorbyl Phosphate), or encapsulated Ascorbic Acid — are far less reactive. Using stable derivatives, this concern is essentially eliminated.

Even with pure L-Ascorbic Acid, dermatologists who've studied this extensively (including Dr. Leslie Baumann) have found no significant real-world concern for consumers.

**How to Layer Them If You're Still Concerned**
If you want to be cautious, use them at different times:
- **AM**: Vitamin C serum → moisturiser → SPF
- **PM**: Niacinamide serum → moisturiser

This approach also means each ingredient gets maximum skin contact time without any potential interaction.

**What They Each Do**
- **Vitamin C (Ascorbic Acid)**: Antioxidant, brightens dark spots, boosts collagen synthesis, protects from free radical damage. Best used in AM before SPF.
- **Niacinamide (B3)**: Minimises pores, reduces sebum, fades post-acne marks, strengthens skin barrier, reduces redness. Works AM and PM.

**Our Verdict**
Using both in the same routine is fine for most people. If you use pure L-Ascorbic Acid and want to be extra cautious, use them at different times of day. But don't be afraid to use both — they address different concerns and together provide excellent results for brightening and barrier support.`,
    tags: ['niacinamide', 'vitamin-c', 'ingredients', 'layering', 'science'],
    relatedProductIds: [1, 7, 10],
  },
  {
    slug: 'truth-about-spf-indian-skin',
    title: 'The Truth About SPF: What Indian Skin Needs',
    category: 'Sun Protection',
    categoryColor: '#C8976A',
    readTime: '6 min read',
    date: 'March 5, 2026',
    author: 'Dr. Aisha Kapoor',
    authorRole: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=500&fit=crop&q=80',
    excerpt: 'Indian skin tones are more resilient to sunburn but still highly vulnerable to UV damage. Here\'s what SPF number you really need.',
    content: `There's a dangerous myth in India: "I don't burn, so I don't need sunscreen." This thinking has contributed to India having one of the highest rates of skin cancer in Asia, along with rampant hyperpigmentation, premature aging, and melasma.

The truth is nuanced: Indian skin tones (Fitzpatrick types III-VI) are indeed more resistant to sunburn thanks to higher melanin content. But melanin is not a complete shield. UVA rays — which don't cause burning — penetrate all skin tones equally and are responsible for:
- Collagen breakdown (aging, wrinkles)
- DNA damage (skin cancer risk)
- Triggering melanin overproduction (dark spots, melasma)

**What Do the SPF Numbers Mean?**
SPF measures protection against UVB rays only (the rays that cause burning). SPF 15 blocks ~93% of UVB, SPF 30 blocks ~97%, and SPF 50 blocks ~98%. Beyond SPF 50, the difference becomes negligible.

PA ratings (PA+, PA++, PA+++, PA++++) measure UVA protection — critical for Indian skin. Look for PA+++ or PA++++ minimum.

**Mineral vs Chemical Sunscreen**
- **Mineral (physical)**: Contains Zinc Oxide and/or Titanium Dioxide. Works by reflecting UV rays. Gentler for sensitive skin, but older formulas leave a white cast — particularly visible on deeper skin tones.
- **Chemical**: Absorbs and converts UV into heat. Generally lighter on skin but some ingredients can irritate sensitive skin.
- **Hybrid**: Combines both — the best of both worlds and typically the most cosmetically elegant.

**The White Cast Problem**
For years, this was the biggest barrier to sunscreen adoption for Brown and Black skin tones. Modern micronised mineral formulas, hybrid formulas, and tinted sunscreens have largely solved this. Look specifically for "invisible," "for Indian skin," or "no white cast" on the label.

**How Much to Apply**
Most people apply only 25-50% of the required amount, effectively halving their protection. The gold standard is:
- 2mg/cm² — for the face alone, this translates to about 1/4 teaspoon or roughly 2 finger lengths.
- Reapply every 2-3 hours when outdoors, after swimming, or excessive sweating.

**Our Recommended Approach for Indian Skin**
1. Choose SPF 50 PA++++ (non-negotiable in India)
2. Opt for hybrid or micronised mineral for no white cast
3. Look for additional skin benefits: Niacinamide for oil control, antioxidants for pollution protection
4. Apply generously — more than you think you need
5. Reapply throughout the day`,
    tags: ['spf', 'sunscreen', 'indian-skin', 'pa-rating', 'uva-uvb'],
    relatedProductIds: [3, 9],
  },
  {
    slug: 'haircare-routine-monsoon',
    title: 'Haircare Routine for Monsoon Season',
    category: 'Hair Care',
    categoryColor: '#5C35D4',
    readTime: '5 min read',
    date: 'February 28, 2026',
    author: 'Priya Nair',
    authorRole: 'Product Scientist',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop&q=80',
    excerpt: 'Humidity makes hair frizzy and scalp conditions worse. Here\'s the complete monsoon hair routine that actually works.',
    content: `Monsoon is arguably the worst season for hair in India. Humidity levels of 80-90%+ create a perfect storm: frizz, fungal scalp conditions, increased hair fall, and that perpetually damp feeling. Here's how to manage it.

**Understanding What Humidity Does to Hair**
Hair is hygroscopic — it readily absorbs moisture from the air. When the protein structure (keratin) in hair absorbs excess humidity, hydrogen bonds form randomly across the hair shaft, causing the strands to swell and curl unpredictably — that's frizz.

For scalp, high humidity means excess sweating and oil production, which creates a breeding ground for Malassezia fungus — the main cause of dandruff.

**Monsoon Hair Routine**

**Shampoo more frequently (but gently)**
During monsoon, wash hair every 2-3 days instead of twice a week. Use a sulphate-free clarifying shampoo to remove sweat, excess oil, and any fungal buildup. Look for anti-dandruff ingredients like Zinc Pyrithione or Ketoconazole if you're dandruff-prone.

**Deep condition — but strategically**
Use a protein hair mask once a week to strengthen the hair shaft and create a temporary barrier against humidity. However, avoid heavy silicone-rich products that can accumulate in humid conditions.

**Scalp oil — pre-wash only**
Apply scalp oils (Bhringraj, Neem, Tea Tree) before washing, not after. Oils left on the scalp in humid conditions can exacerbate fungal issues.

**Anti-humidity serum**
Apply a lightweight anti-frizz serum to damp hair before drying. Look for humectants balanced with occlusives — Glycerin + Dimethicone combination works well. Avoid pure humectant serums (glycerin-only) in high humidity, as they'll actually pull more moisture into hair.

**Dry your hair properly**
Never step out with wet hair in monsoon. The combination of outdoor humidity and already-wet hair maximises frizz. Microfibre towel dry, then use a diffuser or cool air dryer.

**Diet considerations**
Monsoon often brings reduced sunlight exposure, lowering Vitamin D levels — linked to increased hair fall. Consider supplementing with Vitamin D3 and Biotin during this season.`,
    tags: ['haircare', 'monsoon', 'frizz', 'dandruff', 'humidity'],
    relatedProductIds: [60, 61, 62, 63],
  },
  {
    slug: 'baby-skin-ingredients-to-avoid',
    title: 'Baby Skin 101: What Ingredients to Avoid',
    category: 'Baby Care',
    categoryColor: '#4ECDC4',
    readTime: '7 min read',
    date: 'February 20, 2026',
    author: 'Dr. Aisha Kapoor',
    authorRole: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=500&fit=crop&q=80',
    excerpt: 'Baby skin absorbs up to 40% more of what\'s applied to it. Here are the ingredients to absolutely avoid in baby products.',
    content: `Baby skin is fundamentally different from adult skin. It's thinner, more permeable, and has an immature barrier function — meaning it absorbs much more of what you apply to it. A 2019 study found that infant skin can absorb up to 40% more of certain chemicals compared to adult skin.

This makes ingredient selection in baby products critically important. Here's what to avoid.

**Fragrance (Parfum)**
The number one trigger for allergic reactions in babies. Fragrance is a blanket term that can contain hundreds of different chemicals — many of which are known allergens. The EU has identified 26 fragrance allergens that must be disclosed individually, but in India, regulations are less stringent.

Even "natural" fragrances like lavender oil, chamomile, or citrus can cause sensitisation in babies. Choose fragrance-free products only.

**Parabens (Methylparaben, Propylparaben)**
Parabens are preservatives with oestrogenic activity — meaning they can mimic oestrogen in the body. While the data on harm at typical exposure levels is still debated, many paediatricians recommend avoiding them in babies under 2 years as a precaution.

**Phthalates**
Often found as "fragrance" components, phthalates are endocrine disruptors. They're banned in cosmetics across the EU but still appear in some products in India. Look specifically for phthalate-free labelling.

**Talc (Powder)**
Baby talcum powder is now understood to be a significant inhalation risk. Fine talc particles can reach the lungs and cause respiratory problems. Most paediatric organisations worldwide now recommend against talcum powder for babies. Use cornstarch-based powders if needed, applied carefully away from the face.

**Sodium Lauryl Sulfate (SLS)**
A harsh surfactant that disrupts skin barrier and can cause contact dermatitis in sensitive skin. While tolerated by most adults, it's inappropriate for baby skin. Use sodium cocoyl isethionate or glucoside-based cleansers instead.

**Chemical UV Filters**
Oxybenzone and octinoxate are chemical sunscreen ingredients that can be absorbed through baby's thin skin. For babies under 6 months, avoid sunscreen entirely and keep out of direct sun. For babies 6 months+, use only mineral sunscreens with non-nano Zinc Oxide.

**Alcohol (Denat.)**
Denatured alcohol is drying and potentially irritating for baby skin. It appears in some hand sanitisers and toners — avoid these for babies.

**What to Look For Instead**
- Certified organic or natural ingredients with minimal processing
- Colloidal oat (Avena sativa) — proven skin-soothing
- Calendula extract — anti-inflammatory and soothing
- Gentle coconut-derived or amino acid cleansers
- Ceramides — identical to those in healthy skin barrier
- Fragrance-free, dye-free, hypoallergenic certifications`,
    tags: ['baby-care', 'baby-skin', 'ingredients', 'safety', 'newborn'],
    relatedProductIds: [80, 81, 82, 83],
  },
  {
    slug: 'understanding-skin-types-guide',
    title: 'Understanding Skin Types: A Complete Guide',
    category: 'Skincare Basics',
    categoryColor: '#2D5F5A',
    readTime: '6 min read',
    date: 'February 12, 2026',
    author: 'Priya Nair',
    authorRole: 'Product Scientist',
    image: 'https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?w=800&h=500&fit=crop&q=80',
    excerpt: 'Most people misidentify their skin type — and it leads to wrong products and frustration. Here\'s how to identify yours correctly.',
    content: `Knowing your skin type is the foundation of all skincare. Get this wrong, and everything else follows — wrong products, wrong routine, poor results, frustration.

Research suggests that up to 60% of people misidentify their skin type. Most commonly, people with dehydrated skin (lacking water) confuse it with dry skin (lacking oil), and oily-dehydrated skin is frequently misidentified as combination or oily.

**The 5 Skin Types**

**1. Normal Skin**
Relatively balanced sebum and hydration. Small pores, minimal blemishes, and rarely experiences sensitivity. This is actually the least common skin type — most people fall into other categories even if they think they're "normal."

Signs: Even texture, no visible pores, no shine or tightness, skin comfortable throughout the day.

**2. Oily Skin**
Overactive sebaceous glands producing excess sebum. Often has enlarged pores and is prone to blackheads and acne. However, oily skin tends to age better — the extra oil provides some protection.

Signs: Visible shine on nose/forehead/cheeks by midday, enlarged pores, frequent breakouts.

**3. Dry Skin**
Sebaceous glands produce insufficient oil. This is fundamentally different from dehydration (lack of water). Dry skin lacks lipids — ceramides, fatty acids, cholesterol — that form the protective barrier.

Signs: Tight feeling after cleansing, flaky or rough patches, dull appearance, visible fine lines even in young skin.

**4. Combination Skin**
The T-zone (forehead, nose, chin) is oily while the cheeks are dry or normal. This is actually the most common skin type. The cause is that sebaceous gland density varies significantly across the face.

Signs: Oily nose/forehead, possibly dry or flaky cheeks, may need different products for different zones.

**5. Sensitive Skin**
Less a skin type and more a skin condition. Sensitive skin reacts easily to products, environmental triggers, or lifestyle factors. It can co-exist with any of the above types.

Signs: Stinging or burning when applying products, redness, flushing, visible capillaries, rash-like reactions.

**The Dehydration Confusion**
Dehydration is a skin condition (lack of water), not a skin type. Any skin type can be dehydrated. The signs: skin feels tight but looks normal or oily, fine lines appear when skin is pinched, a dull or grey undertone.

Dehydrated skin needs humectants (hyaluronic acid, glycerin), not necessarily heavy creams.

**How to Identify Your Type Accurately**
1. Wash your face with a gentle cleanser
2. Pat dry — don't apply anything
3. Wait 1 hour
4. Examine your skin in natural light

What you see after that hour is your true skin type undistorted by products.`,
    tags: ['skin-types', 'beginners', 'oily', 'dry', 'combination', 'dehydration'],
    relatedProductIds: [4, 2, 6, 7],
  },
]

export default function BlogPage() {
  const featured = BLOG_POSTS[0]
  const rest = BLOG_POSTS.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#C8976A', letterSpacing: 1.5, textTransform: 'uppercase' }}>DermIQ Journal</span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, color: '#1A2E2B', margin: '12px 0 12px' }}>
            Skin Science, Simplified
          </h1>
          <p style={{ color: '#6B7280', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
            Evidence-based articles by dermatologists and product scientists — written for real people, not academics.
          </p>
        </div>

        {/* Featured Article */}
        <Link href={`/blog/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 48 }}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E8E0D8', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
          >
            <div style={{ height: 360, position: 'relative' }}>
              <Image src={featured.image} alt={featured.title} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 20, left: 20, background: featured.categoryColor, color: '#fff', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
                Featured
              </div>
            </div>
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ background: `${featured.categoryColor}18`, color: featured.categoryColor, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{featured.category}</span>
                <span style={{ color: '#9CA3AF', fontSize: 12 }}>{featured.readTime}</span>
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 12, lineHeight: 1.3 }}>{featured.title}</h2>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2D5F5A, #C8976A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {featured.author[0]}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A2E2B' }}>{featured.author}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{featured.date}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Rest of articles */}
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#1A2E2B', marginBottom: 24 }}>All Articles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', overflow: 'hidden', transition: 'box-shadow 0.2s', height: '100%' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ height: 200, position: 'relative' }}>
                  <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px 20px 24px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ background: `${post.categoryColor}18`, color: post.categoryColor, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{post.category}</span>
                    <span style={{ color: '#9CA3AF', fontSize: 11 }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 8, lineHeight: 1.35 }}>{post.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: post.categoryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                        {post.author[0]}
                      </div>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{post.author}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{post.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <MobileToolbar />
    </div>
  )
}
