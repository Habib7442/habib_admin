'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { testimonialSchema, TestimonialValues } from '@/lib/validations/testimonial'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from './PageHeader'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from './ImageUpload'
import { toast } from 'sonner'
import { Loader2, Save, X, Star, User, Building, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialFormProps {
  initialData?: any
  id?: string
}

export function TestimonialForm({ initialData, id }: TestimonialFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<TestimonialValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initialData || {
      client_name: '',
      role: '',
      company: '',
      avatar_url: '',
      review: '',
      rating: 5,
      project_id: null,
      featured: false,
    },
  })

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase.from('projects').select('id, title')
      setProjects(data || [])
    }
    fetchProjects()
  }, [supabase])

  async function onSubmit(values: TestimonialValues) {
    setIsLoading(true)
    try {
      if (id) {
        const { error } = await supabase
          .from('testimonials')
          .update(values)
          .eq('id', id)
        if (error) throw error
        toast.success('Testimonial updated successfully')
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(values)
        if (error) throw error
        toast.success('Testimonial added successfully')
      }
      router.push('/testimonials')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PageHeader title={id ? 'Edit Feedback' : 'New Review'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Client Profile */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
               <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest border-b border-[#262626] pb-4">
                 <User className="w-4 h-4" /> Client Profiling
               </div>
              
               <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest text-center block mb-4">Client Avatar</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} bucket="avatars" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs mt-2" />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t border-[#161616]">
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sarah Jenkins" {...field} className="bg-[#161616] border-[#262626] text-white rounded-xl h-11" />
                      </FormControl>
                      <FormMessage className="text-red-500 font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-60">Job Role / Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior VP Marketing" {...field} className="bg-[#161616] border-[#262626] text-white rounded-xl h-11" />
                      </FormControl>
                      <FormMessage className="text-red-500 font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-60">Organization / Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Studio" {...field} className="bg-[#161616] border-[#262626] text-white rounded-xl h-11" />
                      </FormControl>
                      <FormMessage className="text-red-500 font-bold text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Testimonial Content & Rating */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
               <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                    <Quote className="w-4 h-4" /> Full Feedback Narrative
                  </div>
                  <div className="flex items-center gap-1">
                     <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <div className="flex bg-[#161616] p-1.5 rounded-xl border border-[#262626] shadow-inner">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="p-1 px-1.5 transition-all duration-300 transform active:scale-95"
                              >
                                <Star 
                                  className={cn(
                                    "w-4 h-4 transition-all duration-300",
                                    star <= field.value ? "text-amber-400 fill-amber-400" : "text-zinc-800"
                                  )} 
                                  style={{ filter: star <= field.value ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' : 'none' }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      />
                  </div>
               </div>
              
               <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                         {...field} 
                         placeholder="The collaboration was exceptional because..." 
                         className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] min-h-[220px] rounded-2xl text-lg italic leading-relaxed border-none shadow-inner p-6 shadow-black/50 selection:bg-[#7C3AED]/30"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs px-2" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#161616]">
                 <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Linked Project (Optional)</FormLabel>
                        <Select value={field.value || ''} onValueChange={(v) => field.onChange(v === 'none' ? null : v)}>
                          <FormControl>
                            <SelectTrigger className="bg-[#161616] border-none shadow-inner h-11 rounded-xl text-white">
                              <SelectValue placeholder="Associate with Project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
                            <SelectItem value="none">No Linking</SelectItem>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-3.5 bg-[#161616] border border-[#262626] rounded-xl shadow-inner mt-7">
                        <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest m-0 leading-none">Global Highlight</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#7C3AED]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
               <Button 
                variant="ghost" 
                onClick={() => router.push('/testimonials')}
                className="text-[#52525B] hover:text-white hover:bg-[#161616] rounded-2xl h-12 px-8 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <X className="w-4 h-4 mr-2" /> Discard Post
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl h-12 px-10 font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {id ? 'Confirm Feedback Update' : 'Publish Feedback'}
              </Button>
            </div>
          </div>
        </div>
        <div className="h-40" />
      </form>
    </Form>
  )
}
