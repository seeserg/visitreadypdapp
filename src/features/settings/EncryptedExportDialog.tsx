import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { exportEncryptedJSON } from '@/lib/backup'
import { useToast } from '@/components/ui/toast'

export function EncryptedExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const { toast } = useToast()

  async function handleExport(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'warning' })
      return
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: 'warning' })
      return
    }
    await exportEncryptedJSON(password)
    toast({ title: 'Encrypted backup exported', variant: 'success' })
    setPassword('')
    setConfirm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export encrypted backup</DialogTitle>
          <DialogDescription>
            Choose a password to encrypt your backup. Remember it — it cannot be recovered.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleExport} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="enc-pass">Password</Label>
            <Input id="enc-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="enc-pass-confirm">Confirm password</Label>
            <Input id="enc-pass-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Export</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
