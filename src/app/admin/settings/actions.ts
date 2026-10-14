'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePortfolio } from '@/lib/portfolio'
import { requireAuth } from '@/lib/session'
import { isHttpUrl, isImageAssetId, sanityWrite, withAssetCleanup } from '@/lib/sanity'
import type { FormState } from '../actions'

// Fixed id, so there is only ever one settings document.
const SETTINGS_ID = 'siteSettings'

const TEXT_LIMITS: Record<string, number> = {
  name: 100,
  tagline: 160,
  bio: 1000,
  seoTitle: 70,
  seoDescription: 160,
}
const URL_FIELDS = ['resumeUrl', 'githubUrl', 'linkedinUrl', 'twitterUrl', 'instagramUrl']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SERVICE_COUNT = 4

/** The four "My services" rows. Empty fields are left out so the portfolio uses its built-in text. */
function parseServices(str: (k: string) => string) {
  const services = []
  for (let i = 0; i < SERVICE_COUNT; i++) {
    const title = str(`service${i}Title`)
    const description = str(`service${i}Description`)
    const points = [0, 1, 2].map((p) => str(`service${i}Point${p}`)).filter(Boolean)
    if (title.length > 60) return { error: `Service ${i + 1} title must be 60 characters or less` }
    if (description.length > 200) return { error: `Service ${i + 1} sentence must be 200 characters or less` }
    if (points.some((p) => p.length > 60)) return { error: `Service ${i + 1} bullets must be 60 characters or less` }
    services.push({
      _key: `service${i}`,
      _type: 'service',
      ...(title && { title }),
      ...(description && { description }),
      ...(points.length && { points }),
    })
  }
  return { services }
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const str = (k: string) => String(formData.get(k) ?? '').trim()
  const values: Record<string, string> = {}

  for (const [key, max] of Object.entries(TEXT_LIMITS)) {
    values[key] = str(key)
    if (values[key].length > max) return { error: `${key} must be ${max} characters or less` }
  }
  for (const key of URL_FIELDS) {
    values[key] = str(key)
    if (values[key] && !isHttpUrl(values[key])) return { error: `${key} must be a valid http(s) URL` }
  }
  values.email = str('email')
  if (values.email && !EMAIL.test(values.email)) return { error: 'Contact email is not valid' }

  const parsedServices = parseServices(str)
  if ('error' in parsedServices) return { error: parsedServices.error }

  const profileAsset = str('profileAsset')
  const shareAsset = str('shareAsset')
  if ([profileAsset, shareAsset].some((id) => id && !isImageAssetId(id))) return { error: 'Invalid image upload' }

  const set: Record<string, unknown> = {}
  const unset: string[] = []
  for (const [key, value] of Object.entries(values)) {
    if (value) set[key] = value
    else unset.push(key)
  }
  set.services = parsedServices.services
  const ref = (id: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: id } })
  if (profileAsset) set.profileImage = ref(profileAsset)
  else if (formData.get('removeProfile') === 'on') unset.push('profileImage')
  if (shareAsset) set.shareImage = ref(shareAsset)
  else if (formData.get('removeShare') === 'on') unset.push('shareImage')

  try {
    await sanityWrite.createIfNotExists({ _id: SETTINGS_ID, _type: 'siteSettings' })
    await withAssetCleanup(SETTINGS_ID, () => sanityWrite.patch(SETTINGS_ID).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  revalidatePath('/admin/settings')
  await revalidatePortfolio()
  return { success: true }
}
