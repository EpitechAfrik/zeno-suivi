// Regénère le contenu statique d'index.html à partir de l'objet PROJECTS
// déclaré dans son propre <script>. Nécessaire car la page est aussi lue par
// des aperçus qui bloquent le JavaScript (Gmail, WhatsApp Web...) — sans ce
// script, ces aperçus n'afficheraient rien du tout.
//
// À lancer après CHAQUE modification de PROJECTS dans index.html :
//   node scripts/bake.mjs
//
// Voir RULES.md pour les règles de contenu (statuts, sources, etc.).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('bake.mjs: aucun <script> trouvé dans index.html');
  process.exit(1);
}
const scriptBody = scriptMatch[1];

const fakeEl = () => ({
  innerHTML: '', textContent: '', value: '', style: {}, classList: { add(){}, remove(){}, toggle(){} },
  addEventListener(){}, querySelectorAll: () => [], querySelector: () => fakeEl(),
  closest: () => fakeEl(), focus(){}, select(){},
});
const sandbox = {
  document: {
    getElementById: () => fakeEl(),
    querySelectorAll: () => [],
    querySelector: () => fakeEl(),
    addEventListener(){},
  },
  console,
};

const fn = new Function(
  ...Object.keys(sandbox),
  scriptBody + '\nreturn { PROJECTS, STATUS_LABEL, STATUS_CLASS, CDC_CLASS, CDC_LABEL };'
);
const { PROJECTS, STATUS_LABEL, STATUS_CLASS, CDC_CLASS, CDC_LABEL } = fn(...Object.values(sandbox));

const zeno = PROJECTS.zeno.modules;

function tabsHtml() {
  return Object.entries(PROJECTS).map(([key, p]) => `
      <button class="project-tab ${key === 'zeno' ? 'active' : ''}" data-project="${key}">
        ${p.label}<span class="count">${p.modules.length}</span>
      </button>
    `).join('');
}

const bannerHtml = '';

function summaryHtml(modules) {
  const counts = { fonctionnel: 0, 'en-cours': 0, bloque: 0, 'pas-demarre': 0, sansCdc: 0 };
  modules.forEach((m) => { counts[m.status]++; if (m.cdc === 'non') counts.sansCdc++; });
  return `
      <div class="stat ok" data-stat="fonctionnel" tabindex="0"><span class="n">${counts.fonctionnel}</span><span class="l">Fonctionnels</span></div>
      <div class="stat warn" data-stat="en-cours" tabindex="0"><span class="n">${counts['en-cours']}</span><span class="l">En cours</span></div>
      <div class="stat crit" data-stat="bloque" tabindex="0"><span class="n">${counts.bloque}</span><span class="l">Bloqués</span></div>
      <div class="stat idle" data-stat="pas-demarre" tabindex="0"><span class="n">${counts['pas-demarre']}</span><span class="l">Pas démarrés</span></div>
      <div class="stat crit" data-stat-cdc="non" tabindex="0"><span class="n">${counts.sansCdc}</span><span class="l">Sans CDC</span></div>
    `;
}

function modulesHtml(list) {
  return list.map((m, i) => `
      <div class="module" data-idx="${i}">
        <div class="module-row" data-toggle="${i}" tabindex="0">
          <div><span class="module-name">${m.name}</span><span class="module-desc">${m.desc}</span></div>
          <div class="status-cell">
            <span class="pill ${STATUS_CLASS[m.status]}">${STATUS_LABEL[m.status]}</span>
            ${m.blocker ? `<span class="blocker-tag">${m.blocker}</span>` : ''}
          </div>
          <span class="cdc ${CDC_CLASS[m.cdc]}">CDC&nbsp;${CDC_LABEL[m.cdc]}</span>
          <span class="owner clickable" data-contact="${i}" title="Voir porteur et interlocuteur"><span>${m.owner}${m.role ? `<span class="role"> · ${m.role}</span>` : ''}</span><span class="info-icon">&#9432;</span></span>
          <span class="when ${m.stale ? 'stale' : ''}">${m.when}</span>
          <span class="chevron">&#8250;</span>
        </div>
        <div class="tasks">
          <div class="tasks-inner">
            ${m.tasks.map((t) => `
              <div class="task">
                <span class="t-status ${t.status}"></span>
                <span class="t-label">${t.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
}

const resultCountText = `${zeno.length} chantiers affichés sur ${zeno.length}`;

function rebuildSection(html, id, newInner) {
  const startMarker = `id="${id}">`;
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return html;
  const contentStart = startIdx + startMarker.length;
  let depth = 1;
  let i = contentStart;
  while (depth > 0 && i < html.length) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      i = nextClose + 6;
    }
  }
  const contentEnd = i - 6;
  return html.slice(0, contentStart) + newInner + html.slice(contentEnd);
}

let out = html;
out = rebuildSection(out, 'project-tabs', tabsHtml());
out = rebuildSection(out, 'banner', bannerHtml);
out = rebuildSection(out, 'summary', summaryHtml(zeno));
out = rebuildSection(out, 'modules', modulesHtml(zeno));
out = rebuildSection(out, 'result-count', resultCountText);

fs.writeFileSync(indexPath, out);
console.log('bake.mjs: index.html mis à jour.');
