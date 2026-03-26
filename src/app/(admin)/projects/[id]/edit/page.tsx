'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setProject(data)
      setLoading(false)
    }

    if (id) fetchProject()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  if (!project) return <div>Project not found</div>

  return <ProjectForm id={id as string} initialData={project} />
}
