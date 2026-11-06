import { TemplateForm } from '@/components/admin/TemplateForm'
import { requireAuth } from '@/lib/session'
import { createTemplate } from '../actions'

export default async function NewTemplatePage() {
  await requireAuth()
  return <TemplateForm heading="Add template" submitLabel="Publish" action={createTemplate} />
}
