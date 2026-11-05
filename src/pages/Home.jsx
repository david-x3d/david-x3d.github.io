import { useEffect } from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'

const TITLE = 'davidx3d · Android apps and small tools'

export default function Home() {
  useEffect(() => {
    document.title = TITLE
  }, [])
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  )
}
