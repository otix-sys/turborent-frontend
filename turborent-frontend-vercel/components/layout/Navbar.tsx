'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Car, Bell, MessageSquare, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { notificationsApi } from '../../lib/api'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [unread, setUnread] = useState(0)
  const { user, isAuthenticated, signOut } = useAuth()
  const pathname = usePathname()

  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    notificationsApi.getAll().then(r => {
      setUnread(r.data.unreadCount || 0)
    }).catch(() => {})
  }, [isAuthenticated])

  const navLinks = [
    { href: '/location', label: 'Location' },
    { href: '/vente', label: 'Vente' },
    { href: '/blog', label: 'Conseils' }
  ]

  const bgClass = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${isHome && !scrolled ? 'text-white' : 'text-gray-900'}`}>
              Turbo<span className="text-blue-600">Rent</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-600'
                    : isHome && !scrolled
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link href="/tableau-de-bord/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className={`w-5 h-5 ${isHome && !scrolled ? 'text-white' : 'text-gray-600'}`} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>

                {/* Messages */}
                <Link href="/tableau-de-bord/messages" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MessageSquare className={`w-5 h-5 ${isHome && !scrolled ? 'text-white' : 'text-gray-600'}`} />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isHome && !scrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${isHome && !scrolled ? 'text-white' : 'text-gray-700'}`}>
                      {user.first_name}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${isHome && !scrolled ? 'text-white' : 'text-gray-500'}`} />
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                        onMouseLeave={() => setUserMenu(false)}
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/tableau-de-bord" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Car className="w-4 h-4 text-gray-400" /> Mon espace
                        </Link>
                        <Link href="/tableau-de-bord/profil" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User className="w-4 h-4 text-gray-400" /> Mon profil
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors">
                            <Shield className="w-4 h-4 text-purple-500" /> Administration
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={signOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Connexion
                </Link>
                <Link href="/auth/register" className="btn-primary btn-sm">
                  S'inscrire gratuitement
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg">
            {open
              ? <X className={`w-6 h-6 ${isHome && !scrolled ? 'text-white' : 'text-gray-700'}`} />
              : <Menu className={`w-6 h-6 ${isHome && !scrolled ? 'text-white' : 'text-gray-700'}`} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/tableau-de-bord" onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                      Mon espace
                    </Link>
                    <button onClick={() => { signOut(); setOpen(false) }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)}
                      className="block btn-secondary w-full text-center">
                      Connexion
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)}
                      className="block btn-primary w-full text-center">
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
