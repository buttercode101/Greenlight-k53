#!/usr/bin/env node
/** Validate that every referenced K53 sign is a complete, self-contained SVG. */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/svg:'([^']+)'/g)].map((match) => match[1]);
const uniqueRefs = [...new Set(refs)];
if (!uniqueRefs.length) throw new Error('No sign asset references found in index.html.');

const failures = [];
for (const ref of uniqueRefs) {
  if (!ref.startsWith('assets/signs/') || !ref.endsWith('.svg')) failures.push(`${ref}: sign references must use assets/signs/*.svg`);
  const fullPath = path.join(root, ref);
  try {
    const file = await readFile(fullPath, 'utf8');
    const fileStat = await stat(fullPath);
    if (!fileStat.size || !/^<svg(?:\s|>)/i.test(file.trim()) || !/<\/svg>\s*$/i.test(file)) failures.push(`${ref}: not a complete, non-empty SVG`);
    if (!/viewBox=/i.test(file)) failures.push(`${ref}: missing viewBox`);
    if (!/<title>/i.test(file)) failures.push(`${ref}: missing accessible title`);
    if (/wikimedia error|<!doctype html/i.test(file)) failures.push(`${ref}: contains an error page rather than a sign`);
  } catch (error) { failures.push(`${ref}: ${error.code ?? error.message}`); }
}
const signDir = path.join(root, 'assets/signs');
for (const name of await readdir(signDir)) if (name.endsWith('.png')) failures.push(`assets/signs/${name}: legacy PNG files are not allowed`);
if (failures.length) throw new Error(`Asset verification failed:\n${failures.join('\n')}`);
console.log(`Verified ${refs.length} sign references (${uniqueRefs.length} self-contained SVG assets).`);
