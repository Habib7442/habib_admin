'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Initial = {
  title?: string
  description?: string
  liveUrl?: string
  alt?: string
  imageUrl?: string
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: Initial
}

export function LandingPageForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
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
