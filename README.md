# Coach Tarot

Coach Tarot est une application web autonome pour apprendre le Tarot français, travailler les règles de pli et jouer des donnes complètes contre l'ordinateur.

## Fonctionnalités

- Exercices guidés pour comprendre les règles de fourniture, coupe, surcoupe et défausse.
- Parties à 3, 4 ou 5 joueurs avec enchères, chien, écart, preneur, défense et partenaire appelé.
- Coach optionnel avec indice avant coup, analyse après coup et comparaison des cartes jouables.
- Score de contrat avec bouts, poignées, Petit au bout et bilan de fin de donne.
- Historique des plis, replay carte par carte, mémoire des cartes vues et suivi local de progression.
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
node tests/rules.test.js
```

## Structure

- `index.html`: point d'entrée de l'application.
- `app.js`: logique de jeu, rendu d'interface et persistance locale.
- `styles.css`: styles de l'interface.
- `manifest.webmanifest`: manifeste PWA.
- `service-worker.js`: cache hors ligne.
- `tests/rules.test.js`: tests des règles principales.

## Attribution thème

Le thème Magellan reprend les slots de palette ThemeForge Magellan par Julien Bombled, sous Apache 2.0: fond `#1B1F33`, accent `#8C9CFF`, surfaces `#2A3050`, texte `#F1F3FB` et accents fonctionnels. Le rendu a été adapté pour cette interface web de Tarot.
