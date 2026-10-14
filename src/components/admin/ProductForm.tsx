'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type ProductInitial = {
  name?: string
  oneLiner?: string
  link?: string
  status?: string
  order?: number
  alt?: string
  imageUrl?: string
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: ProductInitial
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-neutral-900'

export function ProductForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // The image goes to /api/upload first (Vercel caps request bodies at 4.5MB); the action only gets its asset id.
    try {
      const file = formData.get('image')
      if (file instanceof File && file.size > 0) formData.set('imageAsset', await uploadToSanity(file))
      formData.delete('image')
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Image upload failed' }
    }
    return action(prev, formData)
  }, {})
  const [preview, setPreview] = useState<string | null>(null)
  const shownImage = preview ?? (initial.imageUrl ? `${initial.imageUrl}?w=800&auto=format` : null)

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" maxLength={80} required defaultValue={initial.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oneLiner">One-line description *</Label>
        <Input id="oneLiner" name="oneLiner" maxLength={90} required defaultValue={initial.oneLiner} placeholder="e.g. AI voice mock interviews" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link *</Label>
        <Input id="link" name="link" type="url" required placeholder="https://" defaultValue={initial.link} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initial.status ?? 'live'} className={selectClass}>
            <option value="live">Live</option>
            <option value="beta">Beta</option>
            <option value="hackathon">Hackathon</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order (lower first)</Label>
          <Input id="order" name="order" type="number" step={1} defaultValue={initial.order ?? 0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{initial.imageUrl ? 'Replace image (optional)' : 'Image (optional)'}</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
        {shownImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownImage} alt="Preview" className="mt-2 max-h-64 rounded-lg border border-white/10" />
        )}
        {initial.imageUrl && (
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" name="removeImage" /> Remove image (ignored if you pick a new one)
          </label>
        )}
        <p className="text-xs text-neutral-500">Without an image the card shows the product name on a green panel.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt">Image alt text (optional)</Label>
        <Input id="alt" name="alt" defaultValue={initial.alt} />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/products">Cancel</Link></Button>
      </div>
    </form>
  )
}
