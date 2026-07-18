import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { db } from '@/db/db'
import { formatDate } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  subtitle: string
  path: string
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  React.useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    async function run() {
      const [symptoms, meds, bp, falls, questions, notes] = await Promise.all([
        db.symptoms.toArray(),
        db.medications.toArray(),
        db.bloodPressure.toArray(),
        db.falls.toArray(),
        db.questions.toArray(),
        db.caregiverNotes.toArray(),
      ])
      const found: SearchResult[] = []
      for (const s of symptoms) {
        if (`${s.type} ${s.notes ?? ''}`.toLowerCase().includes(q))
          found.push({ id: s.id, title: `${s.type} (severity ${s.severity})`, subtitle: formatDate(s.date), path: '/symptoms' })
      }
      for (const m of meds) {
        if (`${m.name} ${m.notes ?? ''} ${m.sideEffects ?? ''}`.toLowerCase().includes(q))
          found.push({ id: m.id, title: m.name, subtitle: `${m.strength} · ${m.frequency}`, path: '/medications' })
      }
      for (const b of bp) {
        if (`${b.notes ?? ''}`.toLowerCase().includes(q))
          found.push({ id: b.id, title: 'Blood pressure entry', subtitle: formatDate(b.date), path: '/blood-pressure' })
      }
      for (const f of falls) {
        if (`${f.location} ${f.cause} ${f.notes ?? ''}`.toLowerCase().includes(q))
          found.push({ id: f.id, title: `Fall — ${f.location}`, subtitle: formatDate(f.date), path: '/falls' })
      }
      for (const qq of questions) {
        if (qq.text.toLowerCase().includes(q))
          found.push({ id: qq.id, title: qq.text, subtitle: qq.priority, path: '/questions' })
      }
      for (const n of notes) {
        if (`${n.observation} ${n.category}`.toLowerCase().includes(q))
          found.push({ id: n.id, title: n.category, subtitle: n.observation.slice(0, 60), path: '/caregiver-notes' })
      }
      if (!cancelled) setResults(found.slice(0, 20))
    }
    run()
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-xl -translate-y-0">
        <DialogHeader>
          <DialogTitle>Search all records</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search symptoms, medications, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search all records"
        />
        <ul className="mt-4 flex max-h-80 flex-col gap-1 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => {
                  navigate(r.path)
                  onOpenChange(false)
                }}
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="font-medium">{r.title}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{r.subtitle}</span>
              </button>
            </li>
          ))}
          {query.trim().length >= 2 && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No results found.</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
