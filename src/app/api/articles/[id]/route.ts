import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifySessionToken, getSessionCookieName } from '@/lib/auth'
import { cookies } from 'next/headers'

async function isAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value
  return token ? verifySessionToken(token) : false
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { title, slug, excerpt, featured_image_url, content, published, tag_ids } =
    await request.json()

  const supabase = await createAdminClient()

  const { data: existing } = await supabase
    .from('edg_articles')
    .select('published, published_at')
    .eq('id', id)
    .single()

  const { data: article, error } = await supabase
    .from('edg_articles')
    .update({
      title,
      slug,
      excerpt,
      featured_image_url,
      content,
      published,
      published_at:
        published && !existing?.published_at
          ? new Date().toISOString()
          : existing?.published_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Replace tags
  await supabase.from('edg_article_tags').delete().eq('article_id', id)
  if (tag_ids?.length) {
    await supabase.from('edg_article_tags').insert(
      tag_ids.map((tag_id: string) => ({ article_id: id, tag_id }))
    )
  }

  return NextResponse.json(article)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createAdminClient()

  await supabase.from('edg_article_tags').delete().eq('article_id', id)
  const { error } = await supabase.from('edg_articles').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
