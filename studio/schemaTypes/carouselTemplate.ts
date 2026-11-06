import {defineArrayMember, defineField, defineType} from 'sanity'

export const templateCategories = [
  {title: 'Fashion', value: 'fashion'},
  {title: 'Personal brand', value: 'personal-brand'},
  {title: 'Business', value: 'business'},
  {title: 'Tech', value: 'tech'},
  {title: 'Other', value: 'other'},
]

// Canva carousel templates shown on the portfolio's /templates page. Free ones link straight to Canva,
// paid ones link to the Etsy/Gumroad listing.
export const carouselTemplate = defineType({
  name: 'carouselTemplate',
  title: 'Carousel template',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required().max(80)}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Who it is for and what it helps them post. 1–3 sentences.',
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: templateCategories, layout: 'radio', direction: 'horizontal'},
      initialValue: 'fashion',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slides',
      title: 'Slides (in order)',
      type: 'array',
      of: [defineArrayMember({type: 'image'})],
      validation: (r) => r.required().min(1).max(20),
    }),
    defineField({
      name: 'size',
      title: 'Slide size',
      type: 'string',
      description: 'e.g. "1080 × 1440"',
      initialValue: '1080 × 1440',
      validation: (r) => r.max(30),
    }),
    defineField({name: 'isFree', title: 'Free template', type: 'boolean', initialValue: false}),
    defineField({
      name: 'price',
      title: 'Price label',
      type: 'string',
      description: 'Shown on paid templates, e.g. "₹499" or "$9".',
      hidden: ({parent}) => !!parent?.isFree,
      validation: (r) => r.max(20),
    }),
    defineField({
      name: 'buyLink',
      title: 'Buy link (Etsy / Gumroad)',
      type: 'url',
      validation: (r) => r.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'canvaLink',
      title: 'Canva template link',
      type: 'url',
      description: 'Canva → Share → Template link. Only shown publicly on free templates.',
      validation: (r) => r.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'featured', title: 'Show on home page', type: 'boolean', initialValue: false}),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers come first.',
      initialValue: 0,
      validation: (r) => r.integer(),
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', category: 'category', isFree: 'isFree', price: 'price', media: 'slides.0'},
    prepare: ({title, category, isFree, price, media}) => ({
      title,
      subtitle: [templateCategories.find((c) => c.value === category)?.title, isFree ? 'Free' : price]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
