'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isHttpUrl, isImageAssetId, sanityWrite, slugTaken, withAssetCleanup } from '@/lib/sanity'
import { generateSlug } from '@/lib/utils/slug'
import type { FormState } from '../actions'

const CATEGORIES = ['web', 'mobile', 'design', 'other']
const STATUSES = ['completed', 'in_progress', 'planning']
const MAX_GALLERY = 20

type Parsed = {
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  liveUrl: string
  githubUrl: string
  techStack: string[]
  category: string
  status: string
  featured: boolean
  sortOrder: number
  thumbnailAsset: string
  newImageAssets: string[]
  removeKeys: string[]
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const title = str('title')
  const slugInput = generateSlug(str('slug')).replace(/^-+|-+$/g, '')
  const slug = slugInput || generateSlug(title).replace(/^-+|-+$/g, '')
  const shortDescription = str('shortDescription')
  const liveUrl = str('liveUrl')
  const githubUrl = str('githubUrl')
  const category = str('category')
  const status = str('status')
  const sortOrder = Number(str('sortOrder') || 0)
  const techStack = [...new Set(str('techStack').split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 30)
  const thumbnailAsset = str('thumbnailAsset')
  const newImageAssets = formData.getAll('imageAssets').map((v) => String(v).trim()).filter(Boolean)
  const removeKeys = formData.getAll('removeImage').map(String)

  if (!title) return { error: 'Title is required' }
  if (title.length > 100) return { error: 'Title must be 100 characters or less' }
  if (!slug) return { error: 'Slug could not be generated. Enter one manually.' }
  if (!shortDescription) return { error: 'Short description is required' }
  if (shortDescription.length > 160) return { error: 'Short description must be 160 characters or less' }
  if (liveUrl && !isHttpUrl(liveUrl)) return { error: 'Live link must be a valid http(s) URL' }
  if (githubUrl && !isHttpUrl(githubUrl)) return { error: 'GitHub link must be a valid http(s) URL' }
  if (!CATEGORIES.includes(category)) return { error: 'Choose a category' }
  if (!STATUSES.includes(status)) return { error: 'Choose a status' }
  if (!Number.isInteger(sortOrder)) return { error: 'Sort order must be a whole number' }
  if (newImageAssets.length > MAX_GALLERY) return { error: `You can add up to ${MAX_GALLERY} gallery images at a time` }
  if ([thumbnailAsset, ...newImageAssets].some((id) => id && !isImageAssetId(id))) {
    return { error: 'Invalid image upload' }
  }

  return {
    title, slug, shortDescription, fullDescription: str('fullDescription'), liveUrl, githubUrl,
    techStack, category, status, featured: formData.get('featured') === 'on', sortOrder,
    thumbnailAsset, newImageAssets, removeKeys,
  }
}

function galleryItems(assetIds: string[]) {
  return assetIds.map((id) => ({
    _type: 'image',
    _key: randomUUID().slice(0, 12),
    asset: { _type: 'reference', _ref: id },
  }))
}

function refreshProjects() {
  revalidatePath('/admin', 'layout')
}

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (!p.thumbnailAsset) return { error: 'Thumbnail is required' }
  if (await slugTaken('project', p.slug)) return { error: `The slug "${p.slug}" is already used by another project` }

  try {
    await sanityWrite.create({
      _type: 'project',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      shortDescription: p.shortDescription,
      ...(p.fullDescription && { fullDescription: p.fullDescription }),
      thumbnail: { _type: 'image', asset: { _type: 'reference', _ref: p.thumbnailAsset } },
      images: galleryItems(p.newImageAssets),
      ...(p.liveUrl && { liveUrl: p.liveUrl }),
      ...(p.githubUrl && { githubUrl: p.githubUrl }),
      techStack: p.techStack,
      category: p.category,
      status: p.status,
      featured: p.featured,
      sortOrder: p.sortOrder,
    })
  } catch (e) {
    console.error(e)
    return { error: 'Upload to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshProjects()
  redirect('/admin/projects')
}

export async function updateProject(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (await slugTaken('project', p.slug, id)) return { error: `The slug "${p.slug}" is already used by another project` }

  try {
    const current = await sanityWrite.fetch<{ images?: { _key: string }[] } | null>(
      '*[_type == "project" && _id == $id][0]{ images }',
      { id }
    )
    if (!current) return { error: 'Project not found' }

    const kept = (current.images ?? []).filter((img) => !p.removeKeys.includes(img._key))
    const images = [...kept, ...galleryItems(p.newImageAssets)]

    const set: Record<string, unknown> = {
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      shortDescription: p.shortDescription,
      images,
      techStack: p.techStack,
      category: p.category,
      status: p.status,
      featured: p.featured,
      sortOrder: p.sortOrder,
    }
    const unset: string[] = []

    if (p.fullDescription) set.fullDescription = p.fullDescription
    else unset.push('fullDescription')
    if (p.liveUrl) set.liveUrl = p.liveUrl
    else unset.push('liveUrl')
    if (p.githubUrl) set.githubUrl = p.githubUrl
    else unset.push('githubUrl')
    if (p.thumbnailAsset) set['thumbnail.asset'] = { _type: 'reference', _ref: p.thumbnailAsset }

    await withAssetCleanup(id, () => sanityWrite.patch(id).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshProjects()
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  await requireAuth()
  await deleteDocWithAssets(id)
  refreshProjects()
}
