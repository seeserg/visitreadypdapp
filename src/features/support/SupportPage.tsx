import { Coffee, Heart, WifiOff, ShieldCheck, Ban, Infinity as InfinityIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TRAITS = [
  { icon: InfinityIcon, text: 'Free Forever' },
  { icon: ShieldCheck, text: 'Open Source' },
  { icon: WifiOff, text: 'Offline' },
  { icon: ShieldCheck, text: 'Privacy First' },
  { icon: Ban, text: 'No Ads' },
  { icon: Ban, text: 'No Tracking' },
  { icon: Ban, text: 'No Subscription' },
]

export function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Support" />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Heart className="h-10 w-10 text-danger-500" />
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Keep VisitReady PD Free</h2>
          <p className="max-w-md text-slate-600 dark:text-slate-300">
            VisitReady PD is built and maintained independently, with no ads, tracking, or subscriptions — ever.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TRAITS.map((t) => (
              <Badge key={t.text} variant="accent" className="flex items-center gap-1 py-1.5">
                <t.icon className="h-3.5 w-3.5" /> {t.text}
              </Badge>
            ))}
          </div>
          <p className="max-w-md text-slate-600 dark:text-slate-300">
            If this app has helped you prepare for appointments, consider supporting development.
          </p>
          <a
            href="https://buymeacoffee.com/seeser"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-warning-500 px-8 text-lg font-semibold text-white hover:bg-warning-600"
          >
            <Coffee className="h-6 w-6" /> Buy Me a Coffee
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
