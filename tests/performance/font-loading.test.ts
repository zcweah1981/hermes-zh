import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function read(path: string) {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('font loading performance', () => {
  it('does not use render-blocking Google Fonts CSS imports', () => {
    const globals = read('app/globals.css')

    assert.doesNotMatch(globals, /@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com/i)
    assert.doesNotMatch(globals, /fonts\.googleapis\.com/i)
  })

  it('uses local system font stacks without external font CSS or build-time font fetches', () => {
    const layout = read('app/layout.tsx')
    const tailwind = read('tailwind.config.ts')

    assert.doesNotMatch(layout, /from ['"]next\/font\/google['"]/, 'build should not depend on Google font downloads')
    assert.doesNotMatch(layout, /from ['"]next\/font\/local['"]/, 'mobile homepage should avoid preloading large custom font files')
    assert.doesNotMatch(layout, /Noto_Sans_SC|Noto_Serif_SC|JetBrains_Mono/, 'layout should not trigger font generation')

    for (const externalFontHost of ['fonts.googleapis.com', 'fonts.gstatic.com']) {
      assert.doesNotMatch(layout, new RegExp(externalFontHost, 'i'))
      assert.doesNotMatch(tailwind, new RegExp(externalFontHost, 'i'))
    }

    assert.match(tailwind, /PingFang SC/, 'Chinese UI should prefer native Chinese system fonts')
    assert.match(tailwind, /Microsoft YaHei/, 'Windows Chinese fallback should remain available')
    assert.match(tailwind, /SFMono-Regular/, 'code blocks should use native mono fonts without network fetches')
  })
})
