// Assemble data/plan-snapshot.json à partir d'un export de la base de
// l'artifact Claude « Plan de charge » (outil Artifact, action read_db avec
// out_dir) :
//   <dump>/demandes/<id>.json   (un fichier par demande)
//   <dump>/resources/<slug>.json
//   <dump>/settings/plan.json
//
//   node scripts/snapshot-from-dump.mjs <dossier-dump>
//
// Puis : node scripts/build.mjs   (injecte le snapshot dans index.html et
// relance bake.mjs). Voir RULES.md §9.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dump = process.argv[2];
if (!dump || !fs.existsSync(dump)) {
  console.error('usage: node scripts/snapshot-from-dump.mjs <dossier-dump>');
  process.exit(1);
}
const readDir = (sub) => {
  const dir = path.join(dump, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({
    id: f.replace(/\.json$/, ''),
    ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')),
  }));
};
const demandes = readDir('demandes');
const resources = Object.fromEntries(readDir('resources').map(({ id, ...r }) => [id, r]));
const settingsPath = path.join(dump, 'settings', 'plan.json');
const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : null;
if (!demandes.length) {
  console.error('snapshot-from-dump: aucune demande trouvée dans', path.join(dump, 'demandes'));
  process.exit(1);
}
const out = { exportedAt: new Date().toISOString(), demandes, resources, settings };
const target = path.join(__dirname, '..', 'data', 'plan-snapshot.json');
fs.writeFileSync(target, JSON.stringify(out, null, 1) + '\n');
console.log(`snapshot-from-dump: ${demandes.length} demandes, ${Object.keys(resources).length} ressources → data/plan-snapshot.json`);
