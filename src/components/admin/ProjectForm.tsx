'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type ProjectInitial = {
  title?: string
  slug?: string
  shortDescription?: string
  fullDescription?: string
  liveUrl?: string
  githubUrl?: string
  techStack?: string[]
  category?: string
  status?: string
  featured?: boolean
  sortOrder?: number
  thumbnailUrl?: string
  images?: { key: string; url: string }[]
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: ProjectInitial
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-neutral-900'

export function ProjectForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // Images go to /api/upload one at a time (Vercel caps request bodies at 4.5MB); the action only gets asset ids.
    try {
      const thumb = formData.get('thumbnail')
      if (thumb instanceof File && thumb.size > 0) formData.set('thumbnailAsset', await uploadToSanity(thumb))
      for (const file of formData.getAll('images')) {
        if (file instanceof File && file.size > 0) formData.append('imageAssets', await uploadToSanity(file))
      }
      formData.delete('thumbnail')
      formData.delete('images')
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Image upload failed' }
    }
    return action(prev, formData)
  }, {})
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const isEdit = !!initial.thumbnailUrl
  const thumb = thumbPreview ?? (initial.thumbnailUrl ? `${initial.thumbnailUrl}?w=800&auto=format` : null)

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" maxLength={100} required defaultValue={initial.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug {isEdit ? '' : '(optional, generated from title)'}</Label>
        <Input id="slug" name="slug" placeholder="my-project" defaultValue={initial.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short description * (max 160 characters)</Label>
        <Textarea id="shortDescription" name="shortDescription" rows={2} maxLength={160} required defaultValue={initial.shortDescription} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullDescription">Full description (optional)</Label>
        <Textarea id="fullDescription" name="fullDescription" rows={6} defaultValue={initial.fullDescription} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">{isEdit ? 'Replace thumbnail (optional)' : 'Thumbnail *'}</Label>
        <Input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/*"
          required={!isEdit}
          onChange={(e) => {
            const file = e.target.files?.[0]
            setThumbPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="Thumbnail preview" className="mt-2 max-h-56 rounded-lg border border-white/10" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Gallery images (optional, you can pick several)</Label>
        <Input id="images" name="images" type="file" accept="image/*" multiple />
        {!!initial.images?.length && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {initial.images.map((img) => (
              <label key={img.key} className="block space-y-1 text-xs text-neutral-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${img.url}?w=300&auto=format`} alt="" className="aspect-video w-full rounded-md border border-white/10 object-cover" />
                <span className="flex items-center gap-1.5">
                  <input type="checkbox" name="removeImage" value={img.key} /> Remove
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="liveUrl">Live link (optional)</Label>
          <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://" defaultValue={initial.liveUrl} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub link (optional)</Label>
          <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/…" defaultValue={initial.githubUrl} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">Tech stack (comma separated)</Label>
        <Input id="techStack" name="techStack" placeholder="Next.js, TypeScript, Sanity" defaultValue={initial.techStack?.join(', ')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select id="category" name="category" defaultValue={initial.category ?? 'web'} className={selectClass}>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="design">Design</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initial.status ?? 'completed'} className={selectClass}>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
            <option value="planning">Planning</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" step={1} defaultValue={initial.sortOrder ?? 0} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured project
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/projects">Cancel</Link></Button>
      </div>
    </form>
  )
}
