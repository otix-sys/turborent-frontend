'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Car } from 'lucide-react'
import { authApi } from '../../../lib/api'

function VerifyEmailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token manquant.')
      return
    }

    authApi.verifyEmail(token)
      .then(res => {
        setStatus('success')
        setMessage(res.data.message)
        setTimeout(() => router.push('/auth/login'), 3000)
      })
      .catch(err => {
        const data = err.response?.data
        if (data?.expired) setStatus('expired')
        else setStatus('error')
        setMessage(data?.error || 'Lien invalide.')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            Turbo<span className="text-blue-600">Rent</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600">Vérification en cours…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Email vérifié !</h2>
              <p className="text-gray-500 text-sm">{message}</p>
              <p className="text-xs text-gray-400">Redirection dans 3 secondes…</p>
              <Link href="/auth/login" className="btn-primary w-full justify-center block text-center">
                Se connecter
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'expired') && (
            <div className="space-y-4">
              <XCircle className="w-14 h-14 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">
                {status === 'expired' ? 'Lien expiré' : 'Lien invalide'}
              </h2>
              <p className="text-gray-500 text-sm">{message}</p>
              {status === 'expired' && (
                <Link href="/auth/login" className="btn-outline w-full justify-center block text-center">
                  Demander un nouveau lien
                </Link>
              )}
              <Link href="/" className="btn-secondary w-full justify-center block text-center">
                Retour à l'accueil
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
