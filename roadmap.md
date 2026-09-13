# Feuille de route Juno-Matos

Juno-Matos devient une application web responsive de consultation et de gestion de matériel pédagogique. Le public consulte les fiches sans compte. Les éditeurs authentifiés créent, modifient et suppriment les fiches ainsi que leurs images.

Cette feuille de route s'appuie sur `GEMINI.md`, `contexte.md` et `questions.md`. Elle sert de référence pour les prochaines décisions et pour le suivi de l'implémentation.

## 1. Décisions validées

| Sujet | Décision |
| --- | --- |
| Framework | Nuxt 4 avec une structure `app/` et `server/` |
| Base de données | SQLite avec Drizzle ORM et NuxtHub, puis Cloudflare D1 en production |
| Interface | La version de Vuetify déjà installée dans le projet, responsive et mobile-first |
| Authentification | Plusieurs utilisateurs stockés en base, avec mots de passe hachés et rôles `admin` et `editor` |
| Images | Cloudinary pour les nouvelles images ; les images existantes sont déjà migrées |
| Données initiales | Le fichier Excel et les images accessibles ont été traités une seule fois ; l'application devient la seule source de modification |
| Identifiants des fiches | Une nouvelle clé primaire auto-incrémentée convient ; les anciens identifiants ne sont pas contractuels |
| Historique | Chaque fiche contient une date de création et une date de modification |
| Notes | La fiche contient `description` et `commentaire` |
| Déploiement | GitHub, NuxtHub et Cloudflare Workers/Pages |

## 2. État actuel

Le projet contient déjà les éléments suivants :

- une application Nuxt minimale ;
- NuxtHub configuré avec une base SQLite ;
- le module Cloudinary configuré avec `CLOUDINARY_CLOUD_NAME` ;
- Vuetify installé dans le projet ;
- un schéma Drizzle minimal pour `articles` ;
- une route de lecture de démonstration ;
- le fichier source `MatosPeda.xlsx` ;
- les documents de cadrage et les réponses aux questions.

Le socle métier, le traitement initial du fichier Excel, la migration des images, l'API publique et l'interface de consultation sont en place. L'authentification, les routes CRUD et l'interface éditeur restent à construire.

## 3. Points techniques à régler avant le développement métier

1. **Conserver la version de Vuetify installée.** Le projet référence actuellement `vuetify` `4.2.1`. Cette version est utilisée comme base, puis mise à jour avec le gestionnaire de paquets lorsque des correctifs de sécurité ou de compatibilité sont publiés.
2. **Retenir une session chiffrée compatible Cloudflare.** Le projet utilisera en priorité `nuxt-auth-utils`, avec une session stockée dans un cookie sécurisé et chiffré. Un test minimal de connexion, déconnexion et lecture de session doit confirmer la compatibilité avec le runtime Cloudflare avant de construire l'espace éditeur.
3. **Confirmer la configuration des migrations NuxtHub.** Les commandes locales et Cloudflare D1 doivent produire le même schéma.
4. **Conserver la traçabilité de l'import initial.** Le mapping du classeur et les identifiants `legacyId` documentent l'origine des données, mais aucun nouvel import Excel n'est prévu.
5. **Ne jamais exposer les secrets Cloudinary.** `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` restent uniquement accessibles au serveur pour les opérations d'image.

## 4. Phase 1 — Stabiliser le socle du projet

**Objectif :** obtenir une base Nuxt reproductible avant d'ajouter les fonctionnalités métier.

- [x] Vérifier que la version de Vuetify installée fonctionne avec `vuetify-nuxt-module`.
- [ ] Maintenir Vuetify et son module à jour avec les correctifs de sécurité disponibles.
- [x] Vérifier l'installation et le démarrage local avec le gestionnaire de paquets retenu.
- [x] Nettoyer les composants et routes de démonstration (`articles`, image `sample`, titre temporaire).
- [ ] Organiser les répertoires `app/`, `server/`, `server/database/` et les composants partagés.
- [x] Documenter les variables d'environnement locales et leur rôle.
- [ ] Ajouter une stratégie de gestion des erreurs et des réponses API cohérentes.
- [ ] Définir les conventions de nommage entre les colonnes SQL, les objets API et les formulaires.

**Résultat attendu :** l'application démarre localement avec une configuration claire et sans fonctionnalité de démonstration restante.

## 5. Phase 2 — Modèle de données et migrations

**Objectif :** représenter les fiches, les utilisateurs et les valeurs de référence dans Drizzle.

### Table `materials`

- `id` : entier auto-incrémenté ;
- `nom` : texte obligatoire ;
- `domaine`, `type`, `theme`, `lieu` : valeurs de classement ;
- `ageMin`, `nbreMin`, `nbreMax` : valeurs numériques facultatives ;
- `description`, `commentaire` : textes facultatifs ;
- `cloudinaryPublicId`, `cloudinaryUrl` : informations de l'image ;
- `createdAt`, `updatedAt` : dates obligatoires.

### Table `users`

- `id` : entier auto-incrémenté ;
- `email` : texte obligatoire et unique ;
- `passwordHash` : mot de passe haché, jamais le mot de passe en clair ;
- `role` : `admin` ou `editor` ;
- `createdAt`, `updatedAt` : dates obligatoires.

### Tables de référence

Créer uniquement les tables utiles après inspection du classeur :

- `domaines` ;
- `types` ;
- `themes` ;
- `lieux` ;
- éventuellement une table dédiée aux tranches ou valeurs d'âge si les données le justifient.

- [x] Remplacer le schéma `articles` par le schéma métier.
- [x] Définir les index nécessaires pour la recherche et les filtres.
- [x] Ajouter des contraintes d'unicité sur les valeurs de référence.
- [x] Générer la première migration Drizzle.
- [x] Appliquer la migration en local et vérifier le schéma généré.
- [ ] Préparer une procédure de migration D1 distincte de la base locale.

**Résultat obtenu :** une base migrable et cohérente avec les champs réellement présents dans Excel, désormais alimentée par les données historiques traitées.

Le champ `materials.legacyId` conserve l'identifiant Excel uniquement pour rendre l'import relançable. La clé primaire applicative reste `materials.id`, auto-incrémentée, conformément à la décision de ne pas dépendre des anciens identifiants.

## 6. Phase 3 — Initialisation des données (terminée)

**Objectif :** traiter les données historiques une seule fois, sans doublons et sans opération manuelle sur chaque image.

Le traitement initial est idempotent et peut être relancé uniquement pour restaurer ou vérifier les données historiques. Il ne constitue pas un mécanisme fonctionnel d'ajout ou de modification : toutes les futures opérations passent par l'application.

- [x] Lire `MatosPeda.xlsx` avec `xlsx` via une route d'administration protégée.
- [x] Cartographier explicitement les colonnes de `matos` vers `materials`.
- [x] Ignorer les colonnes `App:logins` et `softr` qui ne font pas partie du nouveau modèle.
- [x] Nettoyer les valeurs vides et les nombres avant insertion.
- [x] Alimenter les tables de référence avec des insertions idempotentes.
- [x] Définir `legacyId` comme clé de rapprochement stable sans en faire la clé primaire applicative.
- [x] Utiliser les URLs Google Drive publiques déjà importées.
- [x] Télécharger l'image publique côté serveur.
- [x] Envoyer l'image vers Cloudinary avec un `public_id` déterministe.
- [x] Enregistrer l'URL Google Drive source dans la fiche pour préparer la migration Cloudinary.
- [x] Produire un rapport d'import avec les fiches créées, mises à jour et ignorées.
- [x] Clôturer l'import initial après traitement du fichier Excel.
- [x] Protéger l'opération par `NUXT_MIGRATION_SECRET` pendant la phase sans authentification utilisateur.

**Résultat obtenu :** les données Excel et les images accessibles ont été importées une fois, avec un rapport exploitable et sans duplication. Aucun nouvel import Excel n'est prévu dans le fonctionnement courant de l'application.

La migration Cloudinary a été exécutée localement par lots : 288 images ont été transférées sans erreur et une fiche reste sans image source exploitable.

## 7. Phase 4 — Authentification et autorisations BFF

**Objectif :** protéger toutes les opérations d'écriture sans exposer de secret au navigateur.

C'est la prochaine phase après la mise en place du catalogue public. Les scripts d'import historiques sont retirés du fonctionnement courant ; les ajouts, modifications et suppressions passent désormais par l'application.

- [x] Installer et configurer `nuxt-auth-utils` pour les sessions chiffrées côté serveur.
- [ ] Vérifier le fonctionnement de `nuxt-auth-utils` dans le runtime Cloudflare utilisé par NuxtHub.
- [x] Ajouter les routes `login`, `logout` et `session`.
- [x] Hacher les mots de passe avec une méthode adaptée à l'environnement Cloudflare.
- [x] Ajouter une validation stricte des identifiants et des entrées utilisateur.
- [x] Mettre en place une session sécurisée côté serveur avec expiration et protection contre les accès non authentifiés.
- [x] Protéger les routes `POST`, `PUT` et `DELETE` des matériels.
- [ ] Protéger les routes d'administration.
- [ ] Autoriser les éditeurs à gérer les matériels.
- [ ] Réserver la gestion des utilisateurs et des opérations sensibles au rôle `admin`.
- [x] Ajouter une procédure contrôlée pour créer le premier administrateur.
- [x] Ne jamais renvoyer `passwordHash` dans une réponse API.

**Résultat partiel :** la connexion, la déconnexion, la session chiffrée et la création contrôlée du premier administrateur sont en place. L'administrateur principal est créé et `NUXT_BOOTSTRAP_SECRET` a été supprimé. La protection des futures routes CRUD et la vérification Cloudflare restent à terminer.

## 8. Phase 5 — API métier

**Objectif :** exposer une API stable utilisée par l'interface publique et l'interface éditeur.

- [x] Ajouter `GET /api/materials` avec recherche, filtres, pagination et tri.
- [x] Ajouter `GET /api/materials/:id`.
- [x] Ajouter `POST /api/materials`.
- [x] Ajouter `PUT /api/materials/:id`.
- [x] Ajouter `DELETE /api/materials/:id`.
- [x] Ajouter une route pour les valeurs de référence utilisées par les formulaires.
- [x] Traiter la migration initiale des images Google Drive vers Cloudinary.
- [x] Valider les champs obligatoires, les nombres et les tailles de texte côté serveur.
- [x] Utiliser des requêtes paramétrées et limiter la quantité de données renvoyée.
- [x] Retourner des codes HTTP et des messages d'erreur cohérents.
- [x] Prévoir la suppression ou le remplacement de l'image Cloudinary lorsqu'une fiche est supprimée ou modifiée.

**Résultat attendu :** l'API couvre le parcours complet de consultation et de gestion, indépendamment de l'interface.

## 9. Phase 6 — Interface publique Vuetify

**Objectif :** permettre une consultation rapide sur ordinateur, tablette et mobile.

- [x] Créer le layout principal et la navigation responsive.
- [x] Construire la page d'accueil avec recherche globale.
- [x] Ajouter les filtres par domaine, type, thème, lieu et âge.
- [x] Afficher les résultats sous forme de cartes ou de liste adaptée à la taille d'écran.
- [x] Ajouter une pagination pour environ 1 000 fiches.
- [x] Afficher un état de chargement, un état vide et un état d'erreur.
- [x] Créer la page de détail `/materials/:id`.
- [x] Afficher l'image Cloudinary ou un état explicite lorsqu'elle manque.
- [ ] Afficher les dates de création et de modification selon le besoin fonctionnel.
- [ ] Afficher les actions d'édition uniquement pour les utilisateurs connectés.
- [ ] Vérifier la navigation au clavier, les libellés des contrôles, les contrastes et les textes alternatifs.

**Résultat attendu :** le public trouve une fiche en quelques actions et consulte son contenu sur tous les formats d'écran.

## 10. Phase 7 — Interface éditeur et administration

**Objectif :** gérer les fiches et les utilisateurs sans dépendre d'un outil technique.

- [x] Créer le formulaire partagé de création et de modification.
- [x] Valider les champs côté client et côté serveur.
- [x] Alimenter les listes déroulantes depuis les tables de référence.
- [x] Permettre la sélection d'une image et la prise de photo mobile via `accept="image/*"`.
- [x] Afficher le résultat de l'upload.
- [x] Prévisualiser l'image avant l'enregistrement.
- [x] Demander une confirmation avant toute suppression.
- [x] Préserver les données saisies lorsqu'une validation échoue.
- [ ] Ajouter une page d'administration des utilisateurs pour le rôle `admin`.
- [ ] Permettre la création, la désactivation et la réinitialisation contrôlée des comptes.

**Résultat attendu :** un éditeur peut créer et maintenir une fiche depuis un téléphone sans intervention dans la base de données.

## 11. Phase 8 — Qualité, sécurité et validation

**Objectif :** valider les parcours critiques avant la mise en production.

- [ ] Tester la création, modification et suppression d'une fiche.
- [ ] Tester les permissions `admin`, `editor` et visiteur.
- [ ] Tester l'expiration et la destruction de session.
- [ ] Tester les entrées invalides et les fichiers trop volumineux.
- [ ] Vérifier qu'aucun secret n'apparaît dans le bundle client ou les réponses API.
- [ ] Vérifier l'accessibilité et l'utilisation mobile.
- [ ] Tester une sauvegarde et une restauration de la base avant migration de production.
- [ ] Ajouter les tests automatisés disponibles pour les règles métier et les routes sensibles.

**Critère de sortie :** aucun parcours critique ne permet une écriture non authentifiée, une relance de migration ne crée pas de doublon et les fiches principales restent consultables en cas d'image manquante.

## 12. Phase 9 — Déploiement Cloudflare

**Objectif :** publier une version reproductible et sécurisée.

- [ ] Configurer les variables d'environnement et secrets dans l'environnement de production.
- [ ] Utiliser une valeur forte pour le secret de session.
- [ ] Configurer `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` uniquement côté serveur.
- [ ] Configurer `NUXT_SESSION_PASSWORD` avec une valeur aléatoire d'au moins 32 caractères.
- [ ] Appliquer les migrations sur la base D1 de production.
- [ ] Déployer l'application sur l'URL Cloudflare prévue.
- [ ] Vérifier les logs, les performances, les uploads et les sessions en production.
- [ ] Documenter la procédure de déploiement et de retour arrière.

**Résultat attendu :** la version de production sert les fiches publiques et fournit un espace éditeur sécurisé.

## 15. Configuration des secrets de production

Les valeurs présentes dans le fichier `.env` local ne sont pas automatiquement disponibles en production. Elles doivent être ajoutées séparément dans l'environnement Cloudflare qui exécute l'application.

### Valeurs à configurer

| Nom | Type | Utilisation |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Variable | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Secret | Authentification serveur auprès de Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret | Signature des opérations Cloudinary |
| `NUXT_SESSION_PASSWORD` | Secret | Chiffrement et signature des sessions |
| `NUXT_BOOTSTRAP_SECRET` | Secret temporaire | Création contrôlée du premier administrateur, puis suppression |
| `CLOUDFLARE_D1_DATABASE_ID` | Variable | Identifiant public de la base D1 utilisée par NuxtHub |

### Procédure

1. Ouvrir le tableau de bord Cloudflare.
2. Ouvrir **Workers & Pages**, puis sélectionner le projet Juno-Matos.
3. Ouvrir **Settings**, puis **Variables and Secrets**.
4. Ajouter `CLOUDINARY_CLOUD_NAME` comme variable et les autres valeurs sensibles comme secrets chiffrés.
5. Répéter la configuration pour l'environnement de production et, si nécessaire, pour l'environnement de préproduction.
6. Utiliser `NUXT_BOOTSTRAP_SECRET` uniquement pendant la création du premier administrateur, puis le supprimer. Cette étape est terminée pour l'environnement local.
7. Redéployer l'application après l'ajout ou la modification d'un secret.

Les mêmes noms doivent être utilisés dans Nuxt afin que le code serveur fonctionne sans différence entre local et production. Le fichier `.env` local doit rester ignoré par Git ; seul un fichier `.env.example` contenant les noms sans les valeurs peut être partagé.

Le dépôt contient également `wrangler.jsonc`, qui déclare la base D1 `juno-matos-db` pour les commandes Wrangler et le déploiement Cloudflare.

En local sous Windows, utiliser `http://localhost:3000` pour les commandes et les tests d'authentification. Dans l'environnement de développement utilisé pour ce projet, `localhost` fonctionne alors que `127.0.0.1` peut ne pas être joignable.

Les clés Cloudinary ne doivent pas être placées dans le code client, dans `runtimeConfig.public`, dans `roadmap.md` ou dans un dépôt GitHub. La clé API et le secret servent désormais aux opérations d'image effectuées par l'application ; ils peuvent être renouvelés depuis Cloudinary si leur exposition est suspectée.

## 13. Ordre recommandé pour le MVP

Le MVP doit suivre cet ordre afin de réduire les dépendances :

1. Stabiliser les versions et la configuration.
2. Créer le schéma `materials` et les migrations.
3. Finaliser l'authentification et les autorisations.
4. Ajouter l'API CRUD pour les opérations effectuées dans l'application.
5. Construire le formulaire et l'interface éditeur.
6. Tester les parcours critiques.
7. Préparer et déployer la version de production.

## 14. Évolutions après le MVP

Ces fonctionnalités restent hors du premier périmètre :

- export PDF ou export Excel ;
- favoris et listes personnelles ;
- historique détaillé des modifications ;
- recherche plein texte avancée ;
- notifications ;
- statistiques d'utilisation ;
- gestion de plusieurs organisations ou établissements.
