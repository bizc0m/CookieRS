# Log CrokETT

## 2026-05-12

- Renommage complet CookieRS → CrokETT (package.json, preload, main, index.html, localStorage key `crokETT.state`, migrations, textes UI).
- Correction du clignotement webview : `wvFrame` persistant au niveau module, skeleton HTML construit une seule fois, DOM `.web-frame` jamais détaché.
- Correction du clignotement en double vue : toolbar mise à jour en place (jamais détruite), webview retrouvée par `data-tab-id` et non par ordre DOM.
- Clic droit dans le webview : événement Electron `context-menu` (ne remonte pas au document), coordonnées recalculées avec `getBoundingClientRect()` + fallbacks.
- Clic droit en double vue : `ui.menu.wv` stocke la référence du webview source, `pageAct` cible toujours le bon pane.
- Isolation cookies par app : partition `persist:crokETT-app-{partitionKey||appId}` — chaque app isolée, les clones partagent la même clé.
- Suppression du détecteur RSS : `detectRss`, `rssFeedsForTab`, `renderRssMenu`, bouton toolbar RSS, listener `did-navigate-in-page` RSS supprimés.
- Déplacement `+ Groupe` et `+ App` sur la même ligne dans le footer sidebar.
- Réduction de 50 % de la taille des caractères du menu contextuel (13 px → 7 px).
- Réglage global des polices : sélecteur de famille (Système / Sans-serif / Serif / Monospace) + curseur de taille (80–130 %) dans la section « Polices » des réglages.
- Variable CSS `--ui-font` appliquée sur `body` ; police injectée dans les webviews via `insertCSS` si une famille non-système est choisie.
- Marquage visuel des apps clonées : badge `⊕` sur l'icône dans la sidebar, classe CSS `clone-app`, info « Clone de … » dans le tooltip et dans les propriétés.
- Affichage de l'identifiant unique de chaque app dans sa modale de propriétés (champ « Référence », lecture seule).

## 2026-05-11

- Correction du repli des groupes depuis le titre/chevron de l'outliner.
- Réduction d'environ 50 % de la largeur sidebar, des icônes et des textes apps.
- Ajout du bouton double vue `Ⅱ` pour afficher deux apps/webviews côte à côte.
- Ajout des sélecteurs indépendants app/URL pour chaque colonne en double vue.
- Ajout du drag and drop d'une app vers une colonne gauche/droite en double vue.
- Passage de la sidebar en outliner : groupes repliables/dépliables.
- Ajout du drag and drop d'apps entre groupes.
- Ajout des propriétés de priorité sur groupes et apps.
- Ajout des propriétés app cachable, secret par défaut et URL masquée.
- Ajout du bouton global pour masquer les apps cachables.
- Durcissement IPC : `openExternal` limite maintenant les protocoles à http/https/mailto.
- Durcissement extensions Chrome : validation du manifest et chargement sans accès fichier direct.
- Durcissement téléchargements : chemin vérifié et nom de fichier nettoyé.
- Suppression du reset forcé du groupe/app au démarrage.
- Ajout de tests Node sur les validations critiques.
- Correction du clignotement Gmail : le détecteur RSS ne reconstruit plus les webviews.
- Correction du deuxième bouton : menu contextuel ouvert sans rechargement du webview.
- Correction du partage : modal ouverte sans re-render global et fallback rapide si la sélection est inaccessible.
- Fusion visuelle des deux barres latérales en une sidebar compacte.
- Ajout du support d'extensions Chrome unpacked.
- Ajout d'un détecteur RSS/Atom par page.
- Ajout du menu RSS dans le deuxième bouton et dans la toolbar.
- Correction du partage depuis le deuxième bouton.
- Centrage et élargissement du cadre de partage.
- Compactage des barres navigateur/onglets.
- Remise visible par défaut des labels de sites dans la colonne apps.
- Ajout du réglage `Colonne apps compacte`.
- Déplacement de `+ Groupe` dans la colonne groupes.
- Maintien de `+ App` dans la colonne apps.
- Alignement bas des boutons d'ajout groupe/app.
- La roue de réglage de la colonne groupes ouvre maintenant les paramètres globaux.
- Ajout des réglages réels de taille d'icônes groupes/apps.
- Unification de la sidebar : retrait des boutons OFF et Donate.
- Déplacement de l'affichage des apps cachées dans les réglages globaux.
- Déplacement de Donate dans les réglages globaux.
- Restauration du bouton partage direct dans la toolbar.
- Intégration du partage dans le menu secondaire.
- Transformation du deuxième bouton en menu contextuel complet sans symbole trois points.
- Ajout des actions app et groupe dans le menu secondaire.
- Suppression du bouton trois points sur chaque app.
- Suppression de l'URL secondaire sous les labels apps.
- Ajustement de l'affichage macOS des trois boutons système.
- Restauration de la hauteur normale des onglets.
- Ajout de `fonction.MD` pour lister les fonctions.
- Ajout de `log.md` pour suivre les changements.
- Correction du bouton contextuel principal : suppression du double déclenchement `pointerdown`/`click` qui pouvait ouvrir puis fermer le menu immédiatement.
- Durcissement anti-crash renderer : menus flottants rendus uniquement hors racine, handlers `closest()` sécurisés, migration de configuration tolérante aux anciennes données invalides.
- Correction du deuxième bouton : ouverture passée sur `click` capturé et fermeture flottante annulable pour empêcher le menu de se refermer instantanément.
- Désactivation des demandes macOS Trousseau via switches Chromium `password-store=basic` et `use-mock-keychain`.
- Correction du deuxième bouton en handler direct sur le bouton rendu, sans listener global fragile.
- Réduction d'environ 50 % de la barre haute et réduction de 30 %+ des fontes/hauteurs d'onglets.
- Ajout des actions split gauche/droite pour chaque app depuis le menu principal et le menu contextuel d'app.
- Ajout du menu d'onglet : nouvel onglet, fermetures, ouvrir lien dans app/navigateur/fenêtre, split droite/bas, son, épinglage et renommage d'onglet épinglé.
- Harmonisation macOS/fenêtres : factory BrowserWindow commune, options titlebar/traffic lights réutilisées, fenêtres secondaires sécurisées, popups webview redirigées vers le navigateur système.

## Vérification à maintenir

- Ne pas casser les groupes.
- Ne pas casser le drag and drop groupes/apps.
- Ne pas casser les propriétés app/groupe.
- Ne pas casser les notifications et compteurs.
- Ne pas casser les onglets secrets.
- Ne pas casser le partage texte sélectionné + URL.
- Ne pas casser import/export JSON.
- Ne pas casser les skins et densités.
