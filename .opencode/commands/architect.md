---
description: Run architecture audit — identifies structural problems ESLint cannot catch, creates kanban issues for frontend.
---

# /architect

Scans the entire `my-react-app/src/` directory for architecture issues (reducer health, missing memoization, cross-reference data integrity, slot consistency, pattern drift, dead code) and creates GitHub Issues for each finding.

## Usage

```
/architect
```

## Process

1. Runs 6 static analysis checks via bash (reducer, memoization, cross-references, slots, component patterns, dead code)
2. For each finding, creates a GitHub Issue with file paths, evidence, severity, and concrete fix recommendation
3. Adds issues to project board with Status=Todo, Agent=frontend
4. Hands off to engineering-lead with a summary of all issues created
