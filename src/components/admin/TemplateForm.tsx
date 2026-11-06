'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { TEMPLATE_CATEGORY_OPTIONS } from '@/lib/template-categories'

export type TemplateInitial = {
  title?: string
  slug?: string
  description?: string
  category?: string
  size?: string
  isFree?: boolean
  price?: string
  buyLink?: string
  canvaLink?: string
  featured?: boolean
  order?: number
  slides?: { key: string; url: string }[]
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: TemplateInitial
}

// Browsers don't guarantee file order, so slides are ordered by file name (slide-2 before slide-10).
const byName = (files: File[]) =>
  [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-neutral-900'

export function TemplateForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [progress, setProgress] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // Slides go to /api/upload one at a time, in the order picked (Vercel caps request bodies at 4.5MB).
    try {
      const files = byName(formData.getAll('slides').filter((f): f is File => f instanceof File && f.size > 0))
      for (const [i, file] of files.entries()) {
        setProgress(`Uploading slide ${i + 1} of ${files.length}…`)
        formData.append('slideAssets', await uploadToSanity(file))
      }
      formData.delete('slides')
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Slide upload failed' }
    } finally {
      setProgress(null)
    }
    return action(prev, formData)
  }, {})
  const [previews, setPreviews] = useState<string[]>([])
  const [isFree, setIsFree] = useState(initial.isFree ?? false)
  const isEdit = !!initial.slides?.length

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" maxLength={80} required defaultValue={initial.title} placeholder="e.g. SAVRÉ — Fashion Launch Carousel" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug {isEdit ? '' : '(optional, generated from title)'}</Label>
        <Input id="slug" name="slug" placeholder="fashion-launch-carousel" defaultValue={initial.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description * (max 300 characters)</Label>
        <Textarea id="description" name="description" rows={3} maxLength={300} required defaultValue={initial.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select id="category" name="category" defaultValue={initial.category ?? 'fashion'} className={selectClass}>
            {TEMPLATE_CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Slide size</Label>
          <Input id="size" name="size" maxLength={30} defaultValue={initial.size ?? '1080 × 1440'} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order (lower first)</Label>
          <Input id="order" name="order" type="number" step={1} defaultValue={initial.order ?? 0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slides">{isEdit ? 'Add slides (optional, added after the current ones)' : 'Slides * (pick them all at once, in order)'}</Label>
        <Input
          id="slides"
          name="slides"
          type="file"
          accept="image/*"
          multiple
          required={!isEdit}
          onChange={(e) => {
            const files = byName([...(e.target.files ?? [])])
            setPreviews(files.map((f) => URL.createObjectURL(f)))
          }}
        />
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`New slide ${i + 1}`} className="aspect-[3/4] w-full rounded-md border border-white/10 object-cover" />
            ))}
          </div>
        )}
        {isEdit && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {initial.slides!.map((s, i) => (
              <label key={s.key} className="block space-y-1 text-xs text-neutral-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${s.url}?w=240&auto=format`} alt={`Slide ${i + 1}`} className="aspect-[3/4] w-full rounded-md border border-white/10 object-cover" />
                <span className="flex items-center gap-1.5">
                  <input type="checkbox" name="removeSlide" value={s.key} /> Remove
                </span>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-neutral-500">Slides are ordered by file name (slide-1, slide-2, … slide-10). The first slide is the cover.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-white">
        <input type="checkbox" name="isFree" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        Free template (people open it straight in Canva)
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        {!isFree && (
          <div className="space-y-2">
            <Label htmlFor="price">Price label</Label>
            <Input id="price" name="price" maxLength={20} placeholder="₹499" defaultValue={initial.price} />
          </div>
        )}
        <div className={isFree ? 'space-y-2 sm:col-span-3' : 'space-y-2 sm:col-span-2'}>
          <Label htmlFor="buyLink">Buy link (Etsy / Gumroad){isFree ? ' (optional)' : ' *'}</Label>
          <Input id="buyLink" name="buyLink" type="url" placeholder="https://" defaultValue={initial.buyLink} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="canvaLink">Canva template link{isFree ? ' *' : ' (optional, kept private for paid templates)'}</Label>
        <Input id="canvaLink" name="canvaLink" type="url" placeholder="https://www.canva.com/design/…/view?mode=preview" defaultValue={initial.canvaLink} />
        <p className="text-xs text-neutral-500">In Canva: Share → More → Template link.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-white">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Show on the home page
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {progress && <p className="text-sm text-neutral-400">{progress}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/templates">Cancel</Link></Button>
      </div>
    </form>
  )
}
