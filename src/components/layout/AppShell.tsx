import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, ShieldCheck } from 'lucide-react'
import { NAV_ITEMS } from './nav'
import { cn } from '@/lib/utils'
import { GlobalSearch } from '@/features/search/GlobalSearch'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-lg font-semibold text-primary-800 dark:text-primary-200"
          >
            <ShieldCheck className="h-6 w-6 text-accent-600" />
            <span className="text-lg">VisitReady PD</span>
          </button>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
          aria-label="Search all records"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search…</span>
        </button>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <nav
          aria-label="Primary"
          className={cn(
            'fixed inset-y-0 left-0 top-16 z-30 w-72 shrink-0 -translate-x-full overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:translate-x-0',
            mobileOpen && 'translate-x-0'
          )}
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center gap-3 rounded-xl px-4 text-base font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      isActive && 'bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {mobileOpen && (
          <div
            className="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <main id="main-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
