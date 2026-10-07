'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isHttpUrl, isImageAssetId, sanityWrite, withAssetCleanup } from '@/lib/sanity'

export type FormState = { error?: string; success?: boolean }

type Parsed = {
  title: string
  description: string
  liveUrl: string
  alt: string
  imageAsset: string
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const liveUrl = String(formData.get('liveUrl') ?? '').trim()
  const alt = String(formData.get('alt') ?? '').trim()
  const imageAsset = String(formData.get('imageAsset') ?? '').trim()

  if (!title) return { error: 'Title is required' }
  if (title.length > 100) return { error: 'Title must be 100 characters or less' }
  if (liveUrl && !isHttpUrl(liveUrl)) return { error: 'Live link must be a valid http(s) URL' }
  if (imageAsset && !isImageAssetId(imageAsset)) return { error: 'Invalid image upload' }
  return { title, description, liveUrl, alt, imageAsset }
}

/** Admin lists here, the public portfolio there (its own page via `paths`). */
async function refreshAdmin(paths: string[] = []) {
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
  await revalidatePortfolio(paths)
}

export async function createLandingPage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { title, description, liveUrl, alt, imageAsset } = parsed
  if (!imageAsset) return { error: 'Image is required' }

  try {
    await sanityWrite.create({
      _type: 'landingPage',
      title,
      ...(description && { description }),
      ...(liveUrl && { liveUrl }),
      image: { _type: 'image', asset: { _type: 'reference', _ref: imageAsset }, ...(alt && { alt }) },
      ratingCount: 0,
      ratingTotal: 0,
    })
  } catch (e) {
    console.error(e)
    return { error: 'Upload to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refreshAdmin()
  redirect('/admin/landing-pages')
}

export async function updateLandingPage(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { title, description, liveUrl, alt, imageAsset } = parsed

  try {
    const set: Record<string, unknown> = { title }
    const unset: string[] = []

    if (description) set.description = description
    else unset.push('description')
    if (liveUrl) set.liveUrl = liveUrl
    else unset.push('liveUrl')
    if (alt) set['image.alt'] = alt
    else unset.push('image.alt')
    if (imageAsset) set['image.asset'] = { _type: 'reference', _ref: imageAsset }

    await withAssetCleanup(id, () => sanityWrite.patch(id).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refreshAdmin()
  redirect('/admin/landing-pages')
}

export async function deleteLandingPage(id: string) {
  await requireAuth()
  // Deletes the published doc and any draft made in the Studio.
  await deleteDocWithAssets(id)
  await refreshAdmin()
}
