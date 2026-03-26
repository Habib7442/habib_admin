'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, ProjectValues } from '@/lib/validations/project'
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
import { MultiImageUpload } from './MultiImageUpload'
import { TagInput } from './TagInput'
import { RichTextEditor } from './RichTextEditor'
import { generateSlug } from '@/lib/utils/slug'
import { toast } from 'sonner'
import { Loader2, Save, X, Info, Layers, Link as LinkIcon, GitBranch, Hash, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'

interface ProjectFormProps {
  initialData?: any
  id?: string
}

export function ProjectForm({ initialData, id }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      thumbnail_url: '',
      images: [],
      live_url: '',
      github_url: '',
      tech_stack: [],
      category: 'web',
      status: 'planning',
      featured: false,
      sort_order: 0,
    },
  })

  const watchTitle = form.watch('title')
  useEffect(() => {
    if (watchTitle && !id) {
      form.setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, form, id])

  async function onSubmit(values: ProjectValues) {
    setIsLoading(true)
    try {
      if (id) {
        const { error } = await supabase
          .from('projects')
          .update(values)
          .eq('id', id)
        if (error) throw error
        toast.success('Project updated successfully')
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(values)
        if (error) throw error
        toast.success('Project created successfully')
      }
      router.push('/projects')
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
        <PageHeader title={id ? 'Edit Project' : 'New Project'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-2 px-1">
                <Info className="w-4 h-4" /> Core Information
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-xs font-bold uppercase tracking-widest px-1">Project Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Dream Design Agency Website" 
                        {...field} 
                        className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-12 rounded-xl text-lg font-bold placeholder:font-normal placeholder:opacity-40 transition-all font-sans"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs px-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-xs font-bold uppercase tracking-widest px-1">Slug (URL Path)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="dream-design-agency" 
                        {...field} 
                        className="bg-[#161616] border-[#262626] text-[#A1A1AA] focus:border-[#7C3AED] h-11 rounded-xl font-mono text-sm transition-all"
                      />
                    </FormControl>
                    <FormDescription className="text-[#52525B] text-[10px] uppercase font-bold tracking-widest px-1">Auto-generated from title but manually editable</FormDescription>
                    <FormMessage className="text-red-500 font-bold text-xs px-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-xs font-bold uppercase tracking-widest px-1">Short Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief overview of the project (SEO meta description style)..." 
                        {...field} 
                        className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] min-h-[100px] rounded-xl text-sm leading-relaxed"
                      />
                    </FormControl>
                    <div className="flex justify-between items-center px-1">
                      <FormMessage className="text-red-500 font-bold text-xs" />
                      <span className={cn(
                        "text-[10px] font-bold tracking-widest uppercase",
                        (field.value?.length || 0) > 160 ? "text-red-500" : "text-[#52525B]"
                      )}>
                        {field.value?.length || 0}/160 chars
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-2 px-1">
                <Layers className="w-4 h-4" /> Full Project Case Study
              </div>
              <FormField
                control={form.control}
                name="full_description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        placeholder="Describe the project in detail — challenges, solutions, and architectural choices..."
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs px-1" />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-6">
               <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-2 px-1">
                <Hash className="w-4 h-4" /> Technology Stack
              </div>
              <FormField
                control={form.control}
                name="tech_stack"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TagInput 
                        value={field.value || []} 
                        onChange={field.onChange} 
                        placeholder="e.g. Next.js, Framer Motion, PostgreSQL..."
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs px-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-[#111111] border border-[#161616] p-6 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                <ImageIcon className="w-4 h-4" /> Visual Assets
              </div>
              
              <FormField
                control={form.control}
                name="thumbnail_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Primary Thumbnail</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} bucket="project-images" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Project Screenshots</FormLabel>
                    <FormControl>
                      <MultiImageUpload value={field.value || []} onChange={field.onChange} bucket="project-images" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-[#111111] border border-[#161616] p-6 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                <LinkIcon className="w-4 h-4" /> External Links
              </div>
              
              <FormField
                control={form.control}
                name="live_url"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-[#161616] border border-[#262626]">
                       <LinkIcon className="w-3.5 h-3.5 text-[#52525B]" />
                       <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest m-0 leading-none">Live URL</FormLabel>
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="https://..." className="bg-[#161616] border-[#262626] text-white rounded-xl focus:border-[#7C3AED]" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-[#161616] border border-[#262626]">
                       <GitBranch className="w-3.5 h-3.5 text-[#52525B]" />
                       <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest m-0 leading-none">GitHub URL</FormLabel>
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="https://github.com/..." className="bg-[#161616] border-[#262626] text-white rounded-xl focus:border-[#7C3AED]" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-[#111111] border border-[#161616] p-6 rounded-2xl shadow-2xl space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#161616] border-[#262626] text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="mobile">Mobile Apps</SelectItem>
                        <SelectItem value="design">Graphic Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Project Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#161616] border-[#262626] text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#161616] border-[#262626] text-white rounded-xl">
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-[#161616] flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#7C3AED]"
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA] cursor-pointer hover:text-white transition-colors">Featured Project</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Sorting Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-[#161616] border-[#262626] text-white rounded-xl h-11" />
                    </FormControl>
                    <FormMessage className="text-red-500 font-bold text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-10 left-[240px] right-0 flex justify-center z-40 pointer-events-none">
           <div className="bg-[#111111]/80 backdrop-blur-2xl border border-[#262626] p-4 rounded-3xl shadow-2xl flex items-center gap-4 pointer-events-auto min-w-[400px]">
              <div className="flex-1 px-4">
                 <p className="text-xs font-bold text-white uppercase tracking-widest shadow-sm">Ready to update?</p>
                 <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-medium">Verify all fields before saving</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/projects')}
                className="text-[#52525B] hover:text-white hover:bg-[#161616] rounded-2xl h-12 px-6 font-bold uppercase text-xs tracking-widest transition-all"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl h-12 px-8 font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {id ? 'Update Project' : 'Save Project'}
              </Button>
           </div>
        </div>
        <div className="h-40" /> {/* Spacer for the fixed bar */}
      </form>
    </Form>
  )
}
