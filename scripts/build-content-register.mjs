import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { applyReviews, requireReviewedRelease } from './review-records.mjs';
import { BANK } from '../assets/decision/bank.js';
import { questionSource } from '../assets/decision/sources.js';

// The live content is BANK (82 decision cards). The root content-register.json
// also carries frozen legacy records generated from inline data that has since
// been deleted; they can no longer be regenerated, so --check only proves
// their recorded reviews still bind to unchanged fingerprints.
const fingerprint = (q) => crypto.createHash('sha256').update(JSON.stringify(q)).digest('hex');
const decisionRegister = () => ({
  version: 1,
  scope: 'Selected light-vehicle decision practice; not a complete syllabus or independent instructor sign-off',
  items: BANK.map((q) => ({ id: q.id, sha256: fingerprint(q), source: questionSource(q) })),
});

const root = JSON.parse(fs.readFileSync('content-register.json', 'utf8'));
const reviews = JSON.parse(fs.readFileSync('content-reviews.json', 'utf8'));

function authoritativeDecisionRegister() {
  const onDisk = JSON.parse(fs.readFileSync('assets/decision/content-register.json', 'utf8'));
  assert.equal(onDisk.items.length, 82, 'Decision register must hold 82 items');
  assert.deepEqual(onDisk.items.map((x) => x.id), BANK.map((q) => q.id), 'Decision register ids must match BANK order');
  for (const q of BANK) {
    const item = onDisk.items.find((x) => x.id === q.id);
    assert.equal(item.sha256, fingerprint(q), 'Stale fingerprint: ' + q.id);
    assert.deepEqual(item.source, questionSource(q), 'Source drift: ' + q.id);
  }
  return onDisk;
}

if (process.argv.includes('--check')) {
  authoritativeDecisionRegister();
  // The root register's living part is its decision supplement pointer.
  const supplement = root.supplements.find((s) => s.id === 'decision-practice');
  assert(supplement, 'Decision supplement missing from root register');
  assert.equal(supplement.items, BANK.length, 'Supplement must declare 82 items');
  assert.equal(supplement.path, 'assets/decision/content-register.json');
  // Every recorded review must still bind to its record fingerprint; a stale
  // or unknown review throws inside applyReviews.
  applyReviews(structuredClone(root.records), reviews.entries);
  if (process.argv.includes('--require-reviewed')) requireReviewedRelease(root.records);
  console.log(
    'Content register fresh: 82/82 BANK fingerprints match the decision register; ' +
      root.records.length + ' legacy records still bind to ' + reviews.entries.length + ' recorded reviews.',
  );
} else {
  fs.writeFileSync('assets/decision/content-register.json', JSON.stringify(decisionRegister(), null, 2) + '\n');
  console.log('Registered', BANK.length, 'decision items; external review pending.');
}
