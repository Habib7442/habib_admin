'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { isImageAssetId, sanityWrite } from '@/lib/sanity'
import { DESIGN_CATEGORY_VALUES } from '@/lib/design-categories'
import type { FormState } from '../actions'

const MAX_EXTRA_IMAGES = 20

type Parsed = {
  title: string
  description: string
  category: string
  tools: string[]
  tags: string[]
  featured: boolean
  imageAsset: string
  newImageAssets: string[]
  removeKeys: string[]
}

function list(value: string) {
  return [...new Set(value.split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 30)
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const title = str('title')
  const category = str('category')
  const imageAsset = str('imageAsset')
  const newImageAssets = formData.getAll('imageAssets').map((v) => String(v).trim()).filter(Boolean)

  if (!title) return { error: 'Title is required' }
  if (title.length > 100) return { error: 'Title must be 100 characters or less' }
  if (!DESIGN_CATEGORY_VALUES.includes(category)) return { error: 'Choose a category' }
  if (newImageAssets.length > MAX_EXTRA_IMAGES) {
    return { error: `You can add up to ${MAX_EXTRA_IMAGES} extra images at a time` }
  }
  if ([imageAsset, ...newImageAssets].some((id) => id && !isImageAssetId(id))) {
    return { error: 'Invalid image upload' }
  }

  return {
    title,
    description: str('description'),
    category,
    tools: list(str('tools')),
    tags: list(str('tags')),
    featured: formData.get('featured') === 'on',
    imageAsset,
    newImageAssets,
    removeKeys: formData.getAll('removeImage').map(String),
  }
}

function galleryItems(assetIds: string[]) {
  return assetIds.map((id) => ({
    _type: 'image',
    _key: randomUUID().slice(0, 12),
    asset: { _type: 'reference', _ref: id },
  }))
}

function refreshDesigns() {
  revalidatePath('/admin', 'layout')
}

export async function createDesign(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (!p.imageAsset) return { error: 'Main image is required' }

  try {
    await sanityWrite.create({
      _type: 'design',
      title: p.title,
      category: p.category,
      image: { _type: 'image', asset: { _type: 'reference', _ref: p.imageAsset } },
      images: galleryItems(p.newImageAssets),
      ...(p.description && { description: p.description }),
      tools: p.tools,
      tags: p.tags,
      featured: p.featured,
    })
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshDesigns()
  redirect('/admin/designs')
}

export async function updateDesign(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p

  try {
    const current = await sanityWrite.fetch<{ images?: { _key: string }[] } | null>(
      '*[_type == "design" && _id == $id][0]{ images }',
      { id }
    )
    if (!current) return { error: 'Design not found' }

    const kept = (current.images ?? []).filter((img) => !p.removeKeys.includes(img._key))

    const set: Record<string, unknown> = {
      title: p.title,
      category: p.category,
      images: [...kept, ...galleryItems(p.newImageAssets)],
      tools: p.tools,
      tags: p.tags,
      featured: p.featured,
    }
    const unset: string[] = []

    if (p.description) set.description = p.description
    else unset.push('description')
    if (p.imageAsset) set['image.asset'] = { _type: 'reference', _ref: p.imageAsset }

    await sanityWrite.patch(id).set(set).unset(unset).commit()
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshDesigns()
  redirect('/admin/designs')
}

export async function deleteDesign(id: string) {
  await requireAuth()
  await sanityWrite.delete({
    query: '*[_type == "design" && _id in [$id, "drafts." + $id]]',
    params: { id },
  })
  refreshDesigns()
}
