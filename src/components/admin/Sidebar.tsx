'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderPlus, 
  FileText, 
  Palette, 
  MessageSquare, 
  Settings, 
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderPlus },
  { href: '/blogs', label: 'Blogs', icon: FileText },
  { href: '/designs', label: 'Designs', icon: Palette },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null)
    })
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#111111] border-r border-[#262626] flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Admin<span className="text-[#7C3AED]">Panel</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium group",
                isActive 
                  ? "bg-[#161616] text-white border-l-2 border-[#7C3AED]"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#161616]"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-[#7C3AED]" : "text-[#A1A1AA] group-hover:text-white"
              )} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#262626] mt-auto">
        <div className="flex items-center justify-between gap-2 px-2 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#161616] flex items-center justify-center border border-[#262626]">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{userEmail || 'Admin'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-[#A1A1AA] hover:text-[#EF4444] transition-colors rounded-md hover:bg-[#161616]"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
