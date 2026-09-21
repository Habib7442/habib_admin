import { LandingPageForm } from '@/components/admin/LandingPageForm'
import { createLandingPage } from '../../actions'

export default function NewLandingPage() {
  return <LandingPageForm heading="Upload landing page" submitLabel="Publish" action={createLandingPage} />
}
