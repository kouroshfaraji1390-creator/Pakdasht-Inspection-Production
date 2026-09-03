import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.env.NODE_ENV === 'production';
const bool = (v, fallback=false) => v == null ? fallback : /^(1|true|yes|on)$/i.test(String(v));

export const config = Object.freeze({
  root: ROOT,
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8787),
  dbFile: process.env.DB_FILE ? resolve(process.env.DB_FILE) : join(ROOT, 'api', 'data', 'pakdasht.sqlite'),
  appOrigin: process.env.APP_ORIGIN || (isProduction ? '' : `http://localhost:${process.env.PORT || 8787}`),
  sessionTtlDays: Math.max(1, Number(process.env.SESSION_TTL_DAYS || 7)),
  demoMode: bool(process.env.DEMO_MODE, !isProduction),
  allowRegistration: bool(process.env.ALLOW_REGISTRATION, true),
  mapTileUrl: process.env.MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  organizationTimezone: process.env.ORGANIZATION_TIMEZONE || 'Asia/Tehran',
  trustProxy: bool(process.env.TRUST_PROXY, false),
  rateLimitWindowMs: Math.max(1000, Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)),
  rateLimitMax: Math.max(1, Number(process.env.RATE_LIMIT_MAX || 120)),
  authRateLimitMax: Math.max(1, Number(process.env.AUTH_RATE_LIMIT_MAX || 10)),
  maxBodyBytes: Math.max(1024, Number(process.env.MAX_BODY_BYTES || 1_000_000)),
  isProduction,
});
