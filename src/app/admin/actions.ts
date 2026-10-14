'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isFileAssetId, isHttpUrl, isImageAssetId, sanityWrite, withAssetCleanup } from '@/lib/sanity'

export type FormState = { error?: string; success?: boolean }

type Parsed = {
  title: string
  plainDescription: string
  description: string
  liveUrl: string
  alt: string
  imageAsset: string
  videoAsset: string
  webmAsset: string
  posterAsset: string
}

const fileRef = (id: string) => ({ _type: 'file', asset: { _type: 'reference', _ref: id } })
const imageRef = (id: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: id } })

function parseForm(formData: FormData): Parsed | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const plainDescription = String(formData.get('plainDescription') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const liveUrl = String(formData.get('liveUrl') ?? '').trim()
  const alt = String(formData.get('alt') ?? '').trim()
  const imageAsset = String(formData.get('imageAsset') ?? '').trim()
  const videoAsset = String(formData.get('videoAsset') ?? '').trim()
  const webmAsset = String(formData.get('webmAsset') ?? '').trim()
  const posterAsset = String(formData.get('posterAsset') ?? '').trim()

  if (!title) return { error: 'Title is required' }
  if (title.length > 100) return { error: 'Title must be 100 characters or less' }
  if (liveUrl && !isHttpUrl(liveUrl)) return { error: 'Live link must be a valid http(s) URL' }
  if (plainDescription.length > 240) return { error: 'Card description must be 240 characters or less' }
  if ([imageAsset, posterAsset].some((id) => id && !isImageAssetId(id))) return { error: 'Invalid image upload' }
  if ([videoAsset, webmAsset].some((id) => id && !isFileAssetId(id))) return { error: 'Invalid video upload' }
  return { title, plainDescription, description, liveUrl, alt, imageAsset, videoAsset, webmAsset, posterAsset }
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
  const { title, plainDescription, description, liveUrl, alt, imageAsset, videoAsset, webmAsset, posterAsset } = parsed
  if (!imageAsset) return { error: 'Image is required' }

  try {
    await sanityWrite.create({
      _type: 'landingPage',
      title,
      ...(plainDescription && { plainDescription }),
      ...(description && { description }),
      ...(liveUrl && { liveUrl }),
      image: { ...imageRef(imageAsset), ...(alt && { alt }) },
      ...(videoAsset && { previewVideo: fileRef(videoAsset) }),
      ...(webmAsset && { previewVideoWebm: fileRef(webmAsset) }),
      ...(posterAsset && { previewPoster: imageRef(posterAsset) }),
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
  const { title, plainDescription, description, liveUrl, alt, imageAsset, videoAsset, webmAsset, posterAsset } = parsed

  try {
    const set: Record<string, unknown> = { title }
    const unset: string[] = []

    if (plainDescription) set.plainDescription = plainDescription
    else unset.push('plainDescription')

    if (description) set.description = description
    else unset.push('description')
    if (liveUrl) set.liveUrl = liveUrl
    else unset.push('liveUrl')
    if (alt) set['image.alt'] = alt
    else unset.push('image.alt')
    if (imageAsset) set['image.asset'] = { _type: 'reference', _ref: imageAsset }
    if (videoAsset || webmAsset || posterAsset) {
      if (videoAsset) set.previewVideo = fileRef(videoAsset)
      if (webmAsset) set.previewVideoWebm = fileRef(webmAsset)
      if (posterAsset) set.previewPoster = imageRef(posterAsset)
    } else if (formData.get('removeVideo') === 'on') {
      unset.push('previewVideo', 'previewVideoWebm', 'previewPoster')
    }

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
