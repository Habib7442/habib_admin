import {defineArrayMember, defineField, defineType} from 'sanity'

export const designCategories = [
  {title: 'Poster', value: 'poster'},
  {title: 'Social media', value: 'social_media'},
  {title: 'Branding', value: 'branding'},
  {title: 'UI', value: 'ui'},
  {title: 'Illustration', value: 'illustration'},
  {title: 'AI generated', value: 'ai_generated'},
  {title: 'Photoshoot', value: 'photoshoot'},
  {title: 'Other', value: 'other'},
]

export const design = defineType({
  name: 'design',
  title: 'Design',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: designCategories},
      initialValue: 'poster',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Main image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'More images',
      type: 'array',
      description: 'Optional. For carousels or multi-slide posts.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Optional.',
    }),
    defineField({
      name: 'tools',
      title: 'Tools used',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'image'},
  },
})
