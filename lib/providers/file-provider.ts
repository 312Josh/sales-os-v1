import fs from 'node:fs'
import path from 'node:path'
import type { SalesOsData } from '@/lib/types'

const dataFile = path.join(process.cwd(), 'data', 'seed.json')

export function readFileData(): SalesOsData {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8')) as SalesOsData
}

export function writeFileData(data: SalesOsData) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
}
