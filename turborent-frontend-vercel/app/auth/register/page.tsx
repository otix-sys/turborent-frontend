import type { Metadata } from 'next'
import { RegisterForm } from '../../../components/auth/AuthForms'
export const metadata: Metadata = { title: 'Créer un compte | TurboRent' }
export default function RegisterPage() { return <RegisterForm /> }
