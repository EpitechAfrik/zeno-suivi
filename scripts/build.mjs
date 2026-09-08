// Injecte les données générées dans index.html, puis relance bake.mjs.
//
//   node scripts/build.mjs
//
// Deux blocs de index.html sont réécrits entre leurs marqueurs :
//   /*@GIT-MATRIX*/   … /*@/GIT-MATRIX*/   ← data/git-matrix.json   (historique git, périmètre par développeur)
//   /*@PLAN-SNAPSHOT*/ … /*@/PLAN-SNAPSHOT*/ ← data/plan-snapshot.json (demandes, ressources, réglages, exportés de l'artifact Claude)
// Tout le reste de index.html (PROJECTS, ROADMAP, le code) est édité à la main.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

function inject(name, constName, file) {
  const open = `/*@${name}*/`, close = `/*@/${name}*/`;
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1 || b < a) throw new Error(`build.mjs: marqueurs ${open} … ${close} introuvables dans index.html`);
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
  const body = `\nconst ${constName} = ${JSON.stringify(data).replace(/<\//g, '<\\/')};\n`;
  html = html.slice(0, a + open.length) + body + html.slice(b);
  console.log(`build.mjs: ${constName} ← data/${file}`);
}
inject('GIT-MATRIX', 'GIT', 'git-matrix.json');
inject('PLAN-SNAPSHOT', 'SNAPSHOT', 'plan-snapshot.json');
fs.writeFileSync(indexPath, html);
execFileSync(process.execPath, [path.join(__dirname, 'bake.mjs')], { stdio: 'inherit' });
