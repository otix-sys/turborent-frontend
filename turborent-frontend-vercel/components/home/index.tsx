'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Users, Car, ThumbsUp, Shield, Search, FileCheck, Key, Star, CheckCircle, Lock, Award, ArrowRight } from 'lucide-react'
import { vehiclesApi } from '../../lib/api'
import { Vehicle } from '../../types'
import VehicleCard from '../vehicles/VehicleCard'

// ─── Compteur animé ─────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

// ─── Section Stats ───────────────────────────────────────────────
export function StatsSection({ statUsers, statVehicles, statSatisfaction }: {
  statUsers: number; statVehicles: number; statSatisfaction: number
}) {
  const stats = [
    { icon: <Users className="w-8 h-8 text-blue-600" />, value: statUsers, suffix: '+', label: 'Utilisateurs vérifiés', color: 'blue' },
    { icon: <Car className="w-8 h-8 text-green-600" />, value: statVehicles, suffix: '+', label: 'Véhicules disponibles', color: 'green' },
    { icon: <ThumbsUp className="w-8 h-8 text-purple-600" />, value: statSatisfaction, suffix: '%', label: 'Clients satisfaits', color: 'purple' }
  ]

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${stat.color}-50 mb-4`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Véhicules mis en avant ─────────────────────────────────────
export function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<'location' | 'vente'>('location')

  useEffect(() => {
    setLoading(true)
    vehiclesApi.list({ type: activeType, featured_first: 'true', limit: 6, sort: 'recent' })
      .then(r => setVehicles(r.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false))
  }, [activeType])

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900"
            >
              Annonces récentes
            </motion.h2>
            <p className="text-gray-500 mt-1">Véhicules vérifiés par notre équipe</p>
          </div>
          {/* Toggle location / vente */}
          <div className="flex gap-1 bg-gray-200 p-1 rounded-xl self-start sm:self-auto">
            {(['location', 'vente'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'location' ? 'Location' : 'Vente'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-skeleton">
                <div className="skeleton h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-6 w-1/2 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun véhicule disponible pour le moment.</p>
            <p className="text-gray-400 mt-1">Soyez le premier à publier une annonce !</p>
            <Link href="/tableau-de-bord/vehicules/ajouter" className="btn-primary mt-6 inline-flex">
              Publier mon véhicule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <VehicleCard vehicle={v} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href={`/${activeType}`} className="btn-outline inline-flex items-center gap-2">
            Voir toutes les annonces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Comment ça marche ──────────────────────────────────────────
export function HowItWorks() {
  const steps = {
    location: [
      { icon: <Search className="w-6 h-6" />, title: 'Rechercher', desc: 'Trouvez le véhicule idéal avec nos filtres avancés par ville, prix, catégorie.' },
      { icon: <FileCheck className="w-6 h-6" />, title: 'Vérifier', desc: 'Consultez les documents KYC vérifiés et le score de confiance de chaque propriétaire.' },
      { icon: <Shield className="w-6 h-6" />, title: 'Réserver', desc: 'Réservez en ligne. Caution sécurisée via Stripe, assurance incluse.' },
      { icon: <Key className="w-6 h-6" />, title: 'Conduire', desc: 'Récupérez les clés après état des lieux. Roulez l\'esprit tranquille.' }
    ],
    vente: [
      { icon: <FileCheck className="w-6 h-6" />, title: 'Publier', desc: 'Créez votre annonce en 5 minutes avec photos et documents vérifiés.' },
      { icon: <Shield className="w-6 h-6" />, title: 'Être validé', desc: 'Notre équipe vérifie votre annonce sous 24h pour garantir la fiabilité.' },
      { icon: <Star className="w-6 h-6" />, title: 'Recevoir des offres', desc: 'Les acheteurs intéressés vous contactent directement par messagerie sécurisée.' },
      { icon: <CheckCircle className="w-6 h-6" />, title: 'Vendre', desc: 'Finalisez la vente en toute sécurité avec notre système de protection.' }
    ]
  }
  const [mode, setMode] = useState<'location' | 'vente'>('location')

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Comment ça marche ?
          </motion.h2>
          <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['location', 'vente'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {m === 'location' ? 'Je veux louer' : 'Je veux vendre'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps[mode].map((step, i) => (
            <motion.div
              key={`${mode}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative text-center"
            >
              {i < 3 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-0 h-0.5 bg-blue-100 z-0" />
              )}
              <div className="relative z-10 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                {step.icon}
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section confiance ──────────────────────────────────────────
export function TrustSection() {
  const features = [
    { icon: <FileCheck className="w-6 h-6 text-blue-600" />, title: 'KYC obligatoire', desc: 'Permis, carte grise et pièce d\'identité vérifiés par notre équipe avant toute publication.' },
    { icon: <Lock className="w-6 h-6 text-green-600" />, title: 'Caution Stripe', desc: 'Pré-autorisation bancaire sécurisée. Jamais débitée sans preuve validée par notre équipe.' },
    { icon: <Shield className="w-6 h-6 text-purple-600" />, title: 'Assurance incluse', desc: 'Couverture RC incluse dans chaque location. Options premium disponibles.' },
    { icon: <Award className="w-6 h-6 text-yellow-600" />, title: 'Score de confiance', desc: 'Chaque utilisateur a un score basé sur son historique, ses avis et ses vérifications.' }
  ]

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Votre sécurité, notre priorité
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Chaque étape de la location ou de la vente est protégée par notre système de vérification.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-colors border border-gray-700"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Call to Action ─────────────────────────────────────────────
export function CtaSection() {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à TurboRent pour leurs transactions automobiles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Créer mon compte gratuit
            </Link>
            <Link href="/location" className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors border border-blue-400">
              Explorer les véhicules
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
