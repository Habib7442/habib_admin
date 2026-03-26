'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ExternalLink,
  CalendarDays,
  MoreVertical,
  GitBranch
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const pageSize = 10

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  
  const supabase = createClient()

  const fetchProjects = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      if (category !== 'all') {
        query = query.eq('category', category)
      }
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, count, error } = await query

      if (error) throw error
      setProjects(data || [])
      setTotal(count || 0)
    } catch (error: any) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [page, category, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProjects()
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured })
        .eq('id', id)

      if (error) throw error
      setProjects(prev => prev.map(p => p.id === id ? { ...p, featured } : p))
      toast.success(`Project ${featured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const columns = [
    {
      header: 'Thumbnail',
      cell: (item: any) => (
        <div className="w-12 h-12 rounded-lg bg-[#161616] border border-[#262626] overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className="text-[10px] text-[#52525B]">No Image</span>
          )}
        </div>
      )
    },
    {
      header: 'Title',
      cell: (item: any) => (
        <div className="flex flex-col space-y-0.5 max-w-[200px]">
          <span className="text-white font-bold text-sm tracking-tight truncate group-hover:text-[#7C3AED] transition-colors">{item.title}</span>
          <span className="text-[10px] text-[#52525B] font-mono uppercase truncate opacity-70">{item.slug}</span>
        </div>
      )
    },
    {
      header: 'Category',
      cell: (item: any) => (
        <Badge className="bg-zinc-800 text-zinc-100 border-none capitalize text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full opacity-80">
          {item.category}
        </Badge>
      )
    },
    {
      header: 'Status',
      cell: (item: any) => (
        <Badge className={cn(
          "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-none rounded-full",
          item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
          item.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
        )}>
          {item.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Featured',
      cell: (item: any) => (
        <Switch 
          checked={item.featured} 
          onCheckedChange={(checked) => toggleFeatured(item.id, checked)}
          className="data-[state=checked]:bg-[#7C3AED]"
        />
      )
    },
    {
      header: 'Order',
      cell: (item: any) => (
        <span className="text-white font-mono text-xs font-bold bg-[#161616] px-2 py-1 rounded border border-[#262626]">#{item.sort_order}</span>
      )
    },
    {
       header: 'Links',
       cell: (item: any) => (
         <div className="flex items-center gap-2">
           {item.live_url && <a href={item.live_url} target="_blank" className="p-1.5 rounded-lg bg-[#161616] border border-[#262626] text-[#A1A1AA] hover:text-white transition-colors" title="Live Site"><ExternalLink className="w-3.5 h-3.5" /></a>}
           {item.github_url && <a href={item.github_url} target="_blank" className="p-1.5 rounded-lg bg-[#161616] border border-[#262626] text-[#A1A1AA] hover:text-white transition-colors" title="Source Code"><GitBranch className="w-3.5 h-3.5" /></a>}
         </div>
       )
    },
    {
      header: 'Actions',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/projects/${item.id}/edit`}>
            <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-[#161616] transition-all rounded-xl h-9 w-9">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-xl h-9 w-9">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#111111] border-[#262626] rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white text-xl font-bold tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#A1A1AA] text-sm leading-relaxed">
                  This action cannot be undone. This will permanently delete the project <span className="text-white font-bold">"{item.title}"</span> from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-4 border-t border-[#161616] mt-4">
                <AlertDialogCancel className="bg-[#161616] border-[#262626] text-white hover:bg-zinc-800 rounded-xl px-6">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteProject(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 border-none">Delete Project</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title="Projects" 
        actionLabel="Add Project" 
        actionHref="/projects/new" 
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-[#161616] shadow-xl">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B] transition-colors group-focus-within:text-[#7C3AED]" />
          <Input 
            placeholder="Search projects by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-11 rounded-xl transition-all font-medium"
          />
        </form>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] bg-[#161616] border-[#262626] text-white rounded-xl h-11 focus:ring-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] bg-[#161616] border-[#262626] text-white rounded-xl h-11 focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            onClick={() => {setSearch(''); setCategory('all'); setStatus('all'); setPage(1)}}
            className="text-[#52525B] hover:text-white hover:bg-[#161616] transition-colors h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-widest"
          >
            Reset
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={projects} 
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage
        }}
      />
    </div>
  )
}
