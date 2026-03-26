'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface PageHeaderProps {
  title: string
  actionLabel?: string
  actionHref?: string
}

export function PageHeader({ 
  title, 
  actionLabel, 
  actionHref 
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 pb-6 border-b border-[#262626]">
      <div>
        <h1 className="text-2xl font-bold font-sans text-white tracking-tight">{title}</h1>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-none transition-colors duration-200 shadow-lg shadow-indigo-500/10">
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </header>
  )
}
