import { chromium, devices } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const outDir = '/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r10-clean-deploy-verify/dom'
await fs.mkdir(outDir, { recursive: true })

const routes = [
  { name: 'home', url: 'https://hermes-zh.com/' },
  { name: 'docs-start', url: 'https://hermes-zh.com/docs/start' }
]

const browser = await chromium.launch({ headless: true, executablePath: '/snap/bin/chromium' })
for (const route of routes) {
  const context = await browser.newContext({ ...devices['iPhone 12'], locale: 'zh-CN', colorScheme: 'dark' })
  const page = await context.newPage()
  await page.goto(route.url, { waitUntil: 'networkidle', timeout: 60000 })
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('header, [role="banner"]')
    const nav = document.querySelector('nav')
    const mobileNav = document.querySelector('details.site-mobile-nav')
    const mobileSummary = mobileNav?.querySelector('summary')
    const h1 = document.querySelector('h1')
    const rect = (el) => el ? el.getBoundingClientRect().toJSON() : null
    return {
      href: location.href,
      title: document.title,
      viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowFree: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      headerHeight: header ? header.getBoundingClientRect().height : null,
      navDisplay: nav ? getComputedStyle(nav).display : null,
      navHeight: nav ? nav.getBoundingClientRect().height : null,
      mobileNavExists: !!mobileNav,
      summaryExists: !!mobileSummary,
      h1Text: h1?.textContent?.trim() || null,
      headerRect: rect(header),
      navRect: rect(nav),
      mobileNavRect: rect(mobileNav),
      summaryRect: rect(mobileSummary),
      bodyTextSample: document.body.innerText.slice(0, 500)
    }
  })
  const png = path.join(outDir, `${route.name}-iphone12-full.png`)
  await page.screenshot({ path: png, fullPage: true })
  const buf = await fs.readFile(png)
  await fs.writeFile(path.join(outDir, `${route.name}-iphone12.metrics.json`), JSON.stringify({ metrics, screenshot: path.basename(png), sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length }, null, 2))
  await context.close()
}
await browser.close()
console.log(JSON.stringify({ outDir, routes: routes.map(r => r.name) }))
