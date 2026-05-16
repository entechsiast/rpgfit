## Summary

Fixes Issue #126 — CI BDD tests fail due to ambiguous step definitions that Cucumber cannot resolve.

### Duplicates Fixed

| Duplicate Step | Files Removed From | Kept In |
|---------------|-------------------|---------|
| `'I am on the character creator page'` | hp-mp.steps.ts, navigation.steps.ts | character-creation.steps.ts (authoritative) |
| `'I am on the {string} tab'` | character-creation.steps.ts | stat-allocation.steps.ts (Given version) |
| `'I select the {string} class'` | character-creation.steps.ts | wizard-class.steps.ts (exact match) |

### Verification

- **Build:** `npm run build` passes
- **Dry-run:** The two documented duplicates no longer produce "Multiple step definitions match" errors
- **No feature files needed updates** — all `And I am on the "..." tab` steps have backgrounds starting with `Given`, so they resolve to the kept Given definition

### Additional Findings

The dry-run still shows 48 ambiguous scenarios from pre-existing duplicates not covered by this issue:
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

These are out of scope for Issue #126 and should be addressed in a follow-up.
