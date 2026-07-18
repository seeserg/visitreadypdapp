import * as React from 'react'
import { db, getSettings, DEFAULT_SETTINGS } from '@/db/db'
import type { AppSettings } from '@/types'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
  ready: boolean
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      setReady(true)
    })
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    const resolved =
      settings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : settings.theme
    root.setAttribute('data-theme', resolved)
    root.classList.toggle('large-text', settings.largeText)
    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('force-reduced-motion', settings.reducedMotion)
  }, [settings.theme, settings.largeText, settings.highContrast, settings.reducedMotion])

  async function updateSettings(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    await db.settings.put(next)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, ready }}>{children}</SettingsContext.Provider>
  )
}
