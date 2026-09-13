# Questions de Cadrage - Juno-Matos

Afin de commencer le développement sur des bases solides et selon vos préférences exactes, merci de prendre un moment pour répondre aux questions suivantes. Vous pouvez écrire directement vos réponses sous chaque question.

---

### 🎨 Question 1 : Quel framework d'interface (UI) préférez-vous ?
Dans `contexte.md`, vous mentionnez **Vuetify**. C'est une excellente bibliothèque de composants très complète. Cependant, dans l'écosystème Nuxt moderne (surtout avec Nuxt 4 et NuxtHub), **Nuxt UI (v4)** est extrêmement populaire, ultra-performant, parfaitement responsive et très rapide à prendre en main.
*   **Option A : Nuxt UI (v4)** (Recommandé pour sa légèreté, sa réactivité sur mobile, et sa parfaite intégration Nuxt/Tailwind).
*   **Option B : Vuetify (v3)** (Idéal si vous préférez le Material Design de Google ou si vous le maîtrisez déjà).
*   **Option C : Autre** (ex : Tailwind pur, autre bibliothèque).

👉 **Votre réponse :**
je préfère rester sur vuetify V3

---

### 🔐 Question 2 : Comment souhaitez-vous gérer l'authentification ?
Le projet nécessite un espace éditeur sécurisé pour ajouter/modifier/supprimer du matériel.
*   **Option A : Authentification à utilisateur unique simple** (Les identifiants et mots de passe sont définis de manière sécurisée dans les variables d'environnement `.env`, par exemple `ADMIN_USER` et `ADMIN_PASS`. Pas besoin de table `users` en base de données. Très simple et largement suffisant si vous êtes le seul éditeur).
*   **Option B : Authentification multi-utilisateurs avec base de données** (Création d'une table `users` en BDD avec mot de passe haché. Permet de gérer plusieurs comptes éditeurs et éventuellement un compte admin pour créer ces éditeurs).
*   **Option C : Connexion via OAuth (Réseaux Sociaux)** (Se connecter avec GitHub ou Google via NuxtHub Auth).

👉 **Votre réponse :**
Option B

---

### ☁️ Question 3 : Accessibilité des images Google Drive actuelles
Pour que le script de migration automatique puisse transférer les images de Google Drive vers Cloudinary, il faut que Cloudinary puisse accéder directement aux images Google Drive via leur URL publique.
*   **Les images Google Drive actuelles sont-elles configurées en mode public ?** (C'est-à-dire : "Tous les utilisateurs disposant du lien peuvent lire").
    *   *Note :* Si oui, l'import sera 100% automatisé et extrêmement rapide. Si non, il faudra soit les rendre publiques temporairement, soit passer par un script local qui nécessite un token d'API Google Drive.

👉 **Votre réponse :**
Oui elles sont disponibles en lien public

---

### 🏷️ Question 4 : Conservation des identifiants (IDs) existants
Le fichier Excel possède une colonne `id` pour chaque matériel (allant de 1 à 998).
*   Souhaitez-vous que nous conservions exactement ces IDs en base de données SQLite (afin de conserver l'historique et d'éventuels liens externes) ?
*   Les nouveaux matériels ajoutés via l'application commenceront alors à l'ID `999` et s'incrémenteront automatiquement.

👉 **Votre réponse :**
Les ids n'ont pas d'importance tu peux créer une nouvelle clé primaire si c'est plus facile pour l'importation

---

### ⚙️ Question 5 : Configuration Cloudinary de production
Avez-vous déjà vos identifiants Cloudinary prêts à être ajoutés dans le fichier `.env` ?
Nous aurons besoin de :
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` (pour le script de migration et les uploads sécurisés)
- `CLOUDINARY_API_SECRET` (pour le script de migration et les uploads sécurisés)

👉 **Votre réponse :**
les 3 valeurs sont dans le .env local

---

### 💡 Des remarques, souhaits particuliers ou fonctionnalités bonus pour la suite ?
(Par exemple : une fonctionnalité d'export PDF, de partage de fiches de matériel, un système de favoris, etc.)

👉 **Votre réponse :**
Il faudrait ajouter une date de création et une date de modification sur chaque fiche. 
En plus de la colonne description, tu peux ajouter une colonne 'commentaire' en texte.
