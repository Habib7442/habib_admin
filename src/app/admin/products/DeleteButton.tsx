'use client'

import { useTransition } from 'react'
import { deleteProduct } from './actions'
import { Button } from '@/components/ui/button'

export function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm('Delete this product?')) start(() => deleteProduct(id))
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
