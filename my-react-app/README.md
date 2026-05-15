# RPG Fit

An RPG character creator and combat simulator built with React 19. Design your hero, explore dungeons, and battle monsters — all in the browser.

**Work tracking:** [GitHub Project Board](https://github.com/users/entechsiast/projects/2)

---

## Features

- **Class & Race Selection** — Choose from multiple character classes and races, each with unique stats and abilities
- **Stat Allocation** — Distribute attribute points across Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma
- **Appearance Customization** — Customize your character's look with avatar head, hair, eyes, body features, and armor options
- **Skill Trees** — Unlock and allocate skill points across a branching skill tree
- **Equipment System** — Equip weapons, armor, and accessories with an inventory grid
- **Dungeon Exploration** — Browse and enter dungeons with varying difficulty
- **Turn-Based Combat** — Engage in combat with monsters using skills, equipment bonuses, and consumables
- **Leveling System** — Gain XP, level up, and allocate new stat points as your character grows
- **Save / Load / Reset** — Persist character data to localStorage and manage multiple characters

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Routing | React Router v7 |
| Testing (Unit) | Jest, @testing-library/react |
| Testing (BDD/E2E) | Playwright, Cucumber |
| Build Tool | React Scripts (CRA) |
| Icons | react-icons |
| Persistence | localStorage API |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
cd my-react-app
npm install
```

### Development

```bash
npm start
```

Opens the app in your browser at [http://localhost:3000](http://localhost:3000). Edit files and the page reloads automatically.

### Testing

```bash
# Unit tests (Jest)
npm test

# BDD / E2E tests (Cucumber + Playwright)
npm run test:bdd

# BDD tests in headed mode (visible browser)
npm run test:bdd:headed

# BDD tests CI-friendly (headless)
npm run test:bdd:ci
```

### Production Build

```bash
npm run build
```

Outputs a minified production build to the `build/` folder.

---

## Project Structure

```
my-react-app/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components (26 components)
│   │   ├── AppearanceCustomizer/
│   │   ├── AvatarArmor/
│   │   ├── AvatarBody/
│   │   ├── AvatarEyes/
│   │   ├── AvatarFeatures/
│   │   ├── AvatarHair/
│   │   ├── AvatarHead/
│   │   ├── CharacterAvatar/
│   │   ├── CharacterPreview/
│   │   ├── ClassSelector/
│   │   ├── CombatResults/
│   │   ├── CombatSimulator/
│   │   ├── ConsumablesDisplay/
│   │   ├── DungeonDetail/
│   │   ├── DungeonList/
│   │   ├── DungeonsTab/
│   │   ├── EquipmentGrid/
│   │   ├── EquipmentItemCard/
│   │   ├── EquipmentSlot/
│   │   ├── GoldDisplay/
│   │   ├── HpMpDisplay/
│   │   ├── LevelUpModal/
│   │   ├── RaceSelector/
│   │   ├── SkillTree/
│   │   ├── StatAllocator/
│   │   └── XpBar/
│   ├── contexts/            # React Context (CharacterContext with reducer + state)
│   ├── data/                # Game data definitions (classes, races, skills, equipment, dungeons, etc.)
│   ├── pages/               # Page components (Home, RPGCharacterCreator, Adventure, SavedCharacters)
│   ├── services/            # API layer (localStorage persistence)
│   ├── App.js               # App root with routing
│   └── index.js             # Entry point
├── tests/
│   ├── features/            # Cucumber Gherkin feature files (10 features)
│   ├── step-definitions/    # Step definition implementations
│   └── support/             # Playwright configuration
├── build/                   # Production build output
├── package.json
└── README.md
```

---

## Contribution Guidelines

### Before You Start

1. Check the [GitHub Project Board](https://github.com/users/entechsiast/projects/2) for open issues and current sprint priorities.
2. Pick an issue assigned to you. If none are available, [create a new issue](https://github.com/entechsiast/rpgfit/issues/new).

### Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/<issue-number>-<short-desc>
   ```
2. **Make your changes** in `my-react-app/`.
3. **Run tests** before committing:
   ```bash
   cd my-react-app
   npm test -- --watchAll=false
   ```
4. **Commit with descriptive messages** using conventional commits:
   ```bash
   git commit -m "feat: add dungeon combat feature"
   ```
5. **Push and create a Pull Request** targeting `main`:
   ```bash
   git push -u origin feature/<issue-number>-<short-desc>
   ```
6. **Request review** and address any feedback.

### Commit Types

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding or updating tests
- `docs` — Documentation changes
- `chore` — Maintenance tasks (dependencies, config, etc.)

### Pull Requests

- All PRs must pass CI (tests + build).
- All PRs require at least 1 approval before merging.
- PRs are squash merged into `main`.

---

## License

This project is open source and available under the [MIT License](LICENSE).
