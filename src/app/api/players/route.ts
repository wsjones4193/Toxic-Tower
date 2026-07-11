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

  const { name, position, team, bye_week, underdog_id } = await request.json()
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('tt_players')
    .insert({ name, position, team, bye_week: bye_week ?? null, underdog_id: underdog_id ?? null, rank: 999, tier: 1 })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
