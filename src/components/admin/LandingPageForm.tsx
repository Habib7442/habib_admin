'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Initial = {
  title?: string
  plainDescription?: string
  description?: string
  liveUrl?: string
  alt?: string
  imageUrl?: string
  videoUrl?: string
  webmUrl?: string
  posterUrl?: string
}

// File inputs uploaded to /api/upload before the action runs, and the hidden field each asset id goes in.
const UPLOADS = [
  ['image', 'imageAsset'],
  ['video', 'videoAsset'],
  ['webm', 'webmAsset'],
  ['poster', 'posterAsset'],
] as const

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: Initial
}

export function LandingPageForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // Images go to /api/upload one at a time (Vercel caps request bodies at 4.5MB); the action only gets asset ids.
    try {
      for (const [field, target] of UPLOADS) {
        const file = formData.get(field)
        if (file instanceof File && file.size > 0) formData.set(target, await uploadToSanity(file))
        formData.delete(field)
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Upload failed' }
    }
    return action(prev, formData)
  }, {})
  const [preview, setPreview] = useState<string | null>(null)
  const isEdit = !!initial.imageUrl
  const shownImage = preview ?? (initial.imageUrl ? `${initial.imageUrl}?w=800&auto=format` : null)

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" maxLength={100} required defaultValue={initial.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plainDescription">Card description (optional)</Label>
        <Textarea id="plainDescription" name="plainDescription" rows={2} maxLength={240} defaultValue={initial.plainDescription} />
        <p className="text-xs text-neutral-500">1–2 sentences for business owners: what the page does for the business.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={initial.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{isEdit ? 'Replace image (optional)' : 'Image *'}</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required={!isEdit}
          onChange={(e) => {
            const file = e.target.files?.[0]
            setPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
        {shownImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownImage} alt="Preview" className="mt-2 max-h-64 rounded-lg border border-white/10" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt">Image alt text (optional)</Label>
        <Input id="alt" name="alt" defaultValue={initial.alt} />
      </div>

      <fieldset className="space-y-4 rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-sm font-medium text-white">Video preview (optional)</legend>
        <p className="text-xs text-neutral-500">
          A short muted loop shown on the card instead of the image. Run scripts/compress-preview.sh (portfolio repo) first:
          1280px, 12–15s, no audio, under 4MB. Cards without a video show the image.
        </p>
        <div className="space-y-2">
          <Label htmlFor="video">{initial.videoUrl ? 'Replace MP4 video' : 'MP4 video'}</Label>
          <Input id="video" name="video" type="file" accept="video/mp4" />
          {initial.videoUrl && (
            <video src={initial.videoUrl} muted loop autoPlay playsInline className="mt-2 max-h-48 rounded-lg border border-white/10" />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="webm">{initial.webmUrl ? 'Replace WebM video' : 'WebM video (smaller, optional)'}</Label>
          <Input id="webm" name="webm" type="file" accept="video/webm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="poster">{initial.posterUrl ? 'Replace poster image' : 'Poster image (first frame, optional)'}</Label>
          <Input id="poster" name="poster" type="file" accept="image/*" />
          {initial.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${initial.posterUrl}?w=400&auto=format`} alt="Poster" className="mt-2 max-h-32 rounded-lg border border-white/10" />
          )}
        </div>
        {(initial.videoUrl || initial.webmUrl || initial.posterUrl) && (
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" name="removeVideo" /> Remove video preview (ignored if you pick a new file)
          </label>
        )}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="liveUrl">Live link (optional)</Label>
        <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://" defaultValue={initial.liveUrl} />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/landing-pages">Cancel</Link></Button>
      </div>
    </form>
  )
}
