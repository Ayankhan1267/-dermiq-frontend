'use client'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MobileToolbar from '@/components/MobileToolbar'
import { ALL_PRODUCTS, type Product } from '@/lib/products'
import { BLOG_POSTS } from '../page'

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      return <h3 key={i} style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A2E2B', margin: '28px 0 12px' }}>{line.slice(2, -2)}</h3>
    }
    if (line.startsWith('- ')) {
      const text = line.slice(2)
      const parts = text.split(/\*\*(.*?)\*\*/g)
      return (
        <li key={i} style={{ marginBottom: 8, color: '#374151', fontSize: 16, lineHeight: 1.7 }}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </li>
      )
    }
    if (line === '') return <br key={i} />
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)
    return <p key={i} style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, marginBottom: 12 }}>{rendered}</p>
  })
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const post = BLOG_POSTS.find(p => p.slug === slug)

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
    const exists = cart.find((i: any) => i.id === product.id)
    const updated = exists ? cart.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { id: product.id, qty: 1 }]
    localStorage.setItem('dermiq_cart', JSON.stringify(updated))
    toast.success(`${product.name} added to cart!`)
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <h1 style={{ fontSize: 32, color: '#1A2E2B' }}>Article Not Found</h1>
        <Link href="/blog" style={{ color: '#2D5F5A', marginTop: 16, fontSize: 16 }}>← Back to Blog</Link>
      </div>
    )
  }

  const relatedProducts = post.relatedProductIds.map(id => ALL_PRODUCTS.find(p => p.id === id)).filter(Boolean) as Product[]
  const relatedArticles = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', height: 460, overflow: 'hidden', marginTop: 64 }}>
        <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,46,43,0.9) 0%, rgba(26,46,43,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0, padding: '0 24px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
              <span style={{ background: post.categoryColor, color: '#fff', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>{post.category}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{post.readTime}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{post.date}</span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>{post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2D5F5A, #C8976A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {post.author[0]}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{post.author}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{post.authorRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'flex-start' }}>
        {/* Article Content */}
        <article>
          {/* Excerpt */}
          <div style={{ background: '#F7F3EE', borderRadius: 14, padding: '20px 24px', marginBottom: 32, borderLeft: `4px solid ${post.categoryColor}` }}>
            <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>{post.excerpt}</p>
          </div>

          {/* Body */}
          <div style={{ fontSize: 16, lineHeight: 1.8, color: '#374151' }}>
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #E8E0D8' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', marginBottom: 10 }}>Topics</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ background: '#F7F3EE', border: '1px solid #E8E0D8', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#6B7280' }}>#{tag}</span>
              ))}
            </div>
          </div>

          {/* Share */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Share:</p>
            {['📱 WhatsApp', '🐦 Twitter', '🔗 Copy Link'].map(share => (
              <button
                key={share}
                onClick={() => {
                  if (share.includes('Copy')) {
                    navigator.clipboard?.writeText(window.location.href)
                    toast.success('Link copied!')
                  }
                }}
                style={{ background: '#F7F3EE', border: '1px solid #E8E0D8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#374151' }}
              >
                {share}
              </button>
            ))}
          </div>

          {/* Related Articles */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1A2E2B', marginBottom: 20 }}>Related Articles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {relatedArticles.map(article => (
                <Link key={article.slug} href={`/blog/${article.slug}`} style={{ display: 'flex', gap: 16, textDecoration: 'none', background: '#fff', borderRadius: 14, border: '1px solid #E8E0D8', padding: 16, transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e: any) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <Image src={article.image} alt={article.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ background: `${article.categoryColor}18`, color: article.categoryColor, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{article.category}</span>
                    <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: '#1A2E2B', margin: '6px 0 4px', lineHeight: 1.4 }}>{article.title}</h4>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>{article.readTime} · {article.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 100 }}>
          {/* Related Products */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E0D8', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 16 }}>Products Mentioned</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {relatedProducts.map(product => (
                <div key={product.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: '#F7F3EE', flexShrink: 0, position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
                    <Image src={product.image} alt={product.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 2, cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>{product.name}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#2D5F5A' }}>₹{product.price}</p>
                  </div>
                  <button onClick={() => addToCart(product)} style={{ background: '#2D5F5A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)', borderRadius: 20, padding: 24, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🧬</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 8 }}>Get Your Skin Profile</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 1.6 }}>
              2-minute quiz → personalised routine for your exact skin.
            </p>
            <Link href="/skin-quiz" style={{ display: 'block', background: '#C8976A', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Take Skin Quiz →
            </Link>
          </div>
        </div>
      </div>

      <MobileToolbar />
    </div>
  )
}
