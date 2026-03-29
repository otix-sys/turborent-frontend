'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, Clock, XCircle, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { documentsApi } from '../../../lib/api'
import { Document } from '../../../types'
import toast from 'react-hot-toast'

const DOC_CONFIG = [
  { type: 'permis_conduire', label: 'Permis de conduire', desc: 'Recto et verso, lisible, non expiré', accept: '.jpg,.jpeg,.png,.pdf' },
  { type: 'piece_identite', label: "Pièce d'identité", desc: 'Carte nationale d\'identité ou passeport', accept: '.jpg,.jpeg,.png,.pdf' },
  { type: 'carte_grise', label: 'Carte grise', desc: 'Document de votre véhicule à louer', accept: '.jpg,.jpeg,.png,.pdf' }
]

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = () => {
    documentsApi.getMine()
      .then(r => setDocs(r.data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const getDoc = (type: string) => docs.find(d => d.document_type === type)

  const handleUpload = async (type: string, file: File) => {
    setUploading(type)
    try {
      await documentsApi.upload(type, file)
      toast.success('Document soumis. Notre équipe le vérifiera sous 24-48h.')
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur lors de l\'upload')
    } finally {
      setUploading(null)
    }
  }

  const allValid = DOC_CONFIG.every(d => getDoc(d.type)?.status === 'valide')
  const validCount = DOC_CONFIG.filter(d => getDoc(d.type)?.status === 'valide').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents KYC</h1>
        <p className="text-gray-500 mt-1">
          Vos documents sont chiffrés et accessibles uniquement par notre équipe de vérification.
        </p>
      </div>

      {/* Progression */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Vérification d'identité</span>
          <span className="text-sm text-gray-500">{validCount}/3 documents validés</span>
        </div>
        <div className="flex gap-1.5">
          {DOC_CONFIG.map((d, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${
              getDoc(d.type)?.status === 'valide' ? 'bg-green-500'
              : getDoc(d.type)?.status === 'en_attente' ? 'bg-yellow-400'
              : getDoc(d.type)?.status === 'refuse' ? 'bg-red-400'
              : 'bg-gray-200'
            }`} />
          ))}
        </div>
        {allValid && (
          <div className="flex items-center gap-2 mt-3 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Tous vos documents sont validés. Profil certifié ✓</span>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="space-y-4">
        {DOC_CONFIG.map(({ type, label, desc, accept }) => {
          const doc = getDoc(type)
          const isUploading = uploading === type

          return (
            <motion.div key={type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc?.status === 'valide' ? 'bg-green-100' : doc?.status === 'en_attente' ? 'bg-yellow-100' : doc?.status === 'refuse' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {doc?.status === 'valide' ? <CheckCircle className="w-6 h-6 text-green-600" />
                    : doc?.status === 'en_attente' ? <Clock className="w-6 h-6 text-yellow-600" />
                    : doc?.status === 'refuse' ? <XCircle className="w-6 h-6 text-red-600" />
                    : <FileText className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                    {doc && (
                      <div className="mt-2">
                        <span className={`badge ${
                          doc.status === 'valide' ? 'badge-green' : doc.status === 'en_attente' ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {doc.status === 'valide' ? 'Validé' : doc.status === 'en_attente' ? 'En attente de vérification' : 'Refusé'}
                        </span>
                        {doc.refusal_reason && (
                          <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{doc.refusal_reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {doc?.status !== 'valide' && (
                  <div>
                    <input
                      ref={el => { fileInputRefs.current[type] = el }}
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(type, f) }}
                    />
                    <button
                      onClick={() => fileInputRefs.current[type]?.click()}
                      disabled={isUploading}
                      className="btn-primary btn-sm flex items-center gap-2"
                    >
                      {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Upload…</>
                      : <><Upload className="w-4 h-4" /> {doc ? 'Remplacer' : 'Envoyer'}</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Info sécurité */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Sécurité et confidentialité :</strong> Vos documents sont chiffrés AES-256 et stockés sur des serveurs sécurisés. Ils sont accessibles uniquement par notre équipe de vérification et ne sont jamais partagés avec d'autres utilisateurs. Conformité RGPD totale.
        </div>
      </div>
    </div>
  )
}
