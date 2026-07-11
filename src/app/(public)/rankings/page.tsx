import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import RankingsClient from './RankingsClient'
import type { Position } from '@/types'

export const metadata: Metadata = {
  title: 'Fantasy Football Rankings',
  description: 'Tier-based fantasy football rankings for QB, RB, WR, TE, FLEX, and Overall from The Toxic Tower.',
}

const POSITIONS: Array<{ value: string; label: string }> = [
  { value: 'OVERALL', label: 'Overall' },
  { value: 'QB', label: 'QB' },
  { value: 'RB', label: 'RB' },
  { value: 'WR', label: 'WR' },
  { value: 'TE', label: 'TE' },
  { value: 'FLEX', label: 'FLEX' },
]

interface Props {
  searchParams: Promise<{ pos?: string; q?: string }>
}

export default async function RankingsPage({ searchParams }: Props) {
  const { pos = 'OVERALL', q } = await searchParams
  const supabase = await createClient()

  // Get the ranking list for this position
  const { data: rankingList } = await supabase
    .from('tt_ranking_lists')
    .select('*')
    .eq('position', pos)
    .single()

  let players: Array<{
    rank: number
    tier: number
    player: { id: string; name: string; position: string; team: string; bye_week: number | null; public_note: string | null }
    previous_rank: number | null
  }> = []

  let lastUpdated: string | null = null

  if (rankingList) {
    const { data: rankingPlayers } = await supabase
      .from('tt_ranking_players')
      .select('rank, tier, player:tt_players(id, name, position, team, bye_week, public_note)')
      .eq('ranking_list_id', rankingList.id)
      .order('rank')

    // Get previous version for movement
    const { data: versions } = await supabase
      .from('tt_ranking_versions')
      .select('id, created_at')
      .eq('ranking_list_id', rankingList.id)
      .order('created_at', { ascending: false })
      .limit(2)

    let prevVersionPlayers: Record<string, number> = {}
    if (versions && versions.length >= 2) {
      const { data: prevPlayers } = await supabase
        .from('tt_ranking_version_players')
        .select('player_id, rank')
        .eq('ranking_version_id', versions[1].id)

      prevVersionPlayers = Object.fromEntries(
        (prevPlayers ?? []).map((p: { player_id: string; rank: number }) => [p.player_id, p.rank])
      )
    }

    lastUpdated = versions?.[0]?.created_at ?? rankingList.updated_at

    type RankingPlayerRow = { rank: number; tier: number; player: { id: string; name: string; position: string; team: string; bye_week: number | null; public_note: string | null } }
    players = ((rankingPlayers ?? []) as unknown as RankingPlayerRow[]).map((rp) => ({
      rank: rp.rank,
      tier: rp.tier,
      player: rp.player,
      previous_rank: prevVersionPlayers[rp.player?.id] ?? null,
    }))

    if (q) {
      const lower = q.toLowerCase()
      players = players.filter(
        (p) =>
          p.player?.name?.toLowerCase().includes(lower) ||
          p.player?.team?.toLowerCase().includes(lower)
      )
    }
  }

  return (
    <RankingsClient
      positions={POSITIONS}
      activePos={pos}
      players={players}
      lastUpdated={lastUpdated}
      searchQuery={q}
    />
  )
}
