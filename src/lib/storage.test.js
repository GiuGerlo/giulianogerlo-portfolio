import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del cliente Supabase ANTES de importar storage.js (que lo importa).
// Reproducimos solo la cadena que usamos: supabase.storage.from(bucket)
// → { upload, remove, getPublicUrl }.
const uploadMock = vi.fn();
const removeMock = vi.fn();
const getPublicUrlMock = vi.fn();

vi.mock('./supabase.js', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: uploadMock,
        remove: removeMock,
        getPublicUrl: getPublicUrlMock,
      }),
    },
  },
}));

// Import DESPUÉS del mock.
import { uploadImage, removeImage, fileToWebp, MAX_SIZE_BYTES } from './storage.js';

// Helper: fabrica un objeto tipo File falso (no necesitamos contenido real,
// solo `type` y `size` que es lo que validamos).
function fakeFile(type, size) {
  return { type, size, name: `f${Math.random()}` };
}

describe('uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/project-images/foo.webp' },
    });
  });

  it('rechaza mime no permitido sin tocar el bucket', async () => {
    await expect(uploadImage(fakeFile('image/gif', 1000), 'demo')).rejects.toThrow(
      /Formato no permitido/,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rechaza archivos que superan el máximo', async () => {
    await expect(
      uploadImage(fakeFile('image/png', MAX_SIZE_BYTES + 1), 'demo'),
    ).rejects.toThrow(/2 MB/);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('sube un archivo válido y devuelve la URL pública', async () => {
    const url = await uploadImage(fakeFile('image/webp', 1234), 'mi-proyecto');
    expect(uploadMock).toHaveBeenCalledOnce();
    // El path generado arranca con el slug.
    const pathArg = uploadMock.mock.calls[0][0];
    expect(pathArg).toMatch(/^mi-proyecto-\d+-[a-z0-9]+\.webp$/);
    expect(url).toContain('/project-images/');
  });

  it('usa "project" como prefijo cuando no hay slug', async () => {
    await uploadImage(fakeFile('image/jpeg', 100), '');
    const pathArg = uploadMock.mock.calls[0][0];
    expect(pathArg).toMatch(/^project-\d+/);
    // jpeg mapea a extensión .jpg.
    expect(pathArg).toMatch(/\.jpg$/);
  });

  it('tira error legible si el upload de Supabase falla', async () => {
    uploadMock.mockResolvedValue({ error: { message: 'boom' } });
    await expect(uploadImage(fakeFile('image/png', 100), 'x')).rejects.toThrow(
      /No pude subir/,
    );
  });
});

describe('fileToWebp', () => {
  // En jsdom no hay canvas 2d (getContext devuelve null) → fileToWebp cae
  // al archivo original sin tirar ni colgar. Eso es exactamente el fallback
  // robusto que queremos en navegadores sin soporte.
  it('devuelve el archivo original si no hay canvas (fallback)', async () => {
    const f = fakeFile('image/jpeg', 5000);
    const result = await fileToWebp(f);
    expect(result).toBe(f);
  });
});

describe('removeImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    removeMock.mockResolvedValue({ error: null });
  });

  it('borra del bucket cuando la URL es de nuestro Storage', async () => {
    await removeImage(
      'https://x.supabase.co/storage/v1/object/public/project-images/demo-123-abc.webp',
    );
    expect(removeMock).toHaveBeenCalledWith(['demo-123-abc.webp']);
  });

  it('es no-op para paths relativos viejos (public/)', async () => {
    await removeImage('/projects/gym-tracker-1.webp');
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('es no-op para URLs externas', async () => {
    await removeImage('https://otro-host.com/img.png');
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('es no-op para valores no-string', async () => {
    await removeImage(null);
    await removeImage(undefined);
    expect(removeMock).not.toHaveBeenCalled();
  });
});
