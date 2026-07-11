'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Image as ImageIcon,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/rankings', label: 'Rankings', icon: TrendingUp },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/updates', label: 'Updates', icon: History },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/5">
        <Image src="/logo.jpg" alt="EDG" width={28} height={28} className="rounded-md" />
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Admin</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {links.map((l) => {
          const isActive = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#FFB800]/10 text-[#FFB800]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <l.icon size={15} />
              {l.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-4 border-t border-white/5 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  )
}

export default function AdminNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-[#0d0d0d] border-r border-white/5 flex-col z-40">
        <NavContent />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="EDG" width={24} height={24} className="rounded" />
          <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Admin</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white/60 hover:text-white">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-56 bg-[#0d0d0d] border-r border-white/5 flex flex-col">
            <button
              className="absolute top-4 right-4 text-white/40 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
            <NavContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
