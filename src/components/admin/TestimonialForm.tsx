'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { FormState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type TestimonialInitial = {
  quote?: string
  name?: string
  role?: string
  business?: string
  order?: number
}

type Props = {
  heading: string
  submitLabel: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: TestimonialInitial
}

export function TestimonialForm({ heading, submitLabel, action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold text-white">{heading}</h1>

      <div className="space-y-2">
        <Label htmlFor="quote">Quote *</Label>
        <Textarea id="quote" name="quote" rows={5} maxLength={500} required defaultValue={initial.quote} />
        <p className="text-xs text-neutral-500">The client&apos;s own words. Two or three sentences reads best.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" maxLength={100} required defaultValue={initial.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business">Business</Label>
          <Input id="business" name="business" maxLength={100} defaultValue={initial.business} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role (optional)</Label>
          <Input id="role" name="role" maxLength={80} placeholder="e.g. Owner" defaultValue={initial.role} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Order (lower first; the home page shows the first three)</Label>
        <Input id="order" name="order" type="number" step={1} defaultValue={initial.order ?? 0} />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        <Button asChild variant="ghost"><Link href="/admin/testimonials">Cancel</Link></Button>
      </div>
    </form>
  )
}
