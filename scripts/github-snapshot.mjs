// Saves everything the site reads from GitHub to dist/github.json, so the numbers show up
// even when a visitor's own GitHub rate limit is used up. In the deploy workflow this runs with
// the workflow's token (1,000 requests an hour); locally it uses GITHUB_TOKEN if set.
// It never fails the build: without a snapshot the site just asks GitHub directly.
import { writeFileSync } from 'node:fs'
import { allPaths } from '../src/lib/github-data.js'

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'davidx3d-portfolio' }
if (token) headers.Authorization = `Bearer ${token}`

const paths = {}
const failed = []
await Promise.all(
  allPaths().map(async ([path, select]) => {
    try {
      const res = await fetch(`https://api.github.com${path}`, { headers })
      if (!res.ok) throw new Error(String(res.status))
      paths[path] = select(await res.json())
    } catch (e) {
      failed.push(`${path} (${e.message})`)
    }
  }),
)

if (Object.keys(paths).length) {
  writeFileSync('dist/github.json', JSON.stringify({ at: Date.now(), paths }))
  console.log(`github.json: ${Object.keys(paths).length} paths${token ? '' : ' (no token)'}`)
}
if (failed.length) console.warn(`github.json: skipped ${failed.length}:\n  ${failed.join('\n  ')}`)
