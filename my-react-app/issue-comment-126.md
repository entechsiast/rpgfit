## Fix Results

### Changes Made

| File | Change |
|------|--------|
| `my-react-app/tests/step-definitions/hp-mp.steps.ts` | Removed duplicate Given `'I am on the character creator page'` (line 29) |
| `my-react-app/tests/step-definitions/navigation.steps.ts` | Removed duplicate Given `'I am on the character creator page'` (line 21) |
| `my-react-app/tests/step-definitions/character-creation.steps.ts` | Removed duplicate When `'I am on the {string} tab'` (line 9) |
| `my-react-app/tests/step-definitions/character-creation.steps.ts` | Also removed `'I select the {string} class'` (line 15) — additional duplicate with wizard-class.steps.ts |

### Verification

**Dry-run (`npm run test:bdd -- --dry-run`):**
- Duplicate 1 (`'I am on the character creator page'`): No longer shows "Multiple step definitions match" — resolves to character-creation.steps.ts:4 only
- Duplicate 2 (`'I am on the {string} tab'`): No longer shows "Multiple step definitions match" — resolves to stat-allocation.steps.ts:4 only
- Additional duplicate (`'I select the {string} class'`): No longer shows "Multiple step definitions match" — resolves to wizard-class.steps.ts:4 only

**Build (`npm run build`):** Passes

**Feature file updates needed:** None — all feature files using `And I am on the "..." tab` have backgrounds starting with `Given`, so they resolve correctly to the kept Given definition.

### Additional Findings

The dry-run still reports 48 ambiguous scenarios from pre-existing duplicates not covered by Issue #126. These require separate fix efforts:
- `I have selected the {string} race` (avatar.steps.ts vs skills.steps.ts)
- `I have selected the {string} class` (avatar.steps.ts vs skills.steps.ts)
- `I view the character preview` (avatar.steps.ts vs hp-mp.steps.ts)
- `I should see {string}` (equipment.steps.ts vs stat-allocation.steps.ts)
- `I have incremented {string} to 9` (within stat-allocation.steps.ts)
- `I should see the {string} skill` (skills.steps.ts vs wizard-class.steps.ts)
- `I should see {string}` (equipment.steps.ts vs wizard-class.steps.ts)
- `I have a saved character with class and race selected` (3 files)
- `I have a saved character` (combat-simulation vs dungeon-combat)
- `I am in an active dungeon combat` (combat-simulation vs reward-system)
- `combat should begin` (combat-simulation vs dungeon-combat)
- `I should see the consumables section` (consumables vs dungeon-combat)
- `{string} should display the value {int}` (3 files)

### PR

https://github.com/entechsiast/rpgfit/pull/127
