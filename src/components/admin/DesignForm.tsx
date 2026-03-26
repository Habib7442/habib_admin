'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { designSchema, DesignValues } from '@/lib/validations/design'
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
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from './ImageUpload'
import { TagInput } from './TagInput'
import { toast } from 'sonner'
import { Loader2, Save, X, Palette, Image as ImageIcon, Briefcase, Hash, Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DesignFormProps {
  initialData?: any
  id?: string
}

export function DesignForm({ initialData, id }: DesignFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<DesignValues>({
    resolver: zodResolver(designSchema),
    defaultValues: initialData || {
      title: '',
      image_url: '',
      description: '',
      category: 'branding',
      tools: [],
      tags: [],
      featured: false,
    },
  })

  async function onSubmit(values: DesignValues) {
    setIsLoading(true)
    try {
      if (id) {
        const { error } = await supabase
          .from('designs')
          .update(values)
          .eq('id', id)
        if (error) throw error
        toast.success('Design updated successfully')
      } else {
        const { error } = await supabase
          .from('designs')
          .insert(values)
        if (error) throw error
        toast.success('Design added successfully')
      }
      router.push('/designs')
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
        <PageHeader title={id ? 'Edit Visual Work' : 'Add New Work'} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Visual Showcase (Big) */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-4 rounded-2xl shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest px-1">
                 <ImageIcon className="w-4 h-4" /> Final Artifact
              </div>
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} bucket="designs" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs px-1" />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-2 px-1">
                 <Palette className="w-4 h-4" /> Artwork Profile
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest px-1">Artifact Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Modern Abstract Branding Concept" 
                        {...field} 
                        className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-12 rounded-xl text-lg font-bold placeholder:opacity-20 transition-all font-sans border-none shadow-inner"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest px-1">Short Narrative</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain the vision or background of this piece..." 
                        {...field} 
                        className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] min-h-[140px] rounded-xl text-md leading-relaxed border-none shadow-inner"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Properties (Sidebar) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
               <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-2 px-1 border-b border-[#262626] pb-4">
                 <Briefcase className="w-4 h-4" /> Project Metadata
               </div>
              
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Technique Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#161616] border-none shadow-inner text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select Technique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
                        <SelectItem value="ai_generated">Artificial Intelligence</SelectItem>
                        <SelectItem value="branding">Branding & Identity</SelectItem>
                        <SelectItem value="ui">User Interface Design</SelectItem>
                        <SelectItem value="illustration">Graphic Illustration</SelectItem>
                        <SelectItem value="photoshoot">Photography / Shooting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tools"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <Hammer className="w-3.5 h-3.5" /> Creative Tools Used
                    </FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || []} 
                        onChange={field.onChange} 
                        placeholder="e.g. Photoshop, Midjourney..."
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <Hash className="w-3.5 h-3.5" /> Contextual Tags
                    </FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || []} 
                        onChange={field.onChange} 
                        placeholder="Add keywords..."
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-[#161616] flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 bg-[#161616] border border-[#262626] p-4 rounded-xl w-full">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#7C3AED]"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-white block">Promote Artwork</FormLabel>
                        <p className="text-[9px] text-[#52525B] uppercase font-bold tracking-widest mt-1">Highlights this artifact on your home dashboard.</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Actions */}
        <div className="fixed bottom-10 left-[240px] right-0 flex justify-center z-50 pointer-events-none px-10">
           <div className="bg-[#111111]/80 backdrop-blur-3xl border border-[#262626] p-4 rounded-full shadow-2xl flex items-center gap-3 pointer-events-auto min-w-[500px]">
              <div className="flex-1 px-8">
                 <p className="text-sm font-bold text-white tracking-tight">Showcase Integration</p>
                 <p className="text-[10px] text-[#52525B] font-bold uppercase tracking-widest mt-0.5">Ready to publish visual work to the portfolio.</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/designs')}
                className="text-[#52525B] hover:text-white hover:bg-[#161616] rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Discard
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full h-12 px-10 font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {id ? 'Confirm Edits' : 'Publish Design'}
              </Button>
           </div>
        </div>
        <div className="h-40" />
      </form>
    </Form>
  )
}
