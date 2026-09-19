# Contexte du projet Juno-Matos

Juno-Matos fournit un catalogue responsive de matériel pédagogique. Le public consulte les fiches sans compte. Les éditeurs authentifiés ajoutent, modifient et suppriment les matériels et leurs images.

## Décisions validées

- Nuxt 4 avec les répertoires `app/` et `server/`.
- Vuetify reste la bibliothèque d'interface.
- NuxtHub utilise SQLite en local et Cloudflare D1 en production.
- Drizzle ORM décrit le schéma et les migrations.
- `nuxt-auth-utils` gère les sessions chiffrées côté serveur.
- Cloudinary stocke les images.
- Les utilisateurs possèdent un rôle `admin` ou `editor`.
- Les ajouts et modifications courants se font dans l'application. Le fichier Excel a servi uniquement à l'initialisation.

## État fonctionnel actuel

Le catalogue public propose la recherche, les filtres, la pagination et les pages de détail. L'interface éditeur propose la création, la modification, la suppression avec confirmation, la validation des champs et l'upload d'image depuis un fichier ou un appareil mobile.

L'API protège toutes les écritures par session et rôle. Les clés Cloudinary restent côté serveur. Le premier administrateur a été créé localement, puis les données locales ont été transférées dans D1.

## Données de production

La base D1 `juno-matos-db` contient :

- 289 matériels ;
- 1 administrateur principal ;
- 10 domaines ;
- 6 types ;
- 18 thèmes ;
- 39 lieux ;
- 13 valeurs d'âge ;
- les références Cloudinary des images migrées.

Les migrations `0000_initial-schema.sql` et `0001_add-source-image-url.sql` sont appliquées. NuxtHub génère le binding D1 de production à partir de `CLOUDFLARE_D1_DATABASE_ID`.

## Environnement local

Le projet utilise `http://localhost:3000` sous Windows. `127.0.0.1` peut ne pas être joignable dans l'environnement actuel.

Les secrets locaux restent dans `.env`. Le dépôt contient uniquement `.env.example`. Le secret temporaire `NUXT_BOOTSTRAP_SECRET` a été supprimé après la création de l'administrateur local.

## Prochaines étapes

1. Vérifier les variables et secrets dans l'environnement Production Cloudflare.
2. Tester en production la connexion, le catalogue, le CRUD et l'upload Cloudinary.
3. Vérifier les permissions `admin`, `editor` et visiteur.
4. Ajouter l'administration des utilisateurs.
5. Effectuer la revue d'accessibilité et documenter le retour arrière.
