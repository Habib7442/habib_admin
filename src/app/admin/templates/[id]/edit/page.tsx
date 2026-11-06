import { notFound } from 'next/navigation'
import { TemplateForm, type TemplateInitial } from '@/components/admin/TemplateForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateTemplate } from '../../actions'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<TemplateInitial | null>(
    `*[_type == "carouselTemplate" && _id == $id][0]{
      title, "slug": slug.current, description, category, size, isFree, price, buyLink, canvaLink, featured, order,
      "slides": slides[]{ "key": _key, "url": asset->url }
    }`,
    { id }
  )
  if (!doc) notFound()

  return <TemplateForm heading="Edit template" submitLabel="Save changes" action={updateTemplate.bind(null, id)} initial={doc} />
}
