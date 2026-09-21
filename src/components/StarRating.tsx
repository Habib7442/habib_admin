'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  ratingCount: number
  ratingTotal: number
  myRating?: number
}

export function StarRating({ id, ratingCount, ratingTotal, myRating }: Props) {
  const [stats, setStats] = useState({ count: ratingCount, total: ratingTotal })
  const [mine, setMine] = useState<number | undefined>(myRating)
  const [hover, setHover] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const avg = stats.count ? stats.total / stats.count : 0
  const shown = hover || mine || Math.round(avg)

  async function vote(stars: number) {
    if (mine || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stars }),
      })
      const data = await res.json()
      if (res.ok || res.status === 409) {
        if (res.ok) setStats({ count: data.ratingCount, total: data.ratingTotal })
        setMine(data.myRating)
      } else {
        setError(data.error ?? 'Something went wrong')
      }
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!!mine || busy}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => !mine && setHover(n)}
            onClick={() => vote(n)}
            className={cn('p-0.5 transition-transform', !mine && 'hover:scale-110 cursor-pointer', mine && 'cursor-default')}
          >
            <Star className={cn('size-5', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-neutral-600')} />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-400">
          {stats.count ? `${avg.toFixed(1)} (${stats.count})` : 'No ratings yet'}
        </span>
      </div>
      {mine ? (
        <p className="text-xs text-neutral-500">You rated this {mine}★. Thanks!</p>
      ) : (
        <p className="text-xs text-neutral-500">Click a star to rate</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
