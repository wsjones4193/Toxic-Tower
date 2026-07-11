import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminUpdatesPage() {
  const supabase = await createClient()

  const { data: versions } = await supabase
    .from('tt_ranking_versions')
    .select('*, ranking_list:tt_ranking_lists(name, position)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Version History</h1>
        <Link
          href="/updates"
          target="_blank"
          className="text-sm text-[#FFB800] hover:underline"
        >
          Public changelog →
        </Link>
      </div>

      <div className="rounded-xl card-dark border border-white/6 overflow-hidden">
        {!versions?.length ? (
          <p className="p-8 text-center text-white/30">No ranking saves yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium">List</th>
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium hidden sm:table-cell">Version</th>
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium">Summary</th>
                <th className="text-right py-3 px-4 text-xs text-white/30 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="border-b border-white/4 hover:bg-white/2">
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B2FC9]/10 text-[#8B2FC9]">
                      {(v.ranking_list as { name?: string } | null)?.name ?? 'Rankings'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/40 hidden sm:table-cell">
                    v{v.version_number}
                  </td>
                  <td className="py-3 px-4 text-white/60 text-xs max-w-xs truncate">
                    {v.change_summary ?? <span className="text-white/20 italic">No summary</span>}
                  </td>
                  <td className="py-3 px-4 text-white/30 text-xs text-right">
                    {new Date(v.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
