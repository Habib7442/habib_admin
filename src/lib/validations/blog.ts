import * as z from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens only'),
  excerpt: z.string().max(200, 'Excerpt must be 200 characters or less').optional(),
  content: z.string().min(1, 'Content is required'),
  cover_url: z.string().url('Invalid cover URL').optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(['published', 'draft']),
  published_at: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  featured: z.boolean(),
})

export type BlogValues = z.infer<typeof blogSchema>
