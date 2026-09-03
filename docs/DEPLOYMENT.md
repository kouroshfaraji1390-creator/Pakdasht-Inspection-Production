# Production Deployment Guide

## Architecture

Recommended deployment:

`Android/PWA -> HTTPS Reverse Proxy -> Node.js API -> PostgreSQL`

The reverse proxy should terminate TLS and forward only to the private Node.js service. Keep the database private.

## Required configuration

Set `NODE_ENV=production`, `APP_ORIGIN` to the exact public origin, `DEMO_MODE=false`, and `ALLOW_REGISTRATION=false` unless explicitly required.

## Migration

Install the PostgreSQL driver in the deployment environment:

```bash
npm install pg
```

Then run:

```bash
DATABASE_URL='postgresql://...' npm run migrate:postgres
```

Run this first in staging. Compare row counts for every table and test login, organization isolation, missions, tracking, inspections, warnings and reports.

## Multi-instance note

The current in-memory rate limiter and SSE client set are process-local. For more than one Node.js instance, use a shared rate-limit layer (WAF/proxy/Redis-backed solution) and a shared realtime broker/provider. Do not assume the local SSE set scales across instances.

## Rollout

1. Build and test the exact release artifact.
2. Deploy to staging.
3. Run database migration/verification.
4. Run restore drill.
5. Run mobile smoke tests on Android Chrome.
6. Verify HTTPS, cookies and CORS.
7. Verify GPS and offline queue.
8. Promote to production.

## Render deployment (Stage 3)

This repository includes `render.yaml` for the Backend web service. It intentionally does **not** provision PostgreSQL or run the PostgreSQL migration; that belongs to Stage 4.

Important: the current runtime still uses SQLite. Render web services have an ephemeral filesystem by default, so this Stage 3 artifact must not be treated as a durable production data deployment until Stage 4 moves the runtime to PostgreSQL (or a persistent disk is deliberately provisioned).

Required Render settings for this stage:
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `TRUST_PROXY=true`
- `DEMO_MODE=false`
- `ALLOW_REGISTRATION=false`
- `APP_ORIGIN=https://<actual-service-origin>`

Do not commit `.env` or real credentials. Set secrets in Render Environment Variables.
