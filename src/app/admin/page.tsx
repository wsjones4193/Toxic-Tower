import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, TrendingUp, Plus, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: articleCount },
    { count: playerCount },
    { count: versionCount },
  ] = await Promise.all([
    supabase.from('tt_articles').select('*', { count: 'exact', head: true }),
    supabase.from('tt_players').select('*', { count: 'exact', head: true }),
    supabase.from('tt_ranking_versions').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-white/40 text-sm mt-1">The Toxic Tower</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Articles Hub */}
        <div className="rounded-2xl border border-white/8 bg-[#111] overflow-hidden">
          <div className="p-6 border-b border-white/6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 flex items-center justify-center">
                <FileText size={20} className="text-[#FFB800]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Articles</h2>
                <p className="text-xs text-white/40">{articleCount ?? 0} published</p>
              </div>
            </div>
            <p className="text-sm text-white/50">Write and publish fantasy football articles, analysis, and strategy content.</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <Link
              href="/admin/articles/new"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FFB800] text-black font-semibold text-sm hover:bg-[#FFB800]/90 transition-colors"
            >
              <span className="flex items-center gap-2"><Plus size={15} /> New Article</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white/70 text-sm hover:bg-white/8 hover:text-white transition-colors"
            >
              <span>Manage Articles</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Rankings Hub */}
        <div className="rounded-2xl border border-white/8 bg-[#111] overflow-hidden">
          <div className="p-6 border-b border-white/6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B2FC9]/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#8B2FC9]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Rankings</h2>
                <p className="text-xs text-white/40">{playerCount ?? 0} players · {versionCount ?? 0} saves</p>
              </div>
            </div>
            <p className="text-sm text-white/50">Drag-and-drop tier rankings for QB, RB, WR, TE, FLEX, and Overall.</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <Link
              href="/admin/rankings"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#8B2FC9] text-black font-semibold text-sm hover:bg-[#8B2FC9]/90 transition-colors"
            >
              <span className="flex items-center gap-2"><TrendingUp size={15} /> Edit Rankings</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/updates"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white/70 text-sm hover:bg-white/8 hover:text-white transition-colors"
            >
              <span>Version History</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
