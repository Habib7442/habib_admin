// Keep in sync with designCategories in studio/schemaTypes/design.ts
export const DESIGN_CATEGORIES = [
  { value: 'poster', label: 'Poster' },
  { value: 'social_media', label: 'Social media' },
  { value: 'branding', label: 'Branding' },
  { value: 'ui', label: 'UI' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'ai_generated', label: 'AI generated' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'other', label: 'Other' },
] as const

export const DESIGN_CATEGORY_VALUES: string[] = DESIGN_CATEGORIES.map((c) => c.value)

export const designCategoryLabel = (value?: string) =>
  DESIGN_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? ''
