import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifySessionToken, getSessionCookieName } from '@/lib/auth'
import { cookies } from 'next/headers'

async function isAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value
  return token ? verifySessionToken(token) : false
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ranking_list_id, change_summary, players } = await request.json()
  const supabase = await createAdminClient()

  // Get current version number
  const { data: versions } = await supabase
    .from('tt_ranking_versions')
    .select('version_number')
    .eq('ranking_list_id', ranking_list_id)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = (versions?.[0]?.version_number ?? 0) + 1

  // Get previous version's players for movement tracking
  const { data: prevVersion } = await supabase
    .from('tt_ranking_versions')
    .select('id')
    .eq('ranking_list_id', ranking_list_id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  let prevPlayers: Record<string, number> = {}
  if (prevVersion) {
    const { data: prevVersionPlayers } = await supabase
      .from('tt_ranking_version_players')
      .select('player_id, rank')
      .eq('ranking_version_id', prevVersion.id)

    prevPlayers = Object.fromEntries(
      (prevVersionPlayers ?? []).map((p: { player_id: string; rank: number }) => [p.player_id, p.rank])
    )
  }

  // Create version snapshot
  const { data: newVersion, error: versionError } = await supabase
    .from('tt_ranking_versions')
    .insert({
      ranking_list_id,
      version_number: nextVersion,
      change_summary: change_summary || null,
      admin_user: 'admin',
    })
    .select()
    .single()

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 400 })
  }

  // Insert version players
  await supabase.from('tt_ranking_version_players').insert(
    players.map((p: { player_id: string; rank: number; tier: number }) => ({
      ranking_version_id: newVersion.id,
      player_id: p.player_id,
      rank: p.rank,
      tier: p.tier,
      previous_rank: prevPlayers[p.player_id] ?? null,
    }))
  )

  // Update live ranking_players
  await supabase.from('tt_ranking_players').delete().eq('ranking_list_id', ranking_list_id)

  await supabase.from('tt_ranking_players').insert(
    players.map((p: { player_id: string; rank: number; tier: number }) => ({
      ranking_list_id,
      player_id: p.player_id,
      rank: p.rank,
      tier: p.tier,
    }))
  )

  // Update ranking_lists.updated_at
  await supabase
    .from('tt_ranking_lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ranking_list_id)

  return NextResponse.json({ success: true, version: newVersion })
}
