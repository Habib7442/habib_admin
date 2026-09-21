import { DesignForm } from '@/components/admin/DesignForm'
import { createDesign } from '../actions'

export default function NewDesign() {
  return <DesignForm heading="Upload design" submitLabel="Publish" action={createDesign} />
}
