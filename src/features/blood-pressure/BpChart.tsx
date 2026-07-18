import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BloodPressureEntry } from '@/types'
import { formatDate } from '@/lib/utils'

export function BpChart({ entries }: { entries: BloodPressureEntry[] }) {
  const data = [...entries]
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(-20)
    .map((e) => ({
      label: formatDate(e.date, { month: 'short', day: 'numeric' }),
      Sitting: e.sittingSystolic,
      Standing: e.standingSystolic,
      'Heart rate': e.heartRate,
    }))

  if (data.length === 0) return null

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
          <Legend />
          <Line type="monotone" dataKey="Sitting" stroke="#1e4d7b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="Standing" stroke="#1e7c7b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="Heart rate" stroke="#d99a1b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
