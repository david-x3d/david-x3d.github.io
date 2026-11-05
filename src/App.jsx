import { MotionConfig } from 'motion/react'
import Header from './components/Header'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import NotFound from './pages/NotFound'
import { usePath } from './lib/router'
import { projects } from './projects'

export default function App() {
  const path = usePath()
  const slug = path.replace(/^\/+|\/+$/g, '').toLowerCase()
  const project = slug && projects.find((p) => p.slug === slug && p.page)

  let page = <NotFound />
  if (!slug || slug === 'index.html') page = <Home />
  else if (project) page = <ProjectPage key={slug} project={project} />

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>{page}</main>
    </MotionConfig>
  )
}
