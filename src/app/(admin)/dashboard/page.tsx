'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  FolderPlus, 
  FileText, 
  Palette, 
  MessageSquare, 
  Briefcase,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: { published: 0, drafts: 0 },
    designs: 0,
    testimonials: 0,
    availability: false
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [recentBlogs, setRecentBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: projectsCount },
          { data: blogsData },
          { count: designsCount },
          { count: testimonialsCount },
          { data: settingsData }
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('blogs').select('status'),
          supabase.from('designs').select('*', { count: 'exact', head: true }),
          supabase.from('testimonials').select('*', { count: 'exact', head: true }),
          supabase.from('site_settings').select('availability_status').single()
        ])

        const publishedBlogs = blogsData?.filter(b => b.status === 'published').length || 0
        const draftBlogs = blogsData?.filter(b => b.status === 'draft').length || 0

        setStats({
          projects: projectsCount || 0,
          blogs: { published: publishedBlogs, drafts: draftBlogs },
          designs: designsCount || 0,
          testimonials: testimonialsCount || 0,
          availability: settingsData?.availability_status || false
        })

        // Fetch recent items
        const { data: latestProjects } = await supabase
          .from('projects')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: latestBlogs } = await supabase
          .from('blogs')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentProjects(latestProjects || [])
        setRecentBlogs(latestBlogs || [])
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const toggleAvailability = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ availability_status: checked })
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id)

      if (error) throw error
      
      setStats(prev => ({ ...prev, availability: checked }))
      toast.success(`Availability status updated to ${checked ? 'Available' : 'Unavailable'}`)
    } catch (error: any) {
      toast.error('Failed to update availability')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader title="Dashboard" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          icon={<FolderPlus className="w-5 h-5 text-indigo-400" />} 
          label="Total Projects" 
          value={stats.projects} 
        />
        <StatCard 
          icon={<FileText className="w-5 h-5 text-emerald-400" />} 
          label="Blogs" 
          subLabel={`${stats.blogs.published} Pub / ${stats.blogs.drafts} Draft`}
          value={stats.blogs.published + stats.blogs.drafts} 
        />
        <StatCard 
          icon={<Palette className="w-5 h-5 text-amber-400" />} 
          label="Total Designs" 
          value={stats.designs} 
        />
        <StatCard 
          icon={<MessageSquare className="w-5 h-5 text-pink-400" />} 
          label="Testimonials" 
          value={stats.testimonials} 
        />
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#161616] flex flex-col items-center justify-center space-y-4 shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="flex items-center space-x-3">
             <Briefcase className="w-5 h-5 text-[#7C3AED]" />
             <span className="text-sm font-medium text-[#A1A1AA]">Available</span>
          </div>
          <Switch 
            checked={stats.availability} 
            onCheckedChange={toggleAvailability}
            className="data-[state=checked]:bg-[#7C3AED]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Projects */}
        <div className="bg-[#111111] border border-[#161616] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#161616] flex items-center justify-between">
            <h3 className="text-lg font-bold font-sans text-white">Recent Projects</h3>
            <Link href="/projects" className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-medium transition-colors">
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#161616]">
            {recentProjects.length > 0 ? recentProjects.map((project) => (
              <div key={project.id} className="p-4 flex items-center justify-between hover:bg-[#161616] group transition-all duration-200">
                <div className="flex flex-col space-y-1">
                  <span className="text-white font-semibold text-sm group-hover:text-[#7C3AED] transition-colors">{project.title}</span>
                  <span className="text-xs text-[#52525B]">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn(
                    "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-none",
                    project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                    project.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                  )}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Link href={`/projects/${project.id}/edit`} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#7C3AED] font-bold hover:underline">Edit</span>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-[#52525B] text-sm italic">No projects found</div>
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-[#111111] border border-[#161616] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#161616] flex items-center justify-between">
            <h3 className="text-lg font-bold font-sans text-white">Recent Blogs</h3>
            <Link href="/blogs" className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-medium transition-colors">
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#161616]">
            {recentBlogs.length > 0 ? recentBlogs.map((blog) => (
              <div key={blog.id} className="p-4 flex items-center justify-between hover:bg-[#161616] group transition-all duration-200">
                <div className="flex flex-col space-y-1">
                  <span className="text-white font-semibold text-sm group-hover:text-[#7C3AED] transition-colors">{blog.title}</span>
                  <span className="text-xs text-[#52525B]">{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn(
                    "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-none",
                    blog.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  )}>
                    {blog.status}
                  </Badge>
                  <Link href={`/blogs/${blog.id}/edit`} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#7C3AED] font-bold hover:underline">Edit</span>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-[#52525B] text-sm italic">No blogs found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, subLabel }: any) {
  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-[#161616] flex flex-col space-y-4 hover:border-[#262626] transition-all duration-300 shadow-xl group">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-[#161616] border border-[#262626] transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-3xl font-bold font-sans text-white tracking-tight">{value}</span>
        <span className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">{label}</span>
        {subLabel && <span className="text-[10px] text-[#52525B] font-medium">{subLabel}</span>}
      </div>
    </div>
  )
}
