# Projet Maison 3D Interactive

Une application web 3D interactive avec Three.js, permettant d'explorer une maison virtuelle avec vue à la première personne avec des éléments interactifs.

## Installation et Lancement

### Prérequis
*   **Node.js** installé sur la machine.

### Instructions
1.  Ouvrez un terminal dans le dossier du projet.
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Lancez le serveur de développement :
    ```bash
    npx vite
    ```
4.  Ouvrez l'URL indiquée dans le terminal (généralement `http://localhost:5173`) dans le navigateur.

## Contrôles et Utilisation

| Action | Touche / Contrôle |
| :--- | :--- |
| **Se déplacer** | `W`, `A`, `S`, `D` (ou `Z`, `Q`, `S`, `D`) |
| **Regarder** | Souris (Vue à la première personne) |
| **Interagir** | Clic Gauche (sur l'objet) |
| **Verrouiller la souris** | Clic sur l'écran "Click to Start" |
| **Mode Jour / Nuit** | Touche `N` |
| **Ajuster la vitesse** | Slider en bas à gauche de l'écran |

## Fonctionnalités et Interactions

*   **Porte d'entrée** : Cliquez sur la porte pour l'ouvrir ou la fermer.
    *   *Note : La porte a une physique de collision (on ne peut pas traverser quand elle est fermée).*
*   **Sonnette** : Cliquez sur la sonnette à l'entrée pour sonner.
*   **Lampe** : Cliquez sur la lampe posée sur la table pour l'allumer ou l'éteindre.
*   **Cycle Jour/Nuit** : Appuyez sur `N` pour alterner entre une ambiance de jour ensoleillée et une ambiance nocturne avec éclairage artificiel.
*   **Collision** : Le joueur ne peut pas traverser les murs, la table ou la porte fermée.

## Origine des Assets

Les modèles 3D et sons utilisés dans ce projet proviennent de diverses sources :

### Modèles 3D (.glb)
*   **Porte (`door.glb`)** : [Sketchfab / Source à compléter par l'utilisateur]
*   **Sonnette (`door_bell.glb`)** : [Sketchfab / Source à compléter par l'utilisateur]
*   **Table (`table.glb`)** : [Sketchfab / Source à compléter par l'utilisateur]
*   **Lampe (`lamp.glb`)** : [Sketchfab / Source à compléter par l'utilisateur]

### Sons (.wav)
*   **Sonnette (`doorbell.wav`)** : Effet sonore libre de droit (pris sur freesound.org).
*   **Porte (`door.wav`)** : Effet sonore libre de droit (pris sur freesound.org).
*   **Clic Lampe (`lamp.wav`)** : Effet sonore libre de droit (pris sur freesound.org).

## Technologies

*   **Three.js** : Moteur de rendu 3D.
*   **Vite** : Outil de build et serveur de développement.
*   **PointerLockControls** : Pour la navigation à la première personne.
