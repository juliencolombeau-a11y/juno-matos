# Questions de cadrage — décisions prises

Ce document conserve les réponses initiales qui ont guidé l'architecture.

## Interface

Vuetify est conservé comme bibliothèque d'interface.

## Authentification

Le projet utilise une authentification multi-utilisateurs avec une table `users`, des mots de passe hachés, les rôles `admin` et `editor`, et des sessions chiffrées par `nuxt-auth-utils`.

## Images initiales

Les images Google Drive étaient accessibles publiquement. Elles ont été migrées vers Cloudinary. 288 images ont été transférées et une fiche reste sans source d'image exploitable.

## Identifiants

La clé primaire applicative est auto-incrémentée. Le champ `legacyId` conserve l'identifiant Excel uniquement pour la traçabilité et les opérations historiques.

## Cloudinary

Les trois valeurs Cloudinary existent dans le `.env` local et sont configurées séparément comme variables ou secrets dans Cloudflare. Elles ne doivent jamais être commitées.

## Champs métier

Chaque fiche contient les dates de création et de modification, ainsi que les champs `description` et `commentaire`.

## Décision sur l'import

Le fichier Excel a été traité une seule fois. Aucun nouvel import n'est prévu pour le fonctionnement courant : les ajouts, modifications et suppressions passent par l'application.
