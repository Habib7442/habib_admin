import { notFound } from 'next/navigation'
import { BlogForm, type BlogInitial } from '@/components/admin/BlogForm'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { updateBlog } from '../../actions'

export default async function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const doc = await sanityWrite.fetch<BlogInitial | null>(
    `*[_type == "blog" && _id == $id][0]{
      title, "slug": slug.current, status, excerpt, content, category, tags, featured,
      seoTitle, seoDescription, "coverUrl": coverImage.asset->url
    }`,
    { id }
  )
  if (!doc) notFound()

  return (
    <BlogForm
      heading="Edit post"
      submitLabel="Save changes"
      action={updateBlog.bind(null, id)}
      initial={{ ...doc, tags: doc.tags ?? [] }}
    />
  )
}
