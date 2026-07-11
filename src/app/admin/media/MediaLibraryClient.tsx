'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, Trash2, Copy, Folder, X, CheckCircle } from 'lucide-react'

interface MediaFile {
  name: string
  url: string
  size: number
  created_at: string
}

export default function MediaLibraryClient() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchFiles() {
    setLoading(true)
    try {
      const res = await fetch('/api/media')
      if (res.ok) {
        const data = await res.json()
        setFiles(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiles() }, [])

  async function uploadFiles(uploadFiles: File[]) {
    setUploading(true)
    let successCount = 0
    for (const file of uploadFiles) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
      if (res.ok) successCount++
      else toast.error(`Failed to upload ${file.name}`)
    }
    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''}`)
      fetchFiles()
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length) uploadFiles(dropped)
  }

  async function handleDelete(url: string, name: string) {
    const res = await fetch('/api/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      toast.success('File deleted')
      setFiles((prev) => prev.filter((f) => f.url !== url))
    } else {
      toast.error('Failed to delete')
    }
    setConfirmDelete(null)
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
    toast.success('URL copied!')
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Media Library</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFB800] text-black font-semibold text-sm hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) uploadFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
          dragging
            ? 'border-[#FFB800] bg-[#FFB800]/5'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-white/30" />
        <p className="text-white/40 text-sm">
          {dragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-white/20 text-xs mt-1">Images, videos, PDFs supported</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Folder size={32} className="mx-auto mb-2 opacity-30" />
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.url}
              className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/6 hover:border-white/12 transition-colors"
            >
              {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <div className="relative h-36">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-36 flex items-center justify-center">
                  <Folder size={32} className="text-white/20" />
                </div>
              )}

              <div className="p-2">
                <p className="text-xs text-white/60 truncate">{file.name}</p>
                <p className="text-xs text-white/30">{formatSize(file.size)}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === file.url ? (
                    <CheckCircle size={16} className="text-[#FFB800]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  onClick={() => setConfirmDelete(file.url)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-red-500/30 text-white hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-white mb-2">Delete file?</h3>
            <p className="text-white/40 text-sm mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const file = files.find((f) => f.url === confirmDelete)
                  if (file) handleDelete(file.url, file.name)
                }}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
