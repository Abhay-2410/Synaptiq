import type { CorsOptions } from 'cors';

const DEV_LAN_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** CORS for local dev + phone testing on the same Wi‑Fi. */
export function createCorsOptions(): CorsOptions {
  const allowed = parseAllowedOrigins();
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.includes('*') || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      if (isDev && DEV_LAN_ORIGIN.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  };
}
