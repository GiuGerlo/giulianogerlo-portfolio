// TEMPORAL: showcase visual de los primitives UI para revisar en dev.
// En Phase 4 esto se reemplaza por las 8 secciones reales (Hero, About,
// Skills, AI, Projects, Experience, Education, Contact).
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Chip from '../components/ui/Chip.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';

/**
 * Home — placeholder con showcase de primitives.
 *
 * Cuando arranquemos las secciones reales (Phase 4) este archivo queda:
 *   <Hero /> <About /> <Skills /> ...
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
      <p className="mb-12 text-text-muted">Home page</p>

      {/* === SectionHeading === */}
      <SectionHeading
        eyebrow="// preview — primitives"
        title="UI primitives showcase"
        subtitle="Componentes base del sistema visual. Se borra cuando arranquen las secciones reales."
        id="preview"
      />

      {/* === Buttons === */}
      <div className="mb-10">
        <h3 className="mb-3 font-mono text-sm text-text-muted">
          Button variants
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      {/* === Chips === */}
      <div className="mb-10">
        <h3 className="mb-3 font-mono text-sm text-text-muted">Chips</h3>
        <div className="flex flex-wrap gap-2">
          <Chip variant="dot">Disponible para proyectos</Chip>
          <Chip>📍 Rosario, AR</Chip>
          <Chip>🇪🇸 Español</Chip>
          <Chip>Cursando React Cert · DigitalHouse</Chip>
        </div>
      </div>

      {/* === Inputs + Textarea === */}
      <div className="mb-10 max-w-md">
        <h3 className="mb-3 font-mono text-sm text-text-muted">
          Form primitives
        </h3>
        <Input label="Tu nombre" placeholder="Giuliano Gerlo" />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error="Formato inválido"
        />
        <Textarea label="Mensaje" placeholder="Contame tu proyecto..." />
      </div>
    </div>
  );
}
