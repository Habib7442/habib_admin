'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, privateId, publicId, sanityWrite } from '@/lib/sanity'

const STATUSES = ['pending', 'approved', 'hidden']

/**
 * Approved reviews live under a public id (the portfolio shows them); pending and hidden ones
 * under a "private." id, which anonymous visitors can't read. Changing status moves the document.
 */
export async function setReviewStatus(id: string, status: string) {
  await requireAuth()
  if (!STATUSES.includes(status)) return

  const doc = await sanityWrite.getDocument(id)
  if (!doc) return
  const targetId = status === 'approved' ? publicId(id) : privateId(id)

  if (targetId === id) {
    await sanityWrite.patch(id).set({ status }).commit()
  } else {
    // Copy the review's own fields only. A public copy never carries the sender's IP hash.
    const { name, role, rating, review, photo, consent, ipHash, submittedAt, _createdAt } = doc
    await sanityWrite
      .transaction()
      .createOrReplace({
        _id: targetId,
        _type: 'review',
        name,
        ...(role && { role }),
        rating,
        review,
        ...(photo && { photo }),
        consent,
        status,
        submittedAt: submittedAt ?? _createdAt,
        ...(status !== 'approved' && ipHash && { ipHash }),
      })
      .delete(id)
      .commit()
  }
  revalidatePath('/admin', 'layout')
}

export async function deleteReview(id: string) {
  await requireAuth()
  // Also permanently deletes the reviewer's uploaded photo.
  await deleteDocWithAssets(id)
  revalidatePath('/admin', 'layout')
}
