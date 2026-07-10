/**
 * Load backend/.env and override stale shell variables (e.g. ALLOW_CORPUS_FALLBACK).
 * Import this module before any code that reads process.env.
 */
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(rootDir, '.env'), override: true });
