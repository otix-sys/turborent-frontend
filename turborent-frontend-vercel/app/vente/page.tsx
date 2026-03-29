'use client'
import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SortAsc } from 'lucide-react'
import { vehiclesApi } from '../../lib/api'
import type { Vehicle, VehicleFilters, PaginationData } from '../../types'
import VehicleCard from '../../components/vehicles/VehicleCard'
import VehicleFiltersComponent from '../../components/vehicles/VehicleFilters'

function VenteContent() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<VehicleFilters>({
    type: 'vente',
    sort: 'recent',
    page: 1,
  })

  const fetchVehicles = useCallback(async (f: VehicleFilters, q?: string) => {
    setLoading(true)
    try {
      const res = await vehiclesApi.list({ ...f, type: 'vente', q })
      setVehicles(res.data.vehicles || [])
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles(filters, searchInput || undefined)
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVehicles(filters, searchInput || undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vente de véhicules</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {loading ? '…' : `${pagination.total.toLocaleString('fr-FR')} annonce(s)`}
              </p>
            </div>
            <form onSubmit={handleSearch} className="sm:ml-auto flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Marque, ville, modèle…"
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button type="submit" className="btn-primary btn-sm px-4">Rechercher</button>
            </form>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={filters.sort || 'recent'}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value, page: 1 }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="recent">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="year_desc">Année (récent)</option>
              <option value="mileage_asc">Kilométrage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <VehicleFiltersComponent
            filters={filters}
            onChange={f => setFilters({ ...f, type: 'vente' })}
            listingType="vente"
          />

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-skeleton">
                    <div className="skeleton h-44 w-full" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 w-2/3 rounded" />
                      <div className="skeleton h-5 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                <p className="text-gray-500 text-sm">Modifiez vos critères ou revenez plus tard.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <VehicleCard vehicle={v} />
                    </motion.div>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                      disabled={(filters.page || 1) <= 1}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      ← Précédent
                    </button>
                    {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          filters.page === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                      disabled={(filters.page || 1) >= pagination.pages}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )
}

export default function VentePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VenteContent />
    </Suspense>
  )
}
