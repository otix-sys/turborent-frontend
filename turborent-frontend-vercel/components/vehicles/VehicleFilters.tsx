'use client'
import { useState, useCallback } from 'react'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { VehicleFilters } from '../../types'

interface Props {
  filters: VehicleFilters
  onChange: (f: VehicleFilters) => void
  listingType: 'location' | 'vente'
}

const CATEGORIES = ['voiture','moto','scooter','utilitaire','camping_car','camion']
const CAT_LABELS: Record<string,string> = { voiture:'Voiture', moto:'Moto', scooter:'Scooter', utilitaire:'Utilitaire', camping_car:'Camping-car', camion:'Camion' }
const FUELS = ['essence','diesel','electrique','hybride','hybride_rechargeable','gpl']
const FUEL_LABELS: Record<string,string> = { essence:'Essence', diesel:'Diesel', electrique:'Électrique', hybride:'Hybride', hybride_rechargeable:'Hybride rech.', gpl:'GPL' }
const CURRENT_YEAR = new Date().getFullYear()

export default function VehicleFilters({ filters, onChange, listingType }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string,boolean>>({ prix:true, annee:true, kilometrage:true, carburant:true, transmission:true })

  const update = useCallback((key: keyof VehicleFilters, value: unknown) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }, [filters, onChange])

  const reset = () => onChange({ type: listingType, page: 1 })
  const activeCount = Object.keys(filters).filter(k => !['type','page','limit','sort'].includes(k) && filters[k as keyof VehicleFilters] !== undefined && filters[k as keyof VehicleFilters] !== '').length

  const toggle = (section: string) => setExpanded(e => ({ ...e, [section]: !e[section] }))

  const Section = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={() => toggle(id)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3">
        {label}
        {expanded[id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded[id] && <div>{children}</div>}
    </div>
  )

  const content = (
    <div className="space-y-0">
      {/* Catégorie */}
      <Section id="categorie" label="Catégorie">
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => update('category', filters.category === cat ? undefined : cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filters.category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>
      </Section>

      {/* Prix */}
      <Section id="prix" label={listingType === 'location' ? 'Prix / jour (€)' : 'Prix de vente (€)'}>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" min={0} value={filters.min_price || ''}
            onChange={e => update('min_price', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input type="number" placeholder="Max" min={0} value={filters.max_price || ''}
            onChange={e => update('max_price', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Section>

      {/* Année */}
      <Section id="annee" label="Année">
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="De" min={1980} max={CURRENT_YEAR} value={filters.min_year || ''}
            onChange={e => update('min_year', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input type="number" placeholder="À" min={1980} max={CURRENT_YEAR} value={filters.max_year || ''}
            onChange={e => update('max_year', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Section>

      {/* Kilométrage */}
      <Section id="kilometrage" label="Kilométrage (km)">
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" min={0} value={filters.min_mileage ?? ''}
            onChange={e => update('min_mileage', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input type="number" placeholder="Max" min={0} value={filters.max_mileage ?? ''}
            onChange={e => update('max_mileage', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Section>

      {/* Carburant */}
      <Section id="carburant" label="Carburant">
        <div className="space-y-1.5">
          {FUELS.map(fuel => (
            <label key={fuel} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="fuel" checked={filters.fuel === fuel} onChange={() => update('fuel', filters.fuel === fuel ? undefined : fuel)}
                className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{FUEL_LABELS[fuel]}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Transmission */}
      <Section id="transmission" label="Boîte de vitesses">
        <div className="flex gap-2">
          {[['manuelle','Manuelle'],['automatique','Automatique']].map(([val, label]) => (
            <button key={val} onClick={() => update('transmission', filters.transmission === val ? undefined : val)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                filters.transmission === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Nombre de places */}
      <Section id="places" label="Places minimum">
        <div className="flex gap-1.5 flex-wrap">
          {[2,4,5,7,8,9].map(n => (
            <button key={n} onClick={() => update('seats', filters.seats === n ? undefined : n)}
              className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${
                filters.seats === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              {n}+
            </button>
          ))}
        </div>
      </Section>

      {/* Bouton réinitialiser */}
      {activeCount > 0 && (
        <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 mt-2">
          <X className="w-4 h-4" /> Effacer les filtres ({activeCount})
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filtres
              {activeCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>
              )}
            </h2>
          </div>
          {content}
        </div>
      </aside>

      {/* Mobile: bouton + drawer */}
      <div className="lg:hidden">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
          <SlidersHorizontal className="w-4 h-4" /> Filtres
          {activeCount > 0 && <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>}
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Filtres</h2>
                <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              {content}
              <button onClick={() => setOpen(false)} className="w-full btn-primary justify-center mt-4">
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
