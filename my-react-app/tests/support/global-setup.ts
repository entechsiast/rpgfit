import { spawn } from 'child_process';
import { join } from 'path';

export default async () => {
  return new Promise<void>((resolve, reject) => {
    const cwd = join(__dirname, '..');
    const env = { ...process.env, BROWSER: 'none', FAST_DEV: '1' };
    const child = spawn('npm', ['start'], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('You can now view') || output.includes('Compiled successfully')) {
        console.log('Dev server started on http://localhost:3000');
        resolve();
      }
    });

    child.stderr?.on('data', (data) => {
      // ignore errors during startup
    });

    child.on('error', (err) => {
      reject(err);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      reject(new Error('Dev server failed to start within 60 seconds'));
    }, 60000);
  });
};
