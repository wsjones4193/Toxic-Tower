import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TrendingUp, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,47,201,0.15)_0%,transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/logo.jpg"
                alt="The Toxic Tower"
                width={400}
                height={400}
                className="rounded-2xl glow-green"
                priority
              />
            </div>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
              Your crew's hub for fantasy football rankings and analysis.
              Built for the homies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FFB800] text-black font-semibold hover:bg-[#FFB800]/90 transition-colors glow-green"
              >
                <TrendingUp size={18} />
                View Rankings
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-colors"
              >
                <FileText size={18} />
                Read Articles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
