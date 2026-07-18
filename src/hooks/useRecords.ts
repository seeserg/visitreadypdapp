import { useLiveQuery } from 'dexie-react-hooks'
import type { Table, UpdateSpec } from 'dexie'
import { newId } from '@/lib/utils'

interface WithId {
  id: string
  createdAt: string
  updatedAt: string
}

export function useRecords<T extends WithId>(table: Table<T, string>, sortKey: keyof T = 'createdAt') {
  const records = useLiveQuery(async () => {
    const all = await table.toArray()
    return all.sort((a, b) => String(b[sortKey]).localeCompare(String(a[sortKey])))
  }, [table])

  async function add(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record = { ...data, id: newId(), createdAt: now, updatedAt: now } as T
    await table.put(record)
    return record
  }

  async function update(id: string, data: Partial<T>) {
    await table.update(id, { ...data, updatedAt: new Date().toISOString() } as UpdateSpec<T>)
  }

  async function remove(id: string) {
    await table.delete(id)
  }

  return { records: records ?? [], add, update, remove, loading: records === undefined }
}
