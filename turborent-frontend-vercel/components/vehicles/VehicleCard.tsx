'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Shield, Zap, Fuel, Users } from 'lucide-react'
import { Vehicle } from '../../types'
import { vehiclesApi } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Props {
  vehicle: Vehicle
  showFavorite?: boolean
}

const FUEL_LABELS: Record<string, string> = {
  essence: 'Essence', diesel: 'Diesel', electrique: 'Électrique',
  hybride: 'Hybride', hybride_rechargeable: 'Hybride rech.', gpl: 'GPL'
}

export default function VehicleCard({ vehicle, showFavorite = true }: Props) {
  const [favorite, setFavorite] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const { isAuthenticated } = useAuth()

  const href = `/${vehicle.listing_type}/${vehicle.slug || vehicle.id}`
  const price = vehicle.listing_type === 'location' ? vehicle.price_per_day : vehicle.sale_price
  const priceLabel = vehicle.listing_type === 'location' ? '/jour' : ''

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Connectez-vous pour ajouter aux favoris'); return }
    try {
      const res = await vehiclesApi.toggleFavorite(vehicle.id)
      setFavorite(res.data.isFavorite)
      toast.success(res.data.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris')
    } catch { toast.error('Erreur') }
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={href} className="group block">
        <div className="card-hover overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
            {vehicle.primary_photo && !imgErr ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${vehicle.primary_photo}`}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-4xl text-gray-300">🚗</span>
              </div>
            )}

            {/* Badge featured */}
            {vehicle.is_featured && vehicle.featured_until && new Date(vehicle.featured_until) > new Date() && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                <Zap className="w-3 h-3" /> En avant
              </div>
            )}

            {/* Badge type */}
            <div className={`absolute top-3 ${vehicle.is_featured ? 'left-24' : 'left-3'} text-xs font-semibold px-2.5 py-1 rounded-full ${
              vehicle.listing_type === 'location'
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}>
              {vehicle.listing_type === 'location' ? 'Location' : 'Vente'}
            </div>

            {/* Favori */}
            {showFavorite && (
              <button
                onClick={toggleFav}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            )}

            {/* Photo count */}
            {vehicle.photo_count && vehicle.photo_count > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                {vehicle.photo_count} photos
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Marque + modèle */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{vehicle.brand}</p>
                <h3 className="font-bold text-gray-900 text-base leading-tight">
                  {vehicle.model} {vehicle.version && <span className="font-normal text-gray-600">{vehicle.version}</span>}
                </h3>
              </div>
              {/* Rating */}
              {vehicle.review_count && vehicle.review_count > 0 ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{Number(vehicle.avg_rating).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({vehicle.review_count})</span>
                </div>
              ) : null}
            </div>

            {/* Specs */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <span>{vehicle.year}</span>
              <span>·</span>
              <span>{vehicle.mileage?.toLocaleString('fr-FR')} km</span>
              {vehicle.fuel && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    {FUEL_LABELS[vehicle.fuel] || vehicle.fuel}
                  </span>
                </>
              )}
              {vehicle.seats && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {vehicle.seats}pl
                  </span>
                </>
              )}
            </div>

            {/* Localisation */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{vehicle.city}</span>
              {vehicle.owner_verified && (
                <div className="ml-auto flex items-center gap-1 text-green-600">
                  <Shield className="w-3 h-3" />
                  <span>Vérifié</span>
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="flex items-end justify-between pt-3 border-t border-gray-100">
              <div>
                {price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </span>
                    {priceLabel && <span className="text-sm text-gray-400">{priceLabel}</span>}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Prix sur demande</span>
                )}
                {vehicle.listing_type === 'location' && vehicle.deposit_amount && (
                  <p className="text-xs text-gray-400">Caution : {vehicle.deposit_amount.toLocaleString('fr-FR')} €</p>
                )}
              </div>

              {/* Trust score owner */}
              {vehicle.owner_trust_score !== undefined && (
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  vehicle.owner_trust_score >= 80 ? 'bg-green-100 text-green-700'
                  : vehicle.owner_trust_score >= 50 ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {vehicle.owner_trust_score}/100
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
