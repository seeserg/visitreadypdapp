import * as React from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'info' | 'warning'
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons = { success: CheckCircle2, info: Info, warning: AlertTriangle }
const colors = {
  success: 'border-success-500/30 bg-success-50 text-success-600 dark:bg-success-500/10',
  info: 'border-primary-500/30 bg-primary-50 text-primary-800 dark:bg-primary-500/10 dark:text-primary-200',
  warning: 'border-warning-500/30 bg-warning-50 text-warning-600 dark:bg-warning-500/10',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ToastMessage[]>([])

  const toast = React.useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID()
    setMessages((prev) => [...prev, { ...msg, id }])
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-1/2 z-[100] flex w-[92vw] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0"
      >
        {messages.map((m) => {
          const Icon = icons[m.variant ?? 'info']
          return (
            <div
              key={m.id}
              role="status"
              className={cn(
                'animate-fade-in flex items-start gap-3 rounded-xl border p-4 shadow-lg',
                colors[m.variant ?? 'info']
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{m.title}</p>
                {m.description && <p className="text-sm opacity-80">{m.description}</p>}
              </div>
              <button
                onClick={() => setMessages((prev) => prev.filter((x) => x.id !== m.id))}
                className="rounded p-1 hover:bg-black/5"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
