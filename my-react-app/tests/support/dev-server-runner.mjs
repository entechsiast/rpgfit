/**
 * Dev Server Runner — wraps React dev server lifecycle for Cucumber BDD tests.
 *
 * Responsibilities:
 *   1. Validate / acquire lock file (.devserver.lock)
 *   2. Start `npm start` with BROWSER=none on port 3000
 *   3. Poll http://localhost:3000 until healthy
 *   4. Spawn Cucumber tests via child_process
 *   5. On exit (success or failure) kill dev server + clean lock file
 *
 * Cross-platform: detects OS at runtime and uses the appropriate command shell.
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'node:net';

// ── Paths ────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOCK_FILE = join(ROOT, '.devserver.lock');
const HEALTH_TIMEOUT_MS = 120_000;   // 2 min max wait for dev server
const HEALTH_INTERVAL_MS = 2_000;    // poll every 2 s
const HEALTH_CONNECT_TIMEOUT_MS = 3_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Cross-platform command for starting a process. */
function getShellCommand() {
  const platform = process.platform;
  if (platform === 'win32') {
    return { cmd: 'cmd', args: ['/c'] };
  }
  // Linux, macOS, WSL, etc.
  return { cmd: 'bash', args: ['-c'] };
}

/** Check whether a PID is alive (cross-platform). */
function isProcessAlive(pid) {
  const { cmd, args } = getShellCommand();
  try {
    if (process.platform === 'win32') {
      // Windows: use taskkill to test process existence
      spawn('taskkill', ['/PID', String(pid), '/F'], {
        detached: true,
        shell: true,
        stdio: 'ignore',
      });
      // taskkill returns 0 if process existed, 128 if not found
      // We can't easily read the exit code synchronously, so we
      // just return true — the subsequent health check will fail
      // if the process isn't actually listening.
      return true;
    } else {
      // Unix: use kill -0 to test process existence (no signal sent)
      spawn('kill', ['-0', String(pid)], {
        stdio: 'ignore',
      });
      return true;
    }
  } catch {
    return false;
  }
}

/** HTTP health-check against the dev server. */
function healthCheck() {
  return new Promise((resolve) => {
    const req = createConnection({
      hostname: 'localhost',
      port: 3000,
      timeout: HEALTH_CONNECT_TIMEOUT_MS,
    }, () => {
      req.destroy();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/** Wait until the health endpoint responds or timeout. */
async function waitForHealth() {
  const start = Date.now();
  while (Date.now() - start < HEALTH_TIMEOUT_MS) {
    const ok = await healthCheck();
    if (ok) {
      console.log('  ✓ Dev server health check passed');
      return;
    }
    console.log('  ⏳ Waiting for dev server…');
    await new Promise((r) => setTimeout(r, HEALTH_INTERVAL_MS));
  }
  throw new Error(
    `Dev server did not become healthy within ${HEALTH_TIMEOUT_MS / 1000}s`
  );
}

/** Acquire or validate the lock file. Throws on conflict. */
function acquireLock() {
  if (existsSync(LOCK_FILE)) {
    const raw = readFileSync(LOCK_FILE, 'utf-8').trim();
    const pid = Number(raw);
    if (pid > 0 && isProcessAlive(pid)) {
      throw new Error(
        `Dev server already running (PID ${pid}).\n` +
        `Lock file: ${LOCK_FILE}\n` +
        'Stop the existing server or delete the lock file first.'
      );
    }
    // Stale lock — remove it silently
    try { unlinkSync(LOCK_FILE); } catch { /* ignore */ }
    console.log('  ✓ Removed stale lock file');
  }
  return null;
}

/** Write current PID to lock file. */
function writeLock(pid) {
  writeFileSync(LOCK_FILE, String(pid), 'utf-8');
  console.log(`  ✓ Lock file written: ${LOCK_FILE} (PID ${pid})`);
}

/** Remove the lock file. */
function removeLock() {
  try { unlinkSync(LOCK_FILE); console.log('  ✓ Lock file removed'); } catch { /* ignore */ }
}

/** Kill the dev server process by PID (cross-platform). */
function killServer(pid) {
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(pid), '/F'], {
        shell: true,
        stdio: 'ignore',
      });
    } else {
      // Unix: use kill with SIGTERM, fallback to SIGKILL after a delay
      spawn('kill', ['-TERM', String(pid)], {
        stdio: 'ignore',
      });
    }
    console.log(`  ✓ Dev server (PID ${pid}) terminated`);
  } catch {
    console.log(`  ⚠ Dev server (PID ${pid}) already exited`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dev Server Runner ===');

  // 1. Lock
  acquireLock();

  // 2. Start dev server
  console.log('  → Starting dev server (port 3000, BROWSER=none)…');
  const env = {
    ...process.env,
    BROWSER: 'none',
    FAST_DEV: '1',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PLAYWRIGHT_HEADLESS: process.env.PLAYWRIGHT_HEADLESS ?? 'true',
    HEADED: (process.env.HEADDED || process.env.headed) ?? 'false',
  };

  // Cross-platform: use the appropriate shell for the current OS
  const { cmd: shellCmd, args: shellArgs } = getShellCommand();
  const devServer = spawn(shellCmd, [...shellArgs, 'npm start'], {
    cwd: ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Guard: dev server failed to spawn
  if (!devServer.pid) {
    console.error('  ✗ Failed to obtain dev server PID');
    process.exit(1);
  }
  writeLock(devServer.pid);

  // Stream dev server logs (optional, for debugging)
  devServer.stdout?.on('data', (data) => {
    const line = data.toString().trim();
    if (line.includes('Compiled successfully') || line.includes('You can now view')) {
      console.log('  ✓ Dev server compiled:', line);
    }
  });
  devServer.stderr?.on('data', (data) => {
    const line = data.toString().trim();
    if (line.includes('Failed to compile') || line.includes('Error:')) {
      console.error('  ✗ Dev server error:', line);
    }
  });

  // 3. Wait for health
  try {
    await waitForHealth();
  } catch (err) {
    console.error(`  ✗ Health check failed: ${err.message}`);
    killServer(devServer.pid);
    removeLock();
    process.exit(1);
  }

  // 4. Run Cucumber
  console.log('  → Running Cucumber BDD tests…');
  const cucumberEnv = {
    ...process.env,
    BROWSER: 'none',
    PLAYWRIGHT_HEADLESS: process.env.PLAYWRIGHT_HEADLESS ?? 'true',
    HEADED: (process.env.HEADDED || process.env.headed) ?? 'false',
  };

  // Run Cucumber with explicit paths (no config file to avoid path resolution issues)
  const cucumberArgs = [
    '--require', 'step-definitions/**/*.ts',
    '--require', 'support/**/*.ts',
    '--require-module', 'ts-node/register',
    '--format', 'progress',
    'features/**/*.feature',  // positional: feature file globs
    ...(process.argv.slice(2)),   // forward any CLI args like --dry-run
  ];

  // Cross-platform: use the appropriate shell for the current OS
  const cucumberCmd = `npx cucumber-js ${cucumberArgs.map(a => `"${a}"`).join(' ')}`;
  const cucumber = spawn(shellCmd, [...shellArgs, cucumberCmd], {
    cwd: ROOT,
    env: cucumberEnv,
    stdio: 'inherit',
  });

  const cucumberExitCode = await new Promise((resolve) => {
    cucumber.on('exit', (code) => resolve(code ?? 1));
  });

  // 5. Teardown — always kill dev server and clean lock
  console.log('\n=== Teardown ===');
  killServer(devServer.pid);
  removeLock();

  if (cucumberExitCode !== 0) {
    console.error(`\n✗ Cucumber exited with code ${cucumberExitCode}`);
    process.exit(cucumberExitCode);
  }

  console.log('\n✓ All BDD tests passed');
  process.exit(0);
}

// ── Entry point ──────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
