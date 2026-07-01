# Coach Tarot

Coach Tarot est une application web autonome pour apprendre le Tarot français, travailler les règles de pli et jouer des donnes complètes contre l'ordinateur.

Jouer en ligne: https://vblackjack.github.io/coach-tarot/

## Fonctionnalités

- Exercices guidés pour comprendre les règles de fourniture, coupe, surcoupe et défausse.
- Parties à 3, 4 ou 5 joueurs avec enchères, chien, écart, preneur, défense et partenaire appelé.
- Coach optionnel avec indice avant coup, analyse après coup et comparaison des cartes jouables.
- Aide d'enchère, aide d'écart, analyse des coups et explication des cartes non jouables.
- Score de contrat avec bouts, demi-points, poignées, Petit au bout et bilan de fin de donne.
- Historique des plis, replay carte par carte, mémoire des cartes vues et suivi local de progression.
- Interface de table responsive avec cartes agrandies sur le plateau, main stable en bas et panneau droit rétractable.
- Application installable avec manifeste PWA, icône locale et cache hors ligne.

Tout fonctionne localement dans le navigateur: aucun compte, aucun serveur applicatif et aucune donnée envoyée.

## Lancer en local

Ouvrir `index.html` dans un navigateur moderne.

Pour tester l'installation PWA et le cache hors ligne, servir le dossier en HTTP local:

```bash
python -m http.server 4173
```

Puis ouvrir `http://127.0.0.1:4173/index.html`.

## Tests

```bash
node --check app.js
node tests/rules.test.js
git diff --check
```

## UX et règles

La table garde une géométrie stable selon le nombre de joueurs:

- 4 joueurs: croix classique avec Vous au Sud, Nord en face, Est et Ouest sur les côtés.
- 5 joueurs: Nord-Ouest et Nord-Est dans les coins hauts, Ouest et Est dans les coins bas, Vous au Sud.

Le panneau de droite est rétractable comme la navigation de gauche. L'utilisateur choisit donc s'il garde les actions, le coach, le score, l'historique ou les réglages visibles pendant la donne.

Les cartes posées sur le plateau utilisent un rendu agrandi avec chiffres jumbo, figures lisibles pour Roi, Dame, Cavalier et Valet, et emplacements vides plus discrets pour ne pas saturer la table.

Voir aussi [docs/ux-ui-rules.md](docs/ux-ui-rules.md) pour le détail de l'audit UX/UI, du scoring et des choix de layout.

## Structure

- `index.html`: point d'entrée de l'application.
- `app.js`: logique de jeu, rendu d'interface et persistance locale.
- `styles.css`: styles de l'interface.
- `manifest.webmanifest`: manifeste PWA.
- `service-worker.js`: cache hors ligne.
- `tests/rules.test.js`: tests des règles principales.
- `docs/ux-ui-rules.md`: notes de conception UX/UI, règles et scoring.

## Attribution thème

Le thème Magellan reprend les slots de palette ThemeForge Magellan par Julien Bombled, sous Apache 2.0: fond `#1B1F33`, accent `#8C9CFF`, surfaces `#2A3050`, texte `#F1F3FB` et accents fonctionnels. Le rendu a été adapté pour cette interface web de Tarot.
