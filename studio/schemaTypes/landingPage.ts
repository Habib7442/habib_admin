import {defineField, defineType} from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Optional.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live link',
      type: 'url',
      description: 'Optional. Add it if the design is deployed.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'ratingCount',
      title: 'Number of ratings',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      group: 'ratings',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'ratingTotal',
      title: 'Sum of all star ratings',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      group: 'ratings',
      description: 'Average rating = sum of ratings / number of ratings. Updated when visitors rate (1–5 stars).',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  groups: [{name: 'ratings', title: 'Ratings (visitors)'}],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      count: 'ratingCount',
      total: 'ratingTotal',
    },
    prepare({title, media, count, total}) {
      const avg = count ? (total / count).toFixed(1) : null
      return {
        title,
        media,
        subtitle: avg ? `★ ${avg} (${count})` : 'No ratings yet',
      }
    },
  },
})
