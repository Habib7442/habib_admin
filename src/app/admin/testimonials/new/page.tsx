import { TestimonialForm } from '@/components/admin/TestimonialForm'
import { requireAuth } from '@/lib/session'
import { createTestimonial } from '../actions'

export default async function NewTestimonialPage() {
  await requireAuth()
  return <TestimonialForm heading="Add testimonial" submitLabel="Publish" action={createTestimonial} />
}
