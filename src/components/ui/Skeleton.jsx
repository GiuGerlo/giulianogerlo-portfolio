import { cn } from '../../lib/cn.js';

/**
 * Skeleton — placeholder gris con pulso para estados de carga.
 *
 * Por qué existe: las secciones que leen de Supabase (Hero, About, Skills,
 * AI, Experiencia, Educación) mostraban el contenido hardcodeado de fallback
 * mientras cargaba la DB y después lo reemplazaban por el real → "flash" de
 * contenido viejo (mala UX). Ahora durante el `loading` muestran skeletons
 * de este tipo, y el fallback estático queda SOLO para el caso de error real.
 *
 * Es un div tonto: `animate-pulse` (Tailwind) + color de borde tenue. El
 * caller pasa el tamaño/forma via `className` (alto, ancho, rounded) para
 * que el placeholder ocupe el mismo lugar que el contenido final y no haya
 * salto de layout (CLS).
 */
export default function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-border/50', className)}
    />
  );
}
