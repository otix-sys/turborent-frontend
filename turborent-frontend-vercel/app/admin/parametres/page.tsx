'use client'
import { useEffect, useState } from 'react'
import { Save, Loader2, RefreshCw } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import toast from 'react-hot-toast'

const FIELDS = [
  { section: 'Apparence', fields: [
    { key:'hero_title', label:'Titre Hero', type:'text' },
    { key:'hero_subtitle', label:'Sous-titre Hero', type:'text' },
    { key:'hero_image_url', label:'URL image Hero', type:'text', hint:'Chemin ou URL complète vers l\'image BMW M5' },
  ]},
  { section: 'Statistiques (affichées sur l\'accueil)', fields: [
    { key:'stat_users', label:'Nombre d\'utilisateurs', type:'number' },
    { key:'stat_vehicles', label:'Nombre de véhicules', type:'number' },
    { key:'stat_satisfaction', label:'Taux satisfaction (%)', type:'number' },
  ]},
  { section: 'Commissions', fields: [
    { key:'commission_rental_percent', label:'Commission location (%)', type:'number', hint:'Ex: 15 pour 15%' },
    { key:'commission_sale_percent', label:'Commission vente (%)', type:'number', hint:'Ex: 3 pour 3%' },
    { key:'commission_sale_max', label:'Commission vente plafond (€)', type:'number' },
    { key:'deposit_default', label:'Caution par défaut (€)', type:'number' },
  ]},
  { section: 'Prix boosts', fields: [
    { key:'boost_price_1_day', label:'Boost 1 jour (€)', type:'number' },
    { key:'boost_price_3_days', label:'Boost 3 jours (€)', type:'number' },
    { key:'boost_price_7_days', label:'Boost 7 jours (€)', type:'number' },
    { key:'boost_price_14_days', label:'Boost 14 jours (€)', type:'number' },
    { key:'boost_price_30_days', label:'Boost 30 jours (€)', type:'number' },
  ]},
  { section: 'Système', fields: [
    { key:'allow_registration', label:'Inscriptions ouvertes', type:'boolean' },
    { key:'maintenance_mode', label:'Mode maintenance', type:'boolean' },
  ]},
]

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.getSettings()
      .then(r => setSettings(r.data.settings || {}))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const update = (key: string, value: string) => {
    setSettings(s => ({ ...s, [key]: value }))
    setDirty(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      await adminApi.updateSettings(settings)
      toast.success('Paramètres sauvegardés.')
      setDirty(false)
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres du site</h1>
          <p className="text-gray-400 text-sm mt-0.5">Modifiez sans toucher au code. Toutes les modifications sont appliquées en temps réel.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Recharger
          </button>
          <button onClick={save} disabled={!dirty || saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${dirty ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</> : <><Save className="w-4 h-4" /> Sauvegarder</>}
          </button>
        </div>
      </div>

      {dirty && (
        <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
          ⚠ Modifications non sauvegardées — Cliquez sur "Sauvegarder" pour les appliquer.
        </div>
      )}

      <div className="space-y-6">
        {FIELDS.map(({ section, fields }) => (
          <div key={section} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/50">
              <h2 className="text-white font-semibold text-sm">{section}</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ key, label, type, hint }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                  {type === 'boolean' ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => update(key, settings[key] === 'true' ? 'false' : 'true')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings[key] === 'true' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] === 'true' ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className="text-gray-400 text-sm">{settings[key] === 'true' ? 'Activé' : 'Désactivé'}</span>
                    </div>
                  ) : (
                    <input
                      type={type}
                      value={settings[key] || ''}
                      onChange={e => update(key, e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                  )}
                  {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
