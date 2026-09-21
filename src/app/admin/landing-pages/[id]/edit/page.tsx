import { notFound } from 'next/navigation'
import { LandingPageForm } from '@/components/admin/LandingPageForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateLandingPage } from '../../../actions'

type Doc = { title: string; description?: string; liveUrl?: string; alt?: string; imageUrl?: string }

export default async function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<Doc | null>(
    `*[_type == "landingPage" && _id == $id][0]{
      title, description, liveUrl, "alt": image.alt, "imageUrl": image.asset->url
    }`,
    { id }
  )
  if (!doc) notFound()

  return (
    <LandingPageForm
      heading="Edit landing page"
      submitLabel="Save changes"
      action={updateLandingPage.bind(null, id)}
      initial={doc}
    />
  )
}
