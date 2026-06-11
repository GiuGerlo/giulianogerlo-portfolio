#!/usr/bin/env node
/**
 * lint-changed.mjs — hook PostToolUse(Edit|Write) de Claude Code.
 *
 * Corre ESLint sobre el archivo .js/.jsx recién editado y muestra los
 * problemas como AVISO. NO bloquea, NO auto-fixea: el edit ya pasó, esto
 * solo informa para corregir en el próximo paso.
 *
 * Diseño: exit 0 SIEMPRE (warn-only). Si eslint falla o no está, salimos
 * en silencio — un hook nunca debe entorpecer la edición.
 */

import process from 'node:process';
import { execSync } from 'node:child_process';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    setTimeout(() => resolve(data), 2000);
  });
}

const raw = await readStdin();

let filePath = '';
try {
  const payload = JSON.parse(raw);
  filePath = payload?.tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}

// Solo JS/JSX. Otros archivos (md, json, css) no se lintean.
if (!/\.(js|jsx|mjs|cjs)$/.test(filePath)) process.exit(0);

try {
  // eslint sale con código !=0 si hay problemas → lo capturamos en catch.
  execSync(`pnpm exec eslint "${filePath}"`, {
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000,
  });
  // Sin problemas: silencio.
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim();
  if (out) {
    process.stderr.write(
      `[lint-changed] ESLint reportó problemas en ${filePath} ` +
        `(aviso, no bloqueante):\n${out}\n`,
    );
  }
}

// Siempre permitimos.
process.exit(0);
