'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { toast } from 'sonner'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Link as LinkIcon,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, ImageIcon, Play as YoutubeIcon,
  Table as TableIcon, Undo, Redo, Eye, EyeOff, Save,
} from 'lucide-react'
import type { ArticleWithTags, Tag } from '@/types'

interface Props {
  article?: ArticleWithTags
  tags: Tag[]
}

interface SaveDraft {
  title: string
  slug: string
  excerpt: string
  featured_image_url: string
  content: string
  published: boolean
  tag_ids: string[]
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ArticleEditor({ article, tags }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image_url ?? '')
  const [published, setPublished] = useState(article?.published ?? false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t) => t.id) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ controls: true }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: article?.content ?? '',
    onUpdate: ({ editor: e }) => {
      setAutosaveStatus('unsaved')
      clearTimeout(autosaveTimer.current)
      autosaveTimer.current = setTimeout(() => {
        setAutosaveStatus('saving')
        const draft = {
          title,
          slug,
          excerpt,
          featured_image_url: featuredImage,
          content: e.getHTML(),
          published,
          tag_ids: selectedTags,
        }
        localStorage.setItem(`edg-draft-${article?.id ?? 'new'}`, JSON.stringify(draft))
        setAutosaveStatus('saved')
      }, 2000)
    },
  })

  // Auto-generate slug from title for new articles
  useEffect(() => {
    if (!article && title) {
      setSlug(slugify(title))
    }
  }, [title, article])

  async function handleSave() {
    if (!title || !slug) {
      toast.error('Title and slug are required')
      return
    }
    setSaving(true)
    const body = {
      title,
      slug,
      excerpt: excerpt || null,
      featured_image_url: featuredImage || null,
      content: editor?.getHTML() ?? '',
      published,
      tag_ids: selectedTags,
    }
    try {
      const res = article
        ? await fetch(`/api/articles/${article.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      if (res.ok) {
        const data = await res.json()
        localStorage.removeItem(`edg-draft-${article?.id ?? 'new'}`)
        toast.success(published ? 'Article published!' : 'Draft saved!')
        if (!article) {
          router.push(`/admin/articles/${data.id}/edit`)
        } else {
          router.refresh()
        }
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  function addImage() {
    const url = prompt('Image URL:')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  function addYoutube() {
    const url = prompt('YouTube URL:')
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  function addLink() {
    const url = prompt('Link URL:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  function addTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  if (!editor) return null

  const toolbarBtn = (active: boolean) =>
    `p-1.5 rounded text-sm transition-colors ${
      active
        ? 'bg-[#FFB800]/20 text-[#FFB800]'
        : 'text-white/40 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">
          {article ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs ${
              autosaveStatus === 'saved'
                ? 'text-white/20'
                : autosaveStatus === 'saving'
                ? 'text-[#FFB800]/60'
                : 'text-white/40'
            }`}
          >
            {autosaveStatus === 'saved' ? 'All changes saved' : autosaveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
          </span>
          <button
            onClick={() => setPublished(!published)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              published
                ? 'bg-[#FFB800]/15 text-[#FFB800]'
                : 'bg-white/5 text-white/50'
            }`}
          >
            {published ? <Eye size={14} /> : <EyeOff size={14} />}
            {published ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFB800] text-black font-semibold text-sm hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-white text-xl font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FFB800]/40"
          />

          {/* Slug */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm shrink-0">/articles/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="url-slug"
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FFB800]/40"
            />
          </div>

          {/* Toolbar */}
          <div className="rounded-lg bg-[#111] border border-white/6 overflow-hidden">
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/5">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarBtn(editor.isActive('bold'))}><Bold size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarBtn(editor.isActive('italic'))}><Italic size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarBtn(editor.isActive('underline'))}><UnderlineIcon size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={toolbarBtn(editor.isActive('strike'))}><Strikethrough size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={toolbarBtn(editor.isActive('code'))}><Code size={14} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 1 }))}><Heading1 size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 2 }))}><Heading2 size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor.isActive('heading', { level: 3 }))}><Heading3 size={14} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor.isActive('bulletList'))}><List size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor.isActive('orderedList'))}><ListOrdered size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolbarBtn(editor.isActive('blockquote'))}><Quote size={14} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={toolbarBtn(editor.isActive({ textAlign: 'left' }))}><AlignLeft size={14} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={toolbarBtn(editor.isActive({ textAlign: 'center' }))}><AlignCenter size={14} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={toolbarBtn(editor.isActive({ textAlign: 'right' }))}><AlignRight size={14} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={addLink} className={toolbarBtn(editor.isActive('link'))}><LinkIcon size={14} /></button>
              <button onClick={addImage} className={toolbarBtn(false)}><ImageIcon size={14} /></button>
              <button onClick={addYoutube} className={toolbarBtn(false)}><YoutubeIcon size={14} /></button>
              <button onClick={addTable} className={toolbarBtn(false)}><TableIcon size={14} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor.chain().focus().undo().run()} className={toolbarBtn(false)}><Undo size={14} /></button>
              <button onClick={() => editor.chain().focus().redo().run()} className={toolbarBtn(false)}><Redo size={14} /></button>
            </div>
            <EditorContent
              editor={editor}
              className="min-h-[400px] text-white/90"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Excerpt */}
          <div className="rounded-xl card-dark border border-white/6 p-4">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for article cards and SEO..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FFB800]/40 resize-none"
            />
          </div>

          {/* Featured image */}
          <div className="rounded-xl card-dark border border-white/6 p-4">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
              Featured Image URL
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FFB800]/40"
            />
          </div>

          {/* Tags */}
          <div className="rounded-xl card-dark border border-white/6 p-4">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(t.id)
                        ? prev.filter((id) => id !== t.id)
                        : [...prev, t.id]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(t.id)
                      ? 'bg-[#FFB800] text-black'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview link */}
          {article?.slug && article.published && (
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 rounded-lg border border-white/8 text-center text-sm text-white/50 hover:text-white hover:border-white/15 transition-colors"
            >
              View Live Article →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
