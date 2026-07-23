import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { eraseAllData } from '@/db/db'

const CONFIRM_WORD = 'erase'

export function EraseAllDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [confirmText, setConfirmText] = React.useState('')
  const [erasing, setErasing] = React.useState(false)
  const canSubmit = confirmText.trim().toLowerCase() === CONFIRM_WORD

  React.useEffect(() => {
    if (!open) setConfirmText('')
  }, [open])

  async function handleErase(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setErasing(true)
    await eraseAllData()
    // Reload so every in-memory context (settings, theme, all live queries) resets to defaults
    // instead of trying to reconcile every provider with a suddenly-empty database.
    window.location.href = '/'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-5 w-5" /> Erase all information
          </DialogTitle>
          <DialogDescription>
            This permanently deletes everything stored in VisitReady PD on this device — symptoms, medications,
            blood pressure, falls, questions, caregiver notes, appointments, journal entries, and settings. There is
            no undo. Consider exporting a backup first from Backup & Restore.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleErase} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="erase-confirm">
              Type <span className="font-semibold">erase</span> to confirm
            </Label>
            <Input
              id="erase-confirm"
              autoFocus
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="erase"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={!canSubmit || erasing}>
              {erasing ? 'Erasing…' : 'Erase everything'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
