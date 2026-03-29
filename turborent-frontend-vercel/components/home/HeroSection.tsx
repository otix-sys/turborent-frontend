'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Shield, Star, ChevronDown } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  imageUrl: string
}

export default function HeroSection({ title, subtitle, imageUrl }: Props) {
  const [offsetY, setOffsetY] = useState(0)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'location' | 'vente'>('location')
  const heroRef = useRef<HTMLDivElement>(null)

  // Effet parallax
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        if (rect.bottom > 0) setOffsetY(window.scrollY * 0.4)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
  }

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image avec parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform'
        }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            Plateforme 100% sécurisée · KYC vérifié · Caution Stripe
          </motion.div>

          {/* Titre */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p variants={itemVariants} className="text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            {subtitle}
          </motion.p>

          {/* Barre de recherche */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl">
              {/* Tabs location/vente */}
              <div className="flex gap-1 mb-2 px-2 pt-1">
                {(['location', 'vente'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      type === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'location' ? 'Location' : 'Vente'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/${type}?q=${search}` }}
                    placeholder="Marque, ville, modèle…"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-transparent outline-none text-base"
                  />
                </div>
                <Link
                  href={`/${type}${search ? `?q=${encodeURIComponent(search)}` : ''}`}
                  className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Rechercher
                </Link>
              </div>
            </div>

            {/* Suggestions rapides */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['BMW', 'Mercedes', 'Porsche', 'Paris', 'Lyon'].map(s => (
                <Link
                  key={s}
                  href={`/${type}?q=${s}`}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30 transition-colors border border-white/20"
                >
                  {s}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 mt-12">
            {[
              { icon: <Shield className="w-4 h-4 text-green-400" />, text: 'Documents vérifiés' },
              { icon: <Star className="w-4 h-4 text-yellow-400" />, text: '4.9/5 de satisfaction' },
              { icon: <Shield className="w-4 h-4 text-blue-400" />, text: 'Caution sécurisée' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                {item.icon} {item.text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  )
}
