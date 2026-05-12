# Fonctions CrokETT

## Interface

- Interface desktop Electron inspirée de Biscuit/Cookie.
- Trois densités : A compact, B normal, C large.
- Skins : Biscuit, Dark, Mono, Custom.
- Skin personnalisé par couleurs globales.
- Sidebar réduite, avec icônes et textes à taille compacte.
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
- Groupes affichés en outliner repliable/dépliable.
- Propriétés groupe : nom, icône texte, image URL/upload, couleur, highlight, priorité, raccourci, état replié.
- Drag and drop des groupes.
- Raccourcis groupes `Cmd/Ctrl+1..9`.
- Groupe précédent/suivant via menu ou raccourcis.

## Apps

- Ajout d'app par nom et URL.
- Bouton d'ajout placé en bas de la colonne apps.
- Propriétés app : nom, URL, couleur icône, highlight, image URL/upload, priorité, notifications, compteur, cachable, cachée, secret, URL masquée.
- Drag and drop des apps dans un groupe ou entre groupes.
- Favicon automatique si aucune image custom.
- Apps cachées avec affichage temporaire depuis les réglages.
- Bouton global pour masquer toutes les apps marquées cachables.
- Duplication et suppression.
- `duplicateApp(appId)` — crée une copie de l'app avec une `partitionKey` partagée (cookies communs). La copie reçoit le suffixe ` 2` et un nouvel identifiant unique.
- Apps clonées signalées par un badge `⊕` sur l'icône et la classe CSS `clone-app`. L'identifiant unique (`id`) est affiché dans la modale Propriétés (champ « Référence »).

## Onglets

- Onglets par app.
- Nouvel onglet.
- Onglet secret.
- Masquer/afficher les onglets secrets.
- Partitions Electron séparées par groupe, app et secret.
- `partition(appId, partitionKey, tab)` — retourne la chaîne de partition Electron : `persist:crokETT-secret-{tabId}` pour les onglets secrets, sinon `persist:crokETT-app-{partitionKey||appId}`. Les apps clonées partagent la `partitionKey` de l'original → même container de cookies.

## Navigation

- Retour.
- Avant.
- Recharger.
- Barre URL.
- Masquage de l'URL dans l'écran principal.
- Ouverture dans le navigateur externe.
- Barre navigateur et onglets compactées.
- Double vue pour afficher deux apps/webviews côte à côte dans la grande fenêtre.
- En double vue, chaque colonne possède son propre sélecteur d'app et sa propre URL éditable.
- Une app peut être glissée depuis la colonne apps vers la colonne gauche ou droite.
- `syncWebviews(frame, ws, app, splitReady, lPane, lTab, rPane, rTab)` — réconciliation impérative des webviews sans jamais les détacher du DOM. En double vue, la toolbar est mise à jour en place et les webviews sont retrouvées par `data-tab-id`. En vue normale, les webviews non nécessaires sont supprimées, les nouvelles créées.
- `wireWebviews()` — attache les événements Electron (`context-menu`, `did-navigate`, `did-finish-load`, etc.) sur les webviews non encore câblées (`__wired`). Idempotent.
- Clic droit dans le webview : événement `context-menu` Electron. Coordonnées calculées via `getBoundingClientRect()` + `e.params.x/y` avec fallbacks. La référence `wv` est stockée dans `ui.menu.wv` pour que les actions ciblent le bon pane en split.

## Chrome / extensions

- Rendu web via Chromium/Electron.
- Chargement d'extensions Chrome non empaquetées depuis les réglages.
- Liste locale des extensions chargées.
- Certaines APIs Chrome peuvent dépendre des limites Electron.

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

## Polices

- Réglage global de la famille de police (Système, Sans-serif, Serif, Monospace) dans Paramètres → Polices.
- Réglage de la taille du texte (80–130 %) via curseur `fontScale`.
- Variable CSS `--ui-font` appliquée sur `body` via `applyChrome()`.
- `injectWebviewFont(wv)` — injecte la famille choisie dans le webview via `insertCSS` si la famille n'est pas « système ».

## Sécurité locale

- Ouverture externe limitée aux protocoles `http`, `https` et `mailto`.
- Extensions Chrome locales validées par `manifest.json`.
- Téléchargements vers dossier existant uniquement quand le chemin par défaut est utilisé.
