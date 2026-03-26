import * as z from 'zod'

export const testimonialSchema = z.object({
  client_name: z.string().min(1, 'Client name is required').max(100),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  review: z.string().min(1, 'Review text is required'),
  rating: z.number().int().min(1).max(5).default(5),
  project_id: z.string().uuid().optional().nullable(),
  featured: z.boolean().default(false),
})

export type TestimonialValues = z.infer<typeof testimonialSchema>
