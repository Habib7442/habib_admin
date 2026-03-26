'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BlogForm } from '@/components/admin/BlogForm'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditBlogPage() {
  const { id } = useParams()
  const [blog, setBlog] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBlog() {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setBlog(data)
      setLoading(false)
    }

    if (id) fetchBlog()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  if (!blog) return <div>Post not found</div>

  return <BlogForm id={id as string} initialData={blog} />
}
