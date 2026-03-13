import { readFileData, writeFileData } from './file-provider'
import { readSupabaseData, writeSupabaseData } from './supabase-provider'
import type { SalesOsData } from '@/lib/types'

export type DataProvider = {
  read(): SalesOsData | Promise<SalesOsData>
  write(data: SalesOsData): void | Promise<void>
  name: 'file' | 'supabase'
}

const providerName = (process.env.DATA_PROVIDER || 'file') as 'file' | 'supabase'

export function getDataProvider(): DataProvider {
  if (providerName === 'supabase') {
    return {
      name: 'supabase',
      read: readSupabaseData,
      write: writeSupabaseData,
    }
  }

  return {
    name: 'file',
    read: readFileData,
    write: writeFileData,
  }
}
