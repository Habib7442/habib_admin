'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket?: string
}

export function ImageUpload({ value, onChange, bucket = 'project-images' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [supabase, onChange, bucket])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-video w-full rounded-2xl border border-[#262626] bg-[#111111] overflow-hidden group shadow-xl">
          <img src={value} alt="Upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange('')}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg scale-0 group-hover:scale-100 duration-300"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer h-[240px]",
            isDragActive ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-[#262626] bg-[#111111] hover:border-[#7C3AED]/50 hover:bg-[#111111]/50 shadow-inner"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-5 rounded-3xl bg-[#161616] border border-[#262626] mb-6 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-[#A1A1AA] group-hover:text-white transition-colors" />
            )}
          </div>
          <p className="text-sm font-bold text-white tracking-tight">Click or drag image here</p>
          <p className="text-xs text-[#52525B] mt-2 font-medium">SVG, PNG, JPG or WEBP (MAX. 10MB)</p>
        </div>
      )}
    </div>
  )
}
