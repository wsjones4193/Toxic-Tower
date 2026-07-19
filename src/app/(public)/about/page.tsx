import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About the Tower',
  description: 'Learn about The Toxic Tower — your favorite fantasy football trio.',
}

export default async function AboutPage() {
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('tt_articles')
    .select('title, content, updated_at')
    .eq('slug', 'about-the-tower')
    .eq('published', true)
    .single()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-8">About the Tower</h1>

      {article ? (
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-white/40 text-sm">
            Content coming soon. Check back after the tower drops some knowledge.
          </p>
        </div>
      )}
    </div>
  )
}
