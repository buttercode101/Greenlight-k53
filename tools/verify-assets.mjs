#!/usr/bin/env node
/** Validate that every K53 sign asset referenced by the app is a present, parseable SVG. */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/svg:'([^']+)'/g)].map((match) => match[1]);
const uniqueRefs = [...new Set(refs)];
if (!uniqueRefs.length) throw new Error('No sign asset references found in index.html.');

const failures = [];
for (const ref of uniqueRefs) {
  const fullPath = path.join(root, ref);
  try {
    const file = await readFile(fullPath, 'utf8');
    const fileStat = await stat(fullPath);
    if (!fileStat.size || !/<svg(?:\s|>)/i.test(file) || !/<\/svg>\s*$/i.test(file)) {
      failures.push(`${ref}: not a complete, non-empty SVG`);
    }
    if (!/viewBox=/i.test(file)) failures.push(`${ref}: missing viewBox`);
  } catch (error) {
    failures.push(`${ref}: ${error.code ?? error.message}`);
  }
}
if (failures.length) throw new Error(`Asset verification failed:\n${failures.join('\n')}`);
console.log(`Verified ${refs.length} sign references (${uniqueRefs.length} unique SVG assets).`);
