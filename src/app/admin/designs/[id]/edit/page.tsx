import { notFound } from 'next/navigation'
import { DesignForm, type DesignInitial } from '@/components/admin/DesignForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateDesign } from '../../actions'

export default async function EditDesign({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<DesignInitial | null>(
    `*[_type == "design" && _id == $id][0]{
      title, description, category, tools, tags, featured,
      "imageUrl": image.asset->url,
      "images": images[]{ "key": _key, "url": asset->url }
    }`,
    { id }
  )
  if (!doc) notFound()

  return (
    <DesignForm
      heading="Edit design"
      submitLabel="Save changes"
      action={updateDesign.bind(null, id)}
      initial={{ ...doc, images: doc.images ?? [], tools: doc.tools ?? [], tags: doc.tags ?? [] }}
    />
  )
}
