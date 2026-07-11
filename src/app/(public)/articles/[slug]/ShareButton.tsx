'use client'

import { toast } from 'sonner'

interface Props {
  platform: 'twitter' | 'facebook' | 'copy'
  title: string
  icon: React.ReactNode
}

export default function ShareButton({ platform, title, icon }: Props) {
  function handleShare() {
    const url = window.location.href

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
      return
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  const labels = { twitter: 'Twitter', facebook: 'Facebook', copy: 'Copy link' }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-sm transition-colors"
    >
      {icon}
      {labels[platform]}
    </button>
  )
}
