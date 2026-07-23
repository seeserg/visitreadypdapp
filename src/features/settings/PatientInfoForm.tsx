import * as React from 'react'
import { ShieldCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/components/ui/toast'
import type { PatientInfo } from '@/types'

export function PatientInfoForm() {
  const { settings, updateSettings } = useSettings()
  const { toast } = useToast()
  const [form, setForm] = React.useState<PatientInfo>(settings.patient)

  React.useEffect(() => setForm(settings.patient), [settings.patient])

  function field<K extends keyof PatientInfo>(key: K) {
    return {
      value: form[key] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  async function save() {
    await updateSettings({ patient: form })
    toast({ title: 'Patient information saved', variant: 'success' })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-start gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800 dark:bg-accent-900/30 dark:text-accent-200">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Every field below is optional. VisitReady PD works fully anonymously — fill in only what's useful for your
          own reports; nothing here is required and nothing ever leaves this device.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" placeholder="Optional" {...field('name')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-dob">Date of birth</Label>
          <Input id="p-dob" type="date" {...field('dateOfBirth')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-diag">Diagnosis year</Label>
          <Input id="p-diag" placeholder="Optional" {...field('diagnosisYear')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-neuro">Usual neurologist</Label>
          <Input id="p-neuro" placeholder="Optional" {...field('neurologistName')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-ec-name">Emergency contact name</Label>
          <Input id="p-ec-name" placeholder="Optional" {...field('emergencyContactName')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-ec-phone">Emergency contact phone</Label>
          <Input id="p-ec-phone" type="tel" placeholder="Optional" {...field('emergencyContactPhone')} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-notes">Notes</Label>
        <Textarea id="p-notes" placeholder="Optional" {...field('notes')} />
      </div>
      <div>
        <Button type="submit">Save patient information</Button>
      </div>
    </form>
  )
}
