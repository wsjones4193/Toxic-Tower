import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DeleteArticleButton from './DeleteArticleButton'

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('tt_articles')
    .select('id, title, slug, published, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFB800] text-black font-semibold text-sm hover:bg-[#FFB800]/90 transition-colors"
        >
          <Plus size={15} /> New Article
        </Link>
      </div>

      <div className="rounded-xl card-dark border border-white/6 overflow-hidden">
        {!articles?.length ? (
          <p className="p-8 text-center text-white/30">No articles yet. Create your first one!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left py-3 px-4 text-xs text-white/30 font-medium hidden md:table-cell">Date</th>
                <th className="text-right py-3 px-4 text-xs text-white/30 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-white/4 hover:bg-white/2">
                  <td className="py-3 px-4">
                    <span className="text-white/80 font-medium line-clamp-1">{a.title}</span>
                    <span className="text-white/30 text-xs block">/articles/{a.slug}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        a.published
                          ? 'bg-[#FFB800]/10 text-[#FFB800]'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/30 text-xs hidden md:table-cell">
                    {new Date(a.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteArticleButton id={a.id} title={a.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
