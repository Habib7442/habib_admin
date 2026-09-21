'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'

export type FormState = { error?: string }

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type Parsed = {
  title: string
  description: string
  liveUrl: string
  alt: string
  image: File | null
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const liveUrl = String(formData.get('liveUrl') ?? '').trim()
  const alt = String(formData.get('alt') ?? '').trim()
  const file = formData.get('image')
  const image = file instanceof File && file.size > 0 ? file : null

  if (!title) return { error: 'Title is required' }
  if (title.length > 100) return { error: 'Title must be 100 characters or less' }
  if (liveUrl) {
    try {
      const u = new URL(liveUrl)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error()
    } catch {
      return { error: 'Live link must be a valid http(s) URL' }
    }
  }
  if (image) {
    if (!image.type.startsWith('image/')) return { error: 'File must be an image' }
    if (image.size > MAX_IMAGE_BYTES) return { error: 'Image must be 8MB or smaller' }
  }
  return { title, description, liveUrl, alt, image }
}

async function uploadImage(image: File) {
  return sanityWrite.assets.upload('image', Buffer.from(await image.arrayBuffer()), {
    filename: image.name,
    contentType: image.type,
  })
}

function refreshAdmin() {
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}

export async function createLandingPage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { title, description, liveUrl, alt, image } = parsed
  if (!image) return { error: 'Image is required' }

  try {
    const asset = await uploadImage(image)
    await sanityWrite.create({
      _type: 'landingPage',
      title,
      ...(description && { description }),
      ...(liveUrl && { liveUrl }),
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, ...(alt && { alt }) },
      ratingCount: 0,
      ratingTotal: 0,
    })
  } catch (e) {
    console.error(e)
    return { error: 'Upload to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshAdmin()
  redirect('/admin/landing-pages')
}

export async function updateLandingPage(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { title, description, liveUrl, alt, image } = parsed

  try {
    const set: Record<string, unknown> = { title }
    const unset: string[] = []

    if (description) set.description = description
    else unset.push('description')
    if (liveUrl) set.liveUrl = liveUrl
    else unset.push('liveUrl')
    if (alt) set['image.alt'] = alt
    else unset.push('image.alt')
    if (image) {
      const asset = await uploadImage(image)
      set['image.asset'] = { _type: 'reference', _ref: asset._id }
    }

    await sanityWrite.patch(id).set(set).unset(unset).commit()
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshAdmin()
  redirect('/admin/landing-pages')
}

export async function deleteLandingPage(id: string) {
  await requireAuth()
  // Deletes the published doc and any draft made in the Studio.
  await sanityWrite.delete({
    query: '*[_type == "landingPage" && _id in [$id, "drafts." + $id]]',
    params: { id },
  })
  refreshAdmin()
}
