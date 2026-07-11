import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleWithTags, Tag } from '@/types'
import ArticlesClient from './ArticlesClient'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Fantasy football analysis, strategy, and rankings coverage from The Toxic Tower.',
}

const PER_PAGE = 12

interface Props {
  searchParams: Promise<{ page?: string; tag?: string; q?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page = '1', tag, q } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const from = (currentPage - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const supabase = await createClient()

  // Fetch all tags for filter UI
  const { data: tags } = await supabase
    .from('tt_tags')
    .select('*')
    .order('name')

  // Build articles query
  let query = supabase
    .from('tt_articles')
    .select('*, tags:tt_article_tags(tag:tt_tags(*))', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  if (tag) {
    const tagRecord = tags?.find((t: Tag) => t.slug === tag)
    if (tagRecord) {
      const { data: articleIds } = await supabase
        .from('tt_article_tags')
        .select('article_id')
        .eq('tag_id', tagRecord.id)

      const ids = articleIds?.map((r: { article_id: string }) => r.article_id) ?? []
      query = query.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    }
  }

  const { data: articles, count } = await query.range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  return (
    <ArticlesClient
      articles={(articles ?? []) as ArticleWithTags[]}
      tags={(tags ?? []) as Tag[]}
      totalPages={totalPages}
      currentPage={currentPage}
      activeTag={tag}
      searchQuery={q}
      total={count ?? 0}
    />
  )
}
