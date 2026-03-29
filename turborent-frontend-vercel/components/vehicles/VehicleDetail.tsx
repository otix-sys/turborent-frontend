'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Star, Shield, Fuel, Users, Gauge, Calendar, ChevronLeft, Heart, MessageSquare, Zap, CheckCircle, Clock, AlertCircle, Lock, Loader2 } from 'lucide-react'
import { vehiclesApi, rentalsApi, messagesApi } from '../../lib/api'
import { Vehicle, VehiclePhoto, Review } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FUEL_LABELS: Record<string, string> = { essence:'Essence', diesel:'Diesel', electrique:'Électrique', hybride:'Hybride', hybride_rechargeable:'Hybride rech.', gpl:'GPL' }

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export default function VehicleDetailPage({ listingType }: { listingType: 'location' | 'vente' }) {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, isAuthenticated } = useAuth()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [photos, setPhotos] = useState<VehiclePhoto[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [similar, setSimilar] = useState<Vehicle[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [loading, setLoading] = useState(true)

  // Formulaire réservation
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reserving, setReserving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    vehiclesApi.get(slug)
      .then(res => {
        setVehicle(res.data.vehicle)
        setPhotos(res.data.photos || [])
        setReviews(res.data.reviews || [])
        setSimilar(res.data.similar || [])
        setIsFavorite(res.data.isFavorite || false)
      })
      .catch(() => router.push(`/${listingType}`))
      .finally(() => setLoading(false))
  }, [slug])

  const toggleFav = async () => {
    if (!isAuthenticated) { toast.error('Connectez-vous pour ajouter aux favoris'); return }
    if (!vehicle) return
    try {
      const res = await vehiclesApi.toggleFavorite(vehicle.id)
      setIsFavorite(res.data.isFavorite)
      toast.success(res.data.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris')
    } catch { toast.error('Erreur') }
  }

  const handleReserve = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!vehicle || !startDate || !endDate) { toast.error('Sélectionnez des dates'); return }
    setReserving(true)
    try {
      const res = await rentalsApi.create({ vehicle_id: vehicle.id, start_date: startDate, end_date: endDate, message })
      toast.success('Demande envoyée ! Le propriétaire a 24h pour répondre.')
      router.push(`/tableau-de-bord/reservations/${res.data.rentalId}`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur lors de la réservation')
    } finally { setReserving(false) }
  }

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!vehicle) return
    try {
      const res = await messagesApi.startConversation(vehicle.owner_id, `Bonjour, je suis intéressé par votre annonce ${vehicle.brand} ${vehicle.model}.`, vehicle.id)
      router.push(`/tableau-de-bord/messages`)
      toast.success('Conversation démarrée !')
    } catch { toast.error('Erreur') }
  }

  const days = startDate && endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 0
  const subtotal = vehicle?.price_per_day ? days * vehicle.price_per_day : 0
  const platformFee = subtotal * 0.15
  const total = subtotal + platformFee

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="skeleton h-96 w-full rounded-2xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4"><div className="skeleton h-8 w-2/3 rounded" /><div className="skeleton h-24 w-full rounded" /></div>
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')
  const photoUrl = (path: string) => `${API_BASE}${path}`

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Link href={`/${listingType}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Retour aux annonces
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Galerie photos */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative aspect-[16/9] bg-gray-100">
                {photos.length > 0 && !photos[activePhoto] ? null : photos[activePhoto] ? (
                  <img src={photoUrl(photos[activePhoto].file_path)} alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🚗</div>
                )}
                <button onClick={toggleFav} className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                {vehicle.is_featured && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" /> Annonce en avant
                  </div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {photos.map((p, i) => (
                    <button key={p.id} onClick={() => setActivePhoto(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={photoUrl(p.file_path)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos véhicule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{vehicle.brand}</p>
                  <h1 className="text-2xl font-bold text-gray-900">{vehicle.model} {vehicle.version}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    {vehicle.review_count && vehicle.review_count > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={Number(vehicle.avg_rating)} />
                        <span className="text-sm font-medium text-gray-700">{Number(vehicle.avg_rating).toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({vehicle.review_count} avis)</span>
                      </div>
                    ) : <span className="text-sm text-gray-400">Pas encore d'avis</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {listingType === 'location' && vehicle.price_per_day && (
                    <>
                      <div className="text-2xl font-bold text-gray-900">{vehicle.price_per_day.toLocaleString('fr-FR')} €<span className="text-base text-gray-500 font-normal">/jour</span></div>
                      <p className="text-xs text-gray-400">Caution : {(vehicle.deposit_amount || 500).toLocaleString('fr-FR')} €</p>
                    </>
                  )}
                  {listingType === 'vente' && vehicle.sale_price && (
                    <div className="text-2xl font-bold text-gray-900">{vehicle.sale_price.toLocaleString('fr-FR')} €</div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                {vehicle.owner_verified && <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> KYC vérifié</span>}
                {listingType === 'location' && <span className="badge badge-blue"><Shield className="w-3 h-3" /> Assurance incluse</span>}
                {vehicle.first_hand && <span className="badge badge-blue">1ère main</span>}
                {vehicle.negotiable && listingType === 'vente' && <span className="badge badge-gray">Prix négociable</span>}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: 'Année', value: vehicle.year },
                  { icon: <Gauge className="w-4 h-4" />, label: 'Kilométrage', value: `${vehicle.mileage?.toLocaleString('fr-FR')} km` },
                  { icon: <Fuel className="w-4 h-4" />, label: 'Carburant', value: FUEL_LABELS[vehicle.fuel || ''] || vehicle.fuel },
                  { icon: <Users className="w-4 h-4" />, label: 'Places', value: `${vehicle.seats} places` },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Ville', value: vehicle.city },
                  { icon: <Gauge className="w-4 h-4" />, label: 'Boîte', value: vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle' },
                  ...(vehicle.power_din ? [{ icon: <Zap className="w-4 h-4" />, label: 'Puissance', value: `${vehicle.power_din} ch` }] : []),
                  ...(listingType === 'location' && vehicle.included_km_per_day ? [{ icon: <Gauge className="w-4 h-4" />, label: 'Km inclus', value: `${vehicle.included_km_per_day} km/jour` }] : [])
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                    <span className="text-blue-500">{spec.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400">{spec.label}</p>
                      <p className="text-sm font-medium text-gray-800">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                </div>
              )}

              {/* Options */}
              {vehicle.options && vehicle.options.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Équipements</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.options.map((opt, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-green-500" /> {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Propriétaire */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Proposé par</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                  {vehicle.owner_first_name?.[0]}{vehicle.owner_last_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{vehicle.owner_first_name} {vehicle.owner_last_name?.[0]}.</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    {vehicle.owner_verified && <span className="flex items-center gap-1 text-green-600 text-xs"><Shield className="w-3 h-3" /> Vérifié</span>}
                    {vehicle.owner_trust_score !== undefined && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${vehicle.owner_trust_score >= 80 ? 'bg-green-100 text-green-700' : vehicle.owner_trust_score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        Score {vehicle.owner_trust_score}/100
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={handleContact} className="btn-outline btn-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Contacter
                </button>
              </div>
            </div>

            {/* Avis */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Avis ({reviews.length})</h3>
                <div className="space-y-4">
                  {reviews.map((r, i) => (
                    <div key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {r.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.first_name} {r.last_name?.[0]}.</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={r.rating} />
                            <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar réservation / contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {listingType === 'location' ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {vehicle.price_per_day?.toLocaleString('fr-FR')} € <span className="text-base text-gray-500 font-normal">/jour</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{vehicle.included_km_per_day} km inclus/jour · +{vehicle.extra_km_price?.toFixed(2)} €/km suppl.</p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="label text-xs">Date de départ</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                        className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="label text-xs">Date de retour</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]}
                        className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="label text-xs">Message (optionnel)</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Présentez-vous brièvement…" rows={2}
                        className="input-field text-sm resize-none" />
                    </div>
                  </div>

                  {/* Récapitulatif prix */}
                  {days > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1.5">
                      <div className="flex justify-between text-gray-600">
                        <span>{vehicle.price_per_day?.toLocaleString('fr-FR')} € × {days} jour{days > 1 ? 's' : ''}</span>
                        <span>{subtotal.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-xs">
                        <span>Frais de service (15%)</span>
                        <span>{platformFee.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                        <span>Total</span>
                        <span>{total.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €</span>
                      </div>
                    </div>
                  )}

                  {/* Caution info */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mb-4">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Caution : {vehicle.deposit_amount?.toLocaleString('fr-FR')} €</p>
                      <p className="text-xs text-blue-700 mt-0.5">Pré-autorisation Stripe — jamais débitée sans preuve</p>
                    </div>
                  </div>

                  <button onClick={handleReserve} disabled={reserving || !startDate || !endDate}
                    className="btn-primary w-full justify-center">
                    {reserving ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : 'Demander la réservation'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Sans engagement · Annulation gratuite 48h avant</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {vehicle.sale_price?.toLocaleString('fr-FR')} €
                  </div>
                  {vehicle.negotiable && <p className="text-sm text-gray-500 mb-4">Prix négociable</p>}
                  <button onClick={handleContact} className="btn-primary w-full justify-center mb-3">
                    <MessageSquare className="w-4 h-4" /> Contacter le vendeur
                  </button>
                  <p className="text-xs text-gray-400 text-center">Votre demande sera transmise via notre messagerie sécurisée</p>
                </div>
              )}

              {/* Infos sécurité */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Votre protection</h4>
                {[
                  { icon: <Shield className="w-4 h-4 text-green-600" />, text: 'Identité propriétaire vérifiée' },
                  { icon: <Lock className="w-4 h-4 text-blue-600" />, text: 'Paiement sécurisé Stripe' },
                  { icon: <CheckCircle className="w-4 h-4 text-purple-600" />, text: 'Assurance RC incluse' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
