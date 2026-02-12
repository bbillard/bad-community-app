# Badminton Progress — MVP

Prototype mobile-first d'une application gamifiée pour suivre la progression au badminton.

## Fonctionnalités incluses

- Onboarding utilisateur (nom, niveau initial, fréquence d'entraînement)
- Navigation par barre d'onglets: Accueil, Séance, Défis, Communauté
- UI colorée/gamifiée avec avatar de joueur de badminton (inspiré de l'image fournie)
- Page Accueil avec:
  - niveau global, XP totale, barre de progression
  - progression par compétences (Technique, Déplacements, Tactique, Physique, Matchs)
  - historique récent des séances
  - badges débloqués
  - bouton vers la page d'ajout de séance
- Page Création de séance avec:
  - sélection de date (calendrier), limitée à aujourd'hui ou avant
  - tagging d'un ami depuis la communauté
  - upload d'une photo (fichier image) en option
  - pop-up de confirmation puis retour automatique vers l'accueil
- Affichage de la photo dans l'historique des dernières séances
- Génération de défis hebdomadaires
- Leaderboard (amis + club)
- Données persistées en local (localStorage)
- Données de démo injectées au premier onboarding pour visualiser la progression

## Lancer localement

Aucune dépendance npm requise.

```bash
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

## Règles XP (MVP)

- Base par type:
  - Entraînement badminton: 70 XP
  - Match entraînement: 90 XP
  - Match officiel: 120 XP
  - Physique / cardio: 60 XP
- Bonus:
  - +15 XP si validation coéquipier
  - +10 XP si photo ajoutée
- Multiplicateur durée:
  - `<45 min`: x0.8
  - `45-89 min`: x1.0
  - `>=90 min`: x1.2

Les compétences sélectionnées se partagent l'XP de la séance.

## Stack

- HTML / CSS / JavaScript (ES modules)
- Architecture front-only (MVP), facile à porter vers React Native ou Flutter
