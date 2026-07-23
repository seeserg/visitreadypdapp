import * as React from 'react'
import { Upload, FileJson, Lock, Table2, Printer, ShieldCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'
import { AppointmentHistoryCard } from '@/features/appointments/AppointmentHistoryCard'
import { PatientInfoForm } from './PatientInfoForm'
import { EncryptedExportDialog } from './EncryptedExportDialog'
import { ImportDialog } from './ImportDialog'
import { EraseAllDialog } from './EraseAllDialog'
import { exportJSON, exportCSV } from '@/lib/backup'
import { useToast } from '@/components/ui/toast'

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { toast } = useToast()
  const [encDialogOpen, setEncDialogOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [eraseOpen, setEraseOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Everything is stored only on this device." />

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Used to personalize the dashboard and appointment report.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientInfoForm />
        </CardContent>
      </Card>

      <AppointmentHistoryCard />

      <Card>
        <CardHeader>
          <CardTitle>Appearance & Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={(v) => updateSettings({ theme: v as typeof settings.theme })}>
              <SelectTrigger id="theme" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="large-text">Large text mode</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Increases font size across the app.</p>
            </div>
            <Switch id="large-text" checked={settings.largeText} onCheckedChange={(v) => updateSettings({ largeText: v })} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="high-contrast">High contrast mode</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Increases contrast for readability.</p>
            </div>
            <Switch id="high-contrast" checked={settings.highContrast} onCheckedChange={(v) => updateSettings({ highContrast: v })} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="reduced-motion">Reduce motion</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Minimizes animations, regardless of system setting.</p>
            </div>
            <Switch id="reduced-motion" checked={settings.reducedMotion} onCheckedChange={(v) => updateSettings({ reducedMotion: v })} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="units">Units</Label>
            <Select value={settings.units} onValueChange={(v) => updateSettings({ units: v as typeof settings.units })}>
              <SelectTrigger id="units" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Your data never leaves this device unless you export it yourself.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportJSON().then(() => toast({ title: 'JSON exported', variant: 'success' }))}>
            <FileJson className="h-5 w-5" /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => setEncDialogOpen(true)}>
            <Lock className="h-5 w-5" /> Export Encrypted JSON
          </Button>
          <Button variant="outline" onClick={() => exportCSV().then(() => toast({ title: 'CSV exported', variant: 'success' }))}>
            <Table2 className="h-5 w-5" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-5 w-5" /> Print
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-5 w-5" /> Import Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-600" /> Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
            <li>• No account, login, or cloud sync required</li>
            <li>• No analytics, tracking, or advertising</li>
            <li>• All data is stored only in this browser's local IndexedDB</li>
            <li>• No network requests are made after the app is installed</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-danger-200 dark:border-danger-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger-600">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently erase everything stored in this app on this device. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={() => setEraseOpen(true)}>
            <Trash2 className="h-5 w-5" /> Erase all information
          </Button>
        </CardContent>
      </Card>

      <EncryptedExportDialog open={encDialogOpen} onOpenChange={setEncDialogOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <EraseAllDialog open={eraseOpen} onOpenChange={setEraseOpen} />
    </div>
  )
}
