'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'

const STATUSES = ['new', 'read', 'replied', 'archived']

export async function setMessageStatus(id: string, status: string) {
  await requireAuth()
  if (!STATUSES.includes(status)) return
  await sanityWrite.patch(id).set({ status }).commit()
  revalidatePath('/admin', 'layout')
}

export async function deleteMessage(id: string) {
  await requireAuth()
  await sanityWrite.delete({
    query: '*[_type == "contactMessage" && _id in [$id, "drafts." + $id]]',
    params: { id },
  })
  revalidatePath('/admin', 'layout')
}
