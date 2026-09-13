# Juno-Matos - Instructions et Suivi de Projet

Ce fichier sert à conserver l'historique de notre travail, les décisions d'architecture prises, et à guider le développement de l'application **Juno-Matos**.

## 📋 Présentation du Projet

L'application **Juno-Matos** permet de lister, rechercher, ajouter, modifier et supprimer du matériel pédagogique.
- **Utilisateurs cibles** : Public (consultation), Éditeurs (gestion du matériel).
- **Plateformes** : Web responsive (compatible desktop, tablette, mobile).
- **Architecture de déploiement** : Nuxt 4 + NuxtHub (SQLite local et de production hébergé sur Cloudflare D1) + Hébergement Cloudflare Pages + Gestion d'images Cloudinary.

---

## 🛠️ Pile Technologique & Architecture

- **Framework** : Nuxt 4 (Structure avec dossier `/app` et `/server`).
- **Base de données** : SQLite gérée via **Drizzle ORM** et **NuxtHub DB**.
- **Gestion d'images** : **Cloudinary** via le module `@nuxtjs/cloudinary`.
- **Authentification** : Sessions sécurisées côté serveur (via BFF) à l'aide de `nuxt-auth-utils` ou de sessions sécurisées personnalisées.
- **Style / UI** : À définir (Nuxt UI ou Vuetify selon choix utilisateur).

---

## 💾 Schéma de Base de Données (Projeté)

### Table Principale : `materials`
- `id` : `integer().primaryKey()` (conserve les IDs du fichier Excel pour maintenir l'intégrité).
- `nom` : `text().notNull()` (nom du matériel).
- `domaine` : `text()` (catégorie, ex : "mathématiques").
- `type` : `text()` (format, ex : "cartes").
- `theme` : `text()` (thème, ex : "animaux familiers").
- `ageMin` : `integer()` (âge minimum).
- `nbreMin` : `integer()` (nombre de joueurs minimum).
- `nbreMax` : `integer()` (nombre de joueurs maximum).
- `cloudinaryPublicId` : `text()` (ID de l'image Cloudinary).
- `cloudinaryUrl` : `text()` (URL de l'image Cloudinary).
- `lieu` : `text()` (lieu de stockage).
- `description` : `text()` (description textuelle).

### Tables de Référence (Listes déroulantes)
Pour alimenter les formulaires de création et de filtre :
- `domaines` : `id` (text), `nom` (text)
- `types` : `id` (text), `nom` (text)
- `themes` : `nom` (text, clé unique)
- `lieux` : `id` (integer), `nom` (text)
- `ages` : `id` (text), `nom` (integer/text)

---

## 🚀 Bonnes Pratiques de Développement

1. **Sécurité BFF (Backend-For-Frontend)** : 
   - Toutes les requêtes d'écriture (POST, PUT, DELETE) doivent être sécurisées par un middleware d'authentification Nuxt qui valide la session côté serveur.
   - Pas de clés d'API Cloudinary ou de secrets d'authentification exposés dans le code client.
2. **Gestion Cloudinary** :
   - Les téléchargements depuis l'application se feront via une API Nuxt sécurisée qui génère des signatures temporaires d'upload (Secure Upload Presets) ou effectue l'upload directement côté serveur.
3. **Responsive et Mobile First** :
   - Interface épurée et optimisée pour les smartphones (prise de photo via l'appareil photo natif).
4. **Intégrité de la migration** :
   - Le script de migration doit être idempotent (pouvoir être relancé sans dupliquer les enregistrements ni ré-uploader les images déjà présentes dans Cloudinary).
