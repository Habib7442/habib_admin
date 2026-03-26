import * as z from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens only'),
  short_description: z.string().max(160, 'Short description must be 160 characters or less'),
  full_description: z.string().optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  images: z.array(z.string().url()),
  live_url: z.string().url('Invalid live URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  tech_stack: z.array(z.string()),
  category: z.enum(['web', 'mobile', 'design', 'other']),
  status: z.enum(['completed', 'in_progress', 'planning']),
  featured: z.boolean(),
  sort_order: z.number().int(),
})

export type ProjectValues = z.infer<typeof projectSchema>
