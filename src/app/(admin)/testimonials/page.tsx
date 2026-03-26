'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Edit, 
  Trash2, 
  Quote, 
  Star, 
  User, 
  Loader2, 
  MoreVertical,
  Briefcase
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          projects:project_id (title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ featured })
        .eq('id', id)

      if (error) throw error
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured } : t))
      toast.success(`Testimonial ${featured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Testimonial deleted successfully')
      fetchTestimonials()
    } catch (error) {
      toast.error('Failed to delete testimonial')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-500">
      <PageHeader 
        title="Client Feedback" 
        actionLabel="Add Testimonial" 
        actionHref="/testimonials/new" 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
           <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
           <span className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Gathering Feedback...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.length > 0 ? testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-[#111111] border border-[#161616] rounded-2xl overflow-hidden hover:border-[#7C3AED]/30 transition-all duration-300 shadow-xl group">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full border-2 border-[#161616] p-0.5 shadow-xl bg-gradient-to-br from-[#7C3AED] to-indigo-500 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {testimonial.avatar_url ? (
                        <img src={testimonial.avatar_url} alt={testimonial.client_name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center">
                          <User className="text-white w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg tracking-tight leading-none">{testimonial.client_name}</span>
                      <span className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mt-1.5 opacity-70">
                        {testimonial.role} {testimonial.company && `@ ${testimonial.company}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-3.5 h-3.5 transition-all duration-300", 
                          i < (testimonial.rating || 0) ? "text-amber-400 fill-amber-400" : "text-zinc-800"
                        )} 
                        style={{ filter: i < (testimonial.rating || 0) ? 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))' : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 w-10 h-10 text-[#7C3AED]/10 rotate-180" />
                  <p className="text-[#A1A1AA] text-md italic leading-relaxed font-medium relative z-10">
                    "{testimonial.review}"
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[#161616] pt-6 gap-4">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={testimonial.featured} 
                      onCheckedChange={(checked) => toggleFeatured(testimonial.id, checked)}
                      className="data-[state=checked]:bg-[#7C3AED]"
                    />
                    <span className="text-[10px] uppercase font-bold text-[#52525B] tracking-widest group-hover:text-white transition-colors cursor-default">Pin Review</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/testimonials/${testimonial.id}/edit`}>
                      <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-[#161616] h-9 w-9 rounded-xl transition-all border border-transparent hover:border-[#262626]">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-rose-500 hover:bg-rose-500/5 h-9 w-9 rounded-xl transition-all border border-transparent hover:border-rose-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#111111] border-[#262626] rounded-2xl">
                         <AlertDialogHeader>
                            <AlertDialogTitle className="text-white text-xl font-bold tracking-tight">Erase Feedback Post?</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#A1A1AA] text-sm leading-relaxed">
                               This will permanently remove the review from <span className="text-white font-bold">{testimonial.client_name}</span>.
                            </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter className="pt-4 border-t border-[#161616] mt-4">
                            <AlertDialogCancel className="bg-zinc-800 text-white rounded-xl">Hold On</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTestimonial(testimonial.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">Remove Review</AlertDialogAction>
                         </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {testimonial.projects && (
                  <div className="mt-4 flex items-center gap-2 p-2 px-3 bg-[#161616]/50 rounded-lg border border-[#262626]/20">
                     <Briefcase className="w-3 h-3 text-[#7C3AED]" />
                     <span className="text-[10px] text-[#52525B] uppercase font-bold tracking-widest">For Project: <span className="text-indigo-400">{testimonial.projects.title}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full h-80 flex flex-col items-center justify-center p-20 bg-[#111111] rounded-2xl border-2 border-dashed border-[#161616]">
               <Quote className="w-12 h-12 text-[#161616] mb-4" />
               <p className="text-white font-bold text-lg">No client testimonials yet</p>
               <p className="text-[#52525B] text-sm mt-1">Add feedback to boost social proof.</p>
               <Link href="/testimonials/new" className="mt-6">
                  <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl px-8 font-bold text-xs uppercase tracking-widest">Add First Testimonial</Button>
               </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
