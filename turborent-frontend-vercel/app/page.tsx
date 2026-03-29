import type { Metadata } from 'next'
import HeroSection from '../components/home/HeroSection'
import { StatsSection, FeaturedVehicles, HowItWorks, TrustSection, CtaSection } from '../components/home/index'

export const metadata: Metadata = {
  title: 'TurboRent — Location & Vente de véhicules entre particuliers',
  description: 'Louez ou vendez votre véhicule en toute sécurité. KYC vérifié, caution Stripe, assurance incluse.',
}

const DEFAULTS = {
  hero_title: 'Location & Vente de véhicules en toute confiance',
  hero_subtitle: 'La plateforme sécurisée entre particuliers et professionnels',
  hero_image_url: '/images/hero-bmw.jpg',
  stat_users: '10000', stat_vehicles: '2500', stat_satisfaction: '98'
}

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`, { next: { revalidate: 300 } })
    if (!res.ok) return DEFAULTS
    const data = await res.json()
    return { ...DEFAULTS, ...data.settings }
  } catch { return DEFAULTS }
}

export default async function HomePage() {
  const s = await getSettings()
  return (
    <>
      <HeroSection title={s.hero_title} subtitle={s.hero_subtitle} imageUrl={s.hero_image_url} />
      <StatsSection statUsers={+s.stat_users||10000} statVehicles={+s.stat_vehicles||2500} statSatisfaction={+s.stat_satisfaction||98} />
      <FeaturedVehicles />
      <HowItWorks />
      <TrustSection />
      <CtaSection />
    </>
  )
}
