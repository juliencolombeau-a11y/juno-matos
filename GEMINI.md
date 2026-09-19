# Juno-Matos — Instructions et suivi

## Référence du projet

Juno-Matos est une application Nuxt 4 responsive de consultation et de gestion de matériel pédagogique.

- Le public consulte le catalogue sans compte.
- Les utilisateurs authentifiés créent, modifient et suppriment les matériels.
- Les rôles disponibles sont `admin` et `editor`.
- Les données locales utilisent NuxtHub DB avec SQLite.
- La production utilise Cloudflare D1.
- Les images utilisent Cloudinary.

## Règles de sécurité

1. Toutes les écritures passent par des routes serveur protégées par session.
2. Les rôles sont vérifiés côté serveur ; l'interface ne constitue pas une protection.
3. `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` et `NUXT_SESSION_PASSWORD` ne doivent jamais apparaître dans le client, le dépôt ou les réponses API.
4. Le fichier `.env` reste local et ignoré par Git.
5. `NUXT_BOOTSTRAP_SECRET` sert uniquement à créer le premier administrateur et doit être supprimé immédiatement après.
6. Les uploads passent par `/api/media/image`, qui valide le type et limite la taille à 15 Mo.

## État au 13 septembre 2026

Le catalogue public, l'authentification, l'API CRUD, l'interface éditeur et l'upload Cloudinary sont implémentés. La base D1 `juno-matos-db` est créée, les deux migrations sont appliquées et les données locales sont transférées.

Le transfert de production contient 289 matériels, les tables de référence, un administrateur et les références Cloudinary existantes. Aucun nouvel import Excel n'est prévu.

## Commandes importantes

```powershell
npm run dev
npx nuxt typecheck
npm run build
npx wrangler d1 migrations apply juno-matos-db --remote
npm run data:export
npx wrangler d1 execute juno-matos-db --remote --file .data/d1-data.sql --yes
```

Sous Windows, utiliser `http://localhost:3000` pour les tests locaux.

## Reprise du travail

Consulter `roadmap.md` pour la liste des tâches. Les priorités restantes sont les tests de production, la revue d'accessibilité, la vérification Cloudflare de `nuxt-auth-utils`, puis l'administration des utilisateurs.
