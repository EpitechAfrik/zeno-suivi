# Zeno Suivi

Page de suivi des chantiers Zeno, CRM AEIG et EDMS, publiée via GitHub Pages : https://epitechafrik.github.io/zeno-suivi/

**⚠️ Avant de modifier `index.html` : lire [`RULES.md`](./RULES.md).** Ça couvre le format des données, les règles de statut, et l'étape obligatoire après modification (`node scripts/bake.mjs`).

- **Contenu actuel** : mélange de statuts vérifiés par lecture directe du code, et de données reprises du suivi Excel de Rachad — chaque chantier précise sa source dans son commentaire.
- **Prochaine étape possible** : script qui régénère `index.html` depuis une source de vérité automatisée (Plane, etc.) + GitHub Action planifiée pour republier automatiquement.
