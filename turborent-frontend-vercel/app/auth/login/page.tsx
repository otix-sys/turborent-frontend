import type { Metadata } from 'next'
import { LoginForm } from '../../../components/auth/AuthForms'
export const metadata: Metadata = { title: 'Connexion | TurboRent', robots: { index: false } }
export default function LoginPage() { return <LoginForm /> }
