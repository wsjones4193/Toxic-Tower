import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleWithTags } from '@/types'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('tt_tags')
    .select('name')
    .eq('slug', slug)
    .single()

  return data
    ? { title: `${data.name} Articles` }
    : { title: 'Tag Not Found' }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tt_tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) notFound()

  const { data: articleTags } = await supabase
    .from('tt_article_tags')
    .select('article_id')
    .eq('tag_id', tag.id)

  const ids = (articleTags ?? []).map((r: { article_id: string }) => r.article_id)

  const { data: articles } = ids.length
    ? await supabase
        .from('tt_articles')
        .select('*, tags:tt_article_tags(tag:tt_tags(*))')
        .eq('published', true)
        .in('id', ids)
        .order('published_at', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> All Articles
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFB800]/10 text-[#FFB800] font-medium">
            Tag
          </span>
          <h1 className="text-3xl font-extrabold text-white">{tag.name}</h1>
        </div>
        <p className="text-white/40 text-sm">{articles?.length ?? 0} articles</p>
      </div>

      {!articles?.length ? (
        <p className="text-white/30">No articles with this tag yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a as ArticleWithTags} />
          ))}
        </div>
      )}
    </div>
  )
}
