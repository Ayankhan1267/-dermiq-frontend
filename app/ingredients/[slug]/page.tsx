'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import CartDrawer from '@/components/CartDrawer'
import { ALL_PRODUCTS } from '@/lib/products'

const C = {
  teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280',
  border: '#E8E0D8', cream: '#F7F3EE', bg: '#FAFAF8', accent: '#C8976A',
  green: '#10B981', red: '#EF4444', gold: '#D4A853',
}

// ── Ingredient Data ─────────────────────────────────────────────────────────
type IngredientData = {
  name: string; slug: string; emoji: string; tagline: string; category: string
  heroColor: string; rating: number; safetyScore: number; efficacyScore: number
  description: string; howItWorks: string; benefits: string[]; concerns: string[]
  bestFor: string[]; notFor: string[]; concentration: string
  pairsWith: { name: string; reason: string }[]
  avoidWith: { name: string; reason: string }[]
  studyCount: number; productCount: number; funFact: string
  studies: { title: string; journal: string; year: number; finding: string }[]
}

const INGREDIENTS_DATA: Record<string, IngredientData> = {
  niacinamide: {
    name: 'Niacinamide', slug: 'niacinamide', emoji: '🔬', tagline: 'The multi-tasker your routine needs',
    category: 'Active', heroColor: '#2D5F5A',
    rating: 9.4, safetyScore: 9, efficacyScore: 9,
    description: 'Niacinamide (Vitamin B3) is one of the most researched and well-tolerated actives in skincare. It addresses a wide range of skin concerns simultaneously — from enlarged pores and uneven tone to oil control and barrier repair. Suitable for virtually all skin types, including sensitive and acne-prone skin.',
    howItWorks: 'Niacinamide inhibits the transfer of melanosomes from melanocytes to keratinocytes, reducing pigmentation. It simultaneously increases ceramide production to strengthen the skin barrier and regulates sebum secretion by reducing lipase activity in sebaceous glands.',
    benefits: ['Visibly minimises pore appearance', 'Controls excess oil and shine', 'Fades dark spots and hyperpigmentation', 'Strengthens and repairs skin barrier', 'Reduces redness and blotchiness', 'Smoothens skin texture'],
    concerns: ['Large pores', 'Oily skin', 'Uneven tone', 'Hyperpigmentation', 'Redness', 'Dull skin'],
    bestFor: ['Oily skin', 'Combination skin', 'Acne-prone skin', 'Sensitive skin', 'All skin types'],
    notFor: ['Niacinamide flush-prone individuals at >10%'],
    concentration: '2–10% effective range (5% optimal)',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'Boosts hydration while niacinamide works on tone' },
      { name: 'Salicylic Acid', reason: 'Targets acne and minimises pores together' },
      { name: 'SPF', reason: 'Niacinamide enhances photoprotection benefits' },
      { name: 'Ceramides', reason: 'Together they form a barrier-repair powerhouse' },
    ],
    avoidWith: [
      { name: 'Vitamin C (same step)', reason: 'May form niacin causing temporary flushing at high concentrations' },
    ],
    studyCount: 47, productCount: 12, funFact: 'Niacinamide was originally researched as a treatment for pellagra, a vitamin B3 deficiency disease, before dermatologists discovered its remarkable skin benefits.',
    studies: [
      { title: 'Topical niacinamide reduces sebum production', journal: 'International Journal of Dermatology', year: 2006, finding: '5% niacinamide significantly reduced sebum excretion rate after 4 weeks' },
      { title: 'Niacinamide and hyperpigmentation', journal: 'British Journal of Dermatology', year: 2002, finding: '5% niacinamide reduced hyperpigmentation vs vehicle in 8-week split face study' },
      { title: 'Barrier function improvement', journal: 'Journal of Cosmetic Dermatology', year: 2008, finding: 'Ceramide synthesis increased 34% with regular niacinamide application' },
    ],
  },
  'vitamin-c': {
    name: 'Vitamin C', slug: 'vitamin-c', emoji: '🍊', tagline: 'Nature\'s most powerful brightening antioxidant',
    category: 'Active', heroColor: '#C8793A',
    rating: 9.2, safetyScore: 7, efficacyScore: 10,
    description: 'Vitamin C (L-Ascorbic Acid) is the gold standard brightening ingredient in skincare, backed by decades of clinical research. It works as a potent antioxidant, neutralising free radicals from UV exposure and pollution while actively inhibiting melanin synthesis. Consistent use over 8–12 weeks delivers measurable improvements in skin radiance.',
    howItWorks: 'L-Ascorbic Acid inhibits tyrosinase — the enzyme responsible for melanin production — reducing pigment formation at the source. It also stimulates collagen synthesis by stabilising the proline and lysine residues in procollagen, and donates electrons to neutralise reactive oxygen species.',
    benefits: ['Fades dark spots and sun damage', 'Brightens dull, uneven skin tone', 'Stimulates collagen production', 'Neutralises free radical damage', 'Protects against UV-induced aging', 'Improves skin elasticity'],
    concerns: ['Dark spots', 'Sun damage', 'Dull skin', 'Uneven tone', 'Anti-aging', 'Loss of firmness'],
    bestFor: ['Normal skin', 'Dry skin', 'Combination skin', 'Mature skin'],
    notFor: ['Very sensitive skin (start low)', 'Rosacea (may irritate)', 'Broken skin barrier'],
    concentration: '10–20% effective range (15% optimal)',
    pairsWith: [
      { name: 'Ferulic Acid', reason: 'Stabilises Vitamin C and doubles its antioxidant potency' },
      { name: 'Vitamin E', reason: 'Creates a synergistic antioxidant trio' },
      { name: 'SPF', reason: 'Sunscreen extends and multiplies Vitamin C protection' },
      { name: 'Hyaluronic Acid', reason: 'Adds hydration to counteract potential dryness' },
    ],
    avoidWith: [
      { name: 'Niacinamide (same step)', reason: 'Can form niacin at high concentrations, causing flushing' },
      { name: 'Benzoyl Peroxide', reason: 'Oxidises and degrades Vitamin C molecules' },
      { name: 'Retinol (same step)', reason: 'Different pH requirements, use separately AM/PM' },
    ],
    studyCount: 89, productCount: 8, funFact: 'Vitamin C is one of the few skincare ingredients that has been proven effective by pharmaceutical-grade double-blind clinical trials, not just cosmetic studies.',
    studies: [
      { title: 'Topical ascorbic acid for photoaging', journal: 'Dermatologic Surgery', year: 2001, finding: '15% Vitamin C improved photoaged skin scores by 73% vs placebo at 12 weeks' },
      { title: 'Collagen synthesis stimulation', journal: 'Journal of Investigative Dermatology', year: 2003, finding: 'Ascorbic acid increased collagen I synthesis by 8-fold in dermal fibroblasts' },
      { title: 'Melanin inhibition study', journal: 'Pigment Cell Research', year: 2005, finding: 'Topical Vitamin C reduced melanin content by 40% in UVB-irradiated skin' },
    ],
  },
  'hyaluronic-acid': {
    name: 'Hyaluronic Acid', slug: 'hyaluronic-acid', emoji: '💧', tagline: 'The ultimate hydration molecule',
    category: 'Moisturiser', heroColor: '#1E6B8C',
    rating: 9.5, safetyScore: 10, efficacyScore: 9,
    description: 'Hyaluronic Acid (HA) is a naturally occurring molecule in the human body that can hold up to 1,000 times its weight in water. As a skincare ingredient, it is the benchmark for hydration, attracting moisture from the environment and deeper skin layers to the surface. Safe for all skin types, including pregnant women and sensitive skin.',
    howItWorks: 'HA is a glycosaminoglycan that binds water molecules through hydrogen bonds. Multi-molecular weight formulas use low molecular weight HA (penetrates into dermis for deep hydration), medium MW HA (hydrates epidermis), and high MW HA (forms a moisture-locking film on the surface).',
    benefits: ['Instantly plumps and hydrates skin', 'Reduces appearance of fine lines', 'Improves skin elasticity and bounce', 'Supports natural skin barrier function', 'Soothes irritation and redness', 'Non-comedogenic hydration'],
    concerns: ['Dehydration', 'Dry skin', 'Fine lines', 'Dullness', 'Sensitivity', 'Tight feeling'],
    bestFor: ['Dry skin', 'Dehydrated skin', 'Sensitive skin', 'Mature skin', 'All skin types'],
    notFor: ['Very dry climates without occlusive (can draw moisture out)'],
    concentration: '0.1–2% effective range',
    pairsWith: [
      { name: 'Niacinamide', reason: 'Enhances barrier alongside hydration' },
      { name: 'Ceramides', reason: 'Seals in HA moisture for longer-lasting results' },
      { name: 'Glycerin', reason: 'Both humectants work synergistically for maximum hydration' },
      { name: 'Vitamin C', reason: 'HA counteracts Vitamin C dryness' },
    ],
    avoidWith: [
      { name: 'Nothing significant', reason: 'HA is one of the most compatible ingredients in skincare' },
    ],
    studyCount: 62, productCount: 15, funFact: 'A single gram of hyaluronic acid can hold up to 6 litres of water — it is one of nature\'s most effective humectants.',
    studies: [
      { title: 'HA cream reduces wrinkle depth', journal: 'Journal of Clinical and Aesthetic Dermatology', year: 2014, finding: '0.1% HA cream reduced wrinkle depth by 40% after 8 weeks' },
      { title: 'Multi-weight HA penetration study', journal: 'Dermatologica Sinica', year: 2016, finding: 'Low MW HA (20 kDa) penetrated into viable epidermis vs high MW staying at surface' },
      { title: 'HA and skin elasticity', journal: 'Journal of Drugs in Dermatology', year: 2011, finding: '0.1% HA significantly improved skin firmness and elasticity after 60 days' },
    ],
  },
  retinol: {
    name: 'Retinol', slug: 'retinol', emoji: '⚗️', tagline: 'The gold standard anti-aging active',
    category: 'Active', heroColor: '#7B3D6E',
    rating: 9.6, safetyScore: 6, efficacyScore: 10,
    description: 'Retinol (Vitamin A) remains the most clinically proven anti-aging ingredient in skincare. It accelerates cellular turnover, stimulates collagen production, and normalises skin cell differentiation. While powerful, it requires careful introduction to avoid the initial adjustment period known as "retinization".',
    howItWorks: 'Retinol is converted to retinoic acid in the skin via two oxidation steps. Retinoic acid binds to nuclear retinoid receptors (RAR and RXR) in keratinocytes, normalising cell turnover. This process increases collagen synthesis, reduces MMP (matrix metalloproteinase) activity, and fades pigmentation by dispersing melanin granules.',
    benefits: ['Accelerates skin cell turnover', 'Stimulates collagen and elastin production', 'Reduces fine lines and wrinkles', 'Fades pigmentation and age spots', 'Unclogs and minimises pores', 'Smoothens overall skin texture'],
    concerns: ['Fine lines', 'Wrinkles', 'Loss of firmness', 'Uneven texture', 'Hyperpigmentation', 'Large pores'],
    bestFor: ['Normal skin', 'Oily skin', 'Mature skin (30+)', 'Anti-aging focus'],
    notFor: ['Pregnant/breastfeeding women', 'Very sensitive skin', 'Active rosacea', 'Broken skin'],
    concentration: '0.025–1% (start 0.025%, work up to 0.5%)',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'Counteracts retinol dryness and irritation' },
      { name: 'Ceramides', reason: 'Strengthens barrier compromised during retinization' },
      { name: 'Niacinamide', reason: 'Reduces redness and supports barrier during adjustment' },
      { name: 'SPF', reason: 'Essential — retinol increases photosensitivity' },
    ],
    avoidWith: [
      { name: 'Vitamin C (same step)', reason: 'Different pH levels, apply separately AM/PM' },
      { name: 'AHA/BHA (same step)', reason: 'Too much exfoliation combined, can damage barrier' },
      { name: 'Benzoyl Peroxide', reason: 'Degrades retinol molecules' },
    ],
    studyCount: 134, productCount: 6, funFact: 'Retin-A (prescription-strength tretinoin) was approved by the FDA in 1971 to treat acne — its anti-aging benefits were discovered accidentally by patients who noticed skin looking younger.',
    studies: [
      { title: 'Retinol and collagen synthesis', journal: 'Journal of Investigative Dermatology', year: 2007, finding: '0.4% retinol cream increased collagen I by 80% vs vehicle at 24 weeks' },
      { title: 'Fine line reduction meta-analysis', journal: 'JAMA Dermatology', year: 2019, finding: 'Retinol 0.1–1% significantly reduced periorbital wrinkle depth in 8/9 reviewed trials' },
      { title: 'Retinol vs photoaging', journal: 'Archives of Dermatology', year: 1995, finding: '0.1% retinol corrected fine wrinkling and mottled hyperpigmentation in 36 weeks' },
    ],
  },
  'salicylic-acid': {
    name: 'Salicylic Acid', slug: 'salicylic-acid', emoji: '⚡', tagline: 'The acne-fighter that goes deep',
    category: 'Exfoliant', heroColor: '#5A2D2D',
    rating: 9.0, safetyScore: 8, efficacyScore: 9,
    description: 'Salicylic Acid is the only BHA (Beta-Hydroxy Acid) commonly used in skincare and is uniquely effective against acne because it is oil-soluble. Unlike AHAs that work on the surface, SA penetrates into pores, dissolving the sebum and dead cell mixture that causes blackheads, whiteheads, and inflammatory acne.',
    howItWorks: 'As a lipophilic acid, salicylic acid dissolves in oil, allowing it to penetrate sebum-filled follicles. Inside the pore, it performs corneolysis — breaking down the desmosomes between corneocytes to loosen compacted dead cells. It also has keratolytic and anti-inflammatory properties via inhibition of prostaglandin synthesis.',
    benefits: ['Unclogs pores and removes blackheads', 'Prevents new acne formation', 'Reduces oiliness and shine', 'Exfoliates and refines skin texture', 'Has anti-inflammatory properties', 'Reduces post-acne marks'],
    concerns: ['Acne', 'Blackheads', 'Whiteheads', 'Oily skin', 'Large pores', 'Clogged pores'],
    bestFor: ['Oily skin', 'Acne-prone skin', 'Combination skin'],
    notFor: ['Dry skin (can over-dry)', 'Sensitive skin (patch test first)', 'Aspirin allergy', 'Pregnant women (high concentrations)'],
    concentration: '0.5–2% for leave-on; 2–3% for wash-off',
    pairsWith: [
      { name: 'Niacinamide', reason: 'Reduces post-BHA redness and targets oil simultaneously' },
      { name: 'Hyaluronic Acid', reason: 'Restores moisture lost through exfoliation' },
      { name: 'Zinc', reason: 'Complements acne-fighting action' },
      { name: 'SPF', reason: 'Essential as SA increases sun sensitivity' },
    ],
    avoidWith: [
      { name: 'Retinol (same step)', reason: 'Combined exfoliation is too aggressive for barrier' },
      { name: 'AHA (same step)', reason: 'Double exfoliation risks skin irritation and sensitivity' },
      { name: 'Benzoyl Peroxide', reason: 'Can cause excessive dryness and peeling together' },
    ],
    studyCount: 56, productCount: 9, funFact: 'Salicylic acid is derived from willow bark, which has been used since ancient times as a pain reliever — aspirin (acetylsalicylic acid) is a chemical relative.',
    studies: [
      { title: 'SA vs acne vulgaris', journal: 'Journal of Dermatological Science', year: 2004, finding: '2% SA lotion reduced non-inflammatory and inflammatory acne lesions by 50% at 12 weeks' },
      { title: 'Comedolytic effect of BHA', journal: 'Cosmetics and Toiletries', year: 2001, finding: 'Salicylic acid significantly reduced microcomedone count vs control after 8 weeks' },
      { title: 'Sebum regulation study', journal: 'International Journal of Cosmetic Science', year: 2008, finding: '1.5% SA reduced sebum excretion by 23% compared to placebo in 6-week study' },
    ],
  },
  ceramides: {
    name: 'Ceramides', slug: 'ceramides', emoji: '🛡️', tagline: 'Your skin barrier\'s building blocks',
    category: 'Moisturiser', heroColor: '#3D5A78',
    rating: 9.3, safetyScore: 10, efficacyScore: 9,
    description: 'Ceramides are lipids (fats) that make up approximately 50% of the skin\'s outer layer (stratum corneum). They form the "mortar" between skin cells, creating a waterproof barrier that prevents moisture loss and protects against environmental aggressors. Ceramide levels naturally decline with age and are depleted by harsh cleansers.',
    howItWorks: 'Ceramides integrate into the lamellar bodies of keratinocytes during skin cell maturation. In the stratum corneum, they form a complex with cholesterol and free fatty acids (the "triple lipid" structure) to create a water-impermeable barrier. Topical ceramides are taken up by the skin and incorporated into these natural lamellar structures.',
    benefits: ['Repairs and strengthens skin barrier', 'Prevents transepidermal water loss (TEWL)', 'Soothes dry, irritated, and eczema-prone skin', 'Protects against environmental damage', 'Improves overall skin softness', 'Reduces sensitivity and reactivity'],
    concerns: ['Dry skin', 'Eczema', 'Sensitive skin', 'Damaged barrier', 'Redness', 'Flakiness'],
    bestFor: ['Dry skin', 'Sensitive skin', 'Eczema-prone skin', 'Mature skin', 'Post-procedure skin'],
    notFor: ['Not contraindicated for any skin type'],
    concentration: '0.5–1% or as part of lipid complex',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'HA attracts moisture, ceramides lock it in' },
      { name: 'Niacinamide', reason: 'Both promote ceramide synthesis synergistically' },
      { name: 'Cholesterol', reason: 'Completes the triple lipid barrier complex' },
      { name: 'Fatty Acids', reason: 'Mimics the skin\'s natural lipid bilayer exactly' },
    ],
    avoidWith: [
      { name: 'Nothing significant', reason: 'Ceramides are compatible with virtually all skincare actives' },
    ],
    studyCount: 41, productCount: 10, funFact: 'The discovery that ceramides form the skin barrier was made in 1987, fundamentally changing how dermatologists understand eczema and dry skin conditions.',
    studies: [
      { title: 'Ceramide cream for atopic dermatitis', journal: 'Dermatitis', year: 2012, finding: 'Ceramide-dominant barrier repair cream reduced TEWL by 45% vs petrolatum in eczema patients' },
      { title: 'Ceramide depletion with age', journal: 'British Journal of Dermatology', year: 2000, finding: 'Ceramide levels in stratum corneum decrease by 30% between age 30 and 80' },
      { title: 'Topical ceramide uptake', journal: 'Experimental Dermatology', year: 2015, finding: 'Topical ceramide NP was incorporated into native lamellar bodies within 24 hours' },
    ],
  },
  'aha-bha': {
    name: 'AHA / BHA', slug: 'aha-bha', emoji: '✨', tagline: 'Chemical exfoliants for glowing skin',
    category: 'Exfoliant', heroColor: '#6B4A2D',
    rating: 8.8, safetyScore: 7, efficacyScore: 9,
    description: 'AHAs (Alpha-Hydroxy Acids) and BHAs (Beta-Hydroxy Acids) are chemical exfoliants that dissolve the bonds holding dead skin cells together, revealing fresher, brighter skin underneath. Common AHAs include glycolic acid and lactic acid; the primary BHA is salicylic acid. They address different skin concerns and can be combined strategically.',
    howItWorks: 'AHAs are water-soluble acids that work primarily on the skin\'s surface by loosening the ionic bonds between corneocytes in the stratum corneum, allowing dead cells to shed naturally. BHAs are lipid-soluble and can penetrate into sebaceous follicles for deeper pore exfoliation. Both lower skin surface pH to activate exfoliating enzymes.',
    benefits: ['Removes dead skin cell buildup', 'Improves skin texture and radiance', 'Reduces appearance of dark spots', 'Smoothens rough or bumpy skin', 'Unclogs pores (BHA especially)', 'Helps other products absorb better'],
    concerns: ['Dull skin', 'Rough texture', 'Hyperpigmentation', 'Uneven tone', 'Clogged pores', 'Keratosis pilaris'],
    bestFor: ['All skin types (depends on acid choice)', 'Oily skin (BHA)', 'Dry skin (lactic acid AHA)'],
    notFor: ['Broken or compromised barrier', 'Very sensitive skin (start slowly)', 'Before sun exposure without SPF'],
    concentration: 'AHA 5–10%; BHA 0.5–2%',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'Restores hydration after exfoliation' },
      { name: 'SPF', reason: 'Absolutely essential as AHAs increase sun sensitivity by 50%' },
      { name: 'Ceramides', reason: 'Protects barrier integrity alongside exfoliation' },
    ],
    avoidWith: [
      { name: 'Retinol (same step)', reason: 'Excessive exfoliation, use on alternate nights' },
      { name: 'Vitamin C (same step)', reason: 'pH conflict reduces efficacy of both' },
      { name: 'Physical scrubs same day', reason: 'Double exfoliation causes micro-tears' },
    ],
    studyCount: 78, productCount: 7, funFact: 'Cleopatra\'s milk baths were likely an early form of AHA exfoliation — fermented milk contains lactic acid, one of the most popular AHAs used in modern skincare.',
    studies: [
      { title: 'Glycolic acid for photoaging', journal: 'Archives of Dermatology', year: 1996, finding: '8% glycolic acid significantly improved skin texture, fine lines in 22-week study' },
      { title: 'AHA and melasma', journal: 'Journal of the European Academy of Dermatology', year: 2010, finding: 'Combined AHA/vitamin C therapy reduced MASI scores by 60% vs control' },
      { title: 'Lactic acid for dry skin', journal: 'Acta Dermato-Venereologica', year: 1992, finding: '12% lactic acid improved skin hydration and TEWL vs control at 4 weeks' },
    ],
  },
  spf: {
    name: 'SPF / Sunscreen', slug: 'spf', emoji: '☀️', tagline: 'The only anti-aging product proven to work',
    category: 'UV-filter', heroColor: '#C8793A',
    rating: 10, safetyScore: 10, efficacyScore: 10,
    description: 'SPF (Sun Protection Factor) quantifies UV protection — specifically UVB rays that cause burning and skin cancer. PA rating measures UVA protection (the aging rays). Sunscreen is not just a skincare step — it is the single most evidence-backed intervention for preventing premature aging, hyperpigmentation, and skin cancer.',
    howItWorks: 'Mineral sunscreens (zinc oxide, titanium dioxide) work by physically reflecting and scattering UV radiation. Chemical sunscreens (avobenzone, octinoxate) absorb UV photons and convert them to harmless heat energy. SPF 50 blocks 98% of UVB; SPF 30 blocks 97%. PA++++ provides the highest UVA protection.',
    benefits: ['Prevents UV-induced skin aging', 'Protects against skin cancer', 'Prevents tanning and darkening', 'Maintains skincare results longer', 'Prevents hyperpigmentation formation', 'Most cost-effective anti-aging step'],
    concerns: ['Sun damage', 'Tanning', 'Premature aging', 'Skin cancer risk', 'Hyperpigmentation', 'Melasma'],
    bestFor: ['Everyone — all skin types', 'All ages', 'Year-round use'],
    notFor: ['No one should avoid sunscreen'],
    concentration: 'SPF 30+ minimum; SPF 50+ recommended',
    pairsWith: [
      { name: 'Vitamin C', reason: 'Synergistic antioxidant protection against UV damage' },
      { name: 'Niacinamide', reason: 'Reduces UV-triggered hyperpigmentation' },
      { name: 'All morning actives', reason: 'Sunscreen is the final, essential AM step' },
    ],
    avoidWith: [
      { name: 'Nothing', reason: 'Sunscreen should be used with all other products — it goes last' },
    ],
    studyCount: 200, productCount: 5, funFact: 'The FDA has classified only two sunscreen ingredients — zinc oxide and titanium dioxide — as "generally recognized as safe and effective" (GRASE). The jury is still out on most chemical filters.',
    studies: [
      { title: 'Daily sunscreen prevents photoaging', journal: 'Annals of Internal Medicine', year: 2013, finding: 'Daily SPF use prevented measurable photoaging over 4.5 years vs discretionary use' },
      { title: 'Sunscreen and melanoma risk', journal: 'Journal of Clinical Oncology', year: 2011, finding: 'Daily SPF use reduced melanoma risk by 50% in Australian cohort study' },
      { title: 'UV damage and collagen', journal: 'JAMA Dermatology', year: 2016, finding: 'Consistent SPF application partially reversed UV-induced collagen degradation' },
    ],
  },
  peptides: {
    name: 'Peptides', slug: 'peptides', emoji: '🧬', tagline: 'The collagen messengers of skincare',
    category: 'Active', heroColor: '#4A2D78',
    rating: 8.7, safetyScore: 10, efficacyScore: 8,
    description: 'Peptides are short chains of amino acids — the building blocks of proteins like collagen, elastin, and keratin. When applied topically, signalling peptides communicate with skin cells to stimulate collagen production, repair the barrier, and reduce inflammation. They are gentle enough for sensitive skin and safe for daily use.',
    howItWorks: 'Different peptide types work through distinct mechanisms: signal peptides (like Matrixyl) stimulate fibroblasts to produce collagen and elastin. Carrier peptides deliver trace minerals required for enzymatic collagen synthesis. Inhibitor peptides block enzymes that break down collagen. Neurotransmitter peptides (like Argireline) relax facial muscles to reduce expression lines.',
    benefits: ['Stimulates collagen and elastin production', 'Reduces appearance of fine lines', 'Strengthens and repairs skin barrier', 'Improves skin firmness and elasticity', 'Supports wound healing', 'Compatible with all other actives'],
    concerns: ['Fine lines', 'Loss of firmness', 'Aging skin', 'Damaged barrier', 'Dullness'],
    bestFor: ['Mature skin', 'Anti-aging focus', 'Sensitive skin', 'All skin types'],
    notFor: ['Not contraindicated for any skin type'],
    concentration: 'Varies by peptide type; 2–8ppm for signal peptides',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'Amplifies peptide results with deep hydration' },
      { name: 'Vitamin C', reason: 'Both stimulate collagen through different pathways' },
      { name: 'Niacinamide', reason: 'Complementary barrier repair mechanisms' },
      { name: 'Retinol', reason: 'Peptides soothe retinol irritation while adding collagen benefits' },
    ],
    avoidWith: [
      { name: 'AHA/BHA (with copper peptides)', reason: 'Acid pH can deactivate copper peptides specifically' },
    ],
    studyCount: 38, productCount: 7, funFact: 'Matrixyl (palmitoyl pentapeptide-4), one of the most studied cosmetic peptides, has been shown in some studies to be as effective as retinol for reducing wrinkles — without the irritation.',
    studies: [
      { title: 'Palmitoyl pentapeptide-4 for wrinkles', journal: 'International Journal of Cosmetic Science', year: 2005, finding: 'Matrixyl reduced wrinkle volume by 68% compared to vehicle at 4 months' },
      { title: 'Copper peptide wound healing', journal: 'Wound Repair and Regeneration', year: 2001, finding: 'GHK-Cu accelerated wound closure and increased collagen synthesis by 3-fold' },
      { title: 'Signal peptide mechanism', journal: 'Journal of Cosmetic Dermatology', year: 2010, finding: 'Tripeptide-1 increased procollagen-1 secretion by 350% in dermal fibroblasts' },
    ],
  },
  'kojic-acid': {
    name: 'Kojic Acid', slug: 'kojic-acid', emoji: '🍄', tagline: 'Japan\'s brightening secret from fermentation',
    category: 'Active', heroColor: '#7B6B2D',
    rating: 8.4, safetyScore: 8, efficacyScore: 8,
    description: 'Kojic acid is a natural by-product of the rice wine fermentation process, discovered in Japan. It is a powerful tyrosinase inhibitor that reduces melanin production, making it effective for hyperpigmentation, melasma, and post-acne marks. It is particularly popular in Asian skincare and is often combined with Vitamin C or arbutin for enhanced brightening.',
    howItWorks: 'Kojic acid chelates copper from the active site of tyrosinase, the enzyme responsible for melanin synthesis. Without copper co-factor, tyrosinase cannot catalyse the oxidation of tyrosine to dopaquinone — the first step in melanin production. This mechanism differs from Vitamin C (which acts as a reductant) allowing combined use.',
    benefits: ['Reduces melanin overproduction', 'Fades stubborn dark spots and melasma', 'Evens skin tone', 'Has mild antifungal properties', 'Brightens overall complexion', 'Works on all types of hyperpigmentation'],
    concerns: ['Hyperpigmentation', 'Melasma', 'Post-acne marks', 'Uneven tone', 'Sun damage'],
    bestFor: ['Hyperpigmentation-prone skin', 'Darker skin tones with PIH', 'Combination skin'],
    notFor: ['Contact dermatitis-prone individuals', 'Very sensitive skin (may irritate)'],
    concentration: '1–4% effective range (1–2% most tolerable)',
    pairsWith: [
      { name: 'Vitamin C', reason: 'Dual tyrosinase inhibition pathways for stronger brightening' },
      { name: 'Niacinamide', reason: 'Complements brightening while reducing irritation' },
      { name: 'SPF', reason: 'Essential to prevent re-darkening of faded spots' },
    ],
    avoidWith: [
      { name: 'High-concentration exfoliants', reason: 'Increased sensitivity risk when barrier is compromised' },
    ],
    studyCount: 29, productCount: 5, funFact: 'Kojic acid was discovered accidentally in 1989 by Japanese researchers who noticed that workers in sake (rice wine) breweries had unusually even, bright skin from constant contact with fermented rice.',
    studies: [
      { title: 'Kojic acid vs melasma', journal: 'Journal of Dermatology', year: 2010, finding: '1% kojic acid reduced MASI score by 36% at 12 weeks, comparable to 4% hydroquinone' },
      { title: 'Kojic acid tyrosinase inhibition', journal: 'Bioscience, Biotechnology, and Biochemistry', year: 2003, finding: 'Kojic acid had IC50 of 0.03 mM against mushroom tyrosinase' },
      { title: 'Tolerance and efficacy', journal: 'Dermatologic Surgery', year: 2007, finding: 'Combined kojic acid + glycolic acid showed 51% improvement in hyperpigmentation vs control' },
    ],
  },
  'azelaic-acid': {
    name: 'Azelaic Acid', slug: 'azelaic-acid', emoji: '🌾', tagline: 'The rosacea and acne multitasker',
    category: 'Active', heroColor: '#5A7B3D',
    rating: 8.9, safetyScore: 10, efficacyScore: 8,
    description: 'Azelaic acid is a naturally occurring dicarboxylic acid found in grains like wheat, rye, and barley. It is unique among skincare actives in that it is safe for use during pregnancy and breastfeeding. Prescription-strength (15–20%) is approved for rosacea and acne; over-the-counter versions (10%) are effective for hyperpigmentation and mild acne.',
    howItWorks: 'Azelaic acid inhibits tyrosinase to reduce melanin synthesis. It also demonstrates anti-keratinizing effects, normalising the abnormal follicular keratinisation seen in acne. Its anti-inflammatory action comes from inhibiting reactive oxygen species production by neutrophils and reducing pro-inflammatory cytokines.',
    benefits: ['Reduces rosacea redness and bumps', 'Treats acne without drying skin', 'Fades post-inflammatory hyperpigmentation', 'Anti-inflammatory and antibacterial', 'Normalises skin cell turnover', 'Safe during pregnancy'],
    concerns: ['Rosacea', 'Acne', 'Post-acne marks', 'Hyperpigmentation', 'Redness', 'Sensitive skin'],
    bestFor: ['Sensitive skin', 'Rosacea-prone skin', 'Acne-prone skin', 'Pregnant skincare routines'],
    notFor: ['Azelaic acid hypersensitivity (rare)'],
    concentration: '10% OTC; 15–20% prescription',
    pairsWith: [
      { name: 'Niacinamide', reason: 'Synergistic anti-inflammatory and brightening effects' },
      { name: 'SPF', reason: 'Protects treated skin from UV-triggered re-pigmentation' },
      { name: 'Hyaluronic Acid', reason: 'Reduces potential dryness from azelaic acid' },
    ],
    avoidWith: [
      { name: 'High-pH products', reason: 'Azelaic acid works best in slightly acidic environment' },
    ],
    studyCount: 34, productCount: 6, funFact: 'Azelaic acid is one of only two ingredients (alongside niacinamide) that has Level A evidence for treating both acne AND rosacea — making it uniquely versatile.',
    studies: [
      { title: 'Azelaic acid vs rosacea', journal: 'Journal of the European Academy of Dermatology', year: 2003, finding: '15% azelaic acid gel reduced papulopustular rosacea by 70% at 15 weeks' },
      { title: 'Azelaic acid and PIH', journal: 'Dermatologic Therapy', year: 2011, finding: '20% azelaic acid cream comparably effective to 4% hydroquinone for melasma' },
      { title: 'Safety in pregnancy', journal: 'Journal of the American Academy of Dermatology', year: 2009, finding: 'No teratogenic effects observed; classified as Pregnancy Category B by FDA' },
    ],
  },
  bakuchiol: {
    name: 'Bakuchiol', slug: 'bakuchiol', emoji: '🌿', tagline: 'The gentle, plant-based retinol alternative',
    category: 'Active', heroColor: '#4A7B3D',
    rating: 8.5, safetyScore: 10, efficacyScore: 7,
    description: 'Bakuchiol is a meroterpene phenol found in the seeds and leaves of the Psoralea corylifolia plant. It functions as a functional analogue of retinol, activating retinol-like gene expression without causing the irritation, dryness, or photosensitivity associated with vitamin A derivatives. It is safe for use during pregnancy and in sensitive skin.',
    howItWorks: 'Bakuchiol activates retinol-sensitive gene pathways by stimulating retinol receptor pathways differently from retinol — without requiring conversion to retinoic acid. It upregulates types I, III, and IV collagen, fibronectin, and fibrillins. Its antioxidant properties come from its phenolic structure that scavenges free radicals.',
    benefits: ['Retinol-like benefits without irritation', 'Stimulates collagen production', 'Reduces fine lines and wrinkles', 'Safe for use during pregnancy', 'No photosensitivity — can be used AM', 'Suitable for sensitive skin'],
    concerns: ['Anti-aging', 'Fine lines', 'Loss of firmness', 'Sensitive skin wanting retinol benefits'],
    bestFor: ['Sensitive skin', 'Dry skin', 'Pregnant/breastfeeding', 'Retinol-intolerant skin'],
    notFor: ['Those expecting exact retinol-equivalent results'],
    concentration: '0.5–1% effective range',
    pairsWith: [
      { name: 'Hyaluronic Acid', reason: 'Enhances bakuchiol hydration benefits' },
      { name: 'Vitamin C', reason: 'Combined collagen-boosting effect' },
      { name: 'Niacinamide', reason: 'Complementary anti-aging and tone-evening' },
      { name: 'SPF', reason: 'Protective layer, though bakuchiol has less photosensitivity than retinol' },
    ],
    avoidWith: [
      { name: 'Retinol (same step)', reason: 'Combined effect may be too strong for first-time users' },
    ],
    studyCount: 12, productCount: 4, funFact: 'Bakuchiol has been used in Ayurvedic and traditional Chinese medicine for thousands of years as "babchi" — it was only clinically studied as a retinol alternative after 2014.',
    studies: [
      { title: 'Bakuchiol vs retinol split-face study', journal: 'British Journal of Dermatology', year: 2018, finding: '0.5% bakuchiol comparable to 0.5% retinol for wrinkles and pigmentation at 12 weeks with less irritation' },
      { title: 'Gene expression profiling', journal: 'International Journal of Cosmetic Science', year: 2014, finding: 'Bakuchiol upregulated retinol pathway genes including types I/III/IV collagen' },
      { title: 'Safety assessment', journal: 'Journal of Cosmetic Dermatology', year: 2019, finding: 'Bakuchiol showed no significant adverse events in extensive repeated insult patch test' },
    ],
  },
}

const INGREDIENT_BENEFIT_EMOJIS = ['✨', '🔬', '💧', '🛡️', '🌟', '⚡']

function ScoreBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 20px', textAlign: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 6 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < value ? '#fff' : 'rgba(255,255,255,0.3)' }} />
        ))}
      </div>
    </div>
  )
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, color: C.dark }}>{question}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mu} strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 0 18px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, lineHeight: 1.7 }}>{answer}</div>
      )}
    </div>
  )
}

export default function IngredientDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [cartCount, setCartCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)

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

  const ingredient = INGREDIENTS_DATA[slug]

  if (!ingredient) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        <div style={{ fontSize: 64 }}>🔬</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: C.dark }}>Ingredient not found</h2>
        <Link href="/ingredients" style={{ padding: '12px 28px', background: C.teal, color: '#fff', borderRadius: 10, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>View All Ingredients</Link>
      </div>
    )
  }

  const matchedProducts = ALL_PRODUCTS.filter(p =>
    p.ingredients.some(ing => ing.toLowerCase().includes(ingredient.name.toLowerCase().split(' ')[0])) ||
    p.tags?.some(t => t.includes(slug.replace('-', '')))
  ).slice(0, 4)

  const relatedSlugs = Object.keys(INGREDIENTS_DATA).filter(s => s !== slug).slice(0, 6)

  const addToCart = (product: typeof ALL_PRODUCTS[0]) => {
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

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Announcement Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: C.dark, color: '#fff', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500 }}>🔬 DermIQ Ingredients Lab — Science-backed deep dives</span>
      </div>

      <Navbar activePage="ingredients" />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div style={{ paddingTop: 106, paddingBottom: 100 }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${ingredient.heroColor}, ${ingredient.heroColor}CC)`, padding: '60px 24px 50px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
              <Link href="/ingredients" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Ingredients Lab</Link>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{ingredient.name}</span>
            </div>

            {/* Category chip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ingredient.category}</span>
            </div>

            {/* Name & tagline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 56 }}>{ingredient.emoji}</span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>{ingredient.name}</h1>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.85)', margin: '0 0 32px', fontStyle: 'italic' }}>{ingredient.tagline}</p>

            {/* Score badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 480 }}>
              <ScoreBadge label="DermIQ Rating" value={Math.round(ingredient.rating)} color="#fff" />
              <ScoreBadge label="Safety Score" value={ingredient.safetyScore} color="#fff" />
              <ScoreBadge label="Efficacy Score" value={ingredient.efficacyScore} color="#fff" />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

          {/* ── Section 1: The Science ────────────────────────────────────── */}
          <section style={{ padding: '48px 0' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>🧬 The Science</h2>

            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.dark, lineHeight: 1.8, margin: 0 }}>{ingredient.description}</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>How It Works</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, lineHeight: 1.8, margin: 0 }}>{ingredient.howItWorks}</p>
            </div>

            {/* Concentration guide */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Concentration Guide</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, minWidth: 60 }}>Too Low</span>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: `linear-gradient(90deg, #E8E0D8 0%, ${C.teal} 30%, ${C.teal2} 70%, ${C.accent} 100%)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -4, left: '30%', right: '30%', height: 20, background: 'rgba(255,255,255,0.4)', borderRadius: 4, border: `2px solid ${C.teal}` }} />
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.mu, minWidth: 60, textAlign: 'right' }}>Too High</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.teal, background: `${C.teal}15`, padding: '6px 16px', borderRadius: 20 }}>{ingredient.concentration}</span>
              </div>
            </div>
          </section>

          {/* ── Section 2: Benefits ──────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>⭐ Benefits</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {ingredient.benefits.map((benefit, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{INGREDIENT_BENEFIT_EMOJIS[i % INGREDIENT_BENEFIT_EMOJIS.length]}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.dark, lineHeight: 1.5, fontWeight: 500 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: Compatibility ─────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>🤝 Compatibility</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Pairs Well With */}
              <div>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>✅ Pairs Well With</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ingredient.pairsWith.map((pair, i) => (
                    <div key={i} style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px 16px', border: `1px solid #BBF7D0` }}>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 4 }}>{pair.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4ADE80', color: '#15803D' }}>{pair.reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid Combining With */}
              <div>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>⚠️ Avoid Combining With</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ingredient.avoidWith.map((avoid, i) => (
                    <div key={i} style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px 16px', border: `1px solid #FECACA` }}>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#991B1B', marginBottom: 4 }}>{avoid.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#B91C1C' }}>{avoid.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: Best For / Not For ────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>👤 Who Is It For?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>✅ Best For</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ingredient.bestFor.map((type, i) => (
                    <span key={i} style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>{type}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>⚠️ Caution For</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ingredient.notFor.map((type, i) => (
                    <span key={i} style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>{type}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 5: Clinical Evidence ─────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 8 }}>📊 Clinical Evidence</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: C.mu, marginBottom: 24 }}>Backed by <strong style={{ color: C.teal }}>{ingredient.studyCount} clinical studies</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {ingredient.studies.map((study, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Study {i + 1} · {study.year}</div>
                  <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 6, lineHeight: 1.4 }}>{study.title}</h4>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.mu, marginBottom: 10, fontStyle: 'italic' }}>{study.journal}</p>
                  <div style={{ background: C.cream, borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.dark, margin: 0, lineHeight: 1.5 }}>💡 {study.finding}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 6: Products ──────────────────────────────────────── */}
          {matchedProducts.length > 0 && (
            <section style={{ padding: '0 0 48px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 8 }}>🛍️ Products With {ingredient.name}</h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.mu, marginBottom: 24 }}>{matchedProducts.length} product{matchedProducts.length !== 1 ? 's' : ''} featuring this ingredient</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {matchedProducts.map(product => (
                  <Link key={product.id} href={`/product/${product.id}`} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}>
                    <div style={{ aspectRatio: '1', background: C.cream, overflow: 'hidden' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.mu, marginBottom: 4 }}>{product.brand}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, lineHeight: 1.3, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: C.dark }}>₹{product.price}</span>
                        <button
                          onClick={e => { e.preventDefault(); addToCart(product) }}
                          style={{ padding: '6px 12px', background: C.teal, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}
                        >+ Add</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Section 7: FAQ ───────────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.dark, marginBottom: 24 }}>❓ Frequently Asked Questions</h2>
            <div style={{ background: '#fff', borderRadius: 16, padding: '0 24px', border: `1px solid ${C.border}` }}>
              <FAQ
                question={`Can I use ${ingredient.name} every day?`}
                answer={`Yes, ${ingredient.name} can generally be used daily — ${ingredient.safetyScore >= 9 ? 'it is very well tolerated by most skin types' : 'though it is best to start 2–3 times per week and increase gradually as your skin adjusts'}. ${ingredient.category === 'Active' && ingredient.name !== 'Niacinamide' ? 'If you experience irritation, reduce frequency and ensure you are using an appropriate concentration.' : 'Consistent daily use is key to seeing long-term results.'}`}
              />
              <FAQ
                question={`What concentration of ${ingredient.name} should I start with?`}
                answer={`For beginners, start at the lower end of the effective range. ${ingredient.concentration}. Starting low allows your skin to adjust, reduces risk of irritation, and still provides visible benefits over 4–8 weeks of consistent use. Once your skin has adapted, you can gradually increase the concentration.`}
              />
              <FAQ
                question={`Can I use ${ingredient.name} with ${ingredient.pairsWith[0]?.name || 'other actives'}?`}
                answer={`${ingredient.pairsWith[0] ? `Yes! ${ingredient.name} and ${ingredient.pairsWith[0].name} work beautifully together — ${ingredient.pairsWith[0].reason}. This is one of the most popular combinations in evidence-based skincare routines.` : `Generally yes, but always introduce new actives one at a time and patch test first.`}`}
              />
              <FAQ
                question={`How long does it take to see results with ${ingredient.name}?`}
                answer={`Initial results (texture, hydration) are often visible within 2–4 weeks. Significant changes to tone, pigmentation, or fine lines typically require 8–12 weeks of consistent daily use. For anti-aging benefits, maintain use for at least 3–6 months before evaluating results. Skincare is a long game — patience and consistency are essential.`}
              />
            </div>
          </section>

          {/* ── Fun Fact ─────────────────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <div style={{ background: `linear-gradient(135deg, ${C.dark}, #243D3A)`, borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#fff', marginBottom: 10 }}>Did You Know?</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>{ingredient.funFact}</p>
            </div>
          </section>

          {/* ── Related Ingredients ──────────────────────────────────────── */}
          <section style={{ padding: '0 0 48px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.dark, marginBottom: 16 }}>Related Ingredients</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {relatedSlugs.map(s => (
                <Link key={s} href={`/ingredients/${s}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 20, padding: '8px 18px', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: C.dark }}>
                  <span>{INGREDIENTS_DATA[s]?.emoji}</span>
                  <span>{INGREDIENTS_DATA[s]?.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <MobileToolbar activePage="ingredients" />
    </div>
  )
}
