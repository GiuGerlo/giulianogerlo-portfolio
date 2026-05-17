// Custom hook que gestiona el <title> de la pestaña.
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// Sections del Home, en el orden en que se ven al scrollear.
import Hero from '../components/sections/Hero.jsx';
import About from '../components/sections/About.jsx';
import Skills from '../components/sections/Skills.jsx';
import AISection from '../components/sections/AISection.jsx';
import Projects from '../components/sections/Projects.jsx';
import Experience from '../components/sections/Experience.jsx';
import Education from '../components/sections/Education.jsx';
import Contact from '../components/sections/Contact.jsx';

/**
 * Home — landing page. Composición de las 8 secciones del portfolio.
 *
 * Cada sección es autónoma (trae su propia data + heading + layout) y
 * tiene su `id` para el anclaje del navbar (#hero, #about, #skills,
 * #ai, #projects, #experience, #education, #contact). Acá solo se
 * ordenan una abajo de la otra; el scroll es el flujo natural del doc.
 */
export default function Home() {
  // Título de la pestaña para el Home — el principal del sitio.
  useDocumentTitle('Giuliano Gerlo — Full-Stack Developer');

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <AISection />
      <Projects />
      <Experience />
      <Education />
      <Contact />
    </>
  );
}
