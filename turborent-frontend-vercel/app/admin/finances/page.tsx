'use client'
import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { adminApi } from '../../../lib/api'

export default function AdminFinancesPage() {
  const [data, setData] = useState<{ transactions: unknown[]; totals: Record<string,string> }>({ transactions: [], totals: {} })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    adminApi.getTransactions({ type: filter||undefined, limit:50 })
      .then(r => setData({ transactions: r.data.transactions||[], totals: r.data.totals||{} }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const TYPE_CONFIG: Record<string,{ label:string; color:string }> = {
    location:      { label:'Location',   color:'blue' },
    commission:    { label:'Commission', color:'green' },
    depot:         { label:'Dépôt',      color:'yellow' },
    boost:         { label:'Boost',      color:'purple' },
    remboursement: { label:'Remboursement', color:'red' }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Finances</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Commissions totales', value:`${Number(data.totals.total_commission||0).toLocaleString('fr-FR')} €`, icon:<DollarSign className="w-5 h-5 text-green-400" />, color:'green' },
          { label:'Volume locations', value:`${Number(data.totals.total_location||0).toLocaleString('fr-FR')} €`, icon:<TrendingUp className="w-5 h-5 text-blue-400" />, color:'blue' },
          { label:'Revenus boosts', value:`${Number(data.totals.total_boost||0).toLocaleString('fr-FR')} €`, icon:<ArrowUpRight className="w-5 h-5 text-purple-400" />, color:'purple' },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`w-10 h-10 bg-${kpi.color}-900/40 rounded-lg flex items-center justify-center mb-3`}>{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-gray-400 text-sm mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit">
        {[['','Toutes'],['commission','Commissions'],['location','Locations'],['boost','Boosts']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === val ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">De</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Vers</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Montant</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Statut</th>
          </tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-gray-800"><td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td></tr>
            )) : data.transactions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Aucune transaction</td></tr>
            ) : data.transactions.map((item: unknown) => {
              const t = item as { id:string; type:string; amount:number; currency:string; status:string; created_at:string; from_email?:string; to_email?:string }
              const cfg = TYPE_CONFIG[t.type] || { label: t.type, color: 'gray' }
              return (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full bg-${cfg.color}-900/40 text-${cfg.color}-400`}>{cfg.label}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[120px]">{t.from_email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[120px]">{t.to_email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold text-sm ${t.type === 'remboursement' ? 'text-red-400' : 'text-green-400'}`}>
                      {t.type === 'remboursement' ? '-' : '+'}{Number(t.amount).toLocaleString('fr-FR')} {t.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'capture' ? 'bg-green-900/40 text-green-400' : t.status === 'rembourse' ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
