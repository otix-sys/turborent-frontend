import type { Metadata } from 'next'
import { ForgotPasswordForm } from '../../../components/auth/AuthForms'
export const metadata: Metadata = { title: 'Mot de passe oublié | TurboRent', robots: { index: false } }
export default function ForgotPasswordPage() { return <ForgotPasswordForm /> }
