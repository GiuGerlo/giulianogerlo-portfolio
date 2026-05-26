/**
 * ProjectCardSkeleton — placeholder visual de una card de proyecto
 * mientras `useProjects()` está fetching desde Supabase.
 *
 * Por qué existe:
 *  - Sin skeleton, durante el primer render `Projects` mostraría un
 *    espacio vacío (la grid se "colapsa" hasta que llega la data y
 *    aparecen las cards de golpe). El layout pega un salto feo, sobre
 *    todo en conexiones lentas.
 *  - Un skeleton mantiene la altura ocupada y le da al usuario una
 *    señal visual de que algo está cargando.
 *
 * Implementación:
 *  - Calca la estructura de `ProjectCard` (imagen 16:10 + body con tag
 *    + título + summary + chips de stack) pero con bloques grises.
 *  - `animate-pulse` (Tailwind built-in) hace que la opacidad oscile
 *    sutilmente — refuerza la idea de "esto se está cargando".
 *  - aria-hidden + role="presentation": invisible para lectores de
 *    pantalla; el mensaje accesible lo da el contenedor en Projects.jsx.
 */
export default function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated"
    >
      {/* Bloque imagen — mismo aspect ratio que la card real (16:10). */}
      <div className="aspect-[16/10] w-full border-b border-border bg-border/60" />

      {/* Body — replica el spacing de la card real (p-6). */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Tag de categoría */}
        <div className="h-5 w-28 rounded bg-border/60" />
        {/* Título */}
        <div className="h-6 w-3/4 rounded bg-border/60" />
        {/* Rol */}
        <div className="h-3 w-1/2 rounded bg-border/40" />
        {/* Summary (2 líneas) */}
        <div className="h-3 w-full rounded bg-border/40" />
        <div className="h-3 w-5/6 rounded bg-border/40" />

        {/* Stack chips */}
        <div className="mt-2 flex gap-1.5">
          <div className="h-5 w-14 rounded bg-border/60" />
          <div className="h-5 w-12 rounded bg-border/60" />
          <div className="h-5 w-16 rounded bg-border/60" />
        </div>
      </div>
    </div>
  );
}
