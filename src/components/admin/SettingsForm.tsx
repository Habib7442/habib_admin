'use client'

import { useActionState } from 'react'
import type { FormState } from '@/app/admin/actions'
import { saveSettings } from '@/app/admin/settings/actions'
import { uploadToSanity } from '@/lib/client-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type SettingsInitial = {
  name?: string
  tagline?: string
  bio?: string
  email?: string
  resumeUrl?: string
  githubUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  seoTitle?: string
  seoDescription?: string
  profileUrl?: string
  shareUrl?: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      {children}
    </section>
  )
}

function Field({ id, label, ...props }: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...props} />
    </div>
  )
}

function ImageField({ id, label, url, removeName }: { id: string; label: string; url?: string; removeName: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type="file" accept="image/*" />
      {url && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${url}?w=300&auto=format`} alt="" className="h-24 rounded-lg border border-white/10" />
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input type="checkbox" name={removeName} /> Remove (ignored if you pick a new one)
          </label>
        </div>
      )}
    </div>
  )
}

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    // Images go to /api/upload first (Vercel caps request bodies at 4.5MB); the action only gets asset ids.
    try {
      for (const [field, target] of [['profile', 'profileAsset'], ['share', 'shareAsset']] as const) {
        const file = formData.get(field)
        if (file instanceof File && file.size > 0) formData.set(target, await uploadToSanity(file))
        formData.delete(field)
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Image upload failed' }
    }
    return saveSettings(prev, formData)
  }, {})

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-neutral-400">Site-wide details your portfolio reads from Sanity.</p>
      </div>

      <Section title="Profile">
        <Field id="name" label="Name" maxLength={100} defaultValue={initial.name} />
        <Field id="tagline" label="Tagline / role" maxLength={160} defaultValue={initial.tagline} placeholder="Full-stack developer and designer" />
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={5} maxLength={1000} defaultValue={initial.bio} />
        </div>
        <ImageField id="profile" label="Profile photo" url={initial.profileUrl} removeName="removeProfile" />
      </Section>

      <Section title="Contact and links">
        <Field id="email" label="Contact email" type="email" defaultValue={initial.email} />
        <Field id="resumeUrl" label="Resume / CV link" type="url" placeholder="https://" defaultValue={initial.resumeUrl} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="githubUrl" label="GitHub" type="url" placeholder="https://github.com/…" defaultValue={initial.githubUrl} />
          <Field id="linkedinUrl" label="LinkedIn" type="url" placeholder="https://linkedin.com/in/…" defaultValue={initial.linkedinUrl} />
          <Field id="twitterUrl" label="X / Twitter" type="url" placeholder="https://x.com/…" defaultValue={initial.twitterUrl} />
          <Field id="instagramUrl" label="Instagram" type="url" placeholder="https://instagram.com/…" defaultValue={initial.instagramUrl} />
        </div>
      </Section>

      <Section title="SEO defaults">
        <Field id="seoTitle" label="Site title (max 70)" maxLength={70} defaultValue={initial.seoTitle} />
        <div className="space-y-2">
          <Label htmlFor="seoDescription">Site description (max 160)</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} maxLength={160} defaultValue={initial.seoDescription} />
        </div>
        <ImageField id="share" label="Share image (social preview)" url={initial.shareUrl} removeName="removeShare" />
      </Section>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save settings'}</Button>
    </form>
  )
}
