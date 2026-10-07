import {defineField, defineType} from 'sanity'

export const productStatuses = [
  {title: 'Live', value: 'live'},
  {title: 'Beta', value: 'beta'},
  {title: 'Hackathon', value: 'hackathon'},
]

// Products Habib built and runs himself (not client work). Shown as a card grid on the home page.
export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required().max(80)}),
    defineField({
      name: 'oneLiner',
      title: 'One-liner',
      type: 'string',
      description: 'e.g. "AI voice mock interviews".',
      validation: (r) => r.required().max(90),
    }),
    defineField({
      name: 'plainDescription',
      title: 'Plain description',
      type: 'text',
      rows: 2,
      description: 'Shown on the card. 1–2 sentences on who it is for and what it does for them.',
      validation: (r) => r.max(240).warning('Keep it to 1–2 short sentences.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'previewVideo',
      title: 'Preview video (MP4, optional)',
      type: 'file',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      validation: (r) => r.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: productStatuses, layout: 'radio', direction: 'horizontal'},
      initialValue: 'live',
      validation: (r) => r.required(),
    }),
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
    select: {title: 'name', oneLiner: 'oneLiner', status: 'status', media: 'image'},
    prepare: ({title, oneLiner, status, media}) => ({
      title,
      subtitle: [productStatuses.find((s) => s.value === status)?.title, oneLiner].filter(Boolean).join(' · '),
      media,
    }),
  },
})
