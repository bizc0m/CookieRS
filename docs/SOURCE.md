# CookieRS Source Guide

## Architecture

CookieRS est une application Electron minimale.

- `src/main.js` lance la fenêtre native, configure les permissions et expose quelques IPC.
- `src/preload.cjs` expose une API sûre au renderer via `contextBridge`.
- `src/renderer/index.html` charge l'interface.
- `src/renderer/app.js` contient l'état, le rendu UI, les raccourcis, les webviews, les menus et l'import/export JSON.
- `src/renderer/styles.css` contient les skins, densités, panneaux et layout.

## Etat local

L'état principal est persisté dans `localStorage` sous `cookiers.state`.

Champs globaux :

- `density` : `compact`, `normal`, `large`
- `skin` : `biscuit`, `dark`, `mono`, `custom`
- `customSkin` : couleurs du skin personnalisé
- `settingsOpen`, `settingsSection`
- `maskUrl`
- `sidebarCollapsed`
- `secretsHidden`
- `showHiddenApps`
- `workspaces`
- `appsByWorkspace`
- `activeAppByWorkspace`
- `tabsByApp`

## Groupes

Un groupe contient :

- `id`
- `name`
- `icon`
- `iconImage`
- `color`
- `highlightColor`

Les groupes sont réordonnables par drag and drop.

## Apps

Une app contient :

- `id`
- `name`
- `url`
- `color`
- `highlightColor`
- `iconImage`
- `notifications`
- `notificationCount`
- `hidden`

Les apps sont réordonnables par drag and drop.

## Onglets secrets

Un onglet peut être marqué `secret`.

- `Cmd/Ctrl+Shift+S` : active/désactive le secret sur l'onglet actif
- `Cmd/Ctrl+Shift+H` : masque/réaffiche les onglets secrets

Les onglets secrets utilisent une partition Electron séparée.

## Notifications

CookieRS compte les notifications quand un site appelle `new Notification(...)` dans la webview. Un fallback lit aussi les titres de page au format `(N)`.

Limite : un site doit demander et obtenir la permission Notification pour que le flux réel existe.

## Paramètres

La roue de réglages ouvre le panneau global :

- général
- téléchargements
- notifications
- raccourcis
- micro/caméra
- polices
- sync
- extensions
- import/export
- avancé

Les réglages globaux ne doivent pas être dispersés dans la sidebar.

## Import/export

L'export JSON sérialise l'état complet. L'import lit un fichier JSON et passe par `migrateState()` pour compléter les champs manquants.

## Build

Commandes :

```bash
npm install
npm start
npm run pack
npm run build:mac
npm run build:win
npm run build:linux
```

Le packaging multi-OS utilise `electron-builder`.
