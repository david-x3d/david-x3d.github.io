// Static hosts only know about files. Give every project page its own copy of index.html,
// so /nomi loads the app with a 200 and shares with its own title and description,
// and use the plain copy as 404.html for everything else.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { projects } from '../src/projects.js'

const SITE = 'https://david-x3d.github.io'
const index = readFileSync('dist/index.html', 'utf8')
const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const p of projects) {
  if (!p.slug || !p.page) continue
  const title = escape(`${p.name} · davidx3d`)
  const description = escape(p.description)
  const html = index
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*"/g, `$1${description}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${SITE}/${p.slug}/"`)
  mkdirSync(`dist/${p.slug}`, { recursive: true })
  writeFileSync(`dist/${p.slug}/index.html`, html)
}
copyFileSync('dist/index.html', 'dist/404.html')
