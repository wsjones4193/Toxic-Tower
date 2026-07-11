'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useTransition } from 'react'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleWithTags, Tag } from '@/types'

interface Props {
  articles: ArticleWithTags[]
  tags: Tag[]
  totalPages: number
  currentPage: number
  activeTag?: string
  searchQuery?: string
  total: number
}

export default function ArticlesClient({
  articles,
  tags,
  totalPages,
  currentPage,
  activeTag,
  searchQuery,
  total,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    startTransition(() => router.push(`/articles?${params.toString()}`))
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `/articles?${params.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">Articles</h1>
        <p className="text-white/50 text-sm">{total} articles</p>
      </div>

      {/* Search + Tag filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search articles..."
            defaultValue={searchQuery}
            onChange={(e) => {
              const v = e.target.value
              clearTimeout((window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> })._searchTimeout)
              ;(window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(
                () => updateParam('q', v || undefined),
                400
              )
            }}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FFB800]/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam('tag', undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeTag
                ? 'bg-[#FFB800] text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => updateParam('tag', activeTag === t.slug ? undefined : t.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === t.slug
                  ? 'bg-[#FFB800] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {t.name}
            </button>
          ))}
          {(activeTag || searchQuery) && (
            <button
              onClick={() => {
                startTransition(() => router.push('/articles'))
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-lg">No articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm"
            >
              ← Prev
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1]
              return (
                <span key={p} className="flex items-center gap-2">
                  {prev && p - prev > 1 && (
                    <span className="text-white/30 text-sm">…</span>
                  )}
                  <Link
                    href={buildPageUrl(p)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-[#FFB800] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </Link>
                </span>
              )
            })}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 text-sm"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
