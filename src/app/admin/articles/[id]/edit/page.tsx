import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArticleEditor from '@/components/admin/ArticleEditor'
import type { ArticleWithTags } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: article }, { data: tags }] = await Promise.all([
    supabase
      .from('tt_articles')
      .select('*, tags:tt_article_tags(tag:tt_tags(*))')
      .eq('id', id)
      .single(),
    supabase.from('tt_tags').select('*').order('name'),
  ])

  if (!article) notFound()

  return (
    <ArticleEditor
      article={article as ArticleWithTags}
      tags={tags ?? []}
    />
  )
}
