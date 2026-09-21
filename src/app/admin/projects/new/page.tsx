import { ProjectForm } from '@/components/admin/ProjectForm'
import { createProject } from '../actions'

export default function NewProject() {
  return <ProjectForm heading="New project" submitLabel="Publish" action={createProject} />
}
