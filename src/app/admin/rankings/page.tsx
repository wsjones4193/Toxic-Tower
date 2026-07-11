import { createClient } from '@/lib/supabase/server'
import RankingsEditor from '@/components/admin/RankingsEditor'

const POSITIONS = ['OVERALL', 'QB', 'RB', 'WR', 'TE', 'FLEX'] as const

interface Props {
  searchParams: Promise<{ pos?: string }>
}

export default async function AdminRankingsPage({ searchParams }: Props) {
  const { pos = 'OVERALL' } = await searchParams
  const supabase = await createClient()

  // Ensure ranking_lists exist for all positions
  for (const position of POSITIONS) {
    const { data } = await supabase
      .from('tt_ranking_lists')
      .select('id')
      .eq('position', position)
      .single()

    if (!data) {
      await supabase.from('tt_ranking_lists').insert({
        position,
        name: position === 'OVERALL' ? 'Overall Rankings' : `${position} Rankings`,
      })
    }
  }

  const { data: rankingList } = await supabase
    .from('tt_ranking_lists')
    .select('*')
    .eq('position', pos)
    .single()

  const { data: players } = await supabase
    .from('tt_players')
    .select('*')
    .order('rank')

  const { data: rankingPlayers } = rankingList
    ? await supabase
        .from('tt_ranking_players')
        .select('*, player:tt_players(*)')
        .eq('ranking_list_id', rankingList.id)
        .order('rank')
    : { data: [] }

  const { data: unrankedPlayers } = rankingList
    ? await (async () => {
        const rankedIds = (rankingPlayers ?? []).map(
          (rp: { player: { id: string } }) => rp.player?.id
        )
        return supabase
          .from('tt_players')
          .select('*')
          .not('id', 'in', rankedIds.length ? `(${rankedIds.join(',')})` : '(null)')
          .order('name')
      })()
    : { data: [] }

  return (
    <RankingsEditor
      positions={POSITIONS as unknown as string[]}
      activePos={pos}
      rankingList={rankingList}
      rankingPlayers={rankingPlayers ?? []}
      allPlayers={players ?? []}
      unrankedPlayers={unrankedPlayers ?? []}
    />
  )
}
