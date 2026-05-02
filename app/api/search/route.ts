import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  
  try {
    const indexPath = path.join(process.cwd(), 'content-cache/generated/search-index.json')
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json([])
    }
    
    const content = fs.readFileSync(indexPath, 'utf-8')
    const index: any[] = JSON.parse(content)
    
    if (!q) {
      return NextResponse.json([])
    }
    
    const lowerQ = q.toLowerCase()
    
    // Very simple fuzzy search
    const matches = index.filter(item => {
      const matchTitle = item.title && item.title.toLowerCase().includes(lowerQ)
      const matchText = item.text && item.text.toLowerCase().includes(lowerQ)
      return matchTitle || matchText
    }).slice(0, 20) // Limit to top 20
    
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
