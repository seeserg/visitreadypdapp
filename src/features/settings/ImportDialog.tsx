import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { importBackupData, decryptBackup, type BackupData } from '@/lib/backup'
import { useToast } from '@/components/ui/toast'

export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState('')
  const [needsPassword, setNeedsPassword] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (!open) {
      setFile(null)
      setPassword('')
      setNeedsPassword(false)
    }
  }, [open])

  async function detectFormat(f: File) {
    const text = await f.text()
    try {
      const parsed = JSON.parse(text)
      setNeedsPassword(parsed.format === 'visitready-encrypted-v1')
    } catch {
      setNeedsPassword(false)
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    try {
      const text = await file.text()
      let data: BackupData
      if (needsPassword) {
        data = await decryptBackup(text, password)
      } else {
        data = JSON.parse(text)
      }
      await importBackupData(data)
      toast({ title: 'Backup restored', description: 'Your data has been imported.', variant: 'success' })
      onOpenChange(false)
    } catch {
      toast({ title: 'Import failed', description: 'Check the file and password, then try again.', variant: 'warning' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore from backup</DialogTitle>
          <DialogDescription>Import a JSON or encrypted JSON backup exported from VisitReady PD.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-file">Backup file</Label>
            <Input
              id="import-file"
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                if (f) detectFormat(f)
              }}
            />
          </div>
          {needsPassword && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-pass">Password</Label>
              <Input id="import-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file}>
              Restore
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
