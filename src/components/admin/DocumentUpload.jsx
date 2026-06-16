import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn.js';
import {
  uploadDocument,
  removeFile,
  DOCUMENT_ACCEPTED_MIME,
  MAX_DOC_SIZE_BYTES,
} from '../../lib/storage.js';

/**
 * DocumentUpload — subir un documento (PDF o imagen) al bucket `documents`.
 * Variante simple de ImageUpload: single-file, sin galería ni reorder ni
 * preview de imagen. Muestra el archivo actual como link "Ver" + botón quitar.
 *
 * Controlado (value/onChange en el parent vía react-hook-form):
 *  - value: string — URL actual del documento (o '').
 *  - onChange: (url) => void.
 *  - slug: string — prefijo del nombre en el bucket (ej. 'cv', 'cert-react').
 *  - label: string.
 *
 * Validación mime+tamaño: react-dropzone (accept/maxSize) Y uploadDocument
 * (defensa en profundidad). Al reemplazar, borra el documento anterior del
 * bucket (removeFile, no-op si era un path de /public).
 */
export default function DocumentUpload({ value, onChange, slug, label }) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  async function handleDrop(acceptedFiles) {
    const file = acceptedFiles[0];
    if (!file) return;
    setLocalError(null);
    setUploading(true);
    try {
      const url = await uploadDocument(file, slug);
      // Si había un documento anterior en NUESTRO bucket, lo borramos.
      if (value) await removeFile(value);
      onChange(url);
    } catch (err) {
      setLocalError(err.message ?? 'No pude subir el archivo.');
    } finally {
      setUploading(false);
    }
  }

  function handleDropRejected(fileRejections) {
    const code = fileRejections[0]?.errors[0]?.code;
    if (code === 'file-too-large') {
      setLocalError('El archivo supera los 8 MB.');
    } else if (code === 'file-invalid-type') {
      setLocalError('Formato no permitido. Usá PDF, JPG, PNG o WebP.');
    } else {
      setLocalError('Archivo no válido.');
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: DOCUMENT_ACCEPTED_MIME,
    maxSize: MAX_DOC_SIZE_BYTES,
    multiple: false,
    disabled: uploading,
    onDrop: handleDrop,
    onDropRejected: handleDropRejected,
  });

  async function handleRemove() {
    const old = value;
    onChange('');
    await removeFile(old);
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {/* Archivo actual: link "Ver" + quitar. Solo si hay value. */}
      {value && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3 py-2">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 font-mono text-xs text-accent hover:underline"
          >
            <FileText size={14} aria-hidden="true" />
            <span className="truncate">Ver archivo actual</span>
          </a>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Quitar archivo"
            className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-red-500"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Dropzone (siempre visible: subir reemplaza el actual). */}
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/60',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin text-accent" aria-hidden="true" />
            <span className="text-sm text-text-muted">Subiendo…</span>
          </>
        ) : (
          <>
            <UploadCloud size={20} className="text-text-muted" aria-hidden="true" />
            <span className="text-sm text-text-primary">
              {isDragActive ? 'Soltá el archivo acá' : 'Arrastrá un archivo o hacé click'}
            </span>
            <span className="text-xs text-text-muted">PDF, JPG, PNG o WebP · máx. 8 MB</span>
          </>
        )}
      </div>

      {localError && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {localError}
        </p>
      )}
    </div>
  );
}
