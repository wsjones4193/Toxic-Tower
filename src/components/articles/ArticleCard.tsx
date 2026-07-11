import Link from 'next/link'
import Image from 'next/image'
import type { ArticleWithTags } from '@/types'

interface Props {
  article: ArticleWithTags
  compact?: boolean
}

export default function ArticleCard({ article, compact = false }: Props) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  if (compact) {
    return (
      <Link href={`/articles/${article.slug}`} className="group">
        <div className="rounded-xl card-dark border border-white/6 p-4 h-full hover:border-white/12 transition-colors">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {article.tags?.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className="text-xs px-1.5 py-0.5 rounded bg-[#FFB800]/10 text-[#FFB800]"
              >
                {t.name}
              </span>
            ))}
          </div>
          <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#FFB800] transition-colors">
            {article.title}
          </h3>
          {date && <p className="text-xs text-white/40 mt-2">{date}</p>}
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group">
      <article className="rounded-xl card-dark border border-white/6 overflow-hidden hover:border-white/12 transition-colors h-full flex flex-col">
        {article.featured_image_url && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags?.map((t) => (
              <span
                key={t.id}
                className="text-xs px-2 py-0.5 rounded-full bg-[#FFB800]/10 text-[#FFB800]"
              >
                {t.name}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#FFB800] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-white/50 text-sm line-clamp-3 flex-1">{article.excerpt}</p>
          )}
          {date && <p className="text-xs text-white/30 mt-3">{date}</p>}
        </div>
      </article>
    </Link>
  )
}
