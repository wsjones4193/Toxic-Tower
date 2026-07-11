import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0710] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="The Toxic Tower"
              width={36}
              height={36}
              className="rounded-md"
            />
            <div>
              <p className="font-bold text-sm text-white">The Toxic Tower</p>
              <p className="text-xs text-white/40">Fantasy Football</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm text-white/50">
            <Link href="/articles" className="hover:text-white/80 transition-colors">
              Articles
            </Link>
            <Link href="/rankings" className="hover:text-white/80 transition-colors">
              Rankings
            </Link>
            <Link href="/updates" className="hover:text-white/80 transition-colors">
              Changelog
            </Link>
          </nav>

          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} The Toxic Tower. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
