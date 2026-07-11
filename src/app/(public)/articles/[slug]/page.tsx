import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ArticleWithTags } from '@/types'
import { ArrowLeft, Share2, MessageSquare, Link2 } from 'lucide-react'
import ShareButton from './ShareButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('edg_articles')
    .select('title, excerpt, featured_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return { title: 'Article Not Found' }

  return {
    title: data.title,
    description: data.excerpt ?? undefined,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? undefined,
      images: data.featured_image_url ? [{ url: data.featured_image_url }] : [],
    },
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('edg_articles')
    .select('*, tags:edg_article_tags(tag:edg_tags(*))')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) notFound()

  const article = data as ArticleWithTags

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Articles
      </Link>

      {/* Featured image */}
      {article.featured_image_url && (
        <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden mb-8">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags?.map((t) => (
          <Link
            key={t.id}
            href={`/tags/${t.slug}`}
            className="text-xs px-2.5 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] hover:bg-[#39ff14]/20 transition-colors"
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
        {article.title}
      </h1>

      {date && <p className="text-sm text-white/40 mb-8">{date}</p>}

      {/* Content */}
      <div
        className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-p:text-white/80 prose-p:leading-relaxed
          prose-a:text-[#00d4ff] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-blockquote:border-[#39ff14] prose-blockquote:text-white/60
          prose-code:text-[#39ff14] prose-code:bg-white/5 prose-code:rounded prose-code:px-1
          prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-white/8
          prose-hr:border-white/10
          prose-img:rounded-lg
          prose-table:text-white/80
          prose-th:text-white prose-th:bg-white/5
          prose-td:border-white/10"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Share */}
      <div className="mt-12 pt-8 border-t border-white/8">
        <p className="text-sm text-white/40 mb-3 font-medium">Share this article</p>
        <div className="flex items-center gap-3">
          <ShareButton
            platform="twitter"
            title={article.title}
            icon={<Share2 size={16} />}
          />
          <ShareButton
            platform="facebook"
            title={article.title}
            icon={<MessageSquare size={16} />}
          />
          <ShareButton
            platform="copy"
            title={article.title}
            icon={<Link2 size={16} />}
          />
        </div>
      </div>
    </div>
  )
}
