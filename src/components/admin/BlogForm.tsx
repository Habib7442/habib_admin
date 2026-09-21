'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { sanityImageUrl, uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type BlogInitial = {
  title?: string
  slug?: string
  status?: string
  excerpt?: string
  content?: string
  category?: string
  tags?: string[]
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
  coverUrl?: string
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: BlogInitial
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-neutral-900'

export function BlogForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // The cover goes to /api/upload first (Vercel caps request bodies at 4.5MB); the action only gets the asset id.
    try {
      const cover = formData.get('cover')
      if (cover instanceof File && cover.size > 0) formData.set('coverAsset', await uploadToSanity(cover))
      formData.delete('cover')
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Image upload failed' }
    }
    return action(prev, formData)
  }, {})

  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [inserting, setInserting] = useState(false)
  const [insertError, setInsertError] = useState('')
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const cover = coverPreview ?? (initial.coverUrl ? `${initial.coverUrl}?w=800&auto=format` : null)

  async function insertImage(file: File) {
    setInserting(true)
    setInsertError('')
    try {
      const url = sanityImageUrl(await uploadToSanity(file))
      const el = contentRef.current
      if (!el) return
      const snippet = `\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n`
      const { selectionStart: start, selectionEnd: end, value } = el
      el.value = value.slice(0, start) + snippet + value.slice(end)
      el.selectionStart = el.selectionEnd = start + snippet.length
      el.focus()
    } catch (e) {
      setInsertError(e instanceof Error ? e.message : 'Image upload failed')
    } finally {
      setInserting(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" maxLength={120} required defaultValue={initial.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug {initial.slug ? '' : '(optional, generated from title)'}</Label>
        <Input id="slug" name="slug" placeholder="my-first-post" defaultValue={initial.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">Cover image (optional)</Label>
        <Input
          id="cover"
          name="cover"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setCoverPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="Cover preview" className="mt-2 max-h-56 rounded-lg border border-white/10" />
        )}
        {initial.coverUrl && (
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" name="removeCover" /> Remove current cover (ignored if you pick a new one)
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional, max 300 characters)</Label>
        <Textarea id="excerpt" name="excerpt" rows={3} maxLength={300} defaultValue={initial.excerpt} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content (Markdown)</Label>
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void insertImage(file)
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={inserting} onClick={() => imageInputRef.current?.click()}>
              {inserting ? 'Uploading…' : 'Insert image'}
            </Button>
          </div>
        </div>
        <Textarea
          id="content"
          name="content"
          ref={contentRef}
          rows={18}
          className="font-mono text-sm"
          placeholder={'# Heading\n\nWrite in **Markdown**. Use "Insert image" to add pictures.'}
          defaultValue={initial.content}
        />
        {insertError && <p className="text-sm text-red-400">{insertError}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category (optional)</Label>
          <Input id="category" name="category" placeholder="Web development" defaultValue={initial.category} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" placeholder="nextjs, sanity" defaultValue={initial.tags?.join(', ')} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title (optional, max 70)</Label>
          <Input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={initial.seoTitle} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initial.status ?? 'draft'} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoDescription">SEO description (optional, max 160)</Label>
        <Textarea id="seoDescription" name="seoDescription" rows={2} maxLength={160} defaultValue={initial.seoDescription} />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured post
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/blogs">Cancel</Link></Button>
      </div>
    </form>
  )
}
