# snatch

> Gestionnaire de snapshots Git légers pour les sessions de développement assistées par IA.

![snatch demo](https://via.placeholder.com/800x400.png?text=Snatch+UI+Demo+Animation)

## Le Problème

Lorsqu'on travaille avec des assistants de code IA (Claude Code, Cursor, Copilot, Aider...), l'itération rapide est la règle. Un prompt peut introduire une fonctionnalité brillante ou casser votre base de code en une seconde. Les commits Git standards sont trop lourds pour ce flux de travail — vous ne voulez pas polluer votre historique avec des états intermédiaires cassés, mais vous avez absolument besoin d'un filet de sécurité avant de lancer un prompt risqué.

`snatch` résout ce problème en introduisant les **sub-commits** : des snapshots légers et invisibles de votre espace de travail qui vivent en dehors de votre historique Git principal.

## La Solution

`snatch` vous permet de capturer l'état de votre espace de travail instantanément, de lister vos snapshots, d'examiner les changements via un diff visuel et de les restaurer — le tout sans toucher à votre historique Git réel ni polluer votre `git log`.

Une fois que vous avez atteint un état stable, vous pouvez fusionner (**squash**) tous vos snapshots invisibles en un seul commit Git propre et officiel.

## Fonctionnalités Clés

- **Snapshots Invisibles** : Stockés dans l'espace de nom Git `refs/snatch/`, ils n'apparaissent pas dans votre historique standard.
- **Interface Graphique (Tauri)** : Visualisez l'historique de votre session, comparez les diffs et restaurez en un clic.
- **Sauvegarde Auto-IA** : Snapshot automatique capturé avant chaque prompt envoyé via le module de chat intégré.
- **Terminal Intégré** : Accès direct à la ligne de commande sans quitter l'application.
- **Raccourcis Clavier** : `Cmd+S` pour capturer, `Cmd+Z` pour restaurer (filet de sécurité instantané).
- **Multi-Projets** : Gérez plusieurs dépôts Git avec un écran d'accueil dédié et un historique des projets récents.

## Installation

### Via les exécutables (Recommandé)
Téléchargez l'installeur correspondant à votre système sur la page des [Releases](https://github.com/vairan37/snatch/releases) :
- **macOS** : `.dmg` (Intel & Apple Silicon)
- **Windows** : `.msi`
- **Linux** : `.AppImage`

### Compilation depuis les sources
Nécessite Rust et Node.js installés.

```bash
# Installer le CLI
cargo install --path .

# Lancer l'interface UI (mode dev)
cd snatch-ui
npm install
npm run tauri dev
```

## Utilisation Rapide

1. **Initialiser** : Ouvrez un dépôt Git dans `snatch`.
2. **Capturer** : Avant de demander une modification complexe à votre IA, faites `Cmd+S` (ou `snatch save "message"`).
3. **Expérimenter** : Laissez l'IA modifier votre code.
4. **Vérifier** : Utilisez le **Diff Viewer** pour voir ce que l'IA a réellement changé.
5. **Restaurer** : Si le résultat ne vous convient pas, faites `Cmd+Z` pour revenir à l'état précédent.
6. **Consolider** : Une fois la tâche finie, utilisez **Squash** pour créer le commit Git final.

## Commandes CLI

| Commande | Description |
| :--- | :--- |
| `snatch init` | Initialise snatch dans le dépôt courant. |
| `snatch save <msg>` | Capture l'état actuel (incluant les fichiers non suivis). |
| `snatch list` | Liste tous les snapshots de la branche actuelle. |
| `snatch diff <id>` | Affiche le diff entre l'état actuel et le snapshot spécifié. |
| `snatch restore <id>`| Restaure l'espace de travail à l'état exact du snapshot. |
| `snatch squash [msg]`| Fusionne la session en un vrai commit Git et nettoie les snapshots. |

## Comment ça marche ?

`snatch` utilise les **internes natifs de Git** pour une compatibilité et des performances maximales. 

Chaque snapshot est un véritable objet commit Git, mais au lieu d'être attaché à `refs/heads/`, il est enregistré sous un espace de nom masqué :
`refs/snatch/sessions/<branche>/<uuid>`

Cela rend les snapshots **portables** (ils suivent le dépôt), **isolés** (ils n'altèrent pas votre graphe de branches) et **invisibles** pour les outils Git standards.

---
*Développé avec Rust, Tauri et JetBrains Mono.*
