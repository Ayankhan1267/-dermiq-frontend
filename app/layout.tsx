import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-dm' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500','600','700'], style: ['normal','italic'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'DermIQ — Science-Backed Skincare',
  description: 'Dermatologist-formulated skincare with proven ingredients.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
