'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, Star, Download } from 'lucide-react'

interface PlayerEntry {
  rank: number
  tier: number
  previous_rank: number | null
  player: {
    id: string
    name: string
    position: string
    team: string
    bye_week: number | null
    public_note: string | null
  }
}

interface Props {
  positions: Array<{ value: string; label: string }>
  activePos: string
  players: PlayerEntry[]
  lastUpdated: string | null
  searchQuery?: string
}

function MovementIcon({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null)
    return <span className="text-[#8B2FC9] text-xs font-bold">NEW</span>
  const delta = previous - current
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[#FFB800] text-xs">
        <TrendingUp size={11} />+{delta}
      </span>
    )
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400 text-xs">
        <TrendingDown size={11} />{delta}
      </span>
    )
  return <Minus size={11} className="text-white/20" />
}

const POSITION_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-green-500/20 text-green-400',
  WR: 'bg-blue-500/20 text-blue-400',
  TE: 'bg-orange-500/20 text-orange-400',
  K: 'bg-purple-500/20 text-purple-400',
  DST: 'bg-yellow-500/20 text-yellow-400',
}

export default function RankingsClient({
  positions,
  activePos,
  players,
  lastUpdated,
  searchQuery,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [expandedNote, setExpandedNote] = useState<string | null>(null)

  function switchPos(pos: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pos', pos)
    params.delete('q')
    startTransition(() => router.push(`/rankings?${params.toString()}`))
  }

  function handleSearch(q: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    startTransition(() => router.push(`/rankings?${params.toString()}`))
  }

  // Group by tier
  const tiers: Record<number, PlayerEntry[]> = {}
  for (const p of players) {
    if (!tiers[p.tier]) tiers[p.tier] = []
    tiers[p.tier].push(p)
  }

  function handleExport() {
    const rows = [
      ['Rank', 'Player', 'Position', 'Team', 'Tier', 'Bye'],
      ...players.map((p) => [
        p.rank,
        p.player?.name ?? '',
        p.player?.position ?? '',
        p.player?.team ?? '',
        p.tier,
        p.player?.bye_week ?? '',
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tt-rankings-${activePos.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Rankings</h1>
          {lastUpdated && (
            <p className="text-xs text-white/30">
              Last updated:{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Position tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {positions.map((p) => (
          <button
            key={p.value}
            onClick={() => switchPos(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activePos === p.value
                ? 'bg-[#FFB800] text-black glow-green'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search players..."
          defaultValue={searchQuery}
          onChange={(e) => {
            const v = e.target.value
            clearTimeout((window as unknown as { _rt: ReturnType<typeof setTimeout> })._rt)
            ;(window as unknown as { _rt: ReturnType<typeof setTimeout> })._rt = setTimeout(
              () => handleSearch(v),
              350
            )
          }}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40"
        />
      </div>

      {/* No results */}
      {players.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p>No players found.</p>
        </div>
      )}

      {/* Tier groups */}
      {Object.keys(tiers)
        .sort((a, b) => Number(a) - Number(b))
        .map((tier) => (
          <div key={tier} className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Star size={13} className="text-[#FFB800]" />
              <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">
                Tier {tier}
              </span>
              <div className="flex-1 h-px bg-[#FFB800]/20" />
            </div>

            <div className="rounded-xl overflow-hidden border border-white/6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/3 border-b border-white/5">
                    <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium w-12">#</th>
                    <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium">Player</th>
                    <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium hidden sm:table-cell">Pos</th>
                    <th className="text-left py-2.5 px-3 text-xs text-white/30 font-medium hidden sm:table-cell">Team</th>
                    <th className="text-right py-2.5 px-3 text-xs text-white/30 font-medium">+/-</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers[Number(tier)].map((p) => (
                    <>
                      <tr
                        key={p.rank}
                        onClick={() =>
                          p.player?.public_note
                            ? setExpandedNote(
                                expandedNote === p.player.id ? null : p.player.id
                              )
                            : undefined
                        }
                        className={`border-b border-white/3 hover:bg-white/3 transition-colors ${
                          p.player?.public_note ? 'cursor-pointer' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-white/40 font-mono text-xs">{p.rank}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{p.player?.name}</span>
                            {p.player?.public_note && (
                              <span className="text-[#FFB800] text-xs">📝</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              POSITION_COLORS[p.player?.position] ?? 'bg-white/10 text-white/60'
                            }`}
                          >
                            {p.player?.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white/60 hidden sm:table-cell">
                          {p.player?.team}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <MovementIcon current={p.rank} previous={p.previous_rank} />
                        </td>
                      </tr>
                      {expandedNote === p.player?.id && p.player?.public_note && (
                        <tr key={`note-${p.rank}`} className="bg-[#FFB800]/5">
                          <td colSpan={5} className="py-3 px-3 text-sm text-white/70 italic">
                            💬 {p.player.public_note}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  )
}
