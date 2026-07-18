import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { FallEntry } from '@/types'

export function FallsChart({ entries }: { entries: FallEntry[] }) {
  const byMonth = new Map<string, { falls: number; nearFalls: number }>()
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    const cur = byMonth.get(key) ?? { falls: 0, nearFalls: 0 }
    if (e.nearFall) cur.nearFalls++
    else cur.falls++
    byMonth.set(key, cur)
  }
  const data = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, v]) => ({ month, ...v }))

  if (data.length === 0) return null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
          <Bar dataKey="falls" fill="#d64545" name="Falls" radius={[6, 6, 0, 0]} />
          <Bar dataKey="nearFalls" fill="#d99a1b" name="Near falls" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
