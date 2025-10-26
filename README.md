# Streavmin V3

Plateforme de streaming façon Netflix construite sans base de données. Les contenus (films, séries, catégories) sont stockés dans des fichiers JSON locaux et servis via une API Express. Le frontend Next.js consomme cette API pour afficher l&apos;accueil, les fiches détaillées et un lecteur vidéo.

## Fonctionnalités

- Gestion du catalogue file-based :
  - Films et séries stockés dans `data/catalog`.
  - Ajout/mise à jour d&apos;épisodes idempotent avec fusion automatique des saisons.
  - Catégories dynamiques ou manuelles pour alimenter les carrousels Netflix-like.
- API Express (`server.js`) avec authentification par fichier JSON (`data/users`).
  - Sessions HTTP via cookies.
  - Endpoints admin protégés pour CRUD films, catégories et épisodes.
  - Historique "Continuer la lecture" par utilisateur.
- Frontend Next.js (React) avec thème sombre Netflix-like :
  - Accueil avec hero, carrousels et section continuer.
  - Pages liste Films/Séries, fiches détaillées et lecteur vidéo.
  - Admin panel minimal pour créer films, catégories et épisodes.
- Scripts utilitaires :
  - `npm run seed` : population d&apos;un catalogue de démonstration (8 films, 2 séries × 6 épisodes, utilisateur admin).
  - `npm run backup` : zip du dossier `data`.
  - `npm run lint:catalog` : validation JSON via Ajv.

## Structure des données

```
/data
  /catalog
    categories.json
    movies.json
    /series
      <slug>.json
  /users
    admin.json
/frontend
  ...
```

Les vidéos et sous-titres sont référencés par URL (HLS/DASH/mp4). Aucun média n&apos;est stocké sur le serveur.

## Prérequis

- Node.js 18+
- npm

## Installation & démarrage

```bash
npm install
npm run seed    # génère le catalogue et l'admin (admin/admin123)

# lancer l'API
npm start

# dans un autre terminal pour le frontend
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev
```

L&apos;accès à l&apos;admin se fait via `http://localhost:3000/admin` (identifiants admin/admin123).

## Docker

Un `docker-compose.yml` est fourni pour lancer l&apos;API et le frontend :

```bash
docker-compose up --build
```

Les données JSON sont montées dans un volume `./data` afin de persister les modifications.

## Sécurité & bonnes pratiques

- Verrouillage fichier + écriture atomique lors des mises à jour JSON.
- Validation basique des entrées côté API.
- Authentification par session, endpoints admin protégés.
- Catalogue validable avec `npm run lint:catalog`.

## Scripts

- `npm run seed` : réinitialise le catalogue avec des données de démonstration.
- `npm run backup` : crée un zip daté dans `backups/`.
- `npm run lint:catalog` : vérifie la structure JSON.

## Licence

MIT
