import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
  ['security-headers.mjs', '--check'], ['verify.mjs'], ['verify-content.mjs'],
  ['verify-offline.mjs'], ['verify-assessment.mjs'], ['verify-recovery.mjs'],
  ['build-content-register.mjs', '--check'], ['verify-review.mjs'],
  ['verify-product-evidence.mjs'], ['verify-signs.mjs'],
];
let failures = 0;
for (const [script, ...args] of checks) {
  console.log(`\nChecking ${script}`);
  const result = spawnSync(process.execPath, [`scripts/${script}`, ...args], {cwd: root, stdio: 'inherit'});
  if (result.error || result.status !== 0) failures++;
}
console.log(`\n${checks.length - failures}/${checks.length} verification commands passed.`);
process.exitCode = failures ? 1 : 0;
