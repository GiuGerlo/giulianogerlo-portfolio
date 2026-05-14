// `useParams` es un hook de React Router que devuelve un objeto con los
// parámetros dinámicos de la URL. Para la ruta "/proyectos/:slug",
// useParams() devuelve { slug: "lo-que-haya-en-la-url" }.
import { useParams } from 'react-router-dom';

/**
 * ProjectDetail — página de detalle de un proyecto puntual.
 *
 * Stub mínimo por ahora: solo lee el slug de la URL y lo muestra.
 * En Phase 5 (Task 5.1) se completa: busca el proyecto en
 * src/data/projects.js, renderiza hero + stack + gallery + challenges,
 * y redirecciona a /404 si el slug no existe.
 */
export default function ProjectDetail() {
  // Destructuring del objeto que devuelve useParams.
  // Equivalente a: const slug = useParams().slug;
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
      <h1 className="text-3xl font-bold">Proyecto: {slug}</h1>
      <p className="mt-2 text-text-muted">
        Stub — el contenido real se implementa en Phase 5.
      </p>
    </div>
  );
}
