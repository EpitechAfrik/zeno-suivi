# Règles — Suivi Zeno & CRM AEIG

Ce dépôt héberge une page unique (`index.html`) publiée sur GitHub Pages, qui sert de tableau de suivi à Rachad et à l'équipe. Avant de modifier quoi que ce soit, lire ce fichier en entier.

## 1. Où sont les données

Tout le contenu vit dans un objet JavaScript `PROJECTS` déclaré dans le `<script>` d'`index.html` — il n'y a pas de base de données, pas d'API, pas de fichier séparé. La structure :

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

## 3. Un blocage réel = statut "Bloqué", jamais "Fonctionnel" + une note cachée

Si un chantier a un blocage nommé et réel (une dépendance externe, une décision en attente, un CDC qui change sans arrêt...), le **statut global doit être `'bloque'`** — même si le code sous-jacent fonctionne techniquement. On ne mélange pas "ça marche" et "c'est bloqué" dans un statut optimiste avec le vrai problème caché dans les commentaires : ça trompe quelqu'un qui ne fait que scanner la liste.

Utiliser le champ `blocker` (une phrase courte, ex. `'Communication (WhatsApp)'`) pour que la raison soit visible directement dans la ligne, sans avoir à cliquer. Le détail complet reste dans `comments`.

## 4. "CDC disponible" ne compte que les documents récents et fiables

Ne jamais marquer `cdc: 'oui'` sur la seule base d'un vieux fichier `.md` trouvé dans un repo — l'expérience de ce projet a montré que ces docs deviennent obsolètes et personne ne les met à jour. Un CDC ne compte que s'il a été **écrit récemment et vérifié comme reflétant l'état actuel**, ou repris explicitement du suivi de Rachad qui fait foi côté produit/business. Dans le doute, `'partiel'` ou `'non'` plutôt qu'un `'oui'` optimiste.

## 5. Langage : zéro jargon technique dans ce qui est visible

Ce tableau est lu par un manager, pas par un développeur. `name`, `desc`, `comments` et les `tasks[].label` doivent être compréhensibles par quelqu'un qui ne sait pas ce qu'est une API, un repo, ou un endpoint. Traduire en impact concret ("le site peut planter si on ferme l'onglet en éditant" plutôt que "pas de sauvegarde automatique côté client").

## 6. Après CHAQUE modification de `PROJECTS`, lancer le script de rendu

```bash
node scripts/bake.mjs
```

**Pourquoi c'est obligatoire, pas optionnel** : `index.html` contient une copie statique du contenu (dans les `<div id="summary">`, `<div id="modules">`, etc.) en plus du script qui génère ce même contenu dynamiquement. Cette copie statique existe parce que certains aperçus (Gmail, WhatsApp Web...) bloquent le JavaScript — sans elle, ces aperçus affichent une page vide. Si vous modifiez `PROJECTS` sans relancer `bake.mjs`, la version que les gens voient réellement (l'aperçu statique) reste périmée même si le code source a changé.

Committer `index.html` seulement APRÈS avoir lancé le script.

## 7. Ajouter un nouveau projet (onglet)

1. Vérifier d'abord qu'il mérite vraiment un onglet séparé plutôt qu'un chantier dans un projet existant — un projet séparé se justifie quand le code/l'équipe/le repo sont réellement distincts (ex. EDMS a son propre repo, donc son propre onglet — pas parce que le sujet est "gros").
2. Ajouter une entrée dans `PROJECTS` avec `label` et `modules: []` (ou déjà peuplé si les données sont prêtes).
3. Ajouter une branche `else if(state.project === '<clé>')` dans `renderBanner()` pour expliquer la source des données de cet onglet.
4. Lancer `node scripts/bake.mjs`, vérifier dans un navigateur que l'onglet apparaît et fonctionne.

## 8. Ce qu'on a essayé et qui ne marche pas

- **Compter un blocage comme "en cours" ou "fonctionnel"** — testé, jugé trompeur (règle 3).
- **Marquer `cdc: 'oui'` sur la base d'un vieux doc d'architecture** — a produit un faux sentiment de couverture (règle 4).
- **Un vrai téléchargement de fichier (bouton "Exporter")** — ne fonctionne pas dans le bac à sable de la page publiée ; si un export est un jour nécessaire, utiliser un copier-coller (voir historique du fichier) plutôt qu'un téléchargement direct.
