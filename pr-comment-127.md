## Fix: Cucumber Step Function Compatibility

### Problem
All 16 step definition files used callback-style ({ page }: { page: Page }) parameters in async functions, causing the error:
unction uses multiple asynchronous interfaces: callback and promise

### Changes Made
Updated all 16 step definition files to use 	his.page instead of destructured page parameter.

**Before:**
`	ypescript
Given('step text', async function ({ page }: { page: Page }, param: string) {
  await page.doSomething(param);
});
`

**After:**
`	ypescript
Given('step text', async function (param: string) {
  const page = this.page as Page;
  await page.doSomething(param);
});
`

### Files Updated (16 total - 263 functions)
- appearance.steps.ts (10 functions)
- avatar.steps.ts (10 functions)
- character-creation.steps.ts (3 functions)
- combat-simulation.steps.ts (41 functions)
- consumables.steps.ts (9 functions)
- dungeon-combat.steps.ts (54 functions)
- equipment.steps.ts (14 functions)
- hp-mp.steps.ts (26 functions)
- leveling-system.steps.ts (22 functions)
- naming.steps.ts (14 functions)
- navigation.steps.ts (8 functions)
- persistence.steps.ts (13 functions)
- reward-system.steps.ts (34 functions)
- skills.steps.ts (8 functions)
- stat-allocation.steps.ts (14 functions)
- wizard-class.steps.ts (3 functions)

### Verification Results

**Cucumber Dry-Run:** PASS
- No unction uses multiple asynchronous interfaces errors
- 104 scenarios parsed (76 ambiguous, 10 undefined, 18 skipped)
- Ambiguity and undefined step errors are pre-existing issues

**Build:** PASS
- 
pm run build compiled successfully
- No TypeScript errors

### Notes
- The Multiple step definitions match warnings are pre-existing ambiguity issues between files (e.g., I have selected the {string} class defined in both avatar.steps.ts and skills.steps.ts). These are addressed in PR #126.
- The Undefined step messages are pre-existing missing step definitions, not related to this compatibility fix.
