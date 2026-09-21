// Browser-side helper: shrink big images, then upload one per request to /api/upload.
// Vercel rejects request bodies over 4.5MB, so we stay well under that.

const MAX_BYTES = 3.5 * 1024 * 1024
const MAX_SIDE = 2560

function toBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
}

async function shrink(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    throw new Error(`${file.name} is too large (max 3.5MB for this file type)`)
  }

  const bitmap = await createImageBitmap(file)
  const base = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))

  for (const factor of [1, 0.75, 0.5, 0.35]) {
    const scale = base * factor
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.88, 0.75, 0.6]) {
      const blob = await toBlob(canvas, quality)
      if (blob && blob.size <= MAX_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/webp' ? '.webp' : '.png')
        return new File([blob], name, { type: blob.type })
      }
    }
  }
  throw new Error(`${file.name} could not be shrunk enough. Try a smaller image.`)
}

/** Public CDN url for an asset id like image-<hash>-<w>x<h>-<ext>. */
export function sanityImageUrl(assetId: string): string {
  const [, hash, size, ext] = assetId.split('-')
  // Must be direct process.env.NEXT_PUBLIC_* reads so Next inlines them into the browser bundle.
  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  return `https://cdn.sanity.io/images/${project}/${dataset}/${hash}-${size}.${ext}`
}

/** Uploads one image (shrinking it first if needed) and returns the Sanity asset id. */
export async function uploadToSanity(file: File): Promise<string> {
  const ready = await shrink(file)
  const body = new FormData()
  body.append('file', ready)

  const res = await fetch('/api/upload', { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.assetId) throw new Error(data.error ?? `Upload of ${file.name} failed`)
  return data.assetId as string
}
