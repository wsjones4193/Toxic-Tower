import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifySessionToken, getSessionCookieName } from '@/lib/auth'
import { cookies } from 'next/headers'

async function isAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value
  return token ? verifySessionToken(token) : false
}

const BUCKET = 'tt-media'

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase.storage.from(BUCKET).list('', { sortBy: { column: 'created_at', order: 'desc' } })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const files = (data ?? [])
    .filter((f) => f.id)
    .map((f) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
      return {
        name: f.name,
        url: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        created_at: f.created_at ?? '',
      }
    })

  return NextResponse.json(files)
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()
  const supabase = await createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).remove([name])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
