import { spawn } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const LOCK_FILE = join(__dirname, '..', '.devserver.lock');

export default async () => {
  if (!existsSync(LOCK_FILE)) {
    return;
  }

  let pid: number;
  try {
    pid = Number(readFileSync(LOCK_FILE).toString().trim());
  } catch {
    return;
  }

  if (!pid || pid <= 0) {
    return;
  }

  try {
    spawn('taskkill', ['/PID', String(pid), '/F'], { shell: true });
  } catch {
    // Process already exited, ignore
  }

  try {
    unlinkSync(LOCK_FILE);
  } catch {
    // Lock file already removed, ignore
  }
};
