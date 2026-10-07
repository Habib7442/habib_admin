import {defineArrayMember, defineField, defineType} from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fieldsets: [
    {
      name: 'preview',
      title: 'Video preview',
      description:
        'Optional short loop shown on cards instead of the screenshot. Run scripts/compress-preview.sh (portfolio repo) first: 1280px, 12–15s, no audio, under 3 MB.',
      options: {collapsible: true, collapsed: false},
    },
    {name: 'featuring', title: 'Featured on the home page', options: {columns: 2}},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Address of the "How it was made" page: /work/landing/<slug>.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().warning('Without a slug this page has no detail page.'),
    }),
    defineField({
      name: 'plainDescription',
      title: 'Plain description',
      type: 'text',
      rows: 2,
      description:
        'Shown on cards. 1–2 sentences for business owners: what the page does for the business, not how it is built.',
      validation: (rule) => rule.max(240).warning('Keep it to 1–2 short sentences.'),
    }),
    defineField({
      name: 'description',
      title: 'Description (how it was built)',
      type: 'text',
      rows: 6,
      description: 'Shown on the detail page under "How it’s built". Tech, motion and build details go here.',
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
      name: 'previewVideo',
      title: 'Preview video (MP4)',
      type: 'file',
      fieldset: 'preview',
      options: {accept: 'video/mp4'},
    }),
    defineField({
      name: 'previewVideoWebm',
      title: 'Preview video (WebM, optional)',
      type: 'file',
      fieldset: 'preview',
      options: {accept: 'video/webm'},
    }),
    defineField({
      name: 'previewPoster',
      title: 'Poster image',
      type: 'image',
      fieldset: 'preview',
      description: 'First frame of the video, shown until it plays. Falls back to the main image.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      fieldset: 'featuring',
      initialValue: false,
      description: 'The top featured page gets the big section under the hero.',
    }),
    defineField({
      name: 'featuredOrder',
      title: 'Featured order',
      type: 'number',
      fieldset: 'featuring',
      description: 'Lower numbers come first.',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
    defineField({
      name: 'techStack',
      title: 'Tech stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      description: 'Shown on the detail page only.',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live link',
      type: 'url',
      description: 'Optional. Add it if the design is deployed.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    // Legacy visitor star ratings. No longer shown on the site; kept so old data stays valid.
    defineField({name: 'ratingCount', title: 'Number of ratings', type: 'number', readOnly: true, hidden: true}),
    defineField({name: 'ratingTotal', title: 'Sum of all star ratings', type: 'number', readOnly: true, hidden: true}),
  ],
  orderings: [
    {
      title: 'Featured first',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'featuredOrder', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', media: 'image', featured: 'featured', video: 'previewVideo.asset._ref'},
    prepare({title, media, featured, video}) {
      return {
        title,
        media,
        subtitle: [featured && '★ Featured', video ? 'Video' : 'Screenshot only'].filter(Boolean).join(' · '),
      }
    },
  },
})
