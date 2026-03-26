'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  bucket?: string
}

export function MultiImageUpload({ value, onChange, bucket = 'project-images' }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    const newUrls: string[] = [...value]

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }
      
      onChange(newUrls)
      toast.success(`${acceptedFiles.length} images uploaded successfully`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }, [supabase, onChange, bucket, value])

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter(url => url !== urlToRemove))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl border border-[#262626] bg-[#111111] overflow-hidden group shadow-lg hover:border-[#7C3AED]/30 transition-all duration-300">
            <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeImage(url)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl scale-0 group-hover:scale-100 duration-300 transform active:scale-95"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-500 group cursor-pointer aspect-square",
            isDragActive ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-[#262626] bg-[#111111] hover:border-[#7C3AED]/50 hover:bg-[#111111]/50 shadow-inner"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-3 rounded-2xl bg-[#161616] border border-[#262626] mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
            ) : (
              <Plus className="w-6 h-6 text-[#A1A1AA] group-hover:text-white transition-colors" />
            )}
          </div>
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest text-center px-4">Add more screenshots</p>
        </div>
      </div>
    </div>
  )
}
