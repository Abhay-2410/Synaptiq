import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.SESSION_DATA_DIR ?? path.resolve('.data', 'sessions');

function ensureDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string): string {
  return path.join(DATA_DIR, name);
}

export function loadJsonFile<T>(name: string, fallback: T): T {
  ensureDir();
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function saveJsonFile(name: string, data: unknown): void {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data), 'utf8');
}

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Debounced write — avoids hammering disk on every Quick Challenge answer. */
export function scheduleJsonSave(name: string, data: unknown, delayMs = 250): void {
  const existing = saveTimers.get(name);
  if (existing) clearTimeout(existing);
  saveTimers.set(
    name,
    setTimeout(() => {
      saveTimers.delete(name);
      saveJsonFile(name, data);
    }, delayMs),
  );
}
