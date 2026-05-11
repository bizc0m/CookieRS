# Fonctions CookieRS

## Interface

- Interface desktop Electron inspirée de Biscuit/Cookie.
- Trois densités : A compact, B normal, C large.
- Skins : Biscuit, Dark, Mono, Custom.
- Skin personnalisé par couleurs globales.
- Barre latérale groupes et barre apps.
- Sidebar unique compacte avec groupes et apps dans la même colonne.
- Colonne apps repliable en mode icônes seules.
- Réglage pour passer la colonne apps en mode compacte ou labels visibles.
- Bouton `+ Groupe` dans la colonne groupes.
- Bouton `+ App` dans la colonne apps.
- Réglage de taille des icônes groupes.
- Réglage de taille des icônes apps.
- Labels apps affichés sans URL secondaire.
- Réglages globaux centralisés dans la roue de réglages.
- Zone macOS ajustée pour les trois boutons système.

## Groupes

- Groupes de colonne 1.
- Ajout de groupe.
- Bouton d'ajout placé en bas de la colonne groupes.
- Propriétés groupe : nom, icône texte, image URL/upload, couleur, highlight.
- Drag and drop des groupes.
- Raccourcis groupes `Cmd/Ctrl+1..9`.
- Groupe précédent/suivant via menu ou raccourcis.

## Apps

- Ajout d'app par nom et URL.
- Bouton d'ajout placé en bas de la colonne apps.
- Propriétés app : nom, URL, couleur icône, highlight, image URL/upload, notifications, compteur, cachée.
- Drag and drop des apps.
- Favicon automatique si aucune image custom.
- Apps cachées avec affichage temporaire depuis les réglages.
- Duplication et suppression.

## Onglets

- Onglets par app.
- Nouvel onglet.
- Onglet secret.
- Masquer/afficher les onglets secrets.
- Partitions Electron séparées par groupe, app et secret.

## Navigation

- Retour.
- Avant.
- Recharger.
- Barre URL.
- Masquage de l'URL dans l'écran principal.
- Ouverture dans le navigateur externe.
- Barre navigateur et onglets compactées.

## Chrome / extensions

- Rendu web via Chromium/Electron.
- Chargement d'extensions Chrome non empaquetées depuis les réglages.
- Liste locale des extensions chargées.
- Certaines APIs Chrome peuvent dépendre des limites Electron.

## RSS

- Détection automatique des liens RSS/Atom dans les pages.
- Bouton RSS activé quand des flux sont trouvés.
- Menu RSS ouvrant les flux détectés.

## Notifications

- Permission Notification gérée côté Electron.
- Compteur par app via appels `Notification`.
- Fallback par titre de page au format `(N)`.
- Activation/désactivation par app.
- Reset compteur.

## Partage

- Bouton partage direct dans la toolbar.
- Partage du texte sélectionné + URL.
- Partage fonctionne aussi sans texte sélectionné, avec titre + URL.
- Cibles : Copier, X, LinkedIn, Buffer, Mail.
- Fonction partage intégrée au menu secondaire.

## Menu secondaire

- Bouton menu secondaire sans trois points.
- Actions page : retour, avant, reload, partage, secret, cacher secrets, masquer URL, ouvrir navigateur.
- Actions app : ouvrir, nouvel onglet, onglet secret, propriétés, dupliquer, notifications, cacher, reset compteur, supprimer.
- Actions groupe : propriétés, précédent, suivant.

## Import / export

- Export JSON complet de configuration.
- Import JSON avec migration d'état.

## Build

- Développement : `npm start`.
- Tests validations : `npm test`.
- Version cliquable macOS : `npm run pack:clickable`.
- Builds multi-OS : `npm run build:mac`, `npm run build:win`, `npm run build:linux`.

## Sécurité locale

- Ouverture externe limitée aux protocoles `http`, `https` et `mailto`.
- Extensions Chrome locales validées par `manifest.json`.
- Téléchargements vers dossier existant uniquement quand le chemin par défaut est utilisé.
