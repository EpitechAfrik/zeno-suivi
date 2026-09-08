# Règles — Suivi Zeno & CRM AEIG

Ce dépôt héberge une page unique (`index.html`) publiée sur GitHub Pages, qui sert de tableau de suivi à Rachad et à l'équipe. Avant de modifier quoi que ce soit, lire ce fichier en entier.

La page a cinq vues (onglets). Les règles 1 à 8 concernent la vue **Chantiers** (données `PROJECTS`). Les règles 9 à 11 concernent les vues **Avancement V2**, **Roadmap V2**, **Plan de charge** et **Ressources**, qui ont leurs propres sources de données.

## 1. Où sont les données

Tout le contenu des chantiers vit dans un objet JavaScript `PROJECTS` déclaré dans le **premier** `<script>` d'`index.html` — il n'y a pas de base de données, pas d'API, pas de fichier séparé. La structure :

```js
PROJECTS = {
  <clé_projet>: {
    label: 'Nom affiché du projet',
    modules: [
      {
        name, desc,                    // nom + description courte du chantier
        status,                        // 'fonctionnel' | 'en-cours' | 'bloque' | 'pas-demarre'
        cdc,                           // 'oui' | 'partiel' | 'non'
        blocker,                       // string courte, optionnel — voir règle 3
        owner, role,                   // porteur (responsable) du chantier
        support: [{name, role}],       // personnes en soutien, optionnel
        brandContact: {name, role},    // interlocuteur côté marque/tribu
        when, stale,                   // date de dernière activité (JJ/MM), stale=true si >14j
        comments,                      // note libre — DOIT préciser la source (règle 2)
        tasks: [{label, status}],      // sous-tâches dépliables, status = 'ok'|'warn'|'crit'|'idle'
      },
      // ...
    ],
  },
}
```

## 2. Chaque affirmation doit dire d'où elle vient

Deux sources coexistent dans ce fichier, et il ne faut **jamais** les mélanger sans le dire :

- **Vérifié par lecture directe du code** — quelqu'un (humain ou agent) a ouvert le repo concerné et lu le code réel. C'est la source la plus fiable.
- **Transcrit du suivi Excel de Rachad** — repris tel quel d'un export CSV/Excel, jamais vérifié contre le code.

**Le champ `comments` doit toujours préciser laquelle des deux s'applique** (ex. "Source : suivi Rachad (CSV), pas vérifié par lecture de code."). Si les deux sources existent pour un même chantier (ex. le code est audité mais le porteur vient du CSV), le dire explicitement plutôt que de laisser croire que tout vient d'un audit.

**Ne jamais inventer un porteur, un interlocuteur ou une date.** Si l'info n'est pas connue, laisser `owner: '—'` / `brandContact: NO_ONE` plutôt que de deviner.

## 3. `status` = est-ce que ça sert vraiment aujourd'hui — `blocker` = pourquoi c'est imparfait

Un chantier **utilisé et fonctionnel** reste `status: 'fonctionnel'`, même s'il a un point bloquant identifié dessus (une dépendance externe, une décision en attente, un CDC qui change...). Ne pas rétrograder le statut à `'bloque'` juste parce qu'il y a un problème connu — `'bloque'` veut dire "n'est pas utilisable aujourd'hui", pas "a un défaut".

Utiliser le champ `blocker` (une phrase courte, ex. `'Communication (WhatsApp)'`) pour que le point bloquant reste **visible directement dans la ligne**, à côté du statut, sans avoir à cliquer. Le détail complet reste dans `comments`. Résultat recherché : "Fonctionnel" + un petit badge rouge à côté — pas un mensonge par omission, pas un statut alarmiste pour un outil qui marche.

## 4. "CDC disponible" ne compte que les documents récents et fiables

Ne jamais marquer `cdc: 'oui'` sur la seule base d'un vieux fichier `.md` trouvé dans un repo — l'expérience de ce projet a montré que ces docs deviennent obsolètes et personne ne les met à jour. Un CDC ne compte que s'il a été **écrit récemment et vérifié comme reflétant l'état actuel**, ou repris explicitement du suivi de Rachad qui fait foi côté produit/business. Dans le doute, `'partiel'` ou `'non'` plutôt qu'un `'oui'` optimiste.

## 5. Langage : zéro jargon technique dans ce qui est visible

La vue Chantiers est lue par un manager, pas par un développeur. `name`, `desc`, `comments` et les `tasks[].label` doivent être compréhensibles par quelqu'un qui ne sait pas ce qu'est une API, un repo, ou un endpoint. Traduire en impact concret ("le site peut planter si on ferme l'onglet en éditant" plutôt que "pas de sauvegarde automatique côté client").

Les vues Roadmap V2, Plan de charge et Ressources s'adressent au lead technique et à la direction : les références de tickets (`ZENO-###`), de modules et de dépôts y sont admises. La vue Avancement V2 reste en langage direction.

## 6. Après CHAQUE modification de `PROJECTS`, lancer le script de rendu

```bash
node scripts/bake.mjs
```

**Pourquoi c'est obligatoire, pas optionnel** : `index.html` contient une copie statique du contenu (dans les `<div id="summary">`, `<div id="modules">`, etc.) en plus du script qui génère ce même contenu dynamiquement. Cette copie statique existe parce que certains aperçus (Gmail, WhatsApp Web...) bloquent le JavaScript — sans elle, ces aperçus affichent une page vide. Si vous modifiez `PROJECTS` sans relancer `bake.mjs`, la version que les gens voient réellement (l'aperçu statique) reste périmée même si le code source a changé.

Committer `index.html` seulement APRÈS avoir lancé le script. (`node scripts/build.mjs` lance aussi `bake.mjs` à la fin : l'un ou l'autre suffit.)

## 7. Ajouter un nouveau projet (onglet)

1. Vérifier d'abord qu'il mérite vraiment un onglet séparé plutôt qu'un chantier dans un projet existant — un projet séparé se justifie quand le code/l'équipe/le repo sont réellement distincts (ex. EDMS a son propre repo, donc son propre onglet — pas parce que le sujet est "gros").
2. Ajouter une entrée dans `PROJECTS` avec `label` et `modules: []` (ou déjà peuplé si les données sont prêtes).
3. Ajouter une branche `else if(state.project === '<clé>')` dans `renderBanner()` pour expliquer la source des données de cet onglet.
4. Lancer `node scripts/bake.mjs`, vérifier dans un navigateur que l'onglet apparaît et fonctionne.

## 8. Ce qu'on a essayé et qui ne marche pas

- **Compter un blocage comme "en cours" ou "fonctionnel"** — testé, jugé trompeur (règle 3).
- **Marquer `cdc: 'oui'` sur la base d'un vieux doc d'architecture** — a produit un faux sentiment de couverture (règle 4).
- **Un vrai téléchargement de fichier (bouton "Exporter")** — ne fonctionne pas dans le bac à sable de la page publiée ; si un export est un jour nécessaire, utiliser un copier-coller (voir historique du fichier) plutôt qu'un téléchargement direct.
- **Une règle CSS `display:` sur un élément qui porte l'attribut `hidden`** — l'élément reste visible hors de l'artifact Claude (GitHub Pages n'a pas le reset `[hidden]{display:none}` du conteneur Claude). Le fichier déclare `[hidden]{display:none!important}` ; ne pas le retirer.

## 9. Plan de charge : la source est l'artifact Claude, la page publiée est un instantané

Les vues **Plan de charge**, **Avancement V2** (colonnes Ressources / Fin estimée) et **Ressources** (charge actuelle, capacités) lisent le bloc généré `SNAPSHOT` d'`index.html`, alimenté par `data/plan-snapshot.json`. **Ce bloc ne s'édite jamais à la main.**

La même page, publiée comme artifact Claude « Plan de charge Zeno » (lien dans la bannière des vues concernées), est branchée sur une base partagée : là, les affectations, statuts, charges restantes, capacités et réglages du calibrage sont modifiables et enregistrés pour tous les lecteurs. C'est **là** qu'on édite le plan de charge. Toute modification faite dans l'artifact reste invisible sur GitHub Pages tant que l'instantané n'a pas été republié.

Republier l'instantané (depuis une session Claude Code, dans un clone de ce dépôt) :

1. Exporter la base de l'artifact avec l'outil Artifact, action `read_db` (`db_op: list`, `limit: 1000`, `out_dir: <dossier>`) sur les collections `demandes` et `resources`, et `get` sur `settings/plan` (à enregistrer dans `<dossier>/settings/plan.json`).
2. `node scripts/snapshot-from-dump.mjs <dossier>` → écrit `data/plan-snapshot.json` (avec la date d'export).
3. `node scripts/build.mjs` → injecte le snapshot et la matrice git dans `index.html`, puis lance `bake.mjs`.
4. Vérifier la page dans un navigateur (les cinq onglets), puis committer `index.html` **et** `data/plan-snapshot.json`.

Le fichier `index.html` est aussi le contenu de l'artifact : après une évolution du code de la page, republier l'artifact avec le même fichier (outil Artifact, paramètre `url`, capability `db` conservée) pour que les deux copies restent identiques.

Ce qu'il ne faut pas faire : ré-amorcer la base de l'artifact depuis Plane (les `set` écrasent les affectations faites à la main) ; éditer le bloc `SNAPSHOT` directement dans `index.html` (perdu au prochain `build.mjs`).

## 10. Roadmap V2 : `ROADMAP`, édité à la main

Le deuxième `<script>` (`id="roadmap-data"`) déclare `ROADMAP`, la roadmap V2 de `docs/architecture/ROADMAP_V2.md` (dépôt Zeno) confrontée au code du dépôt aeig-plateform :

```js
ROADMAP = {
  range: {start, end},                       // fenêtre de la frise des phases (AAAA-MM-JJ)
  phases: [{n, t, short, w, start, end, late, cls, lbl}],   // cls = 'crit' | 'warn' | 'neutral' ; lbl = phrase d'état
  chantiers: [{phase, n, t, sub, tk, effort, real, note}],   // tk = tickets Plane ; effort = S|M|L|XL ; real = 'done'|'partial'|'none'|'check'
  planeDone: [...], planeBacklog: [...],     // tickets Plane fermés / en backlog (les autres sont supposés Todo)
  tranches: [{id, t, state, map}],           // plan de Giovanni du 30 juillet, state = 'done' | 'todo'
  ecarts: [[titre, texte, regle?]],          // écarts roadmap ↔ code ; regle = true quand c'est tranché
}
```

- `real` obéit à la règle 2 : c'est une **lecture du code**, datée dans `note` ou dans l'en-tête de colonne. Quand un chantier est livré, passer `real` à `'done'` et dire où (branche, dossier, date).
- Un chantier se rattache aux demandes du plan de charge par son numéro (`roadmap: '2.3'` dans la demande) ou par ses tickets `tk`. Ne pas renuméroter un chantier sans mettre à jour les demandes dans l'artifact.
- Le calibrage de charge par défaut d'un chantier vient de `effort` × réglages `settings/plan` (S 0,5 j, M 1,5 j, L 3 j, XL 6 j de boucle humaine) ; une valeur `restDays` saisie sur la demande l'emporte.
- Rien à lancer après une modification de `ROADMAP` (pas de copie statique), mais vérifier la vue dans un navigateur.

## 11. Ressources : `data/git-matrix.json`, régénéré par Claude

La vue Ressources (commits par module et par développeur, frise, fiches) lit le bloc généré `GIT`, alimenté par `data/git-matrix.json`. Le fichier a été produit le 7 septembre 2026 à partir de l'historique git de Zeno (`main`, 7 janvier → 27 août 2026) et d'aeig-plateform (main et refacto, jusqu'au 17 août), en rattachant chaque commit à un module d'après les chemins des fichiers modifiés. Structure : `months` (liste `AAAA-MM`), `total`, `authors[]` (`slug`, `name`, `commits`, `first`, `last`, `byMonth[]`, `dom[]`, `byModule{}`), `modules[]` (`name`, `total`, `per{}`, `top`, `topShare`), `v2` (même chose pour aeig-plateform).

Pour rafraîchir : demander à Claude Code, dans une session du dépôt Zeno, de régénérer `data/git-matrix.json` (même structure, même liste d'auteurs) puis lancer `node scripts/build.mjs`. Limite connue : la frise est câblée sur 8 mois (janvier → août 2026, `MONTH_LBL` dans le code) ; ajouter un mois demande d'étendre cette liste et les colonnes de la frise.
