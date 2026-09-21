import { SettingsForm, type SettingsInitial } from '@/components/admin/SettingsForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'

export default async function SettingsPage() {
  await requireAuth()

  const doc = await sanityWrite.fetch<SettingsInitial | null>(
    `*[_id == "siteSettings"][0]{
      name, tagline, bio, email, resumeUrl, githubUrl, linkedinUrl, twitterUrl, instagramUrl,
      seoTitle, seoDescription,
      "profileUrl": profileImage.asset->url,
      "shareUrl": shareImage.asset->url
    }`
  )
  const initial = doc ?? {}

  // key remounts the form after a save so fields show the stored values
  return <SettingsForm key={JSON.stringify(initial)} initial={initial} />
}
