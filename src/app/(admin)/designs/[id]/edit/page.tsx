'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DesignForm } from '@/components/admin/DesignForm'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditDesignPage() {
  const { id } = useParams()
  const [design, setDesign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDesign() {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setDesign(data)
      setLoading(false)
    }

    if (id) fetchDesign()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  if (!design) return <div>Design not found</div>

  return <DesignForm id={id as string} initialData={design} />
}
