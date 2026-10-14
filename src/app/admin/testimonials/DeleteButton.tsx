'use client'

import { useTransition } from 'react'
import { deleteTestimonial } from './actions'
import { Button } from '@/components/ui/button'

export function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm('Delete this testimonial?')) start(() => deleteTestimonial(id))
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
