'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { DESIGN_CATEGORIES } from '@/lib/design-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type DesignInitial = {
  title?: string
  description?: string
  category?: string
  tools?: string[]
  tags?: string[]
  featured?: boolean
  imageUrl?: string
  images?: { key: string; url: string }[]
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: DesignInitial
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-neutral-900'

export function DesignForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // Images go to /api/upload one at a time (Vercel caps request bodies at 4.5MB); the action only gets asset ids.
    try {
      const main = formData.get('image')
      if (main instanceof File && main.size > 0) formData.set('imageAsset', await uploadToSanity(main))
      for (const file of formData.getAll('images')) {
        if (file instanceof File && file.size > 0) formData.append('imageAssets', await uploadToSanity(file))
      }
      formData.delete('image')
      formData.delete('images')
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Image upload failed' }
    }
    return action(prev, formData)
  }, {})
  const [preview, setPreview] = useState<string | null>(null)
  const isEdit = !!initial.imageUrl
  const shown = preview ?? (initial.imageUrl ? `${initial.imageUrl}?w=800&auto=format` : null)

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" maxLength={100} required defaultValue={initial.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <select id="category" name="category" defaultValue={initial.category ?? 'poster'} className={selectClass}>
          {DESIGN_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{isEdit ? 'Replace main image (optional)' : 'Main image *'}</Label>
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
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Preview" className="mt-2 max-h-72 rounded-lg border border-white/10" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">More images (optional, for carousels; you can pick several)</Label>
        <Input id="images" name="images" type="file" accept="image/*" multiple />
        {!!initial.images?.length && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {initial.images.map((img) => (
              <label key={img.key} className="block space-y-1 text-xs text-neutral-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${img.url}?w=300&auto=format`} alt="" className="aspect-square w-full rounded-md border border-white/10 object-cover" />
                <span className="flex items-center gap-1.5">
                  <input type="checkbox" name="removeImage" value={img.key} /> Remove
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={initial.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tools">Tools used (comma separated)</Label>
          <Input id="tools" name="tools" placeholder="Photoshop, Figma" defaultValue={initial.tools?.join(', ')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" placeholder="event, festival, dark" defaultValue={initial.tags?.join(', ')} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured design
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/designs">Cancel</Link></Button>
      </div>
    </form>
  )
}
