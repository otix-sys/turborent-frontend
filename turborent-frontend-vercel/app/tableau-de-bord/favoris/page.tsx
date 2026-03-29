'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { vehiclesApi } from '../../../lib/api'
import { Vehicle } from '../../../types'
import VehicleCard from '../../../components/vehicles/VehicleCard'

export default function FavorisPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer les favoris de l'utilisateur via la liste avec flag favorites
    vehiclesApi.list({ favorites: true }).then(r => setVehicles(r.data.vehicles || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">Aucun favori</h3>
          <p className="text-gray-400 text-sm mb-6">Parcourez les annonces et cliquez sur ❤ pour sauvegarder vos véhicules préférés.</p>
          <Link href="/location" className="btn-primary inline-flex">Parcourir les annonces</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}
    </div>
  )
}
