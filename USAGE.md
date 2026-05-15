# RPG Fit — Multi-Agent System Usage Guide

This project uses an AI agent team that works through GitHub Issues and a project board.
The rule is simple: **No Ticket, No Work** — every task must have a GitHub Issue before any agent touches it.

---

## Agent Team

| Agent | Type | Role |
|-------|------|------|
| `@scrum-master` | **Primary** | Breaks down high-level needs into epics and user stories on the project board |
| `@engineering-lead` | **Primary** | Orchestrates execution — delegates issues to domain agents, never writes code |
| `@frontend` | Subagent | Owns all React code: components, pages, state, data, styles |
| `@test` | Subagent | Owns all tests: BDD (Playwright/Cucumber) and unit (Jest) |
| `@document` | Subagent | Owns documentation: README, USAGE, project docs |
| `@release` | Subagent | Owns git operations, builds, and CI/CD |

**Primary agents** (scrum-master, engineering-lead) are the ones you talk to directly.
Switch between them with the **Tab** key in opencode.

**Subagents** are invoked by primary agents and should not be called directly for new work.

---

## How to Start a Session

```bash
cd C:\dev\rpgfit
opencode
```

Once opencode loads, switch to `@engineering-lead` (Tab key) and ask it to
check the project board:

```
@engineering-lead Check the project board and tell me what's in progress.
```

This runs `gh project item-list 2 --owner entechsiast --format json` and reports
what's on the board. If there were interrupted tasks (Status = "In Progress"),
those get resumed first.

---

## Workflow A: Scrum Master (Top-Down)

Use this when you have a new feature or idea but haven't broken it down yet.

**Step 1:** Switch to `@scrum-master` and describe your need:

```
@scrum-master I want a potion crafting system where players can find recipes,
gather ingredients from dungeons, and brew potions they can use in combat.
```

**Step 2:** The Scrum Master will:
- Create an **Epic issue** describing the overall feature
- Break it into **user stories** (one issue per story with acceptance criteria)
- Add everything to the project board with Status=Todo and Effort estimated
- Comment on the epic with links to all stories

**Step 3:** Switch to `@engineering-lead` and tell it the epic is ready:

```
@engineering-lead The potion crafting epic is on the board. Start working through it.
```

The Engineering Lead will pick up unassigned stories, assign them to agents,
and manage them through the pipeline.

### Example

**User says:** *"I want a potion crafting system"*

**Scrum Master creates:**
- Epic: \#4 `epic: potion crafting system`
- Story: \#5 `story: as a player, I can view craftable potions with their ingredients`
- Story: \#6 `story: as a player, I can gather ingredients from dungeon loot`
- Story: \#7 `story: as a player, I can brew a potion if I have the ingredients`
- Story: \#8 `story: as a player, I can use a potion from my inventory`

All stories go on the board with Status=Todo, Effort estimated, no Agent set.

---

## Workflow B: Engineering Lead (Execution)

Use this when the board already has issues ready to work.

**Step 1:** Tell the Engineering Lead to review the backlog:

```
@engineering-lead Look at the board and pick the next high-priority issue.
```

**Step 2:** The Engineering Lead checks the board, picks an issue,
assigns Agent=frontend or Agent=test, and delegates.

**Step 3:** The assigned agent reads the issue, implements the work,
and comments on the issue with results.

**Step 4:** The Engineering Lead reassigns to the next agent in the pipeline.

### The Issue Pipeline

An issue flows through phases. The Engineering Lead reassigns the Agent field
at each step:

```
PHASE 1: TESTS     → Agent = test     → Write failing tests (TDD)
PHASE 2: IMPLEMENT → Agent = frontend → Implement against tests
PHASE 3: VERIFY    → Agent = test     → Run tests, report pass/fail
                 → Agent = document  → Update docs (if user-facing)
PHASE 4: SHIP      → Agent = release  → Commit, push, close issue
```

Not every issue needs every phase. A bug fix might skip Tests and go straight
to Implement → Verify → Ship. The Engineering Lead decides scope.

### Example

**User says:** *"Work on issue #2 (Wizard class)"*

```
@engineering-lead Start working on issue #2.
```

The Engineering Lead checks the issue, decides it needs tests first,
sets Agent=test with Status="In Progress", and delegates.

**Phase 1 (@test):** Writes BDD scenarios for Wizard class, comments on #2:
> "Added Wizard feature file with 3 scenarios. Tests are failing (expected)."

**Phase 2 (@frontend):** Implements the Wizard class in `classes.js`,
adds it to ClassSelector, comments on #2:
> "Wizard class implemented. 4 files changed. Unit tests passing."

**Phase 3 (@test):** Runs full suite, comments on #2:
> "All 42 tests passing. No regressions."

**Phase 3 (cont. @document):** Verifies README mentions Wizard class.

**Phase 4 (@release):** Commits everything:
```
git add my-react-app/src/data/classes.js my-react-app/src/components/ClassSelector/
git commit -m "feat: add Wizard character class"
git push origin master
```
Then closes the issue and sets Status=Done.

---

## Working with Domain Agents Directly

You can call subagents from `@engineering-lead` to get status or ask questions,
but all implementation work goes through the issue pipeline.

### @frontend

Owns everything in `my-react-app/src/`. You can ask it questions:

```
@engineering-lead Ask @frontend to check how the equipment system works.
```

The Engineering Lead delegates:
```
@frontend Check the equipment system and report back how items
are structured in equipment.js and how equipping works in the reducer.
```

### @test

Owns test infrastructure and all test files. It can run tests and report:

```
@engineering-lead Ask @test to run the full test suite and report results.
```

### @document

Owns README.md and documentation. It can update docs:

```
@engineering-lead Ask @document to check if the README mentions the Wizard class.
```

### @release

Owns git and CI/CD. It handles commits, pushes, and builds:

```
@engineering-lead Ask @release to build and verify the project compiles.
```

---

## Resuming Interrupted Work

If a session ends unexpectedly (which happens with AI agents):

1. Open opencode and switch to `@engineering-lead`
2. It automatically checks the project board on startup
3. Items with Status="In Progress" were interrupted
4. The issue comments contain all progress notes from the previous session
5. Engineering Lead reads the comments and continues where it left off

---

## Common Commands Reference

These are the commands agents use internally. You don't need to run them
yourself, but they help understand what the agents are doing.

```bash
# Check the project board
gh project item-list 2 --owner entechsiast --format json

# Read an issue
gh issue view <number> --repo entechsiast/rpgfit

# Create an issue
gh issue create --repo entechsiast/rpgfit --title "story: ..." --body "..."

# Add an issue to the project board
gh project item-add 2 --owner entechsiast --url <issue-url>

# Set a field value
gh project item-edit --project-id PVT_kwHOAWZJdM4BXz_q --id <item-id> \
  --field-id PVTSSF_lAHOAWZJdM4BXz_qzhS-TLM \
  --single-select-option-id 47fc9ee4
```

### GitHub Project Field IDs

| Field | ID | Options |
|-------|----|---------|
| **Status** | `PVTSSF_lAHOAWZJdM4BXz_qzhS-TLM` | Todo=`f75ad846`, In Progress=`47fc9ee4`, Done=`98236657` |
| **Agent** | `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPE` | engineering-lead=`9dc3ee5f`, frontend=`1b64d5ed`, test=`3df83358`, document=`d4e115e9`, release=`d196d986`, scrum-master=`bd230d1e` |
| **Effort** | `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPU` | S=`beda8ca2`, M=`c2e4660b`, L=`3676f0d7` |
| **Sprint** | `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPY` | Sprint 1=`7e87c383`, Sprint 2=`abfbfde7`, Sprint 3=`33e69ea4` |

**Project ID:** `PVT_kwHOAWZJdM4BXz_q`
**GitHub Repo:** `entechsiast/rpgfit`

---

## Tips

- **Start small** — give the Scrum Master a contained feature, not the entire roadmap
- **Be specific** — "Add Wizard class with high INT and fireball skill" works better than "Add more classes"
- **Resume interrupted work first** — check Status="In Progress" items at session start
- **Check issue comments** — all agent work is documented there
- **If an agent gets stuck** — tell Engineering Lead "Check issue #X and see what's blocking"
- **Labels help** — use `epic`, `story`, `bug`, `enhancement` labels when creating issues
- **The model matters** — the local Qwen model can handle these agents, but cloud models (Claude, GPT) will be more reliable for complex orchestration
