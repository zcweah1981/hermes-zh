import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const sizeOf = (path: string) => statSync(join(repoRoot, path)).size

describe('first-screen image budget', () => {
  it('keeps the header logo small enough for mobile preload', () => {
    assert.ok(
      sizeOf('public/hermes-logo.png') <= 96 * 1024,
      'header priority logo should stay <= 96KB because it is preloaded on every page',
    )
  })

  it('keeps non-critical bitmap reference assets out of the homepage implementation', () => {
    const homePage = require('node:fs').readFileSync(join(repoRoot, 'app/(marketing)/page.tsx'), 'utf8')
    assert.doesNotMatch(homePage, /hermes-capability-map-cropped|hermes-agent-capability-1to1/, 'homepage should use DOM/CSS/SVG infographic instead of bitmap reference assets')
  })
})
