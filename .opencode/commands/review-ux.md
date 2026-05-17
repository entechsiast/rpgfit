---
description: Run a game design UX review — evaluates the running app against game UX heuristics and produces a spec.
---

# /review-ux

Triggers the game-designer agent to evaluate the running application against 9 categories of game UX heuristics (visual hierarchy, cognitive load, feedback loops, Fitts's Law, consistency, accessibility, RPG conventions, onboarding, responsive design).

## Usage

```
/review-ux
```

## Process

1. Starts the React dev server if not running
2. Takes screenshots of all screens (desktop + mobile)
3. Evaluates against heuristics
4. Writes spec to `docs/specs/game-design-review-<date>.md`
5. Hands off to engineering-lead for kanban ingestion
