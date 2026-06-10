import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

export const readGeneratedJson = cache(async function readGeneratedJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'content-cache', 'generated', fileName)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
})
