import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon } from 'lucide-react';

import { cn } from '../../lib/cn.js';

/**
 * ToolbarButton — un botón de marca de la toolbar. A nivel módulo (no dentro
 * del render) para no recrear el componente en cada render.
 *  - active → resalta si el cursor está sobre esa marca (isActive de TipTap).
 */
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded transition-colors',
        active
          ? 'bg-accent/15 text-accent'
          : 'text-text-muted hover:bg-bg hover:text-text-primary',
      )}
    >
      {children}
    </button>
  );
}

/**
 * RichTextEditor — editor de texto enriquecido (WYSIWYG) para los párrafos
 * del About, construido sobre TipTap v3.
 *
 * Es CONTROLADO en markdown: `value` (string markdown) entra, `onChange`
 * (string markdown) sale. Así encaja con <Controller> de react-hook-form
 * igual que ImageUpload — y la DB sigue guardando markdown (el seed, el
 * fallback y el render público con react-markdown NO cambian).
 *
 * Por qué TipTap escribe/lee markdown y no HTML: la extensión oficial
 * `@tiptap/markdown` agrega `editor.getMarkdown()` y permite
 * `setContent(md, { contentType: 'markdown' })`. Internamente TipTap trabaja
 * con su propio doc, pero hacia afuera solo vemos markdown.
 *
 * Formato permitido: SOLO inline (negrita, itálica, links). Desactivamos
 * headings/listas/blockquote/code en StarterKit porque romperían el layout
 * del About (que estila solo texto inline: strong/em/a).
 *
 * Sincronización controlada (patrón clave con TipTap):
 *  - onUpdate → onChange(markdown actual). Esto corre en cada tecla.
 *  - useEffect → si `value` externo (ej. el reset() del form al cargar la
 *    fila) difiere del markdown actual del editor, hacemos setContent. La
 *    comparación evita re-setear en cada tecla (eso reposicionaría el cursor).
 */
export default function RichTextEditor({ value, onChange, label }) {
  const editor = useEditor({
    // immediatelyRender false: evita el render síncrono inicial (recomendado
    // para entornos sin DOM completo / SSR). Acá lo dejamos por robustez.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Apagamos todo lo que sea bloque — solo queremos texto inline.
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Markdown,
      // openOnClick false: en el editor no queremos navegar al click, solo editar.
      Link.configure({ openOnClick: false }),
    ],
    content: value ?? '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getMarkdown());
    },
  });

  // Sincroniza contenido externo → editor (ej. reset() del form tras el fetch).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getMarkdown();
    if ((value ?? '') !== current) {
      // emitUpdate false: no disparamos onUpdate (sino loop con onChange).
      editor.commands.setContent(value ?? '', {
        contentType: 'markdown',
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  // Toggle de link: si ya hay link lo saca; sino pide la URL por prompt.
  // prompt() nativo: simple y suficiente (un solo escritor admin).
  function toggleLink() {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('URL del link:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      <div className="rounded-md border border-border bg-bg focus-within:border-accent">
        {/* Toolbar. editor puede ser null en el primer render → los handlers
            chequean editor antes de actuar. */}
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          <ToolbarButton
            title="Negrita"
            active={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold size={16} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            title="Itálica"
            active={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            title="Link"
            active={editor?.isActive('link')}
            onClick={toggleLink}
          >
            <LinkIcon size={16} aria-hidden="true" />
          </ToolbarButton>
        </div>

        {/* Área editable. Las clases [&_*] estilan el contenido renderizado
            por ProseMirror (negrita/itálica/links) y dan el padding + min-h
            tipo Textarea. outline-none saca el borde feo del contenteditable. */}
        <EditorContent
          editor={editor}
          className="min-h-[120px] px-3.5 py-2.5 text-sm text-text-primary [&_a]:text-accent [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]"
        />
      </div>
    </div>
  );
}
