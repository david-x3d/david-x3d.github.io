// Static hosts only know about files. Give every project page its own copy of index.html,
// so /nomi loads the app with a 200, and use it as 404.html for everything else.
import { copyFileSync, mkdirSync } from 'node:fs'
import { projects } from '../src/projects.js'

const index = 'dist/index.html'
for (const p of projects) {
  if (!p.slug || !p.page) continue
  mkdirSync(`dist/${p.slug}`, { recursive: true })
  copyFileSync(index, `dist/${p.slug}/index.html`)
}
copyFileSync(index, 'dist/404.html')
