'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  emoji: string
  qty: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([])

  const loadCart = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const cart = JSON.parse(localStorage.getItem('dermiq_cart') || '[]')
        setItems(cart)
      } catch {
        setItems([])
      }
    }
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('dermiq_cart_updated', loadCart)
    return () => window.removeEventListener('dermiq_cart_updated', loadCart)
  }, [loadCart])

  useEffect(() => {
    if (isOpen) loadCart()
  }, [isOpen, loadCart])

  const saveCart = (newItems: CartItem[]) => {
    localStorage.setItem('dermiq_cart', JSON.stringify(newItems))
    setItems(newItems)
    window.dispatchEvent(new CustomEvent('dermiq_cart_updated'))
  }

  const updateQty = (id: number, delta: number) => {
    const updated = items.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter(item => item.qty > 0)
    saveCart(updated)
  }

  const removeItem = (id: number) => {
    saveCart(items.filter(item => item.id !== id))
    toast.success('Removed from bag')
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        zIndex: 201,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E0D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A2E2B', margin: 0 }}>
              My Bag
            </h2>
            {totalItems > 0 && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, border: 'none', background: '#F7F3EE', cursor: 'pointer', color: '#1A2E2B' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1A2E2B', marginBottom: 8 }}>Your bag is empty</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
                Explore our science-backed skincare and find your perfect routine.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)',
                  color: '#fff',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: 14,
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #E8E0D8',
                  background: '#FAFAF8',
                }}>
                  {/* Product image */}
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #F7F3EE, #E8E0D8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    flexShrink: 0,
                  }}>
                    {item.emoji}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#6B7280', marginBottom: 2 }}>{item.brand}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A2E2B', lineHeight: 1.3, marginBottom: 8 }} className="line-clamp-2">
                      {item.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E8E0D8', borderRadius: 8, padding: '2px 4px' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#1A2E2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#2D5F5A', cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A2E2B' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#D4856A' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #E8E0D8' }}>
            {/* Free shipping note */}
            {total < 799 && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#FFF8F0',
                border: '1px solid #F5E6D3',
                marginBottom: 14,
                fontSize: 12,
                color: '#C8976A',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
              }}>
                Add ₹{(799 - total).toLocaleString()} more for FREE shipping 🚚
              </div>
            )}
            {total >= 799 && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#F0F9F8',
                border: '1px solid #C8E6E4',
                marginBottom: 14,
                fontSize: 12,
                color: '#2D5F5A',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
              }}>
                ✓ You qualify for FREE shipping!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#6B7280' }}>Subtotal</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A2E2B' }}>₹{total.toLocaleString()}</span>
            </div>
            <button
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #2D5F5A, #3D7A74)',
                color: '#fff',
                borderRadius: 12,
                border: 'none',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 4px 16px rgba(45,95,90,0.3)',
              }}
              onClick={() => toast.success('Proceeding to checkout...')}
            >
              Checkout — ₹{total.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
