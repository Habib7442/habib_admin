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

const CDN_IMAGE_URL = /cdn\.sanity\.io\/images\/[^/\s]+\/[^/\s]+\/([a-f0-9]+)-(\d+x\d+)\.([a-z0-9]+)/g

/** Every image asset id a value points at: `_ref` references plus Sanity CDN urls inside text (blog Markdown). */
export function collectAssetIds(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    for (const m of value.matchAll(CDN_IMAGE_URL)) out.add(`image-${m[1]}-${m[2]}-${m[3]}`)
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectAssetIds(v, out))
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj._ref === 'string' && isImageAssetId(obj._ref)) out.add(obj._ref)
    Object.values(obj).forEach((v) => collectAssetIds(v, out))
  }
  return out
}

/**
 * Permanently deletes image assets that nothing uses any more.
 * Skips an asset that any document references, or that another blog post embeds in its Markdown.
 * Best effort: a failure here never breaks the admin action that called it.
 */
export async function deleteUnusedAssets(assetIds: Iterable<string>) {
  await Promise.all(
    [...new Set(assetIds)].map(async (id) => {
      try {
        const hash = id.split('-')[1]
        const inUse = await sanityWrite.fetch<boolean>(
          'count(*[references($id) || (_type == "blog" && content match $pattern)]) > 0',
          { id, pattern: `*${hash}*` },
          { perspective: 'raw' } // count Studio drafts too, or we could delete an image a draft still uses
        )
        if (!inUse) await sanityWrite.delete(id)
      } catch (e) {
        console.error('Could not delete unused asset', id, e)
      }
    })
  )
}

/** Deletes a document (and its Studio draft), then permanently deletes the images only it used. */
export async function deleteDocWithAssets(id: string) {
  // "raw" perspective, otherwise Sanity hides the Studio draft and we would miss its images.
  const docs = await sanityWrite.fetch<{ _id: string }[]>(
    '*[_id in $ids]',
    { ids: [id, `drafts.${id}`] },
    { perspective: 'raw' }
  )
  if (!docs.length) return
  const tx = sanityWrite.transaction()
  docs.forEach((d) => tx.delete(d._id))
  await tx.commit()
  await deleteUnusedAssets(collectAssetIds(docs))
}

/** Runs an update, then permanently deletes images the update removed or replaced (unless still used). */
export async function withAssetCleanup(id: string, update: () => Promise<unknown>) {
  const before = collectAssetIds(await sanityWrite.fetch('*[_id == $id][0]', { id }))
  await update()
  const after = collectAssetIds(await sanityWrite.fetch('*[_id == $id][0]', { id }))
  await deleteUnusedAssets([...before].filter((a) => !after.has(a)))
}

/** True if another document of this type (ignoring `exceptId` and its draft) already uses the slug. */
export async function slugTaken(type: string, slug: string, exceptId?: string) {
  return sanityWrite.fetch<boolean>(
    'count(*[_type == $type && slug.current == $slug && !(_id in [$id, "drafts." + $id])]) > 0',
    { type, slug, id: exceptId ?? '' }
  )
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
