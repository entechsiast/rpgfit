import { spawn } from 'child_process';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const LOCK_FILE = join(__dirname, '..', '.devserver.lock');

const isProcessAlive = (pid: number): boolean => {
  try {
    spawn('taskkill', ['/PID', String(pid), '/F'], { shell: true });
    return true;
  } catch {
    return false;
  }
};

export default async () => {
  // Check for existing lock file and process
  if (existsSync(LOCK_FILE)) {
    const existingPid = Number(readFileSync(LOCK_FILE).toString().trim());
    if (existingPid && isProcessAlive(existingPid)) {
      throw new Error(
        `Dev server already running (PID ${existingPid}). Lock file: ${LOCK_FILE}\n` +
        'Stop the existing server or delete the lock file before running tests.'
      );
    }
    // Stale lock file — remove it
    try {
      unlinkSync(LOCK_FILE);
    } catch {
      // ignore
    }
  }

  return new Promise<void>((resolve, reject) => {
    const cwd = join(__dirname, '..');
    const env = { ...process.env, BROWSER: 'none', FAST_DEV: '1' };
    const child = spawn('npm', ['start'], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    // Write PID to lock file
    writeFileSync(LOCK_FILE, String(child.pid));
    console.log(`Dev server started with PID ${child.pid}`);

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('You can now view') || output.includes('Compiled successfully')) {
        console.log('Dev server started on http://localhost:3000');

        // Health check — verify server responds
        fetch('http://localhost:3000')
          .then((res) => {
            if (res.ok) {
              console.log('Dev server health check passed');
              resolve();
            } else {
              reject(
                new Error(
                  `Dev server health check failed with status ${res.status}`
                )
              );
            }
          })
          .catch((err) => {
            reject(
              new Error(
                `Dev server health check failed: ${err.message}`
              )
            );
          });
      }
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Failed to compile') || output.includes('Error:')) {
        reject(new Error(`Dev server compilation error: ${output.trim()}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Dev server failed to start: ${err.message}`));
    });

    child.on('exit', (code) => {
      if (code !== null && code !== 0) {
        reject(new Error(`Dev server exited with code ${code}`));
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      reject(new Error('Dev server failed to start within 60 seconds'));
    }, 60000);
  });
};
