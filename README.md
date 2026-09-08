# Zeno Suivi

Page unique de suivi, publiée via GitHub Pages : https://epitechafrik.github.io/zeno-suivi/

Cinq vues, sélectionnées par onglet (et par ancre : `#chantiers`, `#avancement`, `#roadmap`, `#plan`, `#ressources`) :

| Vue | Contenu | Source | Qui met à jour |
|---|---|---|---|
| **Chantiers** | État de chaque chantier Zeno, CRM AEIG, EDMS : statut, CDC, porteur, blocage, sous-tâches | Lecture directe du code + suivi Excel de Rachad | Yemalin Modeste, à la main dans `index.html` (`PROJECTS`) |
| **Avancement V2** | Rapport direction de la réécriture Zeno V2 : % pondéré, 5 phases, fin estimée, messages clés | Roadmap + plan de charge | Calculé |
| **Roadmap V2** | Les 5 phases et 39 chantiers de `ROADMAP_V2.md`, état réel lu dans le code d'aeig-plateform, tickets Plane, ressource | `ROADMAP` dans `index.html` | À la main (RULES.md §10) |
| **Plan de charge** | Demandes en cours (tickets Plane + chantiers roadmap) affectées à une ressource, charge restante, échéancier par ressource | Instantané de l'artifact Claude « Plan de charge Zeno » | Édité dans l'artifact, republié ici (RULES.md §9) |
| **Ressources** | Qui a développé quoi depuis janvier 2026 (commits par module), fiches par personne, frise, points d'attention | Historique git de Zeno et d'aeig-plateform | Régénéré par Claude (RULES.md §11) |

**⚠️ Avant de modifier `index.html` : lire [`RULES.md`](./RULES.md).** Ça couvre le format des données, les règles de statut, et les étapes obligatoires après modification (`node scripts/bake.mjs` après une édition de `PROJECTS`, `node scripts/build.mjs` après un rafraîchissement des données du plan de charge).

## Fichiers

- `index.html` — la page. Trois blocs de données en tête de script : `PROJECTS` (chantiers, à la main), `ROADMAP` (roadmap V2, à la main), puis un bloc **généré** (`GIT`, `SNAPSHOT`) qu'on ne touche jamais à la main.
- `data/plan-snapshot.json` — dernier export de la base de l'artifact Claude (demandes, ressources, réglages, date d'export).
- `data/git-matrix.json` — matrice commits × modules × développeurs (Zeno `main` du 7 janvier au 27 août 2026, aeig-plateform jusqu'au 17 août).
- `scripts/bake.mjs` — copie statique du contenu des chantiers dans le HTML (aperçus sans JavaScript : Gmail, WhatsApp Web…).
- `scripts/snapshot-from-dump.mjs` — assemble `data/plan-snapshot.json` depuis un export de la base de l'artifact.
- `scripts/build.mjs` — injecte `data/*.json` dans `index.html`, puis lance `bake.mjs`.

## Où s'édite quoi

- **Un chantier change d'état, de porteur, de blocage** → `PROJECTS` dans `index.html`, puis `node scripts/bake.mjs`.
- **Une demande change de ressource, de statut, de charge ; une capacité change** → dans l'artifact Claude (lien dans la bannière de la page, onglets Plan de charge / Ressources), puis republication (RULES.md §9).
- **Un chantier de la roadmap est livré ou un ticket Plane est fermé** → `ROADMAP` dans `index.html` (`real`, `planeDone`), pas de script à lancer.
