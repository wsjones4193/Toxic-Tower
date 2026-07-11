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
      .from('edg_articles')
      .select('*, tags:edg_article_tags(tag:edg_tags(*))')
      .eq('id', id)
      .single(),
    supabase.from('edg_tags').select('*').order('name'),
  ])

  if (!article) notFound()

  return (
    <ArticleEditor
      article={article as ArticleWithTags}
      tags={tags ?? []}
    />
  )
}
