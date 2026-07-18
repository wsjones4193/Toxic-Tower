import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const format = searchParams.get('format') ?? 'csv'
  const pos = searchParams.get('pos') ?? 'OVERALL'

  const supabase = await createClient()

  const { data: rankingList } = await supabase
    .from('tt_ranking_lists')
    .select('id')
    .eq('position', pos)
    .single()

  if (!rankingList) {
    return NextResponse.json({ error: 'Ranking list not found' }, { status: 404 })
  }

  const { data: players } = await supabase
    .from('tt_ranking_players')
    .select('rank, tier, player:tt_players(id, name, position, team, bye_week, underdog_id)')
    .eq('ranking_list_id', rankingList.id)
    .order('rank')

  type ExportRow = {
    rank: number
    tier: number
    player: { id: string; name: string; position: string; team: string; bye_week: number | null; underdog_id: string | null }
  }
  const rows = ((players ?? []) as unknown as ExportRow[]).map((rp) => ({
    underdog_id: rp.player?.underdog_id ?? '',
    player_name: rp.player?.name ?? '',
    rank: rp.rank,
    position: rp.player?.position ?? '',
  }))

  if (format === 'json') {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tt-rankings-${pos.toLowerCase()}.json"`,
      },
    })
  }

  const headers = ['underdog_id', 'player_name', 'rank', 'position']
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => r[h as keyof typeof r]).join(',')),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tt-rankings-${pos.toLowerCase()}.csv"`,
    },
  })
}
