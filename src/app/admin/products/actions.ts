'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isHttpUrl, isImageAssetId, sanityWrite, withAssetCleanup } from '@/lib/sanity'
import type { FormState } from '../actions'

const STATUSES = ['live', 'beta', 'hackathon']

type Parsed = {
  name: string
  oneLiner: string
  link: string
  status: string
  order: number
  alt: string
  imageAsset: string
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const name = str('name')
  const oneLiner = str('oneLiner')
  const link = str('link')
  const status = str('status')
  const order = Number(str('order') || 0)
  const imageAsset = str('imageAsset')

  if (!name) return { error: 'Name is required' }
  if (name.length > 80) return { error: 'Name must be 80 characters or less' }
  if (!oneLiner) return { error: 'One-line description is required' }
  if (oneLiner.length > 90) return { error: 'One-line description must be 90 characters or less' }
  if (!link || !isHttpUrl(link)) return { error: 'Link must be a valid http(s) URL' }
  if (!STATUSES.includes(status)) return { error: 'Choose a status' }
  if (!Number.isInteger(order)) return { error: 'Order must be a whole number' }
  if (imageAsset && !isImageAssetId(imageAsset)) return { error: 'Invalid image upload' }
  return { name, oneLiner, link, status, order, alt: str('alt'), imageAsset }
}

async function refresh() {
  revalidatePath('/admin', 'layout')
  await revalidatePortfolio()
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { name, oneLiner, link, status, order, alt, imageAsset } = parsed

  try {
    await sanityWrite.create({
      _type: 'product',
      name,
      oneLiner,
      link,
      status,
      order,
      ...(imageAsset && { image: { _type: 'image', asset: { _type: 'reference', _ref: imageAsset }, ...(alt && { alt }) } }),
    })
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh()
  redirect('/admin/products')
}

export async function updateProduct(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { name, oneLiner, link, status, order, alt, imageAsset } = parsed

  try {
    const set: Record<string, unknown> = { name, oneLiner, link, status, order }
    const unset: string[] = []
    if (imageAsset) set.image = { _type: 'image', asset: { _type: 'reference', _ref: imageAsset }, ...(alt && { alt }) }
    else if (formData.get('removeImage') === 'on') unset.push('image')
    else if (alt) set['image.alt'] = alt
    else unset.push('image.alt')

    await withAssetCleanup(id, () => sanityWrite.patch(id).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh()
  redirect('/admin/products')
}

export async function deleteProduct(id: string) {
  await requireAuth()
  await deleteDocWithAssets(id)
  await refresh()
}
