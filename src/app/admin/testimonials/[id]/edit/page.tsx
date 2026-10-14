import { notFound } from 'next/navigation'
import { TestimonialForm, type TestimonialInitial } from '@/components/admin/TestimonialForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateTestimonial } from '../../actions'

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<TestimonialInitial | null>(
    `*[_type == "testimonial" && _id == $id][0]{ quote, name, role, business, order }`,
    { id }
  )
  if (!doc) notFound()

  return (
    <TestimonialForm heading="Edit testimonial" submitLabel="Save changes" action={updateTestimonial.bind(null, id)} initial={doc} />
  )
}
