# CookieRS go (New Build) CrockETT V2 

CookieRS est un navigateur desktop open source inspiré du workflow Biscuit : apps web dans une sidebar, workspaces séparés, onglets par app et barre d'adresse visible.

## Lancer en développement

```bash
npm install
npm run dev
```

## Fonctions du lot 1

- Workspaces `Work` et `Personal`
- Apps web préchargées
- Ajout d'app par nom + URL
- Onglets par app
- Sessions isolées par workspace et app avec partitions Electron persistantes
- Barre d'adresse toujours visible
- Navigation retour, avant, reload
- Notifications autorisées côté Electron

## Fonctions du lot 2

- Interface A : éléments réduits à 50 %
- Interface B : taille normale
- Interface C : éléments augmentés à 125 %
- Skins : Biscuit, Dark, Mono
- Récupération automatique des favicons des sites
- Clic droit sur une app : ouvrir, nouvel onglet, propriétés, dupliquer, notifications, supprimer
- Bouton propriétés dans la barre supérieure

## Fonctions du lot 3

- Colonne 2 repliable en mode icônes seules
- Compteur de notifications par app, automatique si le titre de page contient `(N)` et manuel dans les propriétés
- Propriétés des groupes de la colonne 1 : nom, icône texte, couleur
- Raccourcis groupes : `Cmd/Ctrl+1..9`
- Raccourcis groupe précédent/suivant : `Alt+Cmd/Ctrl+←/→`
- Onglet secret : `Cmd/Ctrl+Shift+S`
- Masquer/afficher les onglets secrets : `Cmd/Ctrl+Shift+H`
- Partage du texte sélectionné + URL : copier, X, LinkedIn, Buffer, mail

## Fonctions du lot 4

- Compteur basé sur les notifications de sites via l'API `Notification`, avec fallback titre `(N)`
- Apps cachées et affichage temporaire des apps cachées
- Drag and drop des groupes de la colonne 1
- Drag and drop des apps de la colonne 2
- Couleur assignable aux apps et groupes
- Icône image URL possible pour les groupes
- Export de configuration au format JSON
- Import de configuration JSON

## Fonctions du lot 5

- Tous les réglages globaux regroupés dans la roue de réglages
- Panneau paramètres rapproché de l'interface Biscuit/Cookie
- Sidebar app rapprochée du screenshot : groupe, lignes app, bouton options, footer `+ Groupe`, `OFF`, Donate, `+ App`
- Highlight couleur autour des groupes et des icônes via sélecteur couleur standard
- Icônes personnalisées par URL ou upload image pour apps et groupes
- Skin personnalisé avec couleurs globales du chrome
- Masquage de l'URL sur l'écran principal
- Deuxième bouton de la fenêtre avec actions normales, onglet secret, masquage URL, propriétés et partage
- Documentation source Markdown et Word dans `docs/`

## Compiler

```bash
npm run pack
npm run pack:clickable
npm run build:mac
npm run build:win
npm run build:linux
```

La version macOS cliquable est générée dans `dist/mac-arm64/CookieRS.app`.

Le code source est portable Electron. La compilation native finale doit idéalement être lancée sur chaque OS cible ou via CI multi-OS.

## Licence

MIT. Les assets, logos et marques de services tiers restent la propriété de leurs détenteurs.
