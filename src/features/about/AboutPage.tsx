import { ShieldCheck, Lock, WifiOff, Ban, CreditCard, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PROMISES = [
  { icon: WifiOff, text: 'Never uploads your data' },
  { icon: Ban, text: 'Never tracks you' },
  { icon: Lock, text: 'Never requires an account' },
  { icon: CreditCard, text: 'Never shows advertising' },
  { icon: ShieldCheck, text: 'Stores everything only on your device' },
]

export function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="About VisitReady PD" />

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-12 w-12 text-accent-600" />
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">VisitReady PD</h2>
          <p className="text-slate-500 dark:text-slate-400">Version 1.0.0 · MIT License</p>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">
            A privacy-first, offline companion to help you and your care team prepare for Parkinson's appointments.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our Privacy Promise</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {PROMISES.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <p.icon className="h-5 w-5 shrink-0 text-accent-600" />
                {p.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-300">
            VisitReady PD is not a medical device. It does not diagnose disease or recommend medication changes. It is an
            organizational and communication tool designed to help you prepare for appointments with your care team. Always
            consult a qualified healthcare professional for medical advice.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Source</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-slate-300 px-5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-5 w-5" /> View source on GitHub
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
