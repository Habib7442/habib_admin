import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const SINGLETON = 'siteSettings'

export default defineConfig({
  name: 'default',
  title: 'Habib Portfolio',
  projectId: '61qy0aqx',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site settings')
              .id(SINGLETON)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== SINGLETON),
          ]),
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
  document: {
    // Only one settings document: hide it from "create new" and remove delete-like actions.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global' ? prev.filter((t) => t.templateId !== SINGLETON) : prev,
    actions: (prev, {schemaType}) =>
      schemaType === SINGLETON
        ? prev.filter(({action}) => action && !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev,
  },
})
