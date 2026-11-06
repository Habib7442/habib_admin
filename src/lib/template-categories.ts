// Carousel template categories. Keep in sync with studio/schemaTypes/carouselTemplate.ts and the portfolio.
export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'personal-brand', label: 'Personal brand' },
  { value: 'business', label: 'Business' },
  { value: 'tech', label: 'Tech' },
  { value: 'other', label: 'Other' },
] as const

export const TEMPLATE_CATEGORIES: string[] = TEMPLATE_CATEGORY_OPTIONS.map((c) => c.value)
