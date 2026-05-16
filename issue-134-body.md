## Problem

The Before hook in hooks.ts has two issues:

### 1. Noisy logs
Every scenario prints "Dev server is already running (PID X), skipping server start" — 104 times per CI run. The dev-server-runner.mjs already manages server lifecycle, so this check is redundant.

### 2. Broken isProcessAlive function
The function calls `taskkill /F` to check if a process exists, which actually FORCE-KILLS it. On Windows local dev, this kills the dev server before each scenario. On Linux CI, `taskkill` doesn't exist so it silently fails (returning false).

## Fix
Remove the lock file check and isProcessAlive function entirely from hooks.ts. The dev-server-runner.mjs is the sole manager of the dev server lifecycle — hooks.ts just needs to set up Playwright browser/page for each scenario.
