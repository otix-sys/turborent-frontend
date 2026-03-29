import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CookieBanner from '../components/layout/CookieBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'TurboRent — Location & Vente de véhicules entre particuliers',
    template: '%s | TurboRent'
  },
  description: 'Plateforme sécurisée de location et vente de véhicules entre particuliers et professionnels en France. KYC vérifié, caution sécurisée, assurance incluse.',
  keywords: ['location voiture', 'vente voiture', 'particulier', 'professionnel', 'france'],
  openGraph: {
    siteName: 'TurboRent',
    type: 'website',
    locale: 'fr_FR'
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', background: '#1f2937', color: '#fff' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
      </body>
    </html>
  )
}
