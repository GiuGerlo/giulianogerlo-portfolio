// Sections del Home. Se van sumando en orden Phase 4.1 → 4.8.
import Hero from '../components/sections/Hero.jsx';
import About from '../components/sections/About.jsx';

/**
 * Home — landing page. Composición de las secciones del portfolio.
 *
 * Phase 4 las va agregando una por una. Cuando estén todas:
 *   <Hero /> <About /> <Skills /> <AISection />
 *   <Projects /> <Experience /> <Education /> <Contact />
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}
