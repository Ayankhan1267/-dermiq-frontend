'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const C = { teal: '#2D5F5A', teal2: '#3D7A74', dark: '#1A2E2B', mu: '#6B7280', border: '#E8E0D8', cream: '#F7F3EE' }

const DEMO_PRODUCTS = [
  { name: '10% Niacinamide + Zinc Serum', category: 'Serum', price: 399, mrp: 699, stock: 142, rating: 4.6, active: true, emoji: '✨', size: '30ml', description: 'Controls sebum production, minimises pore appearance, and reduces blemishes.', concerns: ['Acne & Breakouts', 'Oily Skin', 'Pigmentation & Dark Spots'], skin_types: ['Oily', 'Combination', 'Normal'], badge: 'Bestseller' },
  { name: 'Moisturizing Face Cream SPF 50', category: 'Moisturiser', price: 549, mrp: 849, stock: 8, rating: 4.4, active: true, emoji: '☀️', size: '50g', description: 'Lightweight daily moisturiser with broad-spectrum SPF 50 protection.', concerns: ['Dryness & Dehydration', 'Aging & Fine Lines'], skin_types: ['All Skin Types'], badge: null },
  { name: 'AHA BHA 25% Peeling Solution', category: 'Treatment', price: 649, mrp: 999, stock: 56, rating: 4.7, active: true, emoji: '🔬', size: '30ml', description: 'Exfoliating peel to resurface and brighten skin texture.', concerns: ['Dullness', 'Uneven Texture', 'Pores'], skin_types: ['Normal', 'Combination', 'Oily'], badge: 'New' },
  { name: 'Hyaluronic Acid 2% + B5 Serum', category: 'Serum', price: 299, mrp: 499, stock: 210, rating: 4.5, active: true, emoji: '💧', size: '30ml', description: 'Multi-depth hydration serum for plump, bouncy skin.', concerns: ['Dryness & Dehydration', 'Aging & Fine Lines'], skin_types: ['All Skin Types'], badge: null },
]

type StepStatus = 'idle' | 'running' | 'done' | 'error'

export default function VendorSetup() {
  const router = useRouter()
  const [steps, setSteps] = useState<{ label: string; status: StepStatus; detail: string }[]>([
    { label: 'Check authentication', status: 'idle', detail: '' },
    { label: 'Create dermiq_vendors table', status: 'idle', detail: '' },
    { label: 'Create dermiq_products table', status: 'idle', detail: '' },
    { label: 'Create dermiq_orders table', status: 'idle', detail: '' },
    { label: 'Seed vendor profile', status: 'idle', detail: '' },
    { label: 'Seed demo products', status: 'idle', detail: '' },
  ])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  function setStep(i: number, status: StepStatus, detail = '') {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status, detail } : s))
  }

  async function runSetup() {
    setRunning(true)

    // Step 0: Check auth
    setStep(0, 'running')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setStep(0, 'error', 'Not logged in. Please login first.')
      setRunning(false)
      return
    }
    setStep(0, 'done', `Logged in as ${user.email}`)

    // Step 1: Create vendors table via upsert (will fail gracefully if exists)
    setStep(1, 'running')
    try {
      // Test if table exists by selecting from it
      const { error } = await supabase.from('dermiq_vendors').select('id').limit(1)
      if (error && error.code === '42P01') {
        setStep(1, 'error', 'Table does not exist — run the SQL script first (see instructions below)')
        setRunning(false)
        return
      }
      setStep(1, 'done', 'Table exists ✓')
    } catch {
      setStep(1, 'error', 'Could not verify table')
      setRunning(false)
      return
    }

    // Step 2: Check products table
    setStep(2, 'running')
    try {
      const { error } = await supabase.from('dermiq_products').select('id').limit(1)
      if (error && error.code === '42P01') {
        setStep(2, 'error', 'Table does not exist — run the SQL script first')
        setRunning(false)
        return
      }
      setStep(2, 'done', 'Table exists ✓')
    } catch {
      setStep(2, 'error', 'Could not verify table')
      setRunning(false)
      return
    }

    // Step 3: Check orders table
    setStep(3, 'running')
    try {
      const { error } = await supabase.from('dermiq_orders').select('id').limit(1)
      if (error && error.code === '42P01') {
        setStep(3, 'error', 'Orders table missing — run SQL script')
        setRunning(false)
        return
      }
      setStep(3, 'done', 'Table exists ✓')
    } catch {
      setStep(3, 'error', 'Could not verify orders table')
      setRunning(false)
      return
    }

    // Step 4: Seed vendor
    setStep(4, 'running')
    try {
      const { error } = await supabase.from('dermiq_vendors').upsert({
        email: user.email!,
        brand_name: 'My Brand',
        tagline: 'Science-backed skincare',
        verified: false,
        kyc_status: 'pending',
      }, { onConflict: 'email' })
      if (error) throw error
      setStep(4, 'done', `Vendor profile saved for ${user.email}`)
    } catch (e: unknown) {
      setStep(4, 'error', e instanceof Error ? e.message : 'Failed to seed vendor')
      setRunning(false)
      return
    }

    // Step 5: Seed products
    setStep(5, 'running')
    try {
      // Check if already seeded
      const { data: existing } = await supabase.from('dermiq_products').select('id').eq('vendor_email', user.email)
      if (existing && existing.length > 0) {
        setStep(5, 'done', `${existing.length} products already exist — skipped`)
      } else {
        const toInsert = DEMO_PRODUCTS.map(p => ({ ...p, vendor_email: user.email! }))
        const { error } = await supabase.from('dermiq_products').insert(toInsert)
        if (error) throw error
        setStep(5, 'done', `${DEMO_PRODUCTS.length} demo products added`)
      }
    } catch (e: unknown) {
      setStep(5, 'error', e instanceof Error ? e.message : 'Failed to seed products')
      setRunning(false)
      return
    }

    setDone(true)
    setRunning(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#F7F3EE,#E8F0EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 700, color: C.dark }}>Derm<span style={{ color: '#C8976A' }}>IQ</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: C.dark, margin: '16px 0 6px' }}>Vendor Database Setup</h1>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: C.mu }}>Connect your vendor panel to Supabase</p>
        </div>

        {/* STEP 1: SQL Script Instructions */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.dark, marginBottom: 4 }}>Step 1 — Run SQL in Supabase</h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.mu, marginBottom: 16, lineHeight: 1.6 }}>
            Go to your <strong>Supabase Dashboard → SQL Editor</strong> and paste + run the following SQL to create all required tables:
          </p>

          <div style={{ background: '#1A2E2B', borderRadius: 12, padding: 16, marginBottom: 16, overflowX: 'auto' }}>
            <pre style={{ color: '#A7F3D0', fontSize: 12, fontFamily: 'monospace', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{`-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

create table if not exists dermiq_vendors (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  brand_name text not null,
  tagline text,
  verified boolean default false,
  kyc_status text default 'pending',
  bank_holder text, bank_account text,
  bank_ifsc text, bank_name text, upi text,
  created_at timestamptz default now()
);

create table if not exists dermiq_products (
  id bigserial primary key,
  vendor_email text,
  name text not null,
  category text not null,
  price numeric not null,
  mrp numeric not null,
  stock integer default 0,
  rating numeric default 0,
  active boolean default true,
  emoji text default '✨',
  image text, size text, description text,
  concerns text[] default '{}',
  skin_types text[] default '{}',
  badge text,
  created_at timestamptz default now()
);

create table if not exists dermiq_orders (
  id bigserial primary key,
  vendor_email text,
  product_name text not null,
  customer_name text,
  customer_address text,
  qty integer default 1,
  amount numeric not null,
  status text default 'new',
  created_at timestamptz default now()
);

-- Disable RLS for testing (enable later in production)
alter table dermiq_vendors disable row level security;
alter table dermiq_products disable row level security;
alter table dermiq_orders disable row level security;`}</pre>
          </div>

          <div style={{ padding: '12px 16px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA' }}>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#92400E', margin: 0 }}>
              📋 <strong>Full SQL file</strong> also saved at <code>supabase/setup.sql</code> in your project folder with all tables + RLS policies + seed data.
            </p>
          </div>
        </div>

        {/* STEP 2: Env Variables */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.dark, marginBottom: 4 }}>Step 2 — Add Environment Variables</h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.mu, marginBottom: 16 }}>
            Update <code style={{ background: C.cream, padding: '1px 6px', borderRadius: 4 }}>.env.local</code> with your actual Supabase credentials:
          </p>
          <div style={{ background: '#1A2E2B', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <pre style={{ color: '#A7F3D0', fontSize: 12, fontFamily: 'monospace', margin: 0 }}>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}</pre>
          </div>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.mu, margin: 0 }}>
            Find these at: <strong>Supabase Dashboard → Project Settings → API</strong>
          </p>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.mu, margin: '4px 0 0' }}>
            Also add these to <strong>Render.com → Environment Variables</strong> for production.
          </p>
        </div>

        {/* STEP 3: Run Seed */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, color: C.dark, marginBottom: 4 }}>Step 3 — Seed Your Data</h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.mu, marginBottom: 20 }}>
            After SQL tables are created and you&apos;re logged in, click below to verify tables and seed demo data.
          </p>

          {/* Steps list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: s.status === 'done' ? '#F0FDF4' : s.status === 'error' ? '#FEF2F2' : s.status === 'running' ? '#EFF6FF' : C.cream, border: `1px solid ${s.status === 'done' ? '#BBF7D0' : s.status === 'error' ? '#FECACA' : s.status === 'running' ? '#BFDBFE' : C.border}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {s.status === 'done' ? '✅' : s.status === 'error' ? '❌' : s.status === 'running' ? '⏳' : '⭕'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{s.label}</p>
                  {s.detail && <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: s.status === 'error' ? '#DC2626' : C.mu, margin: '2px 0 0' }}>{s.detail}</p>}
                </div>
              </div>
            ))}
          </div>

          {!done ? (
            <button
              onClick={runSetup}
              disabled={running}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: running ? '#9CA3AF' : `linear-gradient(135deg,${C.teal},${C.teal2})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans,sans-serif', boxShadow: running ? 'none' : '0 4px 16px rgba(45,95,90,0.3)' }}
            >
              {running ? '⏳ Running setup...' : '🚀 Run Setup & Seed'}
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, color: C.dark, margin: '0 0 8px' }}>Setup Complete!</p>
              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.mu, margin: '0 0 20px' }}>Your Supabase tables are ready and seeded with demo data.</p>
              <button onClick={() => router.push('/vendor')} style={{ padding: '13px 32px', background: `linear-gradient(135deg,${C.teal},${C.teal2})`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                Go to Vendor Dashboard →
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.mu }}>
          <Link href="/vendor/login" style={{ color: C.teal, fontWeight: 600, textDecoration: 'none' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
