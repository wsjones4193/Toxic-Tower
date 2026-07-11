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

  const { title, slug, excerpt, featured_image_url, content, published, tag_ids } =
    await request.json()

  const supabase = await createAdminClient()

  const { data: article, error } = await supabase
    .from('tt_articles')
    .insert({
      title,
      slug,
      excerpt,
      featured_image_url,
      content,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (tag_ids?.length) {
    await supabase.from('tt_article_tags').insert(
      tag_ids.map((tag_id: string) => ({ article_id: article.id, tag_id }))
    )
  }

  return NextResponse.json(article)
}
