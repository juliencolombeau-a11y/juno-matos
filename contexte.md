# projet juno-matos

Ce projet a pour objectif de mettre à disposition une application permettant de voir/ajouter/modifier du matériel pédagogique. Il faudra que cette application soit utilisable en application bureau ou mobile, elle devra être responsive.

## existant
Il existe déjà plusieurs choses à réutiliser ou à modifier.
### une base de données
Le matériel pédagogique a déjà commencé à etre répertorié, il est disponible dans un fichier excel MatosPeda.xlsx. La feuille 'matos' est la table principale. Les autres feuilles sont des aides pour la feuille principale notamment pour les menus déroulants. Il y a des App:logins et des colonnes softr qui ne serviront plus.
### des images
Il y a des images reliées au matériel par une adresse mail. Pour l'instant ces images sont deposées dans google drive mais l'objectif est de les transférer vers cloudinary en conservant le lien sans devoir tout refaire à la main. J'ai déjà un compte cloudinary.

## fonctionnalités voulues
### authentification
Il faudrait avoir une partie publique avec affichage du matériel, en liste et en détails.
Il faudrait une partie editeur qui permette d'ajouter/modifier/supprimer des matériels pédagogiques. Une authentification simple par identifiant/mot de passe devrait suffire.
Peut être faudra-t-il une partie admin pour gérer les utilisateurs.
### affichage
Affichage public :
- une page d'accueil avec barre de recherche et filtres
- un affichage par liste filtrée de tous les matériels pédagogiques
- un affichage en détail de chaque matériel
Affichage éditeur :
- lors d'un affichage en détail il faut pouvoir avoir un bouton modifier qui emmène vers un formulaire d'édition ainsi qu'un bouton de suppression, avec confirmation pour éviter les erreurs.
- sur la page d'accueil il y aura un bouton 'ajouter' pour gérer les ajouts.
### édition/ajout
le formulaire doit permettre de modifier/ajouter tous les champs d'un objet, ainsi que gérer l'image désirée par cloudinary si possible.
Dans la version mobile si on peut ajouter l'option pour prendre la photo directement ce serait l'idéal.

## technologies
je veux une application nuxt sécurisée notamment avec BFF sécurisé pour les appels API et la sécurité des tokens, qui serait déployée par nuxt-hub et cloudflare et dont les sources seraient sur github. C'est le cas pour le projet actuel juno-matos. Il se déploie sur https://juno-matos.julien-colombeau.workers.dev.
L'interface pourrait être en vuetify.
La gestion des images se fera par cloudinary si possible avec une solution pour migrer de façon simple les images actuelles de Google drive à cloudinary sans devoir récupérer tous les liens à la main.

## état actuel

Le fichier Excel a été traité et les images accessibles ont été migrées vers Cloudinary. Les ajouts, modifications et suppressions se feront désormais uniquement dans l'application.

L'authentification de base est en place avec `nuxt-auth-utils`. L'administrateur principal est créé localement et le secret temporaire `NUXT_BOOTSTRAP_SECRET` a été supprimé après son utilisation.

Pour les tests locaux sous Windows, utiliser `http://localhost:3000`. L'adresse `http://127.0.0.1:3000` peut ne pas être joignable dans l'environnement de développement actuel.
