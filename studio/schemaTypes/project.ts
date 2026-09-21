import {defineArrayMember, defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
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
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full description',
      type: 'text',
      rows: 8,
      description: 'Optional.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Gallery images',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live link',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub link',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'techStack',
      title: 'Tech stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Web', value: 'web'},
          {title: 'Mobile', value: 'mobile'},
          {title: 'Design', value: 'design'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      initialValue: 'web',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Completed', value: 'completed'},
          {title: 'In progress', value: 'in_progress'},
          {title: 'Planning', value: 'planning'},
        ],
        layout: 'radio',
      },
      initialValue: 'completed',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers come first.',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'thumbnail'},
  },
})
