import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = {
  _id: string
  title: string
  shortDescription?: string
  thumbnailUrl?: string
  liveUrl?: string
  githubUrl?: string
  techStack?: string[]
  category?: string
  status?: string
  featured?: boolean
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  planning: 'Planning',
}

export default async function ProjectsPage() {
  await requireAuth()
  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "project"] | order(sortOrder asc, _createdAt desc) {
      _id, title, shortDescription, liveUrl, githubUrl, techStack, category, status, featured,
      "thumbnailUrl": thumbnail.asset->url
    }`
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">+ New project</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No projects yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {p.thumbnailUrl && (
                <div className="relative aspect-video">
                  <Image src={`${p.thumbnailUrl}?w=800&auto=format`} alt={p.title} fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-white">{p.title}</h2>
                  {p.featured && <Badge>Featured</Badge>}
                </div>
                {p.shortDescription && <p className="line-clamp-2 text-sm text-neutral-400">{p.shortDescription}</p>}
                <p className="text-xs text-neutral-500">
                  {[p.category, p.status && STATUS_LABEL[p.status]].filter(Boolean).join(' · ')}
                </p>
                {!!p.techStack?.length && (
                  <p className="line-clamp-1 text-xs text-neutral-400">{p.techStack.join(' · ')}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-3 text-sm">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">Live ↗</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">GitHub ↗</a>}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/projects/${p._id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton id={p._id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
