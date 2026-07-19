'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Settings } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/articles', label: 'Articles' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/updates', label: 'Changelog' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#231540]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.jpg"
              alt="The Toxic Tower"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="hidden sm:block font-bold text-white text-lg leading-tight">
              Toxic Tower
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#FFB800] bg-[#FFB800]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Admin + Mobile */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="p-2 rounded-md text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
              title="Admin"
            >
              <Settings size={16} />
            </Link>
            <button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-white/5 pt-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#FFB800] bg-[#FFB800]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
