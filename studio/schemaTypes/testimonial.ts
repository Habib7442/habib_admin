import {defineField, defineType} from 'sanity'

// Curated quotes from real clients, shown on the home page (hidden when there are none).
// Visitor submissions from the portfolio's /review page are the separate "review" type.
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (r) => r.required().max(500)}),
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required().max(100)}),
    defineField({name: 'role', title: 'Role', type: 'string', description: 'e.g. "Owner".', validation: (r) => r.max(80)}),
    defineField({name: 'business', title: 'Business', type: 'string', validation: (r) => r.max(100)}),
    defineField({name: 'image', title: 'Photo (optional)', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'linkedProject',
      title: 'Linked project',
      type: 'reference',
      to: [{type: 'project'}, {type: 'landingPage'}, {type: 'product'}],
      description: 'Optional. The work this testimonial is about.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers come first. The home page shows the first three.',
      initialValue: 0,
      validation: (r) => r.integer(),
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', business: 'business', quote: 'quote', media: 'image'},
    prepare: ({title, business, quote, media}) => ({
      title: business ? `${title} · ${business}` : title,
      subtitle: quote,
      media,
    }),
  },
})
