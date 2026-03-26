'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder = 'Type and press Enter...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-3">
      <div className={cn(
        "flex flex-wrap gap-2 p-3 bg-[#111111] border border-[#262626] rounded-xl min-h-[52px] shadow-inner focus-within:border-[#7C3AED]/50 transition-all",
        "group"
      )}>
        {value.map((tag, index) => (
          <Badge 
            key={index} 
            className="bg-[#161616] border border-[#262626] text-white hover:border-[#7C3AED]/30 px-3 py-1.5 rounded-lg flex items-center gap-2 group/tag transition-all duration-300"
          >
            <span className="text-xs font-bold tracking-tight text-[#A1A1AA] group-hover/tag:text-white transition-colors">#{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              className="text-[#52525B] hover:text-[#EF4444] transition-colors p-0.5 rounded-full hover:bg-red-500/10"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm min-w-[120px] focus:ring-0 placeholder:text-[#52525B] font-medium"
        />
      </div>
      <p className="text-[10px] text-[#52525B] flex items-center gap-1 uppercase font-bold tracking-widest px-1">
        <Hash className="w-3 h-3" /> Press Enter to add tags
      </p>
    </div>
  )
}
