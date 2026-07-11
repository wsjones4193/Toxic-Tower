import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://toxic-tower.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: articles }, { data: tags }] = await Promise.all([
    supabase
      .from('tt_articles')
      .select('slug, updated_at')
      .eq('published', true),
    supabase.from('tt_tags').select('slug, created_at'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/updates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tagRoutes: MetadataRoute.Sitemap = (tags ?? []).map((t) => ({
    url: `${BASE_URL}/tags/${t.slug}`,
    lastModified: new Date(t.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...articleRoutes, ...tagRoutes]
}
