import * as React from 'react'
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" {...field('name')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-dob">Date of birth</Label>
          <Input id="p-dob" type="date" {...field('dateOfBirth')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-diag">Diagnosis year</Label>
          <Input id="p-diag" {...field('diagnosisYear')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-neuro">Neurologist</Label>
          <Input id="p-neuro" {...field('neurologistName')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-appt">Upcoming appointment date</Label>
          <Input id="p-appt" type="date" {...field('appointmentDate')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-ec-name">Emergency contact name</Label>
          <Input id="p-ec-name" {...field('emergencyContactName')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-ec-phone">Emergency contact phone</Label>
          <Input id="p-ec-phone" type="tel" {...field('emergencyContactPhone')} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-notes">Notes</Label>
        <Textarea id="p-notes" {...field('notes')} />
      </div>
      <div>
        <Button type="submit">Save patient information</Button>
      </div>
    </form>
  )
}
