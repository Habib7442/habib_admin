'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Badge } from '@/components/ui/badge'
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
  Palette,
  Eye,
  MoreVertical,
  Loader2
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

export default function DesignsPage() {
  const [designs, setDesigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  
  const supabase = createClient()

  const fetchDesigns = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      setDesigns(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch designs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDesigns()
  }

  const deleteDesign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Design deleted successfully')
      fetchDesigns()
    } catch (error) {
      toast.error('Failed to delete design')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      <PageHeader 
        title="Visual Designs" 
        actionLabel="Add Design" 
        actionHref="/designs/new" 
      />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-[#161616] shadow-xl">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B] group-focus-within:text-[#7C3AED] transition-colors" />
          <Input 
            placeholder="Search designs by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-11 rounded-xl"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-[#161616] border-[#262626] text-white h-11 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#262626] text-white">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai_generated">AI Generated</SelectItem>
              <SelectItem value="branding">Branding</SelectItem>
              <SelectItem value="ui">UI Components</SelectItem>
              <SelectItem value="illustration">Illustration</SelectItem>
              <SelectItem value="photoshoot">Photoshoot</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
           <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
           <span className="text-[#52525B] text-xs font-bold uppercase tracking-widest">Loading Showcase...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.length > 0 ? designs.map((design) => (
            <div key={design.id} className="group relative aspect-[4/3] rounded-2xl border border-[#161616] bg-[#111111] overflow-hidden shadow-2xl hover:border-[#7C3AED]/40 transition-all duration-500">
               <img src={design.image_url} alt={design.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-white font-bold text-sm tracking-tight">{design.title}</span>
                        <span className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-widest mt-0.5">{design.category.replace('_', ' ')}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Link href={`/designs/${design.id}/edit`}>
                           <Button variant="ghost" size="icon" className="bg-[#161616] border border-[#262626] text-white hover:bg-[#7C3AED] transition-all rounded-xl h-9 w-9">
                              <Edit className="w-4 h-4" />
                           </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-[#161616] border border-[#262626] text-rose-500 hover:bg-rose-600 hover:text-white transition-all rounded-xl h-9 w-9">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#111111] border-[#262626] rounded-2xl">
                             <AlertDialogHeader>
                               <AlertDialogTitle className="text-white font-bold text-xl">Delete Design Permanent?</AlertDialogTitle>
                               <AlertDialogDescription className="text-[#A1A1AA] font-medium leading-relaxed">
                                 This will remove the design from your showcase. This action is final.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter className="pt-4 border-t border-[#161616] mt-4">
                               <AlertDialogCancel className="bg-zinc-800 text-white border-none rounded-xl">Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => deleteDesign(design.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl border-none">Confirm Delete</AlertDialogAction>
                             </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </div>
               </div>
               {design.featured && (
                 <div className="absolute top-4 left-4 bg-[#7C3AED] p-1.5 rounded-lg shadow-xl border border-white/20">
                    <Palette className="w-3.5 h-3.5 text-white" />
                 </div>
               )}
            </div>
          )) : (
            <div className="col-span-full h-80 flex flex-col items-center justify-center p-20 bg-[#111111] rounded-2xl border-2 border-dashed border-[#161616]">
               <span className="text-4xl grayscale mb-4">🖼️</span>
               <p className="text-white font-bold text-lg">No designs uploaded yet</p>
               <p className="text-[#52525B] text-sm mt-1">Start showcasing your work now.</p>
               <Link href="/designs/new" className="mt-6">
                  <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl px-8 font-bold text-xs uppercase tracking-widest">Upload first design</Button>
               </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
