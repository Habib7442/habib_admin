'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TestimonialForm } from '@/components/admin/TestimonialForm'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditTestimonialPage() {
  const { id } = useParams()
  const [testimonial, setTestimonial] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTestimonial() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setTestimonial(data)
      setLoading(false)
    }

    if (id) fetchTestimonial()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  if (!testimonial) return <div>Testimonial not found</div>

  return <TestimonialForm id={id as string} initialData={testimonial} />
}
