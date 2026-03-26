import * as z from 'zod'

export const designSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  image_url: z.string().url('Image is required'),
  description: z.string().optional(),
  category: z.enum(['ai_generated', 'branding', 'ui', 'illustration', 'photoshoot']),
  tools: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean(),
})

export type DesignValues = z.infer<typeof designSchema>
