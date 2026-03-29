'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Download, ZoomIn } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import toast from 'react-hot-toast'

const DOC_LABELS: Record<string, string> = { permis_conduire:'Permis de conduire', carte_grise:'Carte grise', piece_identite:"Pièce d'identité" }

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('en_attente')
  const [previewDoc, setPreviewDoc] = useState<{ id: string; name: string } | null>(null)
  const BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')

  const load = () => {
    setLoading(true)
    adminApi.getDocuments({ status: statusFilter||undefined, limit: 50 })
      .then(r => setDocs(r.data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [statusFilter])

  const validate = async (id: string) => {
    try { await adminApi.validateDocument(id); toast.success('Document validé.'); load() }
    catch { toast.error('Erreur') }
  }

  const refuse = async (id: string) => {
    const reason = prompt('Motif de refus (obligatoire) :')
    if (!reason) return
    try { await adminApi.refuseDocument(id, reason); toast.success('Document refusé.'); load() }
    catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents KYC</h1>
        <p className="text-gray-400 text-sm mt-0.5">Vérification des pièces justificatives — ces documents ne sont jamais accessibles publiquement.</p>
      </div>

      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit">
        {[['en_attente','En attente'],['valide','Validés'],['refuse','Refusés'],['','Tous']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === val ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />) :
        docs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun document dans cette catégorie</p>
          </div>
        ) : docs.map((item: unknown) => {
          const d = item as { id: string; document_type: string; status: string; file_name: string; mime_type: string; created_at: string; user_id: string; first_name: string; last_name: string; email: string; trust_score: number; refusal_reason?: string }
          const fileUrl = `${BASE}/api/v1/admin/documents/file/${d.id}`
          const isPdf = d.mime_type === 'application/pdf'
          return (
            <motion.div key={d.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-5">
              {/* Miniature */}
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-700">
                {isPdf ? (
                  <span className="text-xs text-gray-400 font-mono">PDF</span>
                ) : (
                  <img src={fileUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">{DOC_LABELS[d.document_type] || d.document_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === 'valide' ? 'bg-green-900/50 text-green-400' :
                    d.status === 'en_attente' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>{d.status}</span>
                </div>
                <p className="text-gray-300 text-sm">{d.first_name} {d.last_name} <span className="text-gray-500">·</span> <span className="text-gray-500">{d.email}</span></p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString('fr-FR')}</span>
                  <span className={`text-xs font-medium ${d.trust_score >= 80 ? 'text-green-400' : d.trust_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>Score {d.trust_score}/100</span>
                </div>
                {d.refusal_reason && <p className="text-xs text-red-400 mt-1">Motif : {d.refusal_reason}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Ouvrir le document">
                  <ZoomIn className="w-4 h-4" />
                </a>
                <a href={fileUrl} download={d.file_name}
                  className="p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Télécharger">
                  <Download className="w-4 h-4" />
                </a>
                {d.status === 'en_attente' && (
                  <>
                    <button onClick={() => validate(d.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-900/40 text-green-400 hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Valider
                    </button>
                    <button onClick={() => refuse(d.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded-lg text-xs font-medium transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Refuser
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
