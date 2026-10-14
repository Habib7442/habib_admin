'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, sanityWrite } from '@/lib/sanity'
import type { FormState } from '../actions'

type Parsed = { quote: string; name: string; role: string; business: string; order: number }

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const quote = str('quote')
  const name = str('name')
  const role = str('role')
  const business = str('business')
  const order = Number(str('order') || 0)

  if (!quote) return { error: 'Quote is required' }
  if (quote.length > 500) return { error: 'Quote must be 500 characters or less' }
  if (!name) return { error: 'Name is required' }
  if (name.length > 100) return { error: 'Name must be 100 characters or less' }
  if (role.length > 80) return { error: 'Role must be 80 characters or less' }
  if (business.length > 100) return { error: 'Business must be 100 characters or less' }
  if (!Number.isInteger(order)) return { error: 'Order must be a whole number' }
  return { quote, name, role, business, order }
}

async function refresh() {
  revalidatePath('/admin', 'layout')
  await revalidatePortfolio()
}

export async function createTestimonial(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { quote, name, role, business, order } = parsed

  try {
    await sanityWrite.create({
      _type: 'testimonial',
      quote,
      name,
      order,
      ...(role && { role }),
      ...(business && { business }),
    })
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh()
  redirect('/admin/testimonials')
}

export async function updateTestimonial(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const parsed = parseForm(formData)
  if ('error' in parsed) return parsed
  const { quote, name, role, business, order } = parsed

  try {
    const set: Record<string, unknown> = { quote, name, order }
    const unset: string[] = []
    if (role) set.role = role
    else unset.push('role')
    if (business) set.business = business
    else unset.push('business')
    await sanityWrite.patch(id).set(set).unset(unset).commit()
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  await refresh()
  redirect('/admin/testimonials')
}

export async function deleteTestimonial(id: string) {
  await requireAuth()
  // Also removes a photo added in the Studio, if nothing else uses it.
  await deleteDocWithAssets(id)
  await refresh()
}
