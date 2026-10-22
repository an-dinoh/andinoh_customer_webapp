// Copies the backend's captured API examples (the source of truth for request/response shapes) into
// test/fixtures/api-examples/ for the contract tests in src/services/api/__tests__/.
//
//   npm run api:examples [path/to/andinoh_monolith]
//
// Default monolith location: ../andinoh_backend/andinoh_monolith (or $ANDINOH_MONOLITH).
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const monolith = path.resolve(process.argv[2] ?? process.env.ANDINOH_MONOLITH ?? path.join(root, '../andinoh_backend/andinoh_monolith'));

for (const app of ['customer-app', 'shared']) {
  const from = path.join(monolith, 'docs', app, 'examples');
  const to = path.join(root, 'test/fixtures/api-examples', app);
  if (!fs.existsSync(from)) throw new Error(`No examples at ${from}`);
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  const files = fs.readdirSync(from).filter(f => f.endsWith('.json'));
  for (const f of files) fs.copyFileSync(path.join(from, f), path.join(to, f));
  console.log(`${app}: ${files.length} examples`);
}
