#!/usr/bin/env node
/**
 * secret-guard.mjs — hook PreToolUse(Bash) de Claude Code.
 *
 * Refuerzo contra subir secretos a este repo PÚBLICO. Bloquea comandos `git`
 * (add/commit/push/stage) que toquen archivos sensibles o que contengan
 * patrones de secreto en la línea. La protección primaria es `.gitignore`;
 * esto es defensa en profundidad.
 *
 * Protocolo de hooks:
 *  - Lee JSON por stdin: { tool_name, tool_input: { command }, ... }.
 *  - Para BLOQUEAR: exit code 2 + motivo por stderr (Claude lo recibe).
 *  - Para permitir: exit 0.
 *
 * Diseño FAIL-OPEN: ante cualquier error (parseo, etc.) sale 0 (permite).
 * Un bug en el hook NUNCA debe brickear la sesión bloqueando todo bash.
 */

import process from 'node:process';

// Archivos que jamás deben entrar a git (más allá del .gitignore).
const SENSITIVE_FILES = ['.env', '.claude.json', 'settings.local.json'];

// Patrones de secreto que no deberían viajar en un comando.
const SECRET_PATTERNS = [
  /service_role/i,
  /SUPABASE_SERVICE_ROLE/i,
  /\beyJ[A-Za-z0-9_-]{12,}/, // JWT (anon/service key de Supabase)
  /\bsk-[A-Za-z0-9]{20,}/, // API keys estilo OpenAI/Resend
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    // Si no llega nada en 2s, resolvemos vacío (fail-open).
    setTimeout(() => resolve(data), 2000);
  });
}

function block(reason) {
  process.stderr.write(`[secret-guard] BLOQUEADO: ${reason}\n`);
  process.exit(2);
}

const raw = await readStdin();

let command = '';
try {
  const payload = JSON.parse(raw);
  command = payload?.tool_input?.command ?? '';
} catch {
  process.exit(0); // fail-open: no pude parsear → permito.
}

if (!command) process.exit(0);

// Solo nos interesan comandos git que escriben/stagean.
const isGitWrite = /\bgit\s+(add|commit|push|stage)\b/.test(command);

if (isGitWrite) {
  // ¿Menciona explícitamente un archivo sensible? (excepto .env.example)
  for (const f of SENSITIVE_FILES) {
    // Match del nombre como token, evitando .env.example.
    const re = new RegExp(`(^|[\\s'"/])${f.replace('.', '\\.')}(?!\\.example)([\\s'"]|$)`);
    if (re.test(command)) {
      block(
        `el comando git toca "${f}" (sensible, repo público). ` +
          `Si es a propósito, hacelo a mano fuera de Claude.`,
      );
    }
  }
}

// En cualquier comando: secreto literal embebido en la línea.
for (const pat of SECRET_PATTERNS) {
  if (pat.test(command)) {
    block(
      `el comando contiene lo que parece un secreto (patrón ${pat}). ` +
        `No lo pongas en la línea de comando.`,
    );
  }
}

process.exit(0);
