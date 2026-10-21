# Architecture et déploiement d'une application Nuxt similaire

Ce document décrit l'architecture de Juno-Matos et sert de base pour une future application de gestion de poèmes. Il est destiné à deux lecteurs : un agent IA qui doit prendre des décisions cohérentes avec le projet existant et un développeur qui doit pouvoir installer, migrer et déployer l'application sans reproduire les incidents du premier déploiement.

Les noms métier changent entre les applications, mais les responsabilités techniques restent les mêmes. Une application de poèmes peut donc reprendre le socle, les conventions de sécurité et la procédure de déploiement décrits ici.

## Résumé de la solution

| Élément | Responsabilité |
| --- | --- |
| GitHub | Dépôt du code, historique, branches, revue et déclenchement du déploiement |
| Nuxt 4 | Framework full-stack : interface dans `app/`, routes serveur dans `server/` |
| Vue et Vuetify | Interface responsive et composants visuels |
| NuxtHub DB | Abstraction de la base locale et intégration avec le runtime Cloudflare |
| SQLite | Base locale de développement et de préparation des données |
| Cloudflare D1 | Base SQLite distante utilisée en production |
| Drizzle ORM | Schéma TypeScript, requêtes et migrations SQL |
| Cloudflare Workers/Pages | Hébergement et exécution de l'application Nuxt en production |
| Wrangler | Commandes Cloudflare pour les migrations, l'exécution SQL et le déploiement |
| `nuxt-auth-utils` | Sessions chiffrées côté serveur |
| Cloudinary | Stockage et diffusion des images |
| npm | Installation reproductible à partir de `package-lock.json` |

Le navigateur ne communique pas directement avec D1 ou Cloudinary pour les opérations sensibles. Les routes serveur Nuxt valident les entrées, vérifient la session et le rôle, puis utilisent les services externes avec leurs secrets.

## Structure recommandée

Conserver une structure proche de celle-ci :

```text
app/
  components/       # composants Vue et formulaires
  layouts/          # cadres d'application
  pages/            # pages publiques et privées
server/
  api/              # endpoints HTTP
  db/
    migrations/     # migrations SQL versionnées
    schema.ts       # schéma Drizzle
  utils/            # authentification, validation, intégrations
shared/
  types/            # types partagés entre client et serveur
scripts/            # scripts ponctuels d'import ou d'export
nuxt.config.ts
wrangler.jsonc
package.json
package-lock.json
.env.example
```

Les écritures doivent toujours passer par une route de `server/api`. Une page ou un composant Vue ne constitue jamais une protection d'accès. Les contrôles d'authentification et d'autorisation restent côté serveur, même si l'interface masque les boutons interdits.

## Rôle de chaque environnement

### Développement local

La base locale NuxtHub utilise SQLite. Les variables sont lues depuis un fichier `.env` local, créé à partir de `.env.example`. Le fichier `.env` ne doit jamais être commité.

Sous Windows, utiliser `http://localhost:3000` pour les tests locaux. Dans l'environnement de référence, `127.0.0.1` peut ne pas être joignable alors que `localhost` fonctionne.

Commandes de base :

```powershell
npm install
npm run dev
npx nuxt typecheck
npm run build
```

Utiliser le même gestionnaire de paquets et le même fichier de verrouillage pendant tout le projet. Ne pas alterner npm, pnpm et yarn sans décision explicite.

### Production

La production exécute le build Nuxt avec le preset Cloudflare et utilise D1 comme base SQLite distante. NuxtHub configure l'accès D1 à partir de `CLOUDFLARE_D1_DATABASE_ID`.

Les valeurs présentes dans le `.env` local ne sont pas transférées automatiquement vers Cloudflare. Chaque variable et chaque secret doit être configuré séparément dans l'environnement Cloudflare qui exécute réellement l'application, généralement **Production**.

## Configuration Nuxt et D1

La configuration suit ce principe :

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auth-utils', '@nuxtjs/cloudinary'],
  hub: {
    db: process.env.CLOUDFLARE_D1_DATABASE_ID
      ? {
          dialect: 'sqlite',
          driver: 'd1',
          connection: {
            databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
          },
        }
      : 'sqlite',
  },
})
```

`wrangler.jsonc` doit contenir uniquement les réglages généraux du Worker, par exemple le nom, la date de compatibilité et les flags nécessaires. NuxtHub génère ensuite la configuration de binding D1 dans `.output/server/wrangler.json`.

### Incident à ne pas reproduire : binding D1 déclaré deux fois

Le premier déploiement a échoué avec l'erreur `DB assigned to multiple D1 Database bindings`. La cause était une double déclaration :

1. NuxtHub générait automatiquement le binding `DB` depuis `CLOUDFLARE_D1_DATABASE_ID`.
2. `wrangler.jsonc` déclarait en plus le même binding dans `d1_databases`.

La règle pour la prochaine application est simple : choisir un seul propriétaire du binding. Avec NuxtHub, ne pas ajouter manuellement `d1_databases` dans `wrangler.jsonc`.

Avant le premier déploiement, inspecter la configuration générée :

```powershell
npm run build
Get-Content .output\server\wrangler.json
npx wrangler deploy --dry-run
```

Vérifier qu'un seul binding D1 existe et que son nom est unique. Ne pas corriger ce type d'erreur en ajoutant un second binding ou en renommant au hasard le binding utilisé par NuxtHub.

## Variables et secrets

Utiliser les mêmes noms en local, dans `nuxt.config.ts` et dans Cloudflare :

| Nom | Type | Rôle | Exposition |
| --- | --- | --- | --- |
| `CLOUDFLARE_D1_DATABASE_ID` | Variable | Identifiant de la base D1 choisie par NuxtHub | Serveur / build |
| `CLOUDINARY_CLOUD_NAME` | Variable | Nom du cloud Cloudinary | Peut être public |
| `CLOUDINARY_API_KEY` | Secret | Authentification API Cloudinary | Serveur uniquement |
| `CLOUDINARY_API_SECRET` | Secret | Signature des opérations Cloudinary | Serveur uniquement |
| `NUXT_SESSION_PASSWORD` | Secret | Chiffrement et signature des sessions | Serveur uniquement |
| `NUXT_BOOTSTRAP_SECRET` | Secret temporaire | Création contrôlée du premier administrateur | À supprimer immédiatement |

Règles obligatoires :

- ne jamais mettre une clé Cloudinary ou le secret de session dans `runtimeConfig.public` ;
- ne jamais les inclure dans une page, un bundle client, une réponse API, un fichier Markdown ou GitHub ;
- ne jamais commiter `.env`, `.data/`, une sauvegarde SQL ou un export de production ;
- utiliser un `NUXT_SESSION_PASSWORD` aléatoire d'au moins 32 caractères ;
- ajouter `NUXT_BOOTSTRAP_SECRET` uniquement pour l'initialisation du premier compte, puis le supprimer de Cloudflare et redéployer ;
- renouveler les secrets si une exposition est suspectée.

Le fichier `.env.example` doit contenir les noms des variables sans aucune valeur réelle.

## Base de données et migrations

Drizzle décrit le schéma dans `server/db/schema.ts` et génère des fichiers SQL dans `server/db/migrations`. Une migration est versionnée, relisible et appliquée dans le même ordre en local et en production.

Créer une migration après chaque évolution de schéma. Ne pas modifier une migration déjà appliquée en production : créer une nouvelle migration. Tester chaque migration sur une base locale propre et sur une copie ou un environnement de préproduction avant la production.

Appliquer les migrations D1 explicitement :

```powershell
npx wrangler d1 migrations apply <nom-de-la-base> --remote
```

Le build de l'application et la migration de la base sont deux opérations distinctes. Un build réussi ne prouve pas que le schéma D1 est à jour.

## Import initial et transfert des données

Une future application de poèmes peut démarrer vide. Si elle reprend des données existantes, traiter l'import comme une opération ponctuelle et documentée, séparée du fonctionnement courant de l'application.

La procédure de référence est :

1. préparer et valider les données dans SQLite local ;
2. rendre le script d'export déterministe et relançable sans doublons ;
3. générer un fichier SQL dans `.data/` ;
4. vérifier le nombre de lignes et les tables concernées ;
5. appliquer les migrations sur D1 ;
6. importer le fichier SQL dans D1 ;
7. contrôler les données et les comptes en production ;
8. supprimer les fichiers temporaires contenant des données sensibles.

Commandes utilisées par Juno-Matos :

```powershell
npm run data:export
npx wrangler d1 execute <nom-de-la-base> --remote --file .data\d1-data.sql --yes
```

Ne pas importer des données avant d'avoir appliqué les migrations correspondantes. Conserver les identifiants historiques dans un champ dédié si un rapprochement est nécessaire, mais ne pas rendre une ancienne source de données indispensable au fonctionnement quotidien.

## Cloudinary et médias

Cloudinary stocke les images afin de ne pas alourdir D1. La route serveur d'upload doit :

- exiger une session et le rôle approprié ;
- lire un fichier multipart ;
- vérifier le type MIME ;
- limiter la taille, par exemple à 15 Mo ;
- générer un identifiant public contrôlé ;
- envoyer le fichier à Cloudinary avec les secrets côté serveur ;
- ne renvoyer au client que les informations nécessaires, comme l'identifiant public et l'URL sécurisée.

Une image manquante ne doit pas rendre une fiche inutilisable. Prévoir un état sans image, enregistrer l'URL ou l'identifiant Cloudinary dans D1 et définir le comportement lors d'un remplacement ou d'une suppression.

## Authentification et autorisations

Les sessions sont chiffrées côté serveur avec `nuxt-auth-utils`. Les mots de passe sont hachés et ne sont jamais renvoyés dans une réponse API.

Prévoir au minimum :

- `login`, `logout` et `session` ;
- une route d'initialisation du premier administrateur protégée par un secret temporaire ;
- une vérification de session dans chaque route d'écriture ;
- une vérification du rôle côté serveur ;
- des validations strictes côté serveur ;
- des réponses HTTP cohérentes ;
- une distinction entre visiteur, éditeur et administrateur.

Tester les autorisations avec trois profils : visiteur non connecté, éditeur et administrateur. Tester directement les endpoints, pas seulement les boutons de l'interface.

## Procédure de déploiement recommandée

### Préparer le dépôt GitHub

1. Commiter le code, les migrations et `.env.example`.
2. Vérifier que `.env`, `.data`, `.output` et `node_modules` sont ignorés.
3. Vérifier l'absence de secrets dans l'historique et dans le diff.
4. Vérifier que `package-lock.json` correspond à `package.json`.
5. Pousser une branche ou un commit identifiable.

### Préparer Cloudflare

1. Créer ou sélectionner la base D1 de production.
2. Récupérer son identifiant et le configurer comme `CLOUDFLARE_D1_DATABASE_ID`.
3. Configurer les variables et secrets dans l'environnement **Production**.
4. Vérifier que le projet Cloudflare utilise le bon dépôt GitHub et la bonne branche.
5. Ne pas ajouter de binding D1 manuel si NuxtHub le génère.

### Construire et vérifier

```powershell
npm install
npx nuxt typecheck
npm run build
Get-Content .output\server\wrangler.json
npx wrangler deploy --dry-run
```

Le build doit réussir avant toute migration ou tout déploiement. Le fichier Wrangler généré doit être inspecté pour confirmer les bindings et le preset Cloudflare.

### Initialiser la base et déployer

```powershell
npx wrangler d1 migrations apply <nom-de-la-base> --remote
npx wrangler deploy
```

Si des données initiales existent, effectuer l'import après les migrations et avant les tests fonctionnels complets. Redéployer après toute modification de variable ou de secret : le build peut lire ces valeurs et Cloudflare ne les ajoute pas rétroactivement à une version déjà construite.

### Vérifier la production

Tester dans cet ordre :

1. page publique et navigation ;
2. recherche, filtres et détail ;
3. connexion et déconnexion ;
4. accès visiteur, éditeur et administrateur ;
5. création, modification et suppression ;
6. upload, remplacement et absence d'image ;
7. lecture et écriture D1 ;
8. logs Cloudflare sans secret exposé ;
9. session après rechargement et expiration ;
10. affichage mobile et clavier.

Conserver la date du déploiement, le commit utilisé, l'état des migrations et le résultat des tests. Cette trace facilite un retour arrière ou une nouvelle reprise par un agent IA.

## Retour arrière et maintenance

Un retour arrière de code ne revient pas automatiquement en arrière sur une migration D1. Les migrations destructives doivent donc être évitées ou précédées d'une stratégie de sauvegarde et de restauration.

Avant une modification de schéma :

- exporter ou sauvegarder les données ;
- décrire la migration et son éventuel rollback ;
- tester la migration sur une base de test ;
- déployer le code compatible avec l'ancien et le nouveau schéma si nécessaire ;
- appliquer la migration ;
- vérifier les logs et les parcours critiques.

Mettre à jour régulièrement Nuxt, NuxtHub, Wrangler, `nuxt-auth-utils`, Drizzle et les modules d'interface, mais par lots contrôlés. Après une mise à jour, relancer le typecheck, le build, le dry-run Wrangler et les tests de production.

## Checklist anti-incident

### Avant le développement

- [ ] Le nom métier, les rôles et le périmètre des données sont définis.
- [ ] Le gestionnaire de paquets et le fichier de verrouillage sont choisis.
- [ ] Le schéma et la stratégie de migration sont définis.
- [ ] Les routes qui écrivent sont identifiées.
- [ ] La stratégie de stockage des images est décidée.

### Avant le premier déploiement

- [ ] `.env` et les exports de données sont ignorés par Git.
- [ ] `.env.example` contient tous les noms requis, sans secret.
- [ ] Les secrets sont configurés dans Cloudflare Production.
- [ ] `NUXT_SESSION_PASSWORD` est fort et différent entre les environnements.
- [ ] `NUXT_BOOTSTRAP_SECRET` est prévu pour une seule initialisation.
- [ ] Les migrations ont été testées localement.
- [ ] `CLOUDFLARE_D1_DATABASE_ID` pointe vers la bonne base.
- [ ] Aucun `d1_databases` manuel ne duplique le binding généré par NuxtHub.
- [ ] `.output/server/wrangler.json` ne contient qu'un binding D1 par nom.
- [ ] `npx wrangler deploy --dry-run` réussit.

### Après le déploiement

- [ ] Les migrations distantes sont à jour.
- [ ] Les données initiales sont présentes et comptées.
- [ ] Le premier administrateur peut se connecter.
- [ ] Le secret d'initialisation a été supprimé.
- [ ] Les écritures non authentifiées sont refusées.
- [ ] Les rôles sont vérifiés côté serveur.
- [ ] Les uploads fonctionnent sans exposer les clés Cloudinary.
- [ ] Les logs ne contiennent aucun secret.
- [ ] Le parcours public fonctionne sans compte.

## Consignes pour un agent IA

Avant de modifier le projet, lire `README.md`, `contexte.md`, `roadmap.md` et ce document. Rechercher les décisions existantes avant d'ajouter une nouvelle abstraction ou une nouvelle variable d'environnement.

Lorsqu'une modification concerne la base, créer une migration plutôt que modifier directement la base distante. Lorsqu'elle concerne Cloudflare, vérifier la configuration générée par NuxtHub avant de modifier `wrangler.jsonc`. Lorsqu'elle concerne une écriture, vérifier la session, le rôle, la validation serveur et les tests directs de la route.

Ne jamais traiter un build réussi comme une preuve de déploiement complet. La configuration Cloudflare, les migrations, les secrets, les données et les tests fonctionnels doivent être vérifiés séparément.
