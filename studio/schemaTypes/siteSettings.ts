import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton: there is only ever one document, with the fixed id "siteSettings".
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.max(100)}),
    defineField({name: 'tagline', title: 'Tagline / role', type: 'string', validation: (r) => r.max(160)}),
    defineField({name: 'bio', title: 'Bio', type: 'text', rows: 5, validation: (r) => r.max(1000)}),
    defineField({name: 'profileImage', title: 'Profile photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'email', title: 'Contact email', type: 'string'}),
    defineField({name: 'resumeUrl', title: 'Resume / CV link', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https']})}),
    defineField({name: 'githubUrl', title: 'GitHub', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https']})}),
    defineField({name: 'linkedinUrl', title: 'LinkedIn', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https']})}),
    defineField({name: 'twitterUrl', title: 'X / Twitter', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https']})}),
    defineField({name: 'instagramUrl', title: 'Instagram', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https']})}),
    defineField({name: 'seoTitle', title: 'Site title (SEO)', type: 'string', validation: (r) => r.max(70)}),
    defineField({
      name: 'seoDescription',
      title: 'Site description (SEO)',
      type: 'text',
      rows: 2,
      validation: (r) => r.max(160),
    }),
    defineField({name: 'shareImage', title: 'Share image (social preview)', type: 'image'}),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      description:
        'The four rows of "My services" on the home page, in order. An empty row falls back to the built-in text.',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'service',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.max(60)}),
            defineField({
              name: 'description',
              title: 'One plain-language sentence',
              type: 'string',
              validation: (r) => r.max(200),
            }),
            defineField({
              name: 'points',
              title: 'Bullet points',
              type: 'array',
              of: [defineArrayMember({type: 'string', validation: (r) => r.max(60)})],
              validation: (r) => r.max(3),
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'description'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
