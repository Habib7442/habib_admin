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
  CalendarDays,
  FileText,
  Eye,
  Tag
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  
  const supabase = createClient()

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, count, error } = await query

      if (error) throw error
      setBlogs(data || [])
      setTotal(count || 0)
    } catch (error: any) {
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [page, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchBlogs()
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ featured })
        .eq('id', id)

      if (error) throw error
      setBlogs(prev => prev.map(b => b.id === id ? { ...b, featured } : b))
      toast.success(`Blog post ${featured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Blog post deleted successfully')
      fetchBlogs()
    } catch (error) {
      toast.error('Failed to delete blog post')
    }
  }

  const columns = [
    {
      header: 'Cover',
      cell: (item: any) => (
        <div className="w-12 h-12 rounded-lg bg-[#161616] border border-[#262626] overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/40">
          {item.cover_url ? (
            <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover rounded-md" />
          ) : (
            <FileText className="w-5 h-5 text-[#52525B]" />
          )}
        </div>
      )
    },
    {
      header: 'Title',
      cell: (item: any) => (
        <div className="flex flex-col space-y-0.5 max-w-[250px]">
          <span className="text-white font-bold text-sm tracking-tight truncate group-hover:text-[#7C3AED] transition-colors">{item.title}</span>
          <span className="text-[10px] text-[#A1A1AA] font-mono hover:text-white transition-colors truncate">/{item.slug}</span>
        </div>
      )
    },
    {
      header: 'Category',
      cell: (item: any) => (
        <Badge className="bg-zinc-800 text-zinc-100 border-none capitalize text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full shadow-lg">
          {item.category || 'Uncategorized'}
        </Badge>
      )
    },
    {
       header: 'Tags',
       cell: (item: any) => (
         <div className="flex flex-wrap gap-1 max-w-[120px]">
           {item.tags?.slice(0, 2).map((tag: string, i: number) => (
             <span key={i} className="text-[9px] text-[#52525B] font-bold uppercase tracking-widest bg-[#161616] border border-[#262626] px-1.5 py-0.5 rounded-md">
                {tag}
             </span>
           ))}
           {item.tags?.length > 2 && <span className="text-[9px] text-[#7C3AED] font-bold">+{item.tags.length - 2}</span>}
         </div>
       )
    },
    {
      header: 'Status',
      cell: (item: any) => (
        <Badge className={cn(
          "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-none rounded-full",
          item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
        )}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Pin',
      cell: (item: any) => (
        <Switch 
          checked={item.featured} 
          onCheckedChange={(checked) => toggleFeatured(item.id, checked)}
          className="data-[state=checked]:bg-[#7C3AED]"
        />
      )
    },
    {
      header: 'Actions',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/blogs/${item.id}/edit`}>
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
                <AlertDialogDescription className="text-[#A1A1AA] text-sm font-medium leading-relaxed">
                  This action cannot be undone. This will permanently delete the post <span className="text-white font-bold">"{item.title}"</span> from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-4 border-t border-[#161616] mt-4">
                <AlertDialogCancel className="bg-[#161616] border-[#262626] text-white hover:bg-zinc-800 rounded-xl px-6">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBlog(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 border-none">Delete Post</AlertDialogAction>
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
        title="Blog Articles" 
        actionLabel="New Post" 
        actionHref="/blogs/new" 
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-[#161616] shadow-xl">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B] transition-colors group-focus-within:text-[#7C3AED]" />
          <Input 
            placeholder="Search blogs by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-11 rounded-xl transition-all font-medium"
          />
        </form>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] bg-[#161616] border-[#262626] text-white rounded-xl h-11 focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            onClick={() => {setSearch(''); setStatus('all'); setPage(1)}}
            className="text-[#52525B] hover:text-white hover:bg-[#161616] transition-colors h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-widest"
          >
            Reset
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={blogs} 
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
