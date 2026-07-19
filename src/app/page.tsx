import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { FileText, TrendingUp, ScrollText, ShoppingBag, ExternalLink } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative pt-16 pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,47,201,0.15)_0%,transparent_60%)]" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.jpg"
                alt="Toxic Tower"
                width={200}
                height={200}
                className="rounded-2xl glow-green"
                priority
              />
            </div>
            <p className="text-base md:text-lg text-white max-w-2xl mx-auto mb-3">
              Your favorite TOXIC trio{' '}
              <a href="https://x.com/PPRTyler" target="_blank" rel="noopener noreferrer" className="text-[#FFB800] hover:underline">@PPRTyler</a>{' '}
              <a href="https://x.com/BestBallGuy" target="_blank" rel="noopener noreferrer" className="text-[#FFB800] hover:underline">@BestBallGuy</a>{' '}
              <a href="https://x.com/Emo__Cowboy" target="_blank" rel="noopener noreferrer" className="text-[#FFB800] hover:underline">@Emo_Cowboy</a>{' '}
              with live best ball streams EVERY week
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.youtube.com/@TheToxicTower"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://play.underdogsports.com/vgwg/p-toxic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink size={14} /> Play Underdog
              </a>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

          {/* Articles — full width */}
          <Link href="/articles" className="group block rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-[#8B2FC9]/40 transition-all duration-200 p-8 mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-[#8B2FC9]/20 text-[#8B2FC9]">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors">Articles</h2>
                <p className="text-sm text-white/40">Analysis, strategy, and takes from the tower</p>
              </div>
              <span className="ml-auto text-white/20 group-hover:text-[#FFB800] transition-colors text-2xl">→</span>
            </div>
          </Link>

          {/* Rankings + Changelog — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Link href="/rankings" className="group block rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-[#FFB800]/40 transition-all duration-200 p-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-[#FFB800]/15 text-[#FFB800]">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors">Rankings</h2>
                  <p className="text-sm text-white/40">Live player rankings by position</p>
                </div>
              </div>
              <span className="text-white/20 group-hover:text-[#FFB800] transition-colors text-2xl">→</span>
            </Link>

            <Link href="/updates" className="group block rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-[#FFB800]/40 transition-all duration-200 p-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-[#FFB800]/15 text-[#FFB800]">
                  <ScrollText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors">Changelog</h2>
                  <p className="text-sm text-white/40">Ranking moves and updates over time</p>
                </div>
              </div>
              <span className="text-white/20 group-hover:text-[#FFB800] transition-colors text-2xl">→</span>
            </Link>
          </div>

          {/* Merch — full width, coming soon */}
          <div className="group block rounded-2xl border border-white/8 bg-white/3 p-8 opacity-60 cursor-not-allowed relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-white/10 text-white/50 font-medium">
              Coming Soon
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 text-white/40">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white/50">Merch</h2>
                <p className="text-sm text-white/30">Toxic Tower gear dropping soon</p>
              </div>
            </div>
          </div>

        </section>
      </main>
      <Footer />
    </>
  )
}
