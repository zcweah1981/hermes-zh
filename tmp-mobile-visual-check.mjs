import { chromium, devices } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const outDir = '/root/qa-proof/hermes-zh-r9-mobile-visual-qa'
await fs.mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true, executablePath: '/snap/bin/chromium' })
const context = await browser.newContext({
  ...devices['iPhone 12'],
  locale: 'zh-CN',
  colorScheme: 'dark'
})
const page = await context.newPage()
await page.goto('http://127.0.0.1:3100/', { waitUntil: 'networkidle', timeout: 30000 })

const metrics = await page.evaluate(async () => {
  const fonts = document.fonts
    ? Array.from(document.fonts).map(f => ({ family: f.family, status: f.status, weight: f.weight }))
    : []
  const header = document.querySelector('header, [role="banner"], banner')
  const h1 = document.querySelector('h1')
  const searchLink = Array.from(document.querySelectorAll('a,button,summary')).find(el => /搜索/.test(el.textContent || '') || /search/i.test(el.getAttribute('aria-label') || ''))
  const ctas = Array.from(document.querySelectorAll('main a')).slice(0, 3).map(el => ({ text: (el.textContent || '').trim(), rect: el.getBoundingClientRect().toJSON() }))
  const nav = document.querySelector('nav')
  const mobileDetails = document.querySelector('details.site-mobile-nav')
  const mobileSummary = mobileDetails?.querySelector('summary')
  const navTexts = Array.from(document.querySelectorAll('nav a')).map(el => ({ text: (el.textContent || '').trim(), rect: el.getBoundingClientRect().toJSON() }))
  const get = (el) => el ? ({ text: (el.textContent || '').trim(), rect: el.getBoundingClientRect().toJSON(), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, display: getComputedStyle(el).display }) : null
  return {
    href: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body?.scrollWidth ?? null,
    header: get(header),
    h1: get(h1),
    search: get(searchLink),
    nav: get(nav),
    mobileNav: get(mobileDetails),
    mobileSummary: get(mobileSummary),
    ctas,
    navTexts,
    fonts,
    bodyTextSample: document.body.innerText.slice(0, 400)
  }
})

const screenshotPath = path.join(outDir, 'home-iphone12-full.png')
await page.screenshot({ path: screenshotPath, fullPage: true })
const heroPath = path.join(outDir, 'home-iphone12-hero.png')
await page.screenshot({ path: heroPath, clip: { x: 0, y: 0, width: 390, height: 844 } })

const files = [screenshotPath, heroPath]
const hashes = {}
for (const file of files) {
  const buf = await fs.readFile(file)
  hashes[path.basename(file)] = {
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex')
  }
}

await browser.close()
console.log(JSON.stringify({ outDir, screenshotPath, heroPath, hashes, metrics }, null, 2))
