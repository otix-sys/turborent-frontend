'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResetPasswordForm } from '../../../components/auth/AuthForms'

function ResetPasswordContent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  return <ResetPasswordForm token={token} />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
