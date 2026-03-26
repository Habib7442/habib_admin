'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { blogSchema, BlogValues } from '@/lib/validations/blog'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from './PageHeader'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from './ImageUpload'
import { TagInput } from './TagInput'
import { RichTextEditor } from './RichTextEditor'
import { generateSlug } from '@/lib/utils/slug'
import { toast } from 'sonner'
import { 
  Loader2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Hash, 
  FileText, 
  Settings2, 
  Eye, 
  Globe,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, } from '../ui/form'

interface BlogFormProps {
  initialData?: any
  id?: string
}

export function BlogForm({ initialData, id }: BlogFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<BlogValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_url: '',
      category: '',
      tags: [],
      status: 'draft',
      featured: false,
      seo_title: '',
      seo_description: '',
    },
  })

  const watchTitle = form.watch('title')
  useEffect(() => {
    if (watchTitle && !id) {
      form.setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, form, id])

  async function onSubmit(values: BlogValues) {
    setIsLoading(true)
    try {
      if (id) {
        const { error } = await supabase
          .from('blogs')
          .update(values)
          .eq('id', id)
        if (error) throw error
        toast.success('Blog post updated successfully')
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert(values)
        if (error) throw error
        toast.success('Blog post created successfully')
      }
      router.push('/blogs')
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
        <PageHeader title={id ? 'Edit Blog Post' : 'New Blog Post'} />

        <div className="bg-[#111111] border border-[#161616] p-4 rounded-2xl shadow-xl sticky top-4 z-40 backdrop-blur-3xl flex items-center justify-between mb-10">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
             <TabsList className="bg-transparent border-none p-0 gap-2">
               <TabsTrigger 
                 value="content" 
                 className="data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white text-[#A1A1AA] hover:text-white transition-all rounded-xl h-10 px-6 font-bold uppercase text-xs tracking-widest"
               >
                 <FileText className="w-4 h-4 mr-2" /> Content
               </TabsTrigger>
               <TabsTrigger 
                 value="settings" 
                 className="data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white text-[#A1A1AA] hover:text-white transition-all rounded-xl h-10 px-6 font-bold uppercase text-xs tracking-widest"
               >
                 <Settings2 className="w-4 h-4 mr-2" /> Configuration
               </TabsTrigger>
             </TabsList>
           </Tabs>
           <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/blogs')}
                className="text-[#52525B] hover:text-white hover:bg-[#161616] rounded-xl h-10 px-4 font-bold uppercase text-xs tracking-widest transition-all"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-6 font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {id ? 'Update' : 'Publish'}
              </Button>
           </div>
        </div>

        <Tabs value={activeTab} className="space-y-10">
          <TabsContent value="content" className="space-y-10 focus:outline-none">
            {/* Header Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Type a captivating blog title..." 
                            {...field} 
                            className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] h-16 rounded-2xl text-3xl font-bold placeholder:opacity-20 transition-all font-sans border-none shadow-inner"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs font-bold uppercase tracking-widest px-1 opacity-60">Short Summary / Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write a brief overview for post previews..." 
                            {...field} 
                            className="bg-[#161616] border-[#262626] text-white focus:border-[#7C3AED] min-h-[100px] rounded-xl text-md leading-relaxed border-none shadow-inner"
                          />
                        </FormControl>
                        <div className="flex justify-between items-center px-1">
                          <FormMessage className="text-red-500 font-bold text-xs" />
                          <span className={cn(
                            "text-[10px] font-bold tracking-widest uppercase",
                            (field.value?.length || 0) > 200 ? "text-red-500" : "text-[#52525B]"
                          )}>
                            {field.value?.length || 0}/200 chars
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RichTextEditor 
                            value={field.value || ''} 
                            onChange={field.onChange}
                            placeholder="Write your story here... Supports images, code blocks, and more."
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-8">
                <div className="bg-[#111111] border border-[#161616] p-6 rounded-2xl shadow-2xl space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                    <ImageIcon className="w-4 h-4" /> Cover Artwork
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="cover_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload value={field.value} onChange={field.onChange} bucket="blog-covers" />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-[#111111] border border-[#161616] p-6 rounded-2xl shadow-2xl space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
                    <Hash className="w-4 h-4" /> Categorization
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Post Category</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Technology, Lifestyle..." className="bg-[#161616] border-[#262626] text-white rounded-xl h-11 border-none shadow-inner" />
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
                        <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Topic Tags</FormLabel>
                        <FormControl>
                          <TagInput 
                            value={field.value || []} 
                            onChange={field.onChange} 
                            placeholder="Add tags..."
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-10 focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
                 <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                    <Settings2 className="w-5 h-5 text-[#7C3AED]" />
                    <h3 className="text-lg font-bold font-sans text-white">Post Status</h3>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <div className="col-span-2">
                          <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest block mb-3">Publishing Status</label>
                          <div className="flex p-1 bg-[#161616] rounded-2xl border border-[#262626] shadow-inner">
                             <button 
                               type="button" 
                               onClick={() => field.onChange('published')}
                               className={cn(
                                 "flex-1 flex items-center justify-center h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                 field.value === 'published' ? 'bg-[#7C3AED] text-white shadow-lg' : 'text-[#52525B] hover:text-white'
                               )}
                             >
                               Published
                             </button>
                             <button 
                               type="button" 
                               onClick={() => field.onChange('draft')}
                               className={cn(
                                 "flex-1 flex items-center justify-center h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                 field.value === 'draft' ? 'bg-zinc-800 text-white shadow-lg' : 'text-[#52525B] hover:text-white'
                               )}
                             >
                               Save Draft
                             </button>
                          </div>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <div className="col-span-2 flex items-center justify-between p-4 bg-[#161616] rounded-2xl border border-[#262626] shadow-inner">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#7C3AED]/10 rounded-lg text-[#7C3AED]">
                                 <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-white text-xs font-bold uppercase tracking-widest">Pin to Home</p>
                                 <p className="text-[#52525B] text-[10px] uppercase font-bold tracking-widest leading-none">Sets post as featured content</p>
                              </div>
                           </div>
                           <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#7C3AED]"
                            />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                           <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Permalink / URL Slug</FormLabel>
                           <FormControl>
                             <div className="relative">
                               <Input {...field} className="bg-[#161616] border-none shadow-inner text-white rounded-xl h-12 font-mono text-xs pl-12" />
                               <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                             </div>
                           </FormControl>
                           <FormMessage className="text-red-500 font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                 </div>
              </div>

              <div className="bg-[#111111] border border-[#161616] p-8 rounded-2xl shadow-2xl space-y-8">
                 <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                    <Globe className="w-5 h-5 text-[#7C3AED]" />
                    <h3 className="text-lg font-bold font-sans text-white">Search Optimization</h3>
                 </div>

                 <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="seo_title"
                      render={({ field }) => (
                         <FormItem>
                            <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">SEO Meta Title</FormLabel>
                            <FormControl>
                               <Input {...field} placeholder="Enter SEO Title..." className="bg-[#161616] border-none shadow-inner text-white rounded-xl h-12" />
                            </FormControl>
                         </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo_description"
                      render={({ field }) => (
                         <FormItem>
                            <FormLabel className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">SEO Meta Description</FormLabel>
                            <FormControl>
                               <Textarea {...field} placeholder="Enter SEO Description..." className="bg-[#161616] border-none shadow-inner text-white rounded-xl min-h-[120px]" />
                            </FormControl>
                         </FormItem>
                      )}
                    />
                 </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="h-40" />
      </form>
    </Form>
  )
}
