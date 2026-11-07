'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isHttpUrl, isImageAssetId, sanityWrite, slugTaken, withAssetCleanup } from '@/lib/sanity'
import { generateSlug } from '@/lib/utils/slug'
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES, templateTypePath } from '@/lib/template-categories'
import type { FormState } from '../actions'

const MAX_SLIDES = 20

type Parsed = {
  title: string
  templateType: string
  slug: string
  description: string
  category: string
  size: string
  isFree: boolean
  price: string
  buyLink: string
  canvaLink: string
  featured: boolean
  order: number
  newSlideAssets: string[]
  removeKeys: string[]
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const title = str('title')
  const slug = generateSlug(str('slug') || title).replace(/^-+|-+$/g, '')
  const description = str('description')
  const category = str('category')
  const templateType = str('templateType') || 'carousel'
  const size = str('size')
  const isFree = formData.get('isFree') === 'on'
  const price = isFree ? '' : str('price')
  const buyLink = str('buyLink')
  const canvaLink = str('canvaLink')
  const order = Number(str('order') || 0)
  const newSlideAssets = formData.getAll('slideAssets').map((v) => String(v).trim()).filter(Boolean)
  const removeKeys = formData.getAll('removeSlide').map(String)

  if (!title) return { error: 'Title is required' }
  if (title.length > 80) return { error: 'Title must be 80 characters or less' }
  if (!slug) return { error: 'Slug could not be generated. Enter one manually.' }
  if (!description) return { error: 'Description is required' }
  if (description.length > 300) return { error: 'Description must be 300 characters or less' }
  if (!TEMPLATE_TYPES.includes(templateType)) return { error: 'Choose a type' }
  if (!TEMPLATE_CATEGORIES.includes(category)) return { error: 'Choose a category' }
  if (size.length > 30) return { error: 'Slide size must be 30 characters or less' }
  if (price.length > 20) return { error: 'Price label must be 20 characters or less' }
  if (buyLink && !isHttpUrl(buyLink)) return { error: 'Buy link must be a valid http(s) URL' }
  if (canvaLink && !isHttpUrl(canvaLink)) return { error: 'Canva link must be a valid http(s) URL' }
  if (isFree && !canvaLink) return { error: 'Free templates need a Canva template link' }
  if (!isFree && !buyLink) return { error: 'Paid templates need a buy link (Etsy / Gumroad)' }
  if (!Number.isInteger(order)) return { error: 'Order must be a whole number' }
  if (newSlideAssets.length > MAX_SLIDES) return { error: `You can add up to ${MAX_SLIDES} slides` }
  if (newSlideAssets.some((id) => !isImageAssetId(id))) return { error: 'Invalid image upload' }

  return {
    title, templateType, slug, description, category, size, isFree, price, buyLink, canvaLink,
    featured: formData.get('featured') === 'on', order, newSlideAssets, removeKeys,
  }
}

function slideItems(assetIds: string[]) {
  return assetIds.map((id) => ({
    _type: 'image',
    _key: randomUUID().slice(0, 12),
    asset: { _type: 'reference', _ref: id },
  }))
}

/** Portfolio pages for a template: the hub, its type section and its own page. */
function templatePaths(p: Pick<Parsed, 'templateType' | 'slug'>) {
  const section = `/templates/${templateTypePath(p.templateType)}`
  return [section, `${section}/${p.slug}`]
}

async function refresh(paths: string[] = []) {
  revalidatePath('/admin', 'layout')
  await revalidatePortfolio(['/templates', ...paths])
}

export async function createTemplate(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (p.newSlideAssets.length === 0) return { error: 'Add at least one slide' }
  if (await slugTaken('carouselTemplate', p.slug)) return { error: `The slug "${p.slug}" is already used by another template` }

  try {
    await sanityWrite.create({
      _type: 'carouselTemplate',
      title: p.title,
      templateType: p.templateType,
      slug: { _type: 'slug', current: p.slug },
      description: p.description,
      category: p.category,
      slides: slideItems(p.newSlideAssets),
      ...(p.size && { size: p.size }),
      isFree: p.isFree,
      ...(p.price && { price: p.price }),
      ...(p.buyLink && { buyLink: p.buyLink }),
      ...(p.canvaLink && { canvaLink: p.canvaLink }),
      featured: p.featured,
      order: p.order,
    })
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh(templatePaths(p))
  redirect('/admin/templates')
}

export async function updateTemplate(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (await slugTaken('carouselTemplate', p.slug, id)) return { error: `The slug "${p.slug}" is already used by another template` }

  try {
    const current = await sanityWrite.fetch<{ slides?: { _key: string }[] } | null>(
      '*[_type == "carouselTemplate" && _id == $id][0]{ slides }',
      { id }
    )
    if (!current) return { error: 'Template not found' }

    const kept = (current.slides ?? []).filter((s) => !p.removeKeys.includes(s._key))
    const slides = [...kept, ...slideItems(p.newSlideAssets)]
    if (slides.length === 0) return { error: 'A template needs at least one slide' }
    if (slides.length > MAX_SLIDES) return { error: `A template can have up to ${MAX_SLIDES} slides` }

    const set: Record<string, unknown> = {
      title: p.title,
      templateType: p.templateType,
      slug: { _type: 'slug', current: p.slug },
      description: p.description,
      category: p.category,
      slides,
      isFree: p.isFree,
      featured: p.featured,
      order: p.order,
    }
    const unset: string[] = []
    for (const key of ['size', 'price', 'buyLink', 'canvaLink'] as const) {
      if (p[key]) set[key] = p[key]
      else unset.push(key)
    }

    await withAssetCleanup(id, () => sanityWrite.patch(id).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh(templatePaths(p))
  redirect('/admin/templates')
}

export async function deleteTemplate(id: string) {
  await requireAuth()
  await deleteDocWithAssets(id)
  await refresh()
}
