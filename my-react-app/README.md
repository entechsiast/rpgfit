# RPG Fit

An RPG character creator and combat simulator built with React 19. Design your hero, explore dungeons, and battle monsters — all in the browser.

**Work tracking:** [GitHub Project Board](https://github.com/users/entechsiast/projects/2)

---

## Functionality Overview

RPG Fit is a browser-based RPG game with three major phases: character creation, exploration/combat, and character management.

### Character Creation

- **Class Selection** — Choose from 7 classes (Warrior, Mage, Rogue, Cleric, Ranger, Paladin, Wizard), each with unique hit dice, stat bonuses, primary stat, and starting skills
- **Race Selection** — Choose from 6 races (Human, Elf, Dwarf, Half-Elf, Halfling, Orc), each with stat modifiers, bonus skills, speed, and size
- **Stat Allocation** — Distribute attribute points across 6 stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) with a base value of 10 and maximum of 20
- **Appearance Customization** — Customize avatar with options for head, hair, eyes, body features, skin tone, and armor
- **Skill Selection** — Unlock and allocate skill points across a branching skill tree with skills categorized as combat, utility, social, knowledge, and survival

### Game Data

| Data File | Contents |
|---|---|
| `classes.js` | 7 character classes with stats, hit dice, and starting skills |
| `races.js` | 6 playable races with stat modifiers and bonus skills |
| `skills.js` | 30+ skills across 5 categories (combat, utility, social, knowledge, survival) |
| `equipment.js` | 40+ equipment items across 9 slots with stat bonuses and SVG visuals |
| `dungeons.js` | 5 dungeons (Goblin Caves, Dark Forest Ruins, Abandoned Mine, Dragon's Peak, The Abyssal Throne) with monsters and bosses |
| `monsters.js` | Monster definitions per dungeon with HP, attack, defense, XP, and gold rewards |
| `combat.js` | HP/MP calculation formulas based on class hit dice and stats |
| `consumables.js` | 10 consumable items (potions, elixirs, scrolls, draughts) with healing, mana, and buff effects |
| `loot.js` | Random loot generation from monster drop tables |
| `xp.js` | XP progression system with max level of 15 |
| `stats.js` | Stat constants (base, max, total allocation points) |
| `appearanceOptions.js` | Avatar customization options |

### Dungeon Exploration & Combat

- **Dungeon Browsing** — View available dungeons filtered by character level range
- **Turn-Based Combat** — Fight through monster waves in a dungeon, ending with a boss encounter
- **Combat Mechanics** — Attack and defense calculated from stats + equipment bonuses + temporary buffs
- **Skills in Combat** — Use unlocked skills (some cost MP) for enhanced attacks and effects
- **Equipment Bonuses** — Equipped items across 9 slots (head, chest, pants, boots, right hand, left hand, 3 accessories) provide stat bonuses
- **Consumables** — Use potions, elixirs, scrolls, and draughts during combat for healing, mana restoration, and stat buffs
- **Gold & Loot** — Earn gold and random item drops from defeated monsters
- **Dungeon Completion Rewards** — XP, gold, and guaranteed rare items upon clearing a dungeon
- **Flee Mechanic** — 50% chance to escape combat; failure results in penalty damage

### Leveling System

- **XP Progression** — Gain XP from monster kills and dungeon completion
- **Level-Up** — At each level, gain a stat point to allocate and HP/MP based on class hit die and Constitution/Intelligence/Wisdom
- **Max Level** — 15
- **XP Formula** — Cumulative XP required per level calculated in `data/xp.js`

### Character Management

- **Save Character** — Persist full character state (stats, skills, equipment, level, XP, gold, consumables, completed dungeons) to localStorage
- **Load Character** — Restore the most recently saved character
- **Load Specific Character** — Browse and load from a list of saved characters
- **Delete Character** — Remove a saved character
- **Reset** — Clear current character and start fresh
- **Multiple Characters** — The game supports managing multiple saved characters simultaneously

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                    │
├─────────────────────────────────────────────────────┤
│  React Router (4 routes)                           │
│  ┌──────────┬──────────────┬────────────┬────────┐ │
│  │  Home    │  Character   │  Adventure │ Saved  │ │
│  │  (/)     │  Creator     │  (/advent) │ Chars  │ │
│  │          │  (/creator)  │            │ (/chars)│ │
│  └──────────┴──────────────┴────────────┴────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         CharacterContext (useReducer)         │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │  State: name, class, race, stats,    │    │   │
│  │  │  appearance, skills, equipment,      │    │   │
│  │  │  level, xp, gold, hp, mp, consumables│    │   │
│  │  │  combat state, completed dungeons    │    │   │
│  │  └──────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐               │
│  │  Data Layer  │   │  API Layer   │               │
│  │  (static JS) │   │  (api.js)    │               │
│  │              │   │              │               │
│  │  classes.js  │   │  saveChar()  │               │
│  │  races.js    │   │  loadChar()  │               │
│  │  skills.js   │   │  deleteChar()│               │
│  │  equipment.js│   │  getChars()  │               │
│  │  dungeons.js│   │  clearChar() │               │
│  │  combat.js   │   │              │               │
│  │  consumables│   │              │               │
│  │  loot.js     │   │              │               │
│  │  xp.js       │   │              │               │
│  └──────────────┘   └──────────────┘               │
├─────────────────────────────────────────────────────┤
│              localStorage (persistence)             │
└─────────────────────────────────────────────────────┘
```

### Component Architecture

The application uses 26 React components organized into functional groups:

**Character Creation Components**
| Component | Purpose |
|---|---|
| `ClassSelector` | Displays and allows selection of character class |
| `RaceSelector` | Displays and allows selection of character race |
| `StatAllocator` | UI for distributing stat points |
| `AppearanceCustomizer` | Avatar customization (head, hair, eyes, body, skin tone) |
| `SkillTree` | Interactive skill tree with point allocation |

**Avatar Components**
| Component | Purpose |
|---|---|
| `CharacterAvatar` | Main avatar display |
| `CharacterPreview` | Preview of the character with current appearance |
| `AvatarHead` | Head customization SVG component |
| `AvatarHair` | Hair style/color customization |
| `AvatarEyes` | Eye customization |
| `AvatarBody` | Body/build customization |
| `AvatarFeatures` | Facial features customization |
| `AvatarArmor` | Armor overlay on avatar |

**Adventure & Combat Components**
| Component | Purpose |
|---|---|
| `DungeonList` | Browse available dungeons by level |
| `DungeonDetail` | View dungeon info and monsters |
| `DungeonsTab` | Tab container for dungeon exploration |
| `CombatSimulator` | Main combat engine UI |
| `CombatResults` | Post-combat results display |
| `ConsumablesDisplay` | Show available consumables in combat |
| `HpMpDisplay` | Health and mana bar display |
| `GoldDisplay` | Gold counter |
| `XpBar` | XP progress bar toward next level |
| `LevelUpModal` | Level-up notification and stat allocation |

**Equipment Components**
| Component | Purpose |
|---|---|
| `EquipmentGrid` | 9-slot equipment grid layout |
| `EquipmentSlot` | Individual equipment slot renderer |
| `EquipmentItemCard` | Item card with stats and rarity |

### State Management

State is managed via React Context with `useReducer`:

- **`CharacterProvider`** wraps the app and provides state to all components
- **`useCharacter()`** hook returns the current character state plus computed bonuses
- **`useCharacterDispatch()`** hook returns the dispatch function for state updates
- **28+ action types** handle all game logic (stat changes, combat, leveling, inventory, etc.)
- **Derived state** — `equippedBonuses` and `allBonuses` are computed from equipment and temporary buffs
- **HP/MP recalculation** — Automatically recalculated when stats or equipment change

### Data Layer

Game data is stored as static JavaScript modules (no backend). Key design patterns:

- **Export functions** — Each data file exports lookup functions (e.g., `getClassById`, `getDungeonsForLevel`)
- **Item categories** — Equipment organized by slot; skills organized by category
- **Rarity system** — Equipment has 5 rarity tiers: common, uncommon, rare, epic
- **Stat bonuses** — Items provide stat bonuses that stack across all equipped slots
- **Dungeon level ranges** — Dungeons show based on character level proximity

### API Layer

The `services/api.js` module abstracts localStorage persistence:

| Method | Description |
|---|---|
| `saveCharacter(character)` | Save or update a character; generates unique ID |
| `loadCharacter()` | Load the most recently saved character |
| `loadCharacterById(id)` | Load a specific character by ID |
| `deleteCharacter(id)` | Remove a character from storage |
| `getSavedCharacters()` | Get all saved characters |
| `clearCharacter()` | Clear the current character reference |

Persistence keys:
- `rpg_characters` — Array of all saved characters
- `rpg_current_character` — ID of the most recently loaded character

### Routing

The app uses React Router v7 with 4 routes:

| Route | Page | Purpose |
|---|---|---|
| `/` | `Home` | Landing page |
| `/creator` | `RPGCharacterCreator` | Character creation workflow |
| `/adventure` | `AdventurePage` | Dungeon exploration and combat |
| `/characters` | `SavedCharacters` | Manage saved characters |
| `*` | `Navigate` to `/` | Catch-all redirect |

### Testing Architecture

| Type | Tool | Location |
|---|---|---|
| Unit tests | Jest + @testing-library/react | `*.test.js` alongside source files |
| BDD/E2E tests | Cucumber + Playwright | `tests/features/` (Gherkin) + `tests/step-definitions/` |

---

## Usage Instructions

### Development Setup

1. **Prerequisites**
   - Node.js 18+ and npm 9+

2. **Install dependencies**
   ```bash
   cd my-react-app
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Opens the app at [http://localhost:3000](http://localhost:3000). The page auto-reloads on file changes.

4. **Run tests**
   ```bash
   # Unit tests (Jest, watch mode)
   npm test

   # Unit tests (run once, non-interactive)
   npm test -- --watchAll=false

   # BDD/E2E tests (headless)
   npm run test:bdd

   # BDD/E2E tests (headed — visible browser)
   npm run test:bdd:headed

   # BDD/E2E tests (CI-friendly headless)
   npm run test:bdd:ci
   ```

5. **Build for production**
   ```bash
   npm run build
   ```
   Outputs optimized files to the `build/` directory.

### Gameplay Walkthrough

Here is the typical player journey through RPG Fit:

#### Step 1: Character Creation

1. Navigate to **Character Creator** (`/creator`)
2. **Select a class** — Choose from Warrior, Mage, Rogue, Cleric, Ranger, Paladin, or Wizard. Each class has:
   - A hit die (d4–d12) affecting HP growth
   - Stat bonuses applied at creation
   - Starting skills unlocked automatically
3. **Select a race** — Choose from Human, Elf, Dwarf, Half-Elf, Halfling, or Orc. Each race provides:
   - Stat modifiers (applied on top of class bonuses)
   - Bonus skills added to your skill pool
   - Speed and size attributes
4. **Allocate stat points** — Distribute your attribute points across the 6 stats (base: 10, max: 20)
5. **Customize appearance** — Choose head style, hair color/style, eye color, body build, and skin tone
6. **Select skills** — Browse available skills by category (combat, utility, social, knowledge, survival) and allocate skill points
7. **Review character** — Check your character preview and stats before proceeding

#### Step 2: Adventure & Dungeon Exploration

1. Navigate to **Adventure** (`/adventure`)
2. **Browse dungeons** — View available dungeons filtered by your current level range
3. **View dungeon details** — See monster compositions, boss info, and completion rewards
4. **Enter a dungeon** — Start combat against the dungeon's monster waves

#### Step 3: Combat

1. **Fight through monsters** — Each dungeon has a sequence of monsters followed by a boss
2. **Use skills** — Activate your unlocked skills during combat (some cost MP)
3. **Use consumables** — Apply potions, elixirs, scrolls, or draughts for healing, mana, or stat buffs
4. **Track combat log** — View damage dealt, damage received, gold earned, and loot drops
5. **Defeat the boss** — Clear all monsters and the boss to complete the dungeon
6. **Receive rewards** — Earn XP, gold, and guaranteed rare items upon completion

#### Step 4: Character Growth

1. **Gain XP** — From monster kills and dungeon completion
2. **Level up** — When XP threshold is reached, a level-up modal appears
3. **Allocate stat points** — Each level grants a new stat point
4. **HP/MP increase** — HP and MP grow based on your class hit die and relevant stats
5. **Equip better gear** — Acquire items from loot drops or purchase consumables from shops
6. **Repeat** — Enter harder dungeons as your level increases

#### Step 5: Character Management

1. Navigate to **Saved Characters** (`/characters`)
2. **View all saved characters** — Browse your character collection
3. **Load a character** — Restore any saved character to continue playing
4. **Delete a character** — Remove characters you no longer need
5. **Save your progress** — Characters are automatically saved to localStorage during gameplay

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Routing | React Router v7 |
| State Management | React Context + useReducer |
| Testing (Unit) | Jest, @testing-library/react |
| Testing (BDD/E2E) | Playwright, Cucumber |
| Build Tool | React Scripts (CRA) |
| Icons | react-icons |
| Persistence | localStorage API |

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
│   ├── contexts/            # React Context providers
│   │   └── CharacterContext.jsx   # Main game state (reducer + state)
│   ├── data/                # Game data definitions
│   │   ├── classes.js       # 7 character classes
│   │   ├── races.js         # 6 playable races
│   │   ├── skills.js        # 30+ skills across 5 categories
│   │   ├── equipment.js     # 40+ items across 9 slots
│   │   ├── dungeons.js       # 5 dungeons with monsters & bosses
│   │   ├── monsters.js      # Monster definitions
│   │   ├── combat.js        # HP/MP calculation formulas
│   │   ├── consumables.js   # 10 consumable items
│   │   ├── loot.js          # Random loot generation
│   │   ├── xp.js            # XP progression system
│   │   ├── stats.js         # Stat constants
│   │   └── appearanceOptions.js  # Avatar options
│   ├── pages/               # Page components
│   │   ├── Home/            # Landing page
│   │   ├── RPGCharacterCreator/  # Character creation
│   │   ├── Adventure/       # Dungeon exploration & combat
│   │   └── SavedCharacters/  # Character management
│   ├── services/            # Persistence layer
│   │   └── api.js           # localStorage API wrapper
│   ├── App.js               # App root with routing
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── tests/
│   ├── features/            # Cucumber Gherkin feature files
│   ├── step-definitions/    # Step definition implementations
│   ├── support/             # Playwright configuration
│   └── cucumber.json        # Cucumber configuration
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
