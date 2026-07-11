import { createClient } from '@/lib/supabase/server'
import ArticleEditor from '@/components/admin/ArticleEditor'

export default async function NewArticlePage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tt_tags').select('*').order('name')

  return <ArticleEditor tags={tags ?? []} />
}
