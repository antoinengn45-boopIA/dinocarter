# 🦕 Dino Chrome Game

Un clone du célèbre jeu hors-connexion de Google Chrome, entièrement en **HTML/CSS/JS vanilla**, sans aucune dépendance.

![Aperçu du jeu](https://raw.githubusercontent.com/your-username/dino-game/main/preview.png)

---

## 🎮 Jouer

Ouvre simplement `index.html` dans ton navigateur — aucune installation requise.

Ou héberge-le sur **GitHub Pages** :
1. Forke ce repo
2. Va dans **Settings → Pages**
3. Source : `Deploy from a branch` → branche `main`, dossier `/ (root)`
4. Ton jeu sera en ligne sur `https://ton-pseudo.github.io/dino-game/`

---

## 🕹️ Contrôles

| Action          | Clavier              | Mobile           |
|-----------------|----------------------|------------------|
| Sauter          | `Espace` ou `↑`     | Toucher l'écran  |
| S'accroupir     | `↓`                  | —                |
| Démarrer / Rejouer | `Espace`          | Toucher l'écran  |

### 🔒 Easter Egg — Mode DINO-PRO
Double-appuie sur `Espace` pour activer le mode **Pro** :
- Le dino devient **immortel**
- Il **saute et s'accroupit automatiquement** pour éviter les obstacles
- Un badge vert ⚡ clignote dans le score

Double-appuie à nouveau pour le désactiver.

---

## 📁 Structure du projet

```
dino-game/
├── index.html   ← Structure HTML
├── style.css    ← Mise en page & design pixel-art
├── script.js    ← Logique du jeu (moteur, IA, contrôles)
└── README.md    ← Ce fichier
```

---

## ⚙️ Fonctionnalités

- 🦕 **Dino pixel-art** dessiné entièrement sur `<canvas>`
- 🌵 **3 types de cactus** (simple, double, triple)
- 🦅 **Oiseaux volants** qui apparaissent après le score 200
- ☁️ Nuages parallaxe
- 📈 **Accélération progressive** jusqu'à vitesse ×14
- 🏆 **Tableau des scores** (top 5 du jour + all time)
- 🟢 **Mode DINO-PRO** avec auto-jump IA
- 📱 Compatible **mobile** (touch events)
- 🎨 Design rétro-pixel avec police `VT323` + `Share Tech Mono`

---

## 🛠️ Personnalisation

Toutes les constantes de jeu sont en haut de `script.js` :

```js
const GRAVITY = 0.6;   // Gravité
const JUMP_V  = -12;   // Force de saut (négatif = vers le haut)
const DUCK_H  = 26;    // Hauteur du dino accroupi
```

Les scores du tableau sont dans les tableaux `dailyScores` et `alltimeScores` à la fin de `script.js`.

Les couleurs du thème sont dans les variables CSS de `style.css` :

```css
:root {
  --bg:     #f0ece4;
  --accent: #d94f2b;
  --pro:    #00cc44;
  /* ... */
}
```

---

## 📄 Licence

Projet libre — fait par **Antoine** pour s'amuser 🦕  
Inspiré du jeu hors-connexion de Google Chrome (T-Rex Runner).
