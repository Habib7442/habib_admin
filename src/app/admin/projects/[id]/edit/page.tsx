import { notFound } from 'next/navigation'
import { ProjectForm, type ProjectInitial } from '@/components/admin/ProjectForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateProject } from '../../actions'

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<ProjectInitial | null>(
    `*[_type == "project" && _id == $id][0]{
      title, "slug": slug.current, shortDescription, fullDescription, liveUrl, githubUrl,
      techStack, category, status, featured, sortOrder,
      "thumbnailUrl": thumbnail.asset->url,
      "images": images[]{ "key": _key, "url": asset->url }
    }`,
    { id }
  )
  if (!doc) notFound()

  return (
    <ProjectForm
      heading="Edit project"
      submitLabel="Save changes"
      action={updateProject.bind(null, id)}
      initial={{ ...doc, images: doc.images ?? [], techStack: doc.techStack ?? [] }}
    />
  )
}
