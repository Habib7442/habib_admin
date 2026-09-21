'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderKanban, LayoutDashboard, LayoutTemplate, LogOut, Newspaper, Palette, type LucideIcon } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean }

// Add new sections here and they show up in the sidebar.
const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/landing-pages', label: 'Landing Pages', icon: LayoutTemplate },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/designs', label: 'Designs', icon: Palette },
  { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
]

export function Sidebar() {
  const pathname = usePathname()
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <aside className="flex shrink-0 flex-col border-b border-white/10 bg-[#0E0E0E] md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:py-5">
        <Link href="/admin" className="text-lg font-semibold text-white">
          Habib <span className="text-violet-400">Admin</span>
        </Link>
        <form action={logout} className="md:hidden">
          <button type="submit" aria-label="Log out" className="text-neutral-400 hover:text-white">
            <LogOut className="size-5" />
          </button>
        </form>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item) ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
              isActive(item)
                ? 'bg-violet-500/15 text-white'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            )}
          >
            <item.icon className={cn('size-4', isActive(item) && 'text-violet-400')} />
            {item.label}
          </Link>
        ))}
      </nav>

      <form action={logout} className="hidden border-t border-white/10 p-3 md:block">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </form>
    </aside>
  )
}
