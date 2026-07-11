import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Ranking changelog and updates from The Toxic Tower.',
}

function MovementBadge({ delta }: { delta: number }) {
  if (delta > 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-[#FFB800] font-medium">
      <TrendingUp size={12} /> +{delta}
    </span>
  )
  if (delta < 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
      <TrendingDown size={12} /> {delta}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/40">
      <Minus size={12} />
    </span>
  )
}

export default async function UpdatesPage() {
  const supabase = await createClient()

  const { data: versions } = await supabase
    .from('tt_ranking_versions')
    .select(`
      *,
      ranking_list:tt_ranking_lists(*),
      players:tt_ranking_version_players(
        rank, previous_rank, tier,
        player:tt_players(id, name, position, team)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-1">Changelog</h1>
        <p className="text-white/40 text-sm">All ranking saves and movements</p>
      </div>

      {!versions?.length ? (
        <p className="text-white/30">No updates yet.</p>
      ) : (
        <div className="space-y-6">
          {versions.map((v) => {
            const players = v.players ?? []
            const risers = players
              .filter((p: { previous_rank: number | null; rank: number }) => p.previous_rank !== null && p.previous_rank > p.rank)
              .sort((a: { previous_rank: number; rank: number }, b: { previous_rank: number; rank: number }) => (b.previous_rank - b.rank) - (a.previous_rank - a.rank))
              .slice(0, 5)
            const fallers = players
              .filter((p: { previous_rank: number | null; rank: number }) => p.previous_rank !== null && p.previous_rank < p.rank)
              .sort((a: { previous_rank: number; rank: number }, b: { previous_rank: number; rank: number }) => (a.previous_rank - a.rank) - (b.previous_rank - b.rank))
              .slice(0, 5)
            const newPlayers = players
              .filter((p: { previous_rank: number | null }) => p.previous_rank === null)
              .slice(0, 5)

            return (
              <article key={v.id} className="rounded-xl card-dark border border-white/6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B2FC9]/10 text-[#8B2FC9] font-medium">
                        {v.ranking_list?.name ?? 'Rankings'}
                      </span>
                      <span className="text-xs text-white/30">v{v.version_number}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {v.change_summary ?? `Version ${v.version_number} update`}
                    </h2>
                  </div>
                  <time className="text-xs text-white/30 shrink-0">
                    {new Date(v.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </time>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {risers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#FFB800] mb-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Biggest Risers
                      </p>
                      <ul className="space-y-1">
                        {risers.map((p: { rank: number; previous_rank: number; player?: { id: string; name: string; position: string; team: string } }) => (
                          <li key={p.rank} className="flex items-center justify-between text-xs">
                            <span className="text-white/80">
                              {p.player?.name}{' '}
                              <span className="text-white/30">
                                {p.player?.position} {p.player?.team}
                              </span>
                            </span>
                            <MovementBadge delta={p.previous_rank - p.rank} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fallers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                        <TrendingDown size={12} /> Biggest Fallers
                      </p>
                      <ul className="space-y-1">
                        {fallers.map((p: { rank: number; previous_rank: number; player?: { id: string; name: string; position: string; team: string } }) => (
                          <li key={p.rank} className="flex items-center justify-between text-xs">
                            <span className="text-white/80">
                              {p.player?.name}{' '}
                              <span className="text-white/30">
                                {p.player?.position} {p.player?.team}
                              </span>
                            </span>
                            <MovementBadge delta={p.previous_rank - p.rank} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {newPlayers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#8B2FC9] mb-2 flex items-center gap-1">
                        <Zap size={12} /> New Additions
                      </p>
                      <ul className="space-y-1">
                        {newPlayers.map((p: { rank: number; player?: { id: string; name: string; position: string; team: string } }) => (
                          <li key={p.rank} className="text-xs text-white/80">
                            {p.player?.name}{' '}
                            <span className="text-white/30">
                              {p.player?.position} {p.player?.team}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <Link
                    href="/rankings"
                    className="text-xs text-[#FFB800] hover:underline"
                  >
                    View current rankings →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
