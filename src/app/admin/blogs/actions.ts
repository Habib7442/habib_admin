'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { deleteDocWithAssets, isImageAssetId, sanityWrite, slugTaken, withAssetCleanup } from '@/lib/sanity'
import { generateSlug } from '@/lib/utils/slug'
import type { FormState } from '../actions'

const STATUSES = ['draft', 'published']
const MAX_CONTENT = 200_000

type Parsed = {
  title: string
  slug: string
  status: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured: boolean
  seoTitle: string
  seoDescription: string
  coverAsset: string
}

function parseForm(formData: FormData): Parsed | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? '').trim()

  const title = str('title')
  const clean = (s: string) => generateSlug(s).replace(/^-+|-+$/g, '')
  const slug = clean(str('slug')) || clean(title)
  const status = str('status')
  const excerpt = str('excerpt')
  const content = String(formData.get('content') ?? '')
  const seoTitle = str('seoTitle')
  const seoDescription = str('seoDescription')
  const coverAsset = str('coverAsset')
  const tags = [...new Set(str('tags').split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 30)

  if (!title) return { error: 'Title is required' }
  if (title.length > 120) return { error: 'Title must be 120 characters or less' }
  if (!slug) return { error: 'Slug could not be generated. Enter one manually.' }
  if (!STATUSES.includes(status)) return { error: 'Choose a status' }
  if (excerpt.length > 300) return { error: 'Excerpt must be 300 characters or less' }
  if (content.length > MAX_CONTENT) return { error: 'Content is too long' }
  if (seoTitle.length > 70) return { error: 'SEO title must be 70 characters or less' }
  if (seoDescription.length > 160) return { error: 'SEO description must be 160 characters or less' }
  if (coverAsset && !isImageAssetId(coverAsset)) return { error: 'Invalid image upload' }

  return {
    title, slug, status, excerpt, content, category: str('category'), tags,
    featured: formData.get('featured') === 'on', seoTitle, seoDescription, coverAsset,
  }
}

function refreshBlogs() {
  revalidatePath('/admin', 'layout')
}

export async function createBlog(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (await slugTaken('blog', p.slug)) return { error: `The slug "${p.slug}" is already used by another post` }

  try {
    await sanityWrite.create({
      _type: 'blog',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      status: p.status,
      ...(p.status === 'published' && { publishedAt: new Date().toISOString() }),
      ...(p.coverAsset && { coverImage: { _type: 'image', asset: { _type: 'reference', _ref: p.coverAsset } } }),
      ...(p.excerpt && { excerpt: p.excerpt }),
      ...(p.content && { content: p.content }),
      ...(p.category && { category: p.category }),
      tags: p.tags,
      featured: p.featured,
      ...(p.seoTitle && { seoTitle: p.seoTitle }),
      ...(p.seoDescription && { seoDescription: p.seoDescription }),
    })
  } catch (e) {
    console.error(e)
    return { error: 'Saving to Sanity failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshBlogs()
  redirect('/admin/blogs')
}

export async function updateBlog(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const p = parseForm(formData)
  if ('error' in p) return p
  if (await slugTaken('blog', p.slug, id)) return { error: `The slug "${p.slug}" is already used by another post` }

  try {
    const current = await sanityWrite.fetch<{ publishedAt?: string } | null>(
      '*[_type == "blog" && _id == $id][0]{ publishedAt }',
      { id }
    )
    if (!current) return { error: 'Post not found' }

    const set: Record<string, unknown> = {
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      status: p.status,
      tags: p.tags,
      featured: p.featured,
    }
    const unset: string[] = []

    // First time it goes live, stamp the date. Later edits keep it.
    if (p.status === 'published' && !current.publishedAt) set.publishedAt = new Date().toISOString()

    const optional: Record<string, string> = {
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }
    for (const [key, value] of Object.entries(optional)) {
      if (value) set[key] = value
      else unset.push(key)
    }
    if (p.coverAsset) set.coverImage = { _type: 'image', asset: { _type: 'reference', _ref: p.coverAsset } }
    else if (formData.get('removeCover') === 'on') unset.push('coverImage')

    await withAssetCleanup(id, () => sanityWrite.patch(id).set(set).unset(unset).commit())
  } catch (e) {
    console.error(e)
    return { error: 'Update failed. Check SANITY_API_WRITE_TOKEN.' }
  }

  refreshBlogs()
  redirect('/admin/blogs')
}

export async function deleteBlog(id: string) {
  await requireAuth()
  await deleteDocWithAssets(id)
  refreshBlogs()
}
