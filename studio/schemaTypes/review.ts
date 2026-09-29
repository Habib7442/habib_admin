import {defineField, defineType} from 'sanity'

// Submitted by visitors from the portfolio's /review page. Nothing is shown publicly until approved.
export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({name: 'submittedAt', title: 'Submitted', type: 'datetime', readOnly: true}),
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required().max(100)}),
    defineField({name: 'role', title: 'Role / company', type: 'string', validation: (r) => r.max(100)}),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (r) => r.required().integer().min(1).max(5),
    }),
    defineField({name: 'review', title: 'Review', type: 'text', rows: 5, validation: (r) => r.required().max(1000)}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Hidden', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'consent',
      title: 'Agreed to be shown on the website',
      type: 'boolean',
      readOnly: true,
    }),
    // Salted hash of the sender's IP, used only for rate limiting. Never the raw IP.
    defineField({name: 'ipHash', title: 'Sender hash', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'submittedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'name', rating: 'rating', status: 'status', media: 'photo'},
    prepare: ({title, rating, status, media}) => ({
      title,
      subtitle: `${'★'.repeat(rating ?? 0)} · ${status ?? 'pending'}`,
      media,
    }),
  },
})
