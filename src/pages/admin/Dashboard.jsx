import { Link } from 'react-router-dom';
import {
  FolderGit2,
  User,
  Globe,
  Layers,
  Sparkles,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Plus,
  Eye,
  ExternalLink,
  BarChart3,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { useDashboardStats } from '../../hooks/useDashboardStats.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useChatLogs } from '../../hooks/useChatLogs.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';

// URL pública del sitio (para los accesos "Ver sitio").
const SITE_URL = 'https://giulianogerlo.vercel.app';

// Accesos rápidos a cada sección editable del admin.
const QUICK_LINKS = [
  { to: '/admin/proyectos', label: 'Proyectos', icon: FolderGit2 },
  { to: '/admin/perfil', label: 'Perfil', icon: User },
  { to: '/admin/sitio', label: 'Sitio', icon: Globe },
  { to: '/admin/skills', label: 'Skills', icon: Layers },
  { to: '/admin/ai', label: 'AI', icon: Sparkles },
  { to: '/admin/experiencia', label: 'Experiencia', icon: Briefcase },
  { to: '/admin/educacion', label: 'Educación', icon: GraduationCap },
  { to: '/admin/chats', label: 'Chats', icon: MessageCircle },
];

export default function Dashboard() {
  useDocumentTitle('Panel admin — Giuliano Gerlo');

  const { stats, loading } = useDashboardStats();
  const { data: site } = useSiteSettings();
  const { data: profile } = useProfile();
  const { data: conversations } = useChatLogs();

  // Stat cards: derivadas de los counts. value = string ya formateado.
  const statCards = stats
    ? [
        {
          label: 'Proyectos',
          value: `${stats.projectsPublished}/${stats.projectsTotal}`,
          hint: 'publicados / total',
          icon: FolderGit2,
        },
        { label: 'Experiencias', value: stats.experience, icon: Briefcase },
        { label: 'Grupos de skills', value: stats.skillGroups, icon: Layers },
        { label: 'Skills de IA', value: stats.aiSkills, icon: Sparkles },
        { label: 'Educación', value: stats.education, icon: GraduationCap },
        {
          label: 'Chats',
          value: stats.chatsTotal,
          hint: `${stats.chats7d} en los últimos 7 días`,
          icon: MessageCircle,
        },
      ]
    : [];

  // Borradores sin publicar (para el panel de estado).
  const drafts = stats ? stats.projectsTotal - stats.projectsPublished : 0;

  // Últimas 5 conversaciones para el preview.
  const recentChats = (conversations ?? []).slice(0, 5);

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="// admin"
        title="Panel"
        subtitle="Resumen del contenido del sitio y accesos rápidos."
      />

      {/* ── Stat cards ── */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-bg-elevated p-5"
              >
                <div className="mb-2 flex items-center gap-2 text-text-muted">
                  <s.icon size={16} aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                <p className="text-3xl font-semibold text-text-primary">
                  {s.value}
                </p>
                {s.hint && (
                  <p className="mt-1 text-xs text-text-muted">{s.hint}</p>
                )}
              </div>
            ))}
      </div>

      {/* ── Accesos rápidos ── */}
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-text-muted">
        Accesos rápidos
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Link
          to="/admin/projects/new"
          className="flex items-center gap-2 rounded-xl border border-accent bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo proyecto
        </Link>

        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
          >
            <q.icon size={16} aria-hidden="true" />
            {q.label}
          </Link>
        ))}

        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          <Eye size={16} aria-hidden="true" />
          Ver sitio
        </a>
      </div>

      {/* ── Estado del sitio + Últimos chats (2 columnas en desktop) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estado del sitio */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-text-muted">
            Estado del sitio
          </h2>
          <ul className="space-y-3 text-sm">
            <StatusRow
              ok={Boolean(site?.cvUrl)}
              okText="CV cargado en Supabase"
              warnText="Usando el CV por defecto de /public"
              icon={FileText}
            />
            <StatusRow
              ok={Boolean(profile?.aboutImage)}
              okText="Foto del About cargada"
              warnText="Usando la foto por defecto de /public"
              icon={ImageIcon}
            />
            <StatusRow
              ok={drafts === 0}
              okText="Todos los proyectos publicados"
              warnText={`${drafts} proyecto(s) en borrador sin publicar`}
              icon={FolderGit2}
            />
          </ul>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-accent hover:underline"
          >
            <BarChart3 size={14} aria-hidden="true" />
            Ver analytics en Vercel
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </section>

        {/* Últimos chats */}
        <section className="rounded-xl border border-border bg-bg-elevated p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
              Últimos chats
            </h2>
            <Link
              to="/admin/chats"
              className="font-mono text-xs text-accent hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <p className="text-sm text-text-muted">
              Todavía no hay chats registrados.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentChats.map((conv) => (
                <li key={conv.id} className="flex items-start gap-2 text-sm">
                  <MessageCircle
                    size={14}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-text-muted"
                  />
                  <span className="truncate text-text-primary" title={conv.turns[0]?.message}>
                    {conv.turns[0]?.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}

/**
 * StatusRow — fila del panel "Estado del sitio". Verde con check si `ok`,
 * ámbar con alerta si no.
 */
function StatusRow({ ok, okText, warnText, icon: Icon }) {
  return (
    <li className="flex items-center gap-2">
      <Icon size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
      <span className="flex-1 text-text-muted">{ok ? okText : warnText}</span>
      {ok ? (
        <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-accent" />
      ) : (
        <AlertCircle size={16} aria-hidden="true" className="shrink-0 text-yellow-500" />
      )}
    </li>
  );
}
