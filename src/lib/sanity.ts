import 'server-only'
import { createClient } from '@sanity/client'

export const sanityWrite = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
