// Template categories and types. Keep in sync with studio/schemaTypes/carouselTemplate.ts and the
// portfolio's lib/template-categories.ts + lib/template-types.ts.
export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'personal-brand', label: 'Personal brand' },
  { value: 'business', label: 'Business' },
  { value: 'tech', label: 'Tech' },
  { value: 'other', label: 'Other' },
] as const

export const TEMPLATE_CATEGORIES: string[] = TEMPLATE_CATEGORY_OPTIONS.map((c) => c.value)

// `path` is the portfolio URL section: /templates/<path>/<slug>.
export const TEMPLATE_TYPE_OPTIONS = [
  { value: 'carousel', label: 'Carousel', path: 'carousels', defaultSize: '1080 × 1440' },
  { value: 'reel', label: 'Reel', path: 'reels', defaultSize: '1080 × 1920' },
  { value: 'story', label: 'Story', path: 'stories', defaultSize: '1080 × 1920' },
  { value: 'post', label: 'Post', path: 'posts', defaultSize: '1080 × 1350' },
] as const

export const TEMPLATE_TYPES: string[] = TEMPLATE_TYPE_OPTIONS.map((t) => t.value)

/** Portfolio URL section for a type, e.g. "carousel" → "carousels". */
export const templateTypePath = (type?: string) =>
  TEMPLATE_TYPE_OPTIONS.find((t) => t.value === type)?.path ?? 'carousels'
