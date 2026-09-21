import {defineField, defineType} from 'sanity'

export const contactMessage = defineType({
  name: 'contactMessage',
  title: 'Contact message',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required().max(100)}),
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'subject', title: 'Subject', type: 'string', validation: (r) => r.max(150)}),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 8,
      validation: (r) => r.required().max(5000),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Read', value: 'read'},
          {title: 'Replied', value: 'replied'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
    // Salted hash of the sender's IP, used only for rate limiting. Never the raw IP.
    defineField({name: 'ipHash', title: 'Sender hash', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'name', subtitle: 'subject', status: 'status'},
    prepare: ({title, subtitle, status}) => ({title, subtitle: `${status ?? 'new'}${subtitle ? ' · ' + subtitle : ''}`}),
  },
})
