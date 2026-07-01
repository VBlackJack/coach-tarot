# UX, UI et règles

Ce document résume les choix de conception actuels pour la table de jeu, le coach et le calcul de score.

## Table de jeu

La main du joueur reste en bas de l'écran pendant les plis. Le plateau ne doit pas se redimensionner brutalement entre les tours: les bandeaux d'action sont compacts, la chronologie du pli reste sous le tapis et les informations longues sont envoyées dans le panneau latéral.

Les cartes posées sur le plateau sont plus grandes que les cartes de replay et de chien. Elles utilisent:

- des chiffres jumbo pour les petites cartes et les atouts;
- un rendu dédié pour Roi, Dame, Cavalier et Valet;
- des coins haut/bas lisibles;
- un ordre de pose visible sur chaque carte jouée.

Les emplacements vides sont volontairement plus petits que les cartes jouées. Ils indiquent la place du joueur sans faire croire qu'une carte occupe déjà tout l'espace.

## Géométrie des joueurs

À 4 joueurs, la table utilise une croix classique:

- Nord en haut;
- Est à droite;
- Vous au Sud;
- Ouest à gauche.

À 5 joueurs, la table utilise les coins pour garder une géométrie lisible:

- Nord-Ouest en haut à gauche;
- Nord-Est en haut à droite;
- Ouest en bas à gauche;
- Est en bas à droite;
- Vous au Sud, centré.

Cette disposition évite que deux adversaires d'un même côté se superposent quand les cartes du plateau sont agrandies.

## Panneau droit

Le panneau de partie est rétractable. L'utilisateur choisit s'il veut garder le panneau ouvert ou non, comme pour le menu gauche.

Le panneau regroupe:

- Actions;
- Coach;
- Score;
- Historique;
- Réglages.

Quand le panneau est ouvert, le résumé coach n'est pas dupliqué au-dessus du plateau. Quand il est fermé, le résumé inline peut réapparaître pour ne pas perdre l'information.

Pendant les phases de chien et d'écart, le coach reste accessible. Le choix de prendre le chien ne doit pas bloquer l'accès à l'analyse.

## Replay et lisibilité

Le replay de pli affiche les cartes dans une ligne compacte, y compris à 5 joueurs dans le panneau droit. Les cartes de replay restent plus petites que les cartes du plateau afin de ne pas concurrencer l'action principale.

Le dernier pli est aussi résumé sous la main, avec accès rapide au replay et à l'explication.

## Règles de pli

Les règles appliquées sont les règles usuelles du Tarot français:

- fournir la couleur demandée si possible;
- couper si la couleur demandée manque;
- monter à l'atout si possible quand un atout supérieur est déjà posé;
- l'Excuse reste au camp qui la joue, avec compensation de 0,5 point quand nécessaire.

Cliquer une carte bloquée affiche une explication courte de la règle plutôt que de ne rien faire.

## Scoring

Le score de donne tient compte:

- du nombre de bouts du preneur;
- de l'objectif associé aux bouts;
- du contrat et de son multiplicateur;
- du Petit au bout;
- des poignées;
- des demi-points.

Les demi-points sont attribués au camp qui réussit la donne:

- si le preneur chute avec 29,5 pour un objectif de 41, le score retenu côté preneur est 29;
- si le preneur réussit avec 41,5 pour un objectif de 41, le score retenu côté preneur est 42.

Le bilan final affiche la marque du point de vue du joueur. Une victoire de son camp doit donc produire une marque positive pour lui, même si le preneur a chuté.

## Vérifications

Avant commit, lancer:

```bash
node --check app.js
node tests/rules.test.js
git diff --check
```
