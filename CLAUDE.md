# RPG Fit — AI Context

> **Purpose:** An RPG character creator and combat simulator built with React 19. Features class/race selection, stat allocation, appearance customization, skill trees, equipment system, dungeon combat, and leveling.
> **Work tracking:** [GitHub Project "RPG Fit"](https://github.com/users/entechsiast/projects/2)

---

## Quick Start

1. Check GitHub Project for current sprint and open issues
2. Work in `my-react-app/` for code changes using `cd my-react-app`
3. All work must go through GitHub Issues — no ad-hoc changes

---

## Session Maintenance Protocol

### Session Start Protocol

At the beginning of every session, before doing any work:

1. **Check project board state**
   ```bash
   gh project item-list 2 --owner entechsiast --format json --limit 200
   gh issue list --repo entechsiast/rpgfit --state open
   ```
2. **Identify interrupted work** — Items with Status = "In Progress" were interrupted from a previous session. Resume these first.
3. **Enrich any new items** — Check for items missing Agent, Effort, or Sprint fields. Set them.

### GitHub Project Field IDs

- **Project ID:** `PVT_kwHOAWZJdM4BXz_q`
- **Status field:** `PVTSSF_lAHOAWZJdM4BXz_qzhS-TLM`
  - Todo: `f75ad846`
  - In Progress: `47fc9ee4`
  - Done: `98236657`
- **Agent field:** `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPE`
  - engineering-lead: `9dc3ee5f`
  - frontend: `1b64d5ed`
  - test: `3df83358`
  - document: `d4e115e9`
  - release: `d196d986`
  - scrum-master: `bd230d1e`
- **Effort field:** `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPU`
  - S: `beda8ca2`
  - M: `c2e4660b`
  - L: `3676f0d7`
- **Sprint field:** `PVTSSF_lAHOAWZJdM4BXz_qzhS-TPY`
  - Sprint 1: `7e87c383`
  - Sprint 2: `abfbfde7`
  - Sprint 3: `33e69ea4`

### Session End Protocol

Before ending any session:

1. **Ensure all in-progress issues have current status** — Comment on any issue where work was done this session
2. **Close completed issues** — Any issue where all acceptance criteria are met
3. **Set project board fields** — All items touched this session have correct Status, Agent, Effort, Sprint

### When Creating New Issues

Every new issue must be:
1. Created with appropriate labels (`type:`, `priority:`)
2. Added to the project: `gh project item-add 2 --owner entechsiast --url <issue-url>`
3. Fields set immediately: Status, Agent, Effort, Sprint (if applicable)

---

## Directory Structure

```
C:\dev\rpgfit\
+-- CLAUDE.md                    <- This file
+-- opencode.json                <- OpenCode config (LM Studio local)
+-- my-react-app/
|   +-- README.md
|   +-- package.json
|   +-- src/                     <- All source code
|   |   +-- components/          <- 26 React component directories
|   |   +-- pages/               <- Home, RPGCharacterCreator
|   |   +-- contexts/            <- CharacterContext (reducer + state)
|   |   +-- data/                <- Game data definitions
|   |   +-- services/            <- API (localStorage)
|   |   +-- index.js
|   |   +-- App.js
|   +-- tests/                   <- BDD + E2E tests
|   |   +-- features/            <- 9 Gherkin feature files
|   |   +-- step-definitions/    <- 9 step definition files
|   |   +-- support/             <- Playwright config
|   +-- public/                  <- Static assets
|   +-- build/                   <- Production build output
+-- my-csharp-backend/           <- (empty, for future backend)
+-- .opencode/
|   +-- agents/                  <- Agent definitions (7 agents)
|   +-- commands/                <- Custom slash commands
+-- docs/
|   +-- specs/                   <- Game design review spec documents
+-- .github/workflows/           <- CI/CD pipelines
```

## GitHub Resources

| Resource | Visibility |
|----------|------------|
| `entechsiast/rpgfit` | Public |
| GitHub Project #2 "RPG Fit" | Public |

## Current State

- **Version:** 0.1.0
- **See GitHub Project for active work**

---

## Branching Convention

- Feature branches: `feature/<issue-number>-<short-desc>` (e.g., `feature/3-add-wizard-class`)
- All work on feature branches — never commit directly to `main`
- PR target: `main`
- Merge strategy: squash merge only

## Commit Policy

- Frequent commits with descriptive messages: `type: description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Never force-push to feature branches once a PR is open
- Squash merge all PRs — individual commits not preserved on main

## PR Workflow

- Create PR with `.github/PULL_REQUEST_TEMPLATE.md`
- All PRs require CI pass (tests + build)
- All PRs require 1+ approval before merge

## Branch Protection (GitHub Settings)

Apply these rules to `main` in Settings → Branches:

1. Require pull request reviews (minimum 1 approver)
2. Require status checks to pass before merging
3. Require branches to be up to date before merging
4. Enable "Squash and merge"
5. Disable "Allow deletions"
6. Disable "Allow force pushes"
