import { BlogForm } from '@/components/admin/BlogForm'
import { createBlog } from '../actions'

export default function NewBlog() {
  return <BlogForm heading="New post" submitLabel="Save" action={createBlog} />
}
