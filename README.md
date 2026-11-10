# davidx3d

My portfolio site. React + Vite + Tailwind CSS, animations with [Motion](https://motion.dev).

## Run it locally

Use Node.js 22, matching [`.nvmrc`](.nvmrc) and the deployment workflow.

```bash
npm ci
npm run dev
```

Then open http://localhost:5173.

## Editing projects

All project cards live in [`src/projects.js`](src/projects.js). Add, remove or reorder objects there; the filter buttons are built from the `platforms` field and star counts are fetched from GitHub automatically. The comment at the top of the file lists every field and the available card animations.

Every project has its own page at `/<slug>`, built from its `page` object (the comment at the top of the file lists every field). Screenshots for those pages go in `public/projects/<slug>/`.

Repo count, stars, languages, the 30-day activity grid, and each project page's releases, downloads and commits come from GitHub. The deploy workflow saves them to `github.json` every 30 minutes with its own token, so they always show up; on top of that the browser asks the GitHub API directly when the snapshot is a few minutes old, until the visitor's hourly limit of 60 requests runs out.

The Discord link in the contact section is set by `discord` at the top of `src/projects.js`.

## Deploy

### GitHub Pages

The site lives at https://david-x3d.github.io. Every push to `main` builds it and publishes it with the workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). In the repo settings, **Pages → Source** must be set to **GitHub Actions**.

The build copies `index.html` to `<slug>/index.html` for every project page and to `404.html` (see [`scripts/spa-pages.mjs`](scripts/spa-pages.mjs)), so links like `/nomi` work on a static host.

### Cloudflare Pages (alternative)

Connect the repo under **Workers & Pages → Create → Pages → Connect to Git**, with build command `npm run build` and output directory `dist`. The `.nvmrc` file tells Cloudflare to build with Node 22. Or upload from your machine:

```bash
npm run build
npx wrangler pages deploy dist --project-name davidx3d
```
