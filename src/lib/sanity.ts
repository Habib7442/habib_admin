import 'server-only'
import { createClient } from '@sanity/client'

export const sanityWrite = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// Vercel rejects request bodies over 4.5MB, so each image is uploaded in its own request.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export async function uploadImage(image: File) {
  return sanityWrite.assets.upload('image', Buffer.from(await image.arrayBuffer()), {
    filename: image.name,
    contentType: image.type,
  })
}

export function isHttpUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** Sanity image asset ids look like image-<hash>-<w>x<h>-<ext>. */
export function isImageAssetId(value: string) {
  return /^image-[a-zA-Z0-9]+-\d+x\d+-[a-z0-9]+$/.test(value)
}

/** Returns an error message if the file is not an acceptable image, else null. */
export function imageError(file: File) {
  if (!file.type.startsWith('image/')) return 'Files must be images'
  if (file.size > MAX_IMAGE_BYTES) return 'Image is too large after resizing (max 4MB)'
  return null
}
